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
  // Lobby gate: When true, shows Google Meet "Ready to join?" lobby; when false, in live conference call
  const [inLobby, setInLobby] = useState(false); // default directly to active conference room or lobby

  // Conference Suite State
  const [roomCode, setRoomCode] = useState('RUPAL-901-SYNC');
  const [meetingTitle, setMeetingTitle] = useState('Synthetix Architecture & Series B Syndicate Review');
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

  // Data Collections
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [files, setFiles] = useState<CodeFile[]>(INITIAL_FILES);
  const [activeFileId, setActiveFileId] = useState<string>('gateway-ts');
  const [whiteboardElements, setWhiteboardElements] = useState<WhiteboardElement[]>(INITIAL_WHITEBOARD_ELEMENTS);
  const [slides] = useState<PitchSlide[]>(INITIAL_SLIDES);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [agenda, setAgenda] = useState<AgendaItem[]>(INITIAL_AGENDA);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [minutes, setMinutes] = useState<MeetingMinutes>(INITIAL_MINUTES);
  const [captions, setCaptions] = useState<LiveCaption[]>([
    {
      id: 'cap-1',
      speakerId: 'user-partner-1',
      speakerName: 'Elena Rostova',
      speakerRole: 'investor',
      text: 'Alex, we reviewed the Series B allocation with Vanguard partners. Our key condition is verifying p99 sub-2ms latency under peak load.',
      timestamp: '14:31',
    },
    {
      id: 'cap-2',
      speakerId: 'user-self',
      speakerName: 'Alex Vance',
      speakerRole: 'tech-lead',
      text: 'Understood Elena. I am running our live gateway rate-limiting implementation right now in the In-Call IDE.',
      timestamp: '14:32',
    },
    {
      id: 'cap-3',
      speakerId: 'user-dev-2',
      speakerName: 'Marcus Chen',
      speakerRole: 'developer',
      text: 'And I loaded the streaming anomaly detection pipeline in Python for real-time transaction scoring.',
      timestamp: '14:33',
    },
  ]);

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

  // Speaker simulation to give real conference feel
  useEffect(() => {
    if (inLobby) return;

    const interval = setInterval(() => {
      const activeStageParticipants = participants.filter((p) => !p.inGreenRoom);
      if (activeStageParticipants.length > 0) {
        const randomIdx = Math.floor(Math.random() * activeStageParticipants.length);
        setParticipants((prev) =>
          prev.map((p, idx) => ({
            ...p,
            isSpeaking: idx === randomIdx,
          }))
        );
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [participants, inLobby]);

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
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        text: `Elevated ${admitted.name} (${admitted.jobTitle}) from Backstage Green Room to Main Stage.`,
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
          text: `[Stage Check] Glad to join the main plenum. Our slide decks and models are synced.`,
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

  // Chat message handling
  const handleSendMessage = (text: string, type: ChatMessage['type']) => {
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
  };

  const handleUpvoteQuestion = (messageId: string) => {
    setChatMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, upvotes: (m.upvotes || 0) + 1 } : m
      )
    );
  };

  // Code actions
  const handleUpdateFileContent = (fileId: string, newContent: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, content: newContent } : f))
    );
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

  // If in Pre-Join Lobby screen
  if (inLobby) {
    return (
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
      />
    );
  }

  // Active In-Call Conference Suite
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#202124] text-[#e8eaed] font-sans selection:bg-[#1a73e8] selection:text-white">
      {/* 1. Google Meet Styled Header */}
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
        onBackToPortal={() => setInLobby(true)}
      />

      {/* 2. Central Meeting Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative p-2 md:p-3 gap-2 md:gap-3 bg-[#202124]">
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

          {/* Investor Pitch Deck (With privacy watermark & split video) */}
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

      {/* 3. Iconic Google Meet Floating Bottom Bar */}
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
        unreadCount={chatMessages.length > 3 ? 1 : 0}
        roomCode={roomCode}
      />

      {/* Modals */}
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
    </div>
  );
}
