'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  LiveCaption 
} from '@/types/meeting';

import { 
  INITIAL_PARTICIPANTS, 
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
  const { user } = useAuth();

  // Lobby gate: When true, shows "Ready to join?" lobby; when false, in live conference call
  const [inLobby, setInLobby] = useState(false);

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

  // Data Collections (Initialized with clean fresh start defaults)
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [files, setFiles] = useState<CodeFile[]>(INITIAL_FILES);
  const [activeFileId, setActiveFileId] = useState<string>('index-ts');
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

  // Synchronize authenticated user profile with local participant state
  useEffect(() => {
    if (user) {
      setParticipants((prev) =>
        prev.map((p) => {
          if (p.id === 'user-self') {
            return {
              ...p,
              name: `${user.name} (You)`,
              email: user.email,
              avatar: getUserAvatar(user.avatar, user.name),
              role: user.role,
              jobTitle: user.jobTitle,
              organization: user.organization,
            };
          }
          return p;
        })
      );
    }
  }, [user]);

  // Initialize room in SQLite database on mount / roomCode change
  useEffect(() => {
    async function initRoom() {
      try {
        const res = await fetch('/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomCode,
            title: meetingTitle,
            hostId: user.id,
            hostName: user.name,
            hostRole: user.role,
            hostAvatar: user.avatar,
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
  }, [roomCode, meetingTitle, user.id, user.name, user.role, user.avatar]);

  // Local media stream reference
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const currentUser = participants.find((p) => p.id === 'user-self') || participants[0];

  // Request real camera/mic with safe fallback
  useEffect(() => {
    async function setupCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && !inLobby) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          mediaStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.info('Camera permission deferred or running in sandbox preview.', err);
      }
    }
    if (!inLobby) {
      setupCamera();
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [inLobby]);

  // Audio/Video Toggles
  const handleToggleMic = () => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === 'user-self' ? { ...p, isMuted: !p.isMuted } : p))
    );
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    }
  };

  const handleToggleVideo = () => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === 'user-self' ? { ...p, isVideoOff: !p.isVideoOff } : p))
    );
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    }
  };

  const handleToggleScreenShare = () => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === 'user-self' ? { ...p, isScreenSharing: !p.isScreenSharing } : p))
    );
  };

  const handleToggleHandRaise = () => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === 'user-self' ? { ...p, handRaised: !p.handRaised } : p))
    );
  };

  // Green Room Workflow
  const handleAdmitFromGreenRoom = (participantId: string) => {
    const admitted = participants.find((p) => p.id === participantId);
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, inGreenRoom: false } : p))
    );
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
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, inGreenRoom: true } : p))
    );
  };

  // Chat message handling with backend SQLite persistence
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

    // Asynchronously persist to SQLite database
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
    setIsChatOpen(true);
  };

  const handleRoomChange = (newCode: string, newTitle?: string) => {
    setRoomCode(newCode);
    if (newTitle) {
      setMeetingTitle(newTitle);
    }
  };

  // If in Pre-Join Lobby screen
  if (inLobby) {
    return (
      <>
        <PreJoinLobby
          roomCode={roomCode}
          meetingTitle={meetingTitle}
          participants={participants}
          currentUser={currentUser}
          onJoinMeeting={(startTab) => {
            if (startTab) setActiveTab(startTab);
            setInLobby(false);
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
        participants={participants}
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

      {/* 2. Central Meeting Workspace (Light Canvas #f8fafc with Low Border Clutter) */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative p-2 md:p-3 gap-2 md:gap-3 bg-[#f8fafc]">
          {/* Main Stage View */}
          {activeTab === 'stage' && (
            <div className="flex-1 w-full h-full">
              <VideoStage
                participants={participants}
                layout={layout}
                onAdmitFromGreenRoom={handleAdmitFromGreenRoom}
                onMoveToGreenRoom={handleMoveToGreenRoom}
                localVideoRef={localVideoRef}
              />
            </div>
          )}

          {/* Collaborative Code Workspace (With split video stage) */}
          {activeTab === 'code-ide' && (
            <div className="flex-1 flex flex-col lg:flex-row w-full h-full gap-2.5">
              <div className="flex-1 h-full min-h-0">
                <CodeWorkspace
                  files={files}
                  activeFileId={activeFileId}
                  onSelectFile={setActiveFileId}
                  onUpdateFileContent={handleUpdateFileContent}
                  onShareToChat={handleShareCodeToChat}
                  onAskAIAboutCode={() => setActiveTab('ai-intelligence')}
                />
              </div>

              {splitVideoEnabled && (
                <div className="w-full lg:w-72 xl:w-80 h-44 lg:h-full flex-shrink-0">
                  <VideoStage
                    participants={participants}
                    layout="gallery"
                    compactMode={true}
                    onAdmitFromGreenRoom={handleAdmitFromGreenRoom}
                    onMoveToGreenRoom={handleMoveToGreenRoom}
                    localVideoRef={localVideoRef}
                  />
                </div>
              )}
            </div>
          )}

          {/* Architecture Whiteboard (With split video stage) */}
          {activeTab === 'whiteboard' && (
            <div className="flex-1 flex flex-col lg:flex-row w-full h-full gap-2.5">
              <div className="flex-1 h-full min-h-0">
                <ArchitectureWhiteboard
                  elements={whiteboardElements}
                  onUpdateElements={setWhiteboardElements}
                  onAskAIAboutArchitecture={() => setActiveTab('ai-intelligence')}
                />
              </div>

              {splitVideoEnabled && (
                <div className="w-full lg:w-72 xl:w-80 h-44 lg:h-full flex-shrink-0">
                  <VideoStage
                    participants={participants}
                    layout="gallery"
                    compactMode={true}
                    onAdmitFromGreenRoom={handleAdmitFromGreenRoom}
                    onMoveToGreenRoom={handleMoveToGreenRoom}
                    localVideoRef={localVideoRef}
                  />
                </div>
              )}
            </div>
          )}

          {/* Investor Pitch Deck (With privacy watermark, slide upload & split video) */}
          {activeTab === 'pitch-deck' && (
            <div className="flex-1 flex flex-col lg:flex-row w-full h-full gap-2.5">
              <div className="flex-1 h-full min-h-0">
                <PitchDeckViewer
                  slides={slides}
                  currentSlideIndex={currentSlideIndex}
                  onSlideChange={setCurrentSlideIndex}
                  isWatermarkActive={isWatermarkActive}
                  currentUser={currentUser}
                  onOpenDealRoom={() => setIsDealRoomOpen(true)}
                  onUploadSlide={(newSlide) => setSlides((prev) => [...prev, newSlide])}
                />
              </div>

              {splitVideoEnabled && (
                <div className="w-full lg:w-72 xl:w-80 h-44 lg:h-full flex-shrink-0">
                  <VideoStage
                    participants={participants}
                    layout="gallery"
                    compactMode={true}
                    onAdmitFromGreenRoom={handleAdmitFromGreenRoom}
                    onMoveToGreenRoom={handleMoveToGreenRoom}
                    localVideoRef={localVideoRef}
                  />
                </div>
              )}
            </div>
          )}

          {/* Conference Timetable & Backstage Green Room */}
          {activeTab === 'agenda' && (
            <div className="flex-1 w-full h-full">
              <AgendaGreenRoom
                agenda={agenda}
                participants={participants}
                onAdmitToStage={handleAdmitFromGreenRoom}
                onMoveToGreenRoom={handleMoveToGreenRoom}
              />
            </div>
          )}

          {/* Gemini AI Live Meeting Intelligence */}
          {activeTab === 'ai-intelligence' && (
            <div className="flex-1 w-full h-full">
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
          <div className="h-full flex-shrink-0 animate-in slide-in-from-right duration-200">
            <ChatAndQAPanel
              messages={chatMessages}
              participants={participants}
              currentUser={currentUser}
              onSendMessage={handleSendMessage}
              onUpvoteQuestion={handleUpvoteQuestion}
              onClose={() => setIsChatOpen(false)}
            />
          </div>
        )}
      </div>

      {/* 3. Floating Bottom Controls Dock */}
      <ConferenceControls
        currentUser={currentUser}
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
        participantCount={participants.length}
        unreadCount={chatMessages.length > 2 ? 1 : 0}
        roomCode={roomCode}
      />

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
