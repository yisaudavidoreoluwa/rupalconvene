'use client';

import React, { useState, useMemo } from 'react';
import { VideoTile } from './VideoTile';
import { Participant, StageLayout, LiveCaption } from '@/types/meeting';
import { UserCheck, Sparkles } from 'lucide-react';
import { GeminiNotesCard } from './GeminiNotesCard';

interface VideoStageProps {
  participants: Participant[];
  layout: StageLayout;
  onAdmitFromGreenRoom: (participantId: string) => void;
  onMoveToGreenRoom: (participantId: string) => void;
  localVideoRef?: React.RefObject<HTMLVideoElement | null>;
  compactMode?: boolean;
  currentUserId?: string;
  localStream?: MediaStream | null;
  captions?: LiveCaption[];
  meetingTitle?: string;
  isNotesOpen?: boolean;
  onToggleNotes?: () => void;
}

export const VideoStage: React.FC<VideoStageProps> = ({
  participants,
  layout,
  onAdmitFromGreenRoom,
  onMoveToGreenRoom,
  localVideoRef,
  compactMode = false,
  currentUserId,
  localStream,
  captions = [],
  meetingTitle = 'Executive & Engineering Sync',
  isNotesOpen: externalNotesOpen,
  onToggleNotes,
}) => {
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [internalNotesOpen, setInternalNotesOpen] = useState(true);

  const notesOpen = externalNotesOpen !== undefined ? externalNotesOpen : internalNotesOpen;
  const setNotesOpen = (open: boolean) => {
    setInternalNotesOpen(open);
    if (onToggleNotes && open !== notesOpen) {
      onToggleNotes();
    }
  };

  const checkIsSelf = (participantId: string) => {
    return (
      participantId === currentUserId ||
      participantId === 'user-self' ||
      (!!currentUserId && participantId.startsWith(currentUserId))
    );
  };

  const stageParticipants = participants.filter((p) => !p.inGreenRoom);
  const greenRoomParticipants = participants.filter((p) => p.inGreenRoom);

  // Purely real participants - zero dummy or simulated attendees
  const displayParticipants = useMemo(() => {
    return stageParticipants;
  }, [stageParticipants]);

  const primaryParticipant = 
    displayParticipants.find((p) => p.id === pinnedId) ||
    displayParticipants.find((p) => p.isSpeaking) ||
    displayParticipants[0];

  const secondaryParticipants = displayParticipants.filter(
    (p) => p.id !== primaryParticipant?.id
  );

  return (
    <div className="relative w-full h-full flex flex-col p-1.5 sm:p-2 md:p-2.5 overflow-hidden bg-[#0a0c10] select-none">
      {/* Green Room Alert Bar for Stage Hosts */}
      {greenRoomParticipants.length > 0 && !compactMode && (
        <div className="mb-2 px-3.5 py-2 rounded-xl bg-amber-950/80 border border-amber-500/30 text-amber-200 flex items-center justify-between shadow-lg z-20 backdrop-blur-md">
          <div className="flex items-center space-x-2 text-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="font-bold text-amber-100">Green Room:</span>
            <span className="text-amber-300 hidden sm:inline">
              {greenRoomParticipants.map((p) => `${p.name} (${p.jobTitle})`).join(', ')}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {greenRoomParticipants.map((p) => (
              <button
                key={p.id}
                onClick={() => onAdmitFromGreenRoom(p.id)}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-xs"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Admit {p.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Gemini "My Notes" Card matching reference image */}
      {!compactMode && (
        <GeminiNotesCard
          isOpen={notesOpen}
          onClose={() => setNotesOpen(false)}
          captions={captions}
          meetingTitle={meetingTitle}
        />
      )}

      {/* Reopen Notes Button if Closed */}
      {!notesOpen && !compactMode && (
        <button
          onClick={() => setNotesOpen(true)}
          className="absolute top-4 right-4 z-30 flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#181a20]/90 hover:bg-[#22252e] text-white border border-white/10 shadow-xl backdrop-blur-md text-xs font-semibold transition-all active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>My Notes</span>
        </button>
      )}

      {/* Video Tile Layout */}
      {compactMode ? (
        /* Compact Vertical Ribbon when Code IDE or Whiteboard is open */
        <div className="w-full flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto max-h-[280px] md:max-h-full pb-2">
          {stageParticipants.map((p) => {
            const isSelf = checkIsSelf(p.id);
            const stream = (isSelf && !p.stream && localStream) ? localStream : p.stream;
            const participantWithStream = stream ? { ...p, stream } : p;
            return (
              <div key={p.id} className="min-w-[190px] md:min-w-0 md:w-full h-36 flex-shrink-0">
                <VideoTile
                  participant={participantWithStream}
                  isSelf={isSelf}
                  isPinned={pinnedId === p.id}
                  onPinToggle={() => setPinnedId(pinnedId === p.id ? null : p.id)}
                  localVideoRef={isSelf ? localVideoRef : undefined}
                />
              </div>
            );
          })}
        </div>
      ) : layout === 'speaker-focus' && primaryParticipant ? (
        /* Spotlight Mode */
        <div className="flex-1 flex flex-col gap-2.5 min-h-0">
          <div className="flex-1 min-h-0 relative">
            {(() => {
              const isSelf = checkIsSelf(primaryParticipant.id);
              const stream = (isSelf && !primaryParticipant.stream && localStream) ? localStream : primaryParticipant.stream;
              const primaryWithStream = stream ? { ...primaryParticipant, stream } : primaryParticipant;
              return (
                <VideoTile
                  participant={primaryWithStream}
                  isSelf={isSelf}
                  isPinned={pinnedId === primaryParticipant.id}
                  onPinToggle={() => setPinnedId(null)}
                  localVideoRef={isSelf ? localVideoRef : undefined}
                />
              );
            })()}
          </div>

          {secondaryParticipants.length > 0 && (
            <div className="h-28 sm:h-32 flex gap-2.5 overflow-x-auto py-1">
              {secondaryParticipants.map((p) => {
                const isSelf = checkIsSelf(p.id);
                const stream = (isSelf && !p.stream && localStream) ? localStream : p.stream;
                const secondaryWithStream = stream ? { ...p, stream } : p;
                return (
                  <div key={p.id} className="w-44 sm:w-52 h-full flex-shrink-0">
                    <VideoTile
                      participant={secondaryWithStream}
                      isSelf={isSelf}
                      isPinned={pinnedId === p.id}
                      onPinToggle={() => setPinnedId(p.id)}
                      onMoveToGreenRoom={() => onMoveToGreenRoom(p.id)}
                      localVideoRef={isSelf ? localVideoRef : undefined}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* 2x2 Gallery Grid Matching Reference Screenshot Exactly */
        <div 
          className={`flex-1 grid gap-2 sm:gap-2.5 auto-rows-fr h-full w-full ${
            displayParticipants.length <= 1
              ? 'grid-cols-1 grid-rows-1'
              : displayParticipants.length === 2
              ? 'grid-cols-1 sm:grid-cols-2 grid-rows-1'
              : 'grid-cols-2 grid-rows-2'
          }`}
        >
          {displayParticipants.map((p) => {
            const isSelf = checkIsSelf(p.id);
            const stream = (isSelf && !p.stream && localStream) ? localStream : p.stream;
            const participantWithStream = stream ? { ...p, stream } : p;
            return (
              <div key={p.id} className="w-full h-full min-h-0 relative">
                <VideoTile
                  participant={participantWithStream}
                  isSelf={isSelf}
                  isPinned={pinnedId === p.id}
                  onPinToggle={() => setPinnedId(pinnedId === p.id ? null : p.id)}
                  onMoveToGreenRoom={() => onMoveToGreenRoom(p.id)}
                  localVideoRef={isSelf ? localVideoRef : undefined}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
