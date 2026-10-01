'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Participant } from '@/types/meeting';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
  ],
  iceCandidatePoolSize: 10,
};

interface UseWebRTCOptions {
  roomCode: string;
  currentUser: Participant;
  enabled?: boolean;
}

export function useWebRTC({ roomCode, currentUser, enabled = true }: UseWebRTCOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [remoteParticipants, setRemoteParticipants] = useState<Participant[]>([]);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const iceCandidatesQueueRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastSpeakingStateRef = useRef<boolean>(false);

  // Keep a stable ref to currentUser to avoid re-subscribing on every state update
  const currentUserRef = useRef<Participant>(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // 1. Initialize Local Media (Camera & Mic with Web Audio Analyser)
  const initLocalMedia = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return null;
    }

    // Reuse existing active stream if already available
    if (localStreamRef.current && localStreamRef.current.active) {
      return localStreamRef.current;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      localStreamRef.current = stream;
      setLocalStream(stream);

      // Sync initial muted/video states
      const audioTracks = stream.getAudioTracks();
      const videoTracks = stream.getVideoTracks();
      if (currentUserRef.current.isMuted) {
        audioTracks.forEach((t) => (t.enabled = false));
      }
      if (currentUserRef.current.isVideoOff) {
        videoTracks.forEach((t) => (t.enabled = false));
      }

      // Add tracks to any existing peer connections
      peerConnectionsRef.current.forEach((pc) => {
        const senders = pc.getSenders();
        stream.getTracks().forEach((track) => {
          const alreadyAdded = senders.some((s) => s.track?.id === track.id);
          if (!alreadyAdded) {
            pc.addTrack(track, stream);
          }
        });
      });

      // Setup Web Audio Analyser for live speech detection
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.5;

          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          audioContextRef.current = audioCtx;
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          const checkVolume = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);

            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            const normalizedLevel = Math.min(100, Math.round((average / 128) * 100));

            setAudioLevel(normalizedLevel);
            const speaking = normalizedLevel > 18 && !currentUserRef.current.isMuted;
            setIsSpeaking(speaking);

            // Broadcast speaking state change
            if (speaking !== lastSpeakingStateRef.current) {
              lastSpeakingStateRef.current = speaking;
              if (channelRef.current) {
                channelRef.current.send({
                  type: 'broadcast',
                  event: 'peer-state',
                  payload: {
                    userId: currentUserRef.current.id,
                    isSpeaking: speaking,
                    isMuted: currentUserRef.current.isMuted,
                    isVideoOff: currentUserRef.current.isVideoOff,
                  },
                });
              }
            }

            animFrameRef.current = requestAnimationFrame(checkVolume);
          };

          checkVolume();
        }
      } catch (audioErr) {
        console.warn('[WebRTC] Audio analyser fallback active:', audioErr);
      }

      return stream;
    } catch (err) {
      console.warn('[WebRTC] Camera/Mic permission deferred:', err);
      return null;
    }
  }, []);

  // 2. Peer Connection Factory
  const createPeerConnection = useCallback((peerId: string, initiator: boolean) => {
    if (peerConnectionsRef.current.has(peerId)) {
      return peerConnectionsRef.current.get(peerId)!;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionsRef.current.set(peerId, pc);

    // Add local tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // Remote track arrived
    pc.ontrack = (event) => {
      const remoteStream = event.streams[0] || new MediaStream([event.track]);
      remoteStreamsRef.current.set(peerId, remoteStream);
      setRemoteStreams(new Map(remoteStreamsRef.current));

      setRemoteParticipants((prev) =>
        prev.map((p) => (p.id === peerId ? { ...p, stream: remoteStream } : p))
      );
    };

    // ICE Candidate generation
    pc.onicecandidate = (event) => {
      if (event.candidate && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'webrtc-signal',
          payload: {
            to: peerId,
            from: currentUserRef.current.id,
            candidate: event.candidate,
          },
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.info(`[WebRTC] Peer ${peerId} ICE state:`, pc.iceConnectionState);
    };

    // If initiator, generate SDP offer
    if (initiator) {
      pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      })
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          if (channelRef.current) {
            channelRef.current.send({
              type: 'broadcast',
              event: 'webrtc-signal',
              payload: {
                to: peerId,
                from: currentUserRef.current.id,
                sdp: pc.localDescription,
              },
            });
          }
        })
        .catch((err) => console.error('[WebRTC] Create offer error:', err));
    }

    return pc;
  }, []);

  // 3. Supabase Realtime Signaling & Presence
  useEffect(() => {
    if (!enabled || !roomCode || !currentUser.id) return;

    let mounted = true;
    const supabase = getSupabaseBrowserClient();

    // Start local media
    initLocalMedia();

    if (supabase) {
      const channelName = `call_room_${roomCode.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      const channel = supabase.channel(channelName, {
        config: {
          presence: { key: currentUser.id },
          broadcast: { self: false },
        },
      });

      channelRef.current = channel;

      // Handle Presence Sync (Remote participants join/leave)
      channel
        .on('presence', { event: 'sync' }, () => {
          if (!mounted) return;
          const presenceState = channel.presenceState();
          const peers: Participant[] = [];

          Object.keys(presenceState).forEach((key) => {
            if (key !== currentUserRef.current.id) {
              const state = presenceState[key][0] as Record<string, unknown> | undefined;
              if (state) {
                peers.push({
                  id: key,
                  name: (state.name as string) || 'Remote Participant',
                  email: (state.email as string) || '',
                  role: (state.role as Participant['role']) || 'developer',
                  avatar: (state.avatar as string) || '',
                  organization: (state.organization as string) || 'Rupal Tech Solutions',
                  jobTitle: (state.jobTitle as string) || 'Conference Member',
                  isMuted: Boolean(state.isMuted),
                  isVideoOff: Boolean(state.isVideoOff),
                  isScreenSharing: Boolean(state.isScreenSharing),
                  isSpeaking: Boolean(state.isSpeaking),
                  handRaised: Boolean(state.handRaised),
                  inGreenRoom: false,
                  stream: remoteStreamsRef.current.get(key) || null,
                });

                // Deterministic initiator: user with lower alphanumeric ID initiates offer
                const isInitiator = currentUserRef.current.id < key;
                if (!peerConnectionsRef.current.has(key)) {
                  createPeerConnection(key, isInitiator);
                }
              }
            }
          });

          setRemoteParticipants(peers);
          setConnectionStatus('connected');
        })
        .on('presence', { event: 'leave' }, ({ key }) => {
          if (!mounted) return;
          const pc = peerConnectionsRef.current.get(key);
          if (pc) {
            pc.close();
            peerConnectionsRef.current.delete(key);
          }
          iceCandidatesQueueRef.current.delete(key);
          remoteStreamsRef.current.delete(key);
          setRemoteStreams(new Map(remoteStreamsRef.current));
          setRemoteParticipants((prev) => prev.filter((p) => p.id !== key));
        })
        // WebRTC Signaling: SDP Offers, Answers, and ICE Candidates
        .on('broadcast', { event: 'webrtc-signal' }, async ({ payload }) => {
          if (!mounted || payload.to !== currentUserRef.current.id) return;

          const fromPeerId = payload.from;
          let pc = peerConnectionsRef.current.get(fromPeerId);

          if (!pc) {
            pc = createPeerConnection(fromPeerId, false);
          }

          if (payload.sdp) {
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));

              // If offer, reply with answer
              if (payload.sdp.type === 'offer') {
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                channel.send({
                  type: 'broadcast',
                  event: 'webrtc-signal',
                  payload: {
                    to: fromPeerId,
                    from: currentUserRef.current.id,
                    sdp: pc.localDescription,
                  },
                });
              }

              // Drain queued ICE candidates received before remoteDescription was set
              const queued = iceCandidatesQueueRef.current.get(fromPeerId) || [];
              for (const cand of queued) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(cand));
                } catch (candErr) {
                  console.warn('[WebRTC] Queued ICE candidate skipped:', candErr);
                }
              }
              iceCandidatesQueueRef.current.delete(fromPeerId);
            } catch (sdpErr) {
              console.error('[WebRTC] SDP negotiation error:', sdpErr);
            }
          } else if (payload.candidate) {
            if (pc.remoteDescription && pc.remoteDescription.type) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
              } catch (iceErr) {
                console.warn('[WebRTC] ICE candidate skipped:', iceErr);
              }
            } else {
              // Queue candidate until remoteDescription is ready
              if (!iceCandidatesQueueRef.current.has(fromPeerId)) {
                iceCandidatesQueueRef.current.set(fromPeerId, []);
              }
              iceCandidatesQueueRef.current.get(fromPeerId)!.push(payload.candidate);
            }
          }
        })
        // Remote peer state updates (mic mute, camera off, speaking, hand raise)
        .on('broadcast', { event: 'peer-state' }, ({ payload }) => {
          if (!mounted) return;
          setRemoteParticipants((prev) =>
            prev.map((p) =>
              p.id === payload.userId
                ? {
                    ...p,
                    isMuted: payload.isMuted !== undefined ? payload.isMuted : p.isMuted,
                    isVideoOff: payload.isVideoOff !== undefined ? payload.isVideoOff : p.isVideoOff,
                    isSpeaking: payload.isSpeaking !== undefined ? payload.isSpeaking : p.isSpeaking,
                    handRaised: payload.handRaised !== undefined ? payload.handRaised : p.handRaised,
                  }
                : p
            )
          );
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              userId: currentUserRef.current.id,
              name: currentUserRef.current.name,
              email: currentUserRef.current.email,
              avatar: currentUserRef.current.avatar,
              role: currentUserRef.current.role,
              organization: currentUserRef.current.organization,
              jobTitle: currentUserRef.current.jobTitle,
              isMuted: currentUserRef.current.isMuted,
              isVideoOff: currentUserRef.current.isVideoOff,
              isSpeaking: false,
              handRaised: currentUserRef.current.handRaised,
            });
          }
        });
    }

    return () => {
      mounted = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
      iceCandidatesQueueRef.current.clear();
      remoteStreamsRef.current.clear();
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
    };
  }, [roomCode, currentUser.id, enabled, initLocalMedia, createPeerConnection]);

  // 4. Synchronize local audio/video track states on mute/camera toggles
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !currentUser.isMuted;
      });
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !currentUser.isVideoOff;
      });
    }

    // Broadcast updated state to room channel
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'peer-state',
        payload: {
          userId: currentUser.id,
          isMuted: currentUser.isMuted,
          isVideoOff: currentUser.isVideoOff,
          handRaised: currentUser.handRaised,
        },
      });

      // Update presence
      channelRef.current.track({
        userId: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar,
        role: currentUser.role,
        organization: currentUser.organization,
        jobTitle: currentUser.jobTitle,
        isMuted: currentUser.isMuted,
        isVideoOff: currentUser.isVideoOff,
        isSpeaking: false,
        handRaised: currentUser.handRaised,
      }).catch(() => {});
    }
  }, [currentUser.id, currentUser.name, currentUser.email, currentUser.avatar, currentUser.role, currentUser.organization, currentUser.jobTitle, currentUser.isMuted, currentUser.isVideoOff, currentUser.handRaised]);

  // Toggle Mute / Mic
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((t) => {
        t.enabled = !t.enabled;
      });
      return audioTracks.length > 0 ? !audioTracks[0].enabled : true;
    }
    return !currentUserRef.current.isMuted;
  }, []);

  // Toggle Camera / Video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((t) => {
        t.enabled = !t.enabled;
      });
      return videoTracks.length > 0 ? !videoTracks[0].enabled : true;
    }
    return !currentUserRef.current.isVideoOff;
  }, []);

  return {
    localStream,
    remoteStreams,
    remoteParticipants,
    audioLevel,
    isSpeaking,
    connectionStatus,
    toggleMute,
    toggleVideo,
    initLocalMedia,
  };
}
