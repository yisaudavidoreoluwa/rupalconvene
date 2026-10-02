'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShieldCheck } from 'lucide-react';
import { PreJoinLobby } from '@/components/PreJoinLobby';
import { ConferenceHeader } from '@/components/ConferenceHeader';
import { VideoStage } from '@/components/VideoStage';
import { CodeWorkspace } from '@/components/CodeWorkspace';
import { ArchitectureWhiteboard } from '@/components/ArchitectureWhiteboard';
import { PitchDeckViewer } from '@/components/PitchDeckViewer';
import { AgendaGreenRoom } from '@/components/AgendaGreenRoom';
import { AIIntelligenceDrawer } from '@/components/AIIntelligenceDrawer';
import { ChatAndQAPanel } from '@/components/ChatAndQAPanel';
import { ConferenceControls } from '@/components/ConferenceControls';
import { DealRoomModal } from '@/components/DealRoomModal';
import { InviteModal } from '@/components/InviteModal';
import { LeaveModal } from '@/components/LeaveModal';
import { AuthModal } from '@/components/AuthModal';
import { DocumentationModal } from '@/components/DocumentationModal';
import { AuthProviderComponent, useAuth } from '@/context/AuthContext';
import { getUserAvatar } from '@/lib/avatar';
import { useWebRTC } from '@/hooks/useWebRTC';

import { 
  Participant, 
  ActiveWorkspaceTab, 
  StageLayout, 
  CodeFile, 
  WhiteboardElement, 
  PitchSlide, 
  AgendaItem, 
  ChatMessage, 
  MeetingMinutes, 
  LiveCaption,
  RoomPermissions,
  AccessRequest
} from '@/types/meeting';

import { 
  INITIAL_FILES, 
  INITIAL_WHITEBOARD_ELEMENTS, 
  INITIAL_SLIDES, 
  INITIAL_AGENDA, 
  INITIAL_CHAT, 
  INITIAL_MINUTES 
} from '@/lib/mock-data';

export default function Home() {
  return (
    <AuthProviderComponent>
      <ConferenceApp />
      <AuthModal />
    </AuthProviderComponent>
  );
}

