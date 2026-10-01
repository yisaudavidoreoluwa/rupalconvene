'use client';

import React, { useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Pin, 
  Volume2, 
  VideoOff 
} from 'lucide-react';
import { Participant, ParticipantRole } from '@/types/meeting';

interface VideoTileProps {
  participant: Participant;
  isSelf?: boolean;
  isPinned?: boolean;
  onPinToggle?: () => void;
  onMoveToGreenRoom?: () => void;
  localVideoRef?: React.RefObject<HTMLVideoElement | null>;
  isPip?: boolean;
}

export const VideoTile: React.FC<VideoTileProps> = ({
  participant,
  isSelf = false,
  isPinned = false,
  onPinToggle,
  onMoveToGreenRoom,
  localVideoRef,
  isPip = false,
}) => {
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  // Attach remote WebRTC media stream to video and audio elements
  useEffect(() => {
    if (!isSelf && participant.stream) {
      if (remoteVideoRef.current && remoteVideoRef.current.srcObject !== participant.stream) {
        remoteVideoRef.current.srcObject = participant.stream;
      }
      if (remoteAudioRef.current && remoteAudioRef.current.srcObject !== participant.stream) {
        remoteAudioRef.current.srcObject = participant.stream;
        remoteAudioRef.current.play().catch((e) => {
          console.info('Audio autoplay pending user interaction:', e);
        });
      }
    }
  }, [isSelf, participant.stream]);

  const getRoleBadge = (role: ParticipantRole) => {
    switch (role) {
      case 'tech-lead':
        return { label: 'Tech Lead', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'developer':
        return { label: 'Engineer', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'investor':
        return { label: 'Investor / VC', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'business-partner':
        return { label: 'Partner', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
      default:
        return { label: 'Presenter', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
    }
  };

  const badge = getRoleBadge(participant.role);

  return (
    <div
      className={`group relative w-full h-full rounded-2xl overflow-hidden bg-[#0a192f] transition-all duration-200 flex flex-col justify-between shadow-xs select-none touch-manipulation ${
        participant.isSpeaking
          ? 'ring-2 ring-emerald-500 shadow-emerald-500/20'
          : isPinned
          ? 'ring-2 ring-blue-500'
          : 'ring-1 ring-slate-800/80 hover:ring-slate-700'
      }`}
    >
      {/* Video Content Layer */}
      <div className="absolute inset-0 w-full h-full bg-[#0a192f] flex items-center justify-center overflow-hidden">
        {/* 1. Local Video Element */}
        {isSelf && localVideoRef ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-200 ${
              participant.isVideoOff ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          />
        ) : null}

        {/* 2. Remote Video Element */}
        {!isSelf && participant.stream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-200 ${
              participant.isVideoOff ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          />
        ) : null}

        {/* 3. Remote Audio Element (Plays remote participant's voice across devices) */}
        {!isSelf && participant.stream && (
          <audio ref={remoteAudioRef} autoPlay playsInline />
        )}

        {/* 4. Avatar Fallback (when video is disabled or waiting for stream) */}
        {(participant.isVideoOff || (!isSelf && !participant.stream)) && (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-[#0f172a] via-[#0a192f] to-[#0f172a]">
            <div className="relative mb-2 sm:mb-3">
              <img
                src={participant.avatar}
                alt={participant.name}
                className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover shadow-lg transition-transform group-hover:scale-105 ${
                  participant.isSpeaking
                    ? 'ring-3 ring-emerald-400 ring-offset-2 ring-offset-[#0a192f]'
                    : 'ring-1 ring-slate-700'
                }`}
              />
              {participant.isSpeaking && (
                <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-white shadow-xs">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                </div>
              )}
            </div>

            <div className="text-center z-10 px-2">
              <div className="text-xs sm:text-sm font-bold text-white truncate max-w-[160px] sm:max-w-[200px]">
                {participant.name} {isSelf && '(You)'}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 truncate max-w-[160px] sm:max-w-[200px] font-medium">
                {participant.jobTitle || 'Active Member'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Bar: Role Pill & Mic Status */}
      <div className="relative z-10 p-2 sm:p-2.5 flex items-center justify-between w-full pointer-events-none">
        <div className="flex items-center space-x-1.5 pointer-events-auto">
          <span className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase backdrop-blur-md ${badge.color}`}>
            {badge.label}
          </span>
          {participant.handRaised && (
            <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold">
              ✋ Raised
            </span>
          )}
        </div>

        {/* Top-Right Status Badges */}
        <div className="flex items-center space-x-1 pointer-events-auto">
          {participant.isVideoOff && (
            <div className="p-1 rounded-full bg-slate-800/90 text-slate-400 shadow-xs" title="Camera off">
              <VideoOff className="w-3 h-3" />
            </div>
          )}

          {participant.isMuted && (
            <div className="p-1 rounded-full bg-red-500 text-white shadow-xs" title="Microphone muted">
              <MicOff className="w-3 h-3" />
            </div>
          )}

          {onPinToggle && (
            <button
              onClick={onPinToggle}
              className={`p-1 rounded bg-[#0f172a]/80 text-slate-400 hover:text-white transition-opacity ${
                isPinned ? 'opacity-100 text-blue-400' : 'opacity-0 group-hover:opacity-100'
              }`}
              title={isPinned ? 'Unpin' : 'Pin tile'}
            >
              <Pin className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Bar: Name Tag & Speaking Indicator */}
      <div className="relative z-10 p-2 sm:p-2.5 flex items-center justify-between w-full pointer-events-none">
        <div className="px-2 py-1 rounded-md bg-[#0f172a]/90 text-white text-[11px] sm:text-xs font-semibold backdrop-blur-md flex items-center space-x-1.5 shadow-xs max-w-[80%] truncate pointer-events-auto">
          <span className="truncate">{participant.name} {isSelf && '(You)'}</span>
        </div>

        {/* Dynamic Speaking Waveform */}
        {participant.isSpeaking && (
          <div className="flex items-center space-x-0.5 px-2 py-1 rounded-md bg-[#0f172a]/90 backdrop-blur-md">
            <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-bounce" />
            <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_100ms]" />
            <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_200ms]" />
          </div>
        )}
      </div>
    </div>
  );
};