function ConferenceApp() {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  // Lobby gate: Defaults to true so users land on the Pre-Join Lobby
  const [inLobby, setInLobby] = useState(true);

  // Strictly enforce authentication gate: if user logs out, return to lobby
  useEffect(() => {
    if (!isAuthenticated) {
      setInLobby(true);
    }
  }, [isAuthenticated]);

  // Conference Suite State
  const [roomCode, setRoomCode] = useState('RUPAL-804-SYNC');
  const [meetingTitle, setMeetingTitle] = useState('Engineering Architecture & Strategic Review');
  const [activeTab, setActiveTab] = useState<ActiveWorkspaceTab>('stage');
  const [layout, setLayout] = useState<StageLayout>('gallery');
  const [isWatermarkActive, setIsWatermarkActive] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [splitVideoEnabled, setSplitVideoEnabled] = useState(true);

  // Modals
  const [isDealRoomOpen, setIsDealRoomOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // Hardware and In-call Media States
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);

  // Data Collections (Initialized with clean fresh start defaults)
  const [files, setFiles] = useState<CodeFile[]>(INITIAL_FILES);
  const [activeFileId, setActiveFileId] = useState<string>('index-html');
  const [whiteboardElements, setWhiteboardElements] = useState<WhiteboardElement[]>(INITIAL_WHITEBOARD_ELEMENTS);
  const [slides, setSlides] = useState<PitchSlide[]>(INITIAL_SLIDES);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [agenda, setAgenda] = useState<AgendaItem[]>(INITIAL_AGENDA);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [minutes, setMinutes] = useState<MeetingMinutes>(INITIAL_MINUTES);
  const [captions, setCaptions] = useState<LiveCaption[]>([
    {
      id: 'cap-welcome',
      speakerId: 'user-self',
      speakerName: 'Host',
      speakerRole: 'tech-lead',
      text: 'Conference session initialized. Audio and video streams are encrypted with 256-bit DTLS-SRTP.',
      timestamp: '00:00',
    }
  ]);

  // Local media video reference for HTML5 <video> tag
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  // Auto-detect room code from URL query parameter (e.g. ?room=RUPAL-804-SYNC)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room');
      if (urlRoom && urlRoom.trim()) {
        setRoomCode(urlRoom.trim().toUpperCase());
      }
    }
  }, []);

  // Build current participant profile (Clean name without duplicate (You))
  const currentUser: Participant = {
    id: user?.id || 'user-self',
    name: user?.name || 'Conference Host',
    email: user?.email || '',
    role: user?.role || 'tech-lead',
    avatar: getUserAvatar(user?.avatar, user?.name || 'You'),
    organization: user?.organization || 'Rupal Tech Solutions',
    jobTitle: user?.jobTitle || 'Platform Engineer',
    isMuted,
    isVideoOff,
    isScreenSharing,
    isSpeaking: false,
    handRaised,
    inGreenRoom: false,
  };

  // Permissions & Access Requests State (Requirement 2 & 6)
  const [roomPermissions, setRoomPermissions] = useState<RoomPermissions>({
    codeEditMode: 'host-only',
    allowedEditorIds: [],
    handsOnDeck: false,
    allowedPresenterIds: [],
  });
  const [incomingAccessRequest, setIncomingAccessRequest] = useState<AccessRequest | null>(null);
  const [remoteEditorStatus, setRemoteEditorStatus] = useState<{ name: string; fileId: string } | null>(null);
  const remoteEditorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Determine host and permissions
  const isHost = user?.role === 'host' || currentUser.role === 'host';
  const canEditCode = isHost || roomPermissions.codeEditMode === 'everyone' || (roomPermissions.codeEditMode === 'selected' && roomPermissions.allowedEditorIds.includes(currentUser.id));
  const canControlDeck = isHost || roomPermissions.handsOnDeck || roomPermissions.allowedPresenterIds.includes(currentUser.id);

  // Remote Real-time Callbacks
  const handleRemoteCodeEdit = useCallback((fileId: string, content: string, senderName: string) => {
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, content } : f)));
    setRemoteEditorStatus({ name: senderName, fileId });
    if (remoteEditorTimeoutRef.current) clearTimeout(remoteEditorTimeoutRef.current);
    remoteEditorTimeoutRef.current = setTimeout(() => {
      setRemoteEditorStatus(null);
    }, 2500);
  }, []);

  const handleRemoteChatMessage = useCallback((msg: ChatMessage) => {
    setChatMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
    if (msg.type === 'chat') {
      setCaptions((prev) => [
        ...prev,
        {
          id: `cap-${msg.id || Date.now()}`,
          speakerId: msg.senderId,
          speakerName: msg.senderName,
          speakerRole: msg.senderRole,
          text: msg.text,
          timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, []);

  const handleRemoteUpvote = useCallback((messageId: string) => {
    setChatMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, upvotes: (m.upvotes || 0) + 1 } : m))
    );
  }, []);

  const handleRemotePermissions = useCallback((permissions: RoomPermissions) => {
    setRoomPermissions(permissions);
  }, []);

  const handleRemoteAccessRequest = useCallback((req: AccessRequest) => {
    setIncomingAccessRequest(req);
  }, []);

  const handleRemoteAccessResponse = useCallback((payload: { requestId: string; targetUserId: string; type: 'code-edit' | 'hands-on-deck'; granted: boolean }) => {
    if (payload.targetUserId === currentUser.id) {
      const typeLabel = payload.type === 'code-edit' ? 'Code Editor' : 'Hands on Deck';
      setCaptions((prev) => [
        ...prev,
        {
          id: `notif-${Date.now()}`,
          speakerId: 'system',
          speakerName: 'Host Permissions',
          speakerRole: 'host',
          text: `Host has ${payload.granted ? 'granted' : 'declined'} your request for ${typeLabel} access.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [currentUser.id]);

  const handleRemoteSlidesUpdate = useCallback((newSlides: PitchSlide[]) => {
    setSlides(newSlides);
  }, []);

  // Real-time WebRTC Mesh & Supabase Realtime Signaling Hook
  const {
    localStream,
    remoteParticipants,
    audioLevel,
    isSpeaking: isLocalSpeaking,
    toggleMute: webrtcToggleMute,
    toggleVideo: webrtcToggleVideo,
    initLocalMedia,
    broadcastSlideChange,
    broadcastLaser,
    broadcastReaction,
    broadcastCodeEdit,
    broadcastChatMessage,
    broadcastUpvote,
    broadcastPermissions,
    broadcastAccessRequest,
    broadcastAccessResponse,
    broadcastSlidesUpdate,
    syncedSlideIndex,
    laserPointer,
    reactions,
  } = useWebRTC({
    roomCode,
    currentUser: {
      ...currentUser,
      isSpeaking: false,
    },
    enabled: isAuthenticated,
    onRemoteCodeEdit: handleRemoteCodeEdit,
    onRemoteChatMessage: handleRemoteChatMessage,
    onRemoteUpvote: handleRemoteUpvote,
    onRemotePermissions: handleRemotePermissions,
    onRemoteAccessRequest: handleRemoteAccessRequest,
    onRemoteAccessResponse: handleRemoteAccessResponse,
    onRemoteSlidesUpdate: handleRemoteSlidesUpdate,
  });

  // Synchronize slide changes across all devices in the room
  useEffect(() => {
    if (syncedSlideIndex !== null && syncedSlideIndex !== currentSlideIndex) {
      if (syncedSlideIndex >= 0 && syncedSlideIndex < slides.length) {
        setCurrentSlideIndex(syncedSlideIndex);
      }
    }
  }, [syncedSlideIndex, slides.length, currentSlideIndex]);

  const handleSlideChange = (newIndex: number) => {
    setCurrentSlideIndex(newIndex);
    broadcastSlideChange(newIndex);
  };

  const handleUploadSlides = (newSlides: PitchSlide[]) => {
    setSlides(newSlides);
    broadcastSlidesUpdate(newSlides);
  };

  // Attach local media stream to localVideoRef element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      if (localVideoRef.current.srcObject !== localStream) {
        localVideoRef.current.srcObject = localStream;
      }
    }
  }, [localStream, inLobby]);

  // Combined Participants: Local User + Live Remote Peers across devices
  const allParticipants: Participant[] = [
    {
      ...currentUser,
      stream: localStream || undefined,
      isSpeaking: isLocalSpeaking,
    },
    ...remoteParticipants,
  ];

  // Initialize room in database on mount / roomCode change
  useEffect(() => {
    async function initRoom() {
      try {
        const res = await fetch('/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomCode,
            title: meetingTitle,
            hostId: user?.id || 'host_default',
            hostName: user?.name || 'Conference Host',
            hostRole: user?.role || 'developer',
            hostAvatar: user?.avatar || '',
          })
        });
        const data = await res.json();
        if (data.success && data.room) {
          // Fetch existing messages if any
          const msgRes = await fetch(`/api/rooms/${roomCode}/messages`);
          const msgData = await msgRes.json();
          if (msgData.success && msgData.messages && msgData.messages.length > 0) {
            setChatMessages(msgData.messages);
          }
        }
      } catch (err) {
        console.info('Database sync running in memory fallback', err);
      }
    }
    initRoom();
  }, [roomCode, meetingTitle, user?.id, user?.name, user?.role, user?.avatar]);

  // Audio/Video Toggles
  const handleToggleMic = () => {
    setIsMuted((prev) => !prev);
    webrtcToggleMute();
  };

  const handleToggleVideo = async () => {
    setIsVideoOff((prev) => !prev);
    await webrtcToggleVideo();
  };

  const handleToggleScreenShare = async () => {
    try {
      if (!isScreenSharing && navigator.mediaDevices?.getDisplayMedia) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setIsScreenSharing(true);
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
        };
      } else {
        setIsScreenSharing(false);
      }
    } catch {
      setIsScreenSharing(false);
    }
  };

  const handleToggleHandRaise = () => {
    setHandRaised((prev) => !prev);
  };

  // Green Room Workflow
  const handleAdmitFromGreenRoom = (participantId: string) => {
    const admitted = allParticipants.find((p) => p.id === participantId);
    if (admitted) {
      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: 'system',
        senderName: 'Stage Manager',
        senderRole: 'host',
        senderAvatar: getUserAvatar(undefined, 'Stage Manager'),
        text: `Elevated ${admitted.name} to Main Stage.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'system',
      };
      setChatMessages((prev) => [...prev, newMsg]);

      setCaptions((prev) => [
        ...prev,
        {
          id: `cap-${Date.now()}`,
          speakerId: admitted.id,
          speakerName: admitted.name,
          speakerRole: admitted.role,
          text: `[Joined Stage] Ready to collaborate.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const handleMoveToGreenRoom = (participantId: string) => {
    console.info('Moved participant to green room:', participantId);
  };

  // Chat message handling with real-time broadcast and backend persistence
  const handleSendMessage = async (text: string, type: ChatMessage['type']) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatar,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      upvotes: type === 'qa' ? 1 : undefined,
    };
    setChatMessages((prev) => [...prev, newMsg]);

    // Broadcast instant real-time message to all meeting participants (Requirement 4)
    broadcastChatMessage(newMsg);

    setCaptions((prev) => [
      ...prev,
      {
        id: `cap-${Date.now()}`,
        speakerId: currentUser.id,
        speakerName: currentUser.name,
        speakerRole: currentUser.role,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    // Asynchronously persist to SQLite/Supabase database
    try {
      fetch(`/api/rooms/${roomCode}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          senderAvatar: currentUser.avatar,
          type,
        }),
      }).catch(() => {});
    } catch {}
  };

  const handleUpvoteQuestion = (messageId: string) => {
    setChatMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, upvotes: (m.upvotes || 0) + 1 } : m
      )
    );
    broadcastUpvote(messageId);
  };

  // Code actions with backend persistence
  const handleUpdateFileContent = (fileId: string, newContent: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, content: newContent } : f))
    );

    try {
      const target = files.find((f) => f.id === fileId);
      if (target) {
        fetch(`/api/rooms/${roomCode}/files`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: fileId,
            name: target.name,
            language: target.language,
            content: newContent,
          }),
        }).catch(() => {});
      }
    } catch {}
  };

  const handleShareCodeToChat = (fileName: string, code: string, language: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatar,
      text: `Shared code snippet: ${fileName}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'code-share',
      codeSnippet: {
        code,
        language,
      },
    };
    setChatMessages((prev) => [...prev, newMsg]);
    broadcastChatMessage(newMsg);
    setIsChatOpen(true);
  };

  const handleRoomChange = (newCode: string, newTitle?: string) => {
    setRoomCode(newCode);
    if (newTitle) {
      setMeetingTitle(newTitle);
    }
  };

  // If in Pre-Join Lobby screen or unauthenticated
  if (inLobby || !isAuthenticated) {
    return (
      <>
        <PreJoinLobby
          roomCode={roomCode}
          meetingTitle={meetingTitle}
          participants={allParticipants}
          currentUser={{
            ...currentUser,
            isSpeaking: isLocalSpeaking,
          }}
          audioLevel={audioLevel}
          localStream={localStream}
          onJoinMeeting={(startTab) => {
            if (!isAuthenticated) {
              openAuthModal('login');
              return;
            }
            if (startTab) setActiveTab(startTab);
            setInLobby(false);
            initLocalMedia();
          }}
          onToggleMic={handleToggleMic}
          onToggleVideo={handleToggleVideo}
          onOpenDocs={() => setIsDocsOpen(true)}
          onRoomChange={handleRoomChange}
        />
        <DocumentationModal
          isOpen={isDocsOpen}
          onClose={() => setIsDocsOpen(false)}
        />
      </>
    );
  }

  // Active In-Call Conference Suite (White Background & Deep Navy Blue)
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Rupal Convene Clean Header */}
      <ConferenceHeader
        title={meetingTitle}
        roomCode={roomCode}
        participants={allParticipants}
        layout={layout}
        onLayoutChange={setLayout}
        isWatermarkActive={isWatermarkActive}
        onToggleWatermark={() => setIsWatermarkActive(!isWatermarkActive)}
        isRecording={isRecording}
        onToggleRecording={() => setIsRecording(!isRecording)}
        onOpenInvite={() => setIsInviteOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        onBackToPortal={() => setInLobby(true)}
      />

      {/* Host Access Request Banner (Requirement 2 & 6) */}
      {incomingAccessRequest && isHost && (
        <div className="fixed top-16 right-4 z-50 bg-[#0f172a] text-white p-4 rounded-2xl shadow-2xl border border-blue-500/40 max-w-sm w-full animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center space-x-2 font-bold text-xs text-blue-400 mb-1">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Attendee Permission Request</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            <span className="font-bold text-white">{incomingAccessRequest.userName}</span> requested {incomingAccessRequest.type === 'code-edit' ? 'Code Editor write access' : 'Hands on Deck presentation control'}.
          </p>
          <div className="flex items-center justify-end space-x-2 mt-3">
            <button
              onClick={() => {
                broadcastAccessResponse(incomingAccessRequest.id, incomingAccessRequest.userId, incomingAccessRequest.type, false);
                setIncomingAccessRequest(null);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={() => {
                if (incomingAccessRequest.type === 'code-edit') {
                  const updated: RoomPermissions = {
                    ...roomPermissions,
                    codeEditMode: 'selected',
                    allowedEditorIds: Array.from(new Set([...roomPermissions.allowedEditorIds, incomingAccessRequest.userId])),
                  };
                  setRoomPermissions(updated);
                  broadcastPermissions(updated);
                } else {
                  const updated: RoomPermissions = {
                    ...roomPermissions,
                    handsOnDeck: true,
                    allowedPresenterIds: Array.from(new Set([...roomPermissions.allowedPresenterIds, incomingAccessRequest.userId])),
                  };
                  setRoomPermissions(updated);
                  broadcastPermissions(updated);
                }
                broadcastAccessResponse(incomingAccessRequest.id, incomingAccessRequest.userId, incomingAccessRequest.type, true);
                setIncomingAccessRequest(null);
              }}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors"
            >
              Grant Access
            </button>
          </div>
        </div>
      )}

      {/* 2. Central Meeting Workspace (Light Canvas #f8fafc with Low Border Clutter) */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative p-1.5 sm:p-2 md:p-3 gap-2 md:gap-3 bg-[#f8fafc]">
          {/* Main Stage View */}
          {activeTab === 'stage' && (
            <div className="flex-1 w-full h-full min-h-0">
              <VideoStage
                participants={allParticipants}
                layout={layout}
                onAdmitFromGreenRoom={handleAdmitFromGreenRoom}
                onMoveToGreenRoom={handleMoveToGreenRoom}
                localVideoRef={localVideoRef}
                currentUserId={currentUser.id}
                localStream={localStream}
              />
            </div>
          )}

          {/* Collaborative Code Workspace (With Side-by-Side Live Preview & Real-Time Sync) */}
          {activeTab === 'code-ide' && (
            <div className="flex-1 flex flex-col lg:flex-row w-full h-full gap-2.5 min-h-0">
              <div className="flex-1 h-full min-h-0">
                <CodeWorkspace
                  files={files}
                  activeFileId={activeFileId}
                  onSelectFile={setActiveFileId}
                  onUpdateFileContent={handleUpdateFileContent}
                  onShareToChat={handleShareCodeToChat}
                  onAskAIAboutCode={(fileName, code) => {}}
                  onAddFile={(newFile) => setFiles((prev) => [...prev, newFile])}
                  onDeleteFile={(id) => setFiles((prev) => prev.filter(f => f.id !== id))}
                  isHost={isHost}
                  canEditCode={canEditCode}
                  roomPermissions={roomPermissions}
                  onUpdatePermissions={(newPerms) => {
                    setRoomPermissions(newPerms);
                    broadcastPermissions(newPerms);
                  }}
                  onRequestEditAccess={() => broadcastAccessRequest('code-edit')}
                  remoteEditorStatus={remoteEditorStatus}
                  onBroadcastCodeEdit={(fileId, content) => broadcastCodeEdit(fileId, content)}
                  participants={allParticipants.filter((p) => p.id !== currentUser.id)}
                />
              </div>

              {splitVideoEnabled && (
                <div className="w-full lg:w-72 xl:w-80 h-40 sm:h-48 lg:h-full flex-shrink-0">
                  <VideoStage
                    participants={allParticipants}
                    layout="gallery"
                    compactMode={true}
                    onAdmitFromGreenRoom={handleAdmitFromGreenRoom}
                    onMoveToGreenRoom={handleMoveToGreenRoom}
                    localVideoRef={localVideoRef}
                    currentUserId={currentUser.id}
                    localStream={localStream}
                  />
                </div>
              )}
            </div>
          )}

          {/* Architecture Whiteboard (With split video stage) */}
          {activeTab === 'whiteboard' && (
            <div className="flex-1 flex flex-col lg:flex-row w-full h-full gap-2.5 min-h-0">
              <div className="flex-1 h-full min-h-0">
                <ArchitectureWhiteboard
                  elements={whiteboardElements}
                  onUpdateElements={setWhiteboardElements}
                  onAskAIAboutArchitecture={() => setActiveTab('ai-intelligence')}
                />
              </div>

              {splitVideoEnabled && (
                <div className="w-full lg:w-72 xl:w-80 h-40 sm:h-48 lg:h-full flex-shrink-0">
                  <VideoStage
                    participants={allParticipants}
                    layout="gallery"
                    compactMode={true}
                    onAdmitFromGreenRoom={handleAdmitFromGreenRoom}
                    onMoveToGreenRoom={handleMoveToGreenRoom}
                    localVideoRef={localVideoRef}
                    currentUserId={currentUser.id}
                    localStream={localStream}
                  />
                </div>
              )}
            </div>
          )}

          {/* Investor Pitch Deck (With multi-page PDF presentation, Hands on Deck & split video) */}
          {activeTab === 'pitch-deck' && (
            <div className="flex-1 flex flex-col lg:flex-row w-full h-full gap-2.5 min-h-0">
              <div className="flex-1 h-full min-h-0">
                <PitchDeckViewer
                  slides={slides}
                  currentSlideIndex={currentSlideIndex}
                  onSlideChange={handleSlideChange}
                  isWatermarkActive={isWatermarkActive}
                  currentUser={currentUser}
                  onOpenDealRoom={() => setIsDealRoomOpen(true)}
                  onUploadSlide={(newSlide) => setSlides((prev) => [...prev, newSlide])}
                  onUploadSlides={handleUploadSlides}
                  laserPointer={laserPointer}
                  onLaserMove={broadcastLaser}
                  isHost={isHost}
                  canControlDeck={canControlDeck}
                  roomPermissions={roomPermissions}
                  onUpdatePermissions={(newPerms) => {
                    setRoomPermissions(newPerms);
                    broadcastPermissions(newPerms);
                  }}
                  onRequestDeckAccess={() => broadcastAccessRequest('hands-on-deck')}
                />
              </div>

              {splitVideoEnabled && (
                <div className="w-full lg:w-72 xl:w-80 h-40 sm:h-48 lg:h-full flex-shrink-0">
                  <VideoStage
                    participants={allParticipants}
                    layout="gallery"
                    compactMode={true}
                    onAdmitFromGreenRoom={handleAdmitFromGreenRoom}
                    onMoveToGreenRoom={handleMoveToGreenRoom}
                    localVideoRef={localVideoRef}
                    currentUserId={currentUser.id}
                    localStream={localStream}
                  />
                </div>
              )}
            </div>
          )}

          {/* Conference Timetable & Backstage Green Room */}
          {activeTab === 'agenda' && (
            <div className="flex-1 w-full h-full min-h-0">
              <AgendaGreenRoom
                agenda={agenda}
                participants={allParticipants}
                onAdmitToStage={handleAdmitFromGreenRoom}
                onMoveToGreenRoom={handleMoveToGreenRoom}
                currentUserId={currentUser.id}
              />
            </div>
          )}

          {/* Gemini AI Live Meeting Intelligence */}
          {activeTab === 'ai-intelligence' && (
            <div className="flex-1 w-full h-full min-h-0">
              <AIIntelligenceDrawer
                minutes={minutes}
                onUpdateMinutes={setMinutes}
                captions={captions}
                activeCodeSnippet={files.find((f) => f.id === activeFileId)?.content}
                currentSlideTitle={slides[currentSlideIndex]?.title}
                meetingTitle={meetingTitle}
              />
            </div>
          )}
        </div>

        {/* Right Collapsible Chat / Q&A / Attendance Drawer */}
        {isChatOpen && (
          <div className="h-full flex-shrink-0 animate-in slide-in-from-right duration-200 w-full sm:w-80 md:w-96 absolute sm:relative inset-y-0 right-0 z-40 bg-white sm:bg-transparent shadow-xl sm:shadow-none">
            <ChatAndQAPanel
              messages={chatMessages}
              participants={allParticipants}
              currentUser={{
                ...currentUser,
                isSpeaking: isLocalSpeaking,
              }}
              onSendMessage={handleSendMessage}
              onUpvoteQuestion={handleUpvoteQuestion}
              onClose={() => setIsChatOpen(false)}
            />
          </div>
        )}
      </div>

      {/* 3. Floating Bottom Controls Dock */}
      <ConferenceControls
        currentUser={{
          ...currentUser,
          isSpeaking: isLocalSpeaking,
        }}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onToggleMic={handleToggleMic}
        onToggleVideo={handleToggleVideo}
        onToggleScreenShare={handleToggleScreenShare}
        onToggleHandRaise={handleToggleHandRaise}
        isChatOpen={isChatOpen}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        onLeaveMeeting={() => setIsLeaveOpen(true)}
        onOpenDealRoom={() => setIsDealRoomOpen(true)}
        participantCount={allParticipants.length}
        unreadCount={chatMessages.length > 2 ? 1 : 0}
        roomCode={roomCode}
        onSendReaction={broadcastReaction}
      />

      {/* Floating Live Emoji Reactions Overlay */}
      {reactions.length > 0 && (
        <div className="fixed bottom-24 right-6 sm:right-10 pointer-events-none z-50 flex flex-col items-end space-y-2.5">
          {reactions.map((r) => (
            <div 
              key={r.id} 
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#0f172a]/90 backdrop-blur-md text-white shadow-2xl border border-slate-700/60 animate-in slide-in-from-bottom duration-200 animate-bounce"
            >
              <span className="text-xl sm:text-2xl">{r.emoji}</span>
              <span className="text-[11px] font-semibold text-slate-300">{r.senderName}</span>
            </div>
          ))}
        </div>
      )}

      {/* Modals & Drawers */}
      <DealRoomModal
        isOpen={isDealRoomOpen}
        onClose={() => setIsDealRoomOpen(false)}
      />

      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        roomCode={roomCode}
      />

      <LeaveModal
        isOpen={isLeaveOpen}
        onClose={() => setIsLeaveOpen(false)}
        onConfirmLeave={() => setInLobby(true)}
        onEndMeetingForAll={() => {
          alert('Conference ended by Host. Executive minutes dispatched to all partner emails.');
          setInLobby(true);
        }}
      />

      <DocumentationModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  );
}
