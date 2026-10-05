'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { VideoTile } from './VideoTile';
import { Participant, StageLayout, LiveCaption } from '@/types/meeting';
import { 
  UserCheck, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  UserPlus, 
  Users,
  Grid,
  Maximize2
} from 'lucide-react';
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
  roomCode?: string;
  onOpenInvite?: () => void;
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
  roomCode,
  onOpenInvite,
}) => {
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [internalNotesOpen, setInternalNotesOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(12); // Up to 12 tiles per page by default for 30+ scalability

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

  const stageParticipants = useMemo(() => {
    return participants.filter((p) => !p.inGreenRoom);
  }, [participants]);

  const greenRoomParticipants = useMemo(() => {
    return participants.filter((p) => p.inGreenRoom);
  }, [participants]);

  // Sort participants: self first, then active speakers, then rest
  const sortedStageParticipants = useMemo(() => {
    return [...stageParticipants].sort((a, b) => {
      const aIsSelf = checkIsSelf(a.id);
      const bIsSelf = checkIsSelf(b.id);
      if (aIsSelf && !bIsSelf) return -1;
      if (!aIsSelf && bIsSelf) return 1;
      if (a.isSpeaking && !b.isSpeaking) return -1;
      if (!a.isSpeaking && b.isSpeaking) return 1;
      if (a.handRaised && !b.handRaised) return -1;
      if (!a.handRaised && b.handRaised) return 1;
      return 0;
    });
  }, [stageParticipants, currentUserId]);

  // Pagination calculation for 30+ participants
  const totalPages = Math.max(1, Math.ceil(sortedStageParticipants.length / pageSize));
  const effectivePage = Math.min(currentPage, totalPages);

  // Reset page if out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Current page participants
  const displayParticipants = useMemo(() => {
    if (compactMode) return sortedStageParticipants;
    if (sortedStageParticipants.length <= pageSize) return sortedStageParticipants;

    const startIndex = (effectivePage - 1) * pageSize;
    return sortedStageParticipants.slice(startIndex, startIndex + pageSize);
  }, [compactMode, sortedStageParticipants, effectivePage, pageSize]);

  // Check if someone on another page is actively speaking
  const speakingOutsidePage = useMemo(() => {
    if (totalPages <= 1) return null;
    const speaker = sortedStageParticipants.find(
      (p) => p.isSpeaking && !displayParticipants.some((dp) => dp.id === p.id)
    );
    if (!speaker) return null;
    const speakerIndex = sortedStageParticipants.findIndex((p) => p.id === speaker.id);
    const speakerPage = Math.floor(speakerIndex / pageSize) + 1;
    return { participant: speaker, page: speakerPage };
  }, [sortedStageParticipants, displayParticipants, totalPages, pageSize]);

  // Primary speaker for Spotlight / Speaker-Focus mode
  const primaryParticipant = useMemo(() => {
    return (
      sortedStageParticipants.find((p) => p.id === pinnedId) ||
      sortedStageParticipants.find((p) => p.isSpeaking) ||
      sortedStageParticipants[0]
    );
  }, [sortedStageParticipants, pinnedId]);

  const secondaryParticipants = useMemo(() => {
    return sortedStageParticipants.filter((p) => p.id !== primaryParticipant?.id);
  }, [sortedStageParticipants, primaryParticipant]);

  // Adaptive Grid styling based on visible count
  const getGalleryGridClass = (count: number) => {
    if (count <= 1) return 'grid-cols-1 grid-rows-1 max-w-4xl max-h-[85vh] mx-auto';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1';
    if (count <= 4) return 'grid-cols-2 grid-rows-2';
    if (count <= 6) return 'grid-cols-2 md:grid-cols-3 grid-rows-3 md:grid-rows-2';
    if (count <= 9) return 'grid-cols-2 sm:grid-cols-3 grid-rows-4 sm:grid-rows-3';
    if (count <= 12) return 'grid-cols-3 md:grid-cols-4 grid-rows-4 md:grid-rows-3';
    return 'grid-cols-3 md:grid-cols-4 lg:grid-cols-4 grid-rows-4';
  };

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

      {/* Floating Gemini "My Notes" Card (Closed by default to avoid obscuring video tiles) */}
      {!compactMode && notesOpen && (
        <GeminiNotesCard
          isOpen={notesOpen}
          onClose={() => setNotesOpen(false)}
          captions={captions}
          meetingTitle={meetingTitle}
        />
      )}

      {/* Single Participant Prompt Pill */}
      {stageParticipants.length === 1 && !compactMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#181a20]/90 backdrop-blur-md border border-white/10 text-white shadow-xl text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-200">You are the only one in this meeting</span>
          {onOpenInvite && (
            <button
              onClick={onOpenInvite}
              className="ml-1.5 px-2.5 py-0.5 rounded-md bg-blue-600 hover:bg-blue-500 font-semibold text-[11px] text-white transition-colors cursor-pointer flex items-center space-x-1"
            >
              <UserPlus className="w-3 h-3" />
              <span>Invite Others</span>
            </button>
          )}
        </div>
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
        /* Spotlight / Speaker-Focus Mode (Supports 30+ participants filmstrip) */
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

          {/* Filmstrip of all other participants */}
          {secondaryParticipants.length > 0 && (
            <div className="relative">
              <div className="h-28 sm:h-32 flex gap-2.5 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-white/10">
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

              {/* Total count badge for 30+ attendees */}
              {stageParticipants.length > 4 && (
                <div className="absolute -top-3 right-2 px-2.5 py-0.5 rounded-full bg-[#181a20] border border-white/10 text-[10px] text-slate-300 font-medium">
                  {stageParticipants.length} attendees on stage
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Adaptive Multi-User Gallery Grid (Clean, Spacious, Supports 1 to 30+ Users) */
        <div className="flex-1 flex flex-col min-h-0 w-full">
          <div 
            className={`flex-1 grid gap-2 sm:gap-2.5 auto-rows-fr h-full w-full ${getGalleryGridClass(displayParticipants.length)}`}
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

          {/* Floating Pagination Bar for 30+ Participants */}
          {totalPages > 1 && (
            <div className="mt-2 px-3 py-1.5 rounded-xl bg-[#111318]/95 border border-white/10 backdrop-blur-md flex items-center justify-between text-xs text-slate-300 shadow-xl flex-shrink-0">
              {/* Left: Previous / Next & Page Indicators */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={effectivePage === 1}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-white font-medium transition-colors flex items-center space-x-1 cursor-pointer"
                  title="Previous page (Left arrow)"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center space-x-1.5 px-2">
                  <span className="font-bold text-white">
                    Page {effectivePage} of {totalPages}
                  </span>
                  <span className="text-slate-400">
                    • {stageParticipants.length} Participants
                  </span>
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={effectivePage === totalPages}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-white font-medium transition-colors flex items-center space-x-1 cursor-pointer"
                  title="Next page (Right arrow)"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Right: Speaking Outside Current Page Alert */}
              <div className="flex items-center space-x-2">
                {speakingOutsidePage && (
                  <button
                    onClick={() => setCurrentPage(speakingOutsidePage.page)}
                    className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse font-medium text-xs hover:bg-emerald-500/30 transition-colors cursor-pointer"
                    title={`Go to Page ${speakingOutsidePage.page}`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{speakingOutsidePage.participant.name.split(' ')[0]} is speaking on Page {speakingOutsidePage.page}</span>
                  </button>
                )}

                {/* Page Size Toggle (12 vs 16 vs All) */}
                <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/5 text-[11px]">
                  <button
                    onClick={() => setPageSize(12)}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      pageSize === 12 ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    12 / page
                  </button>
                  <button
                    onClick={() => setPageSize(16)}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      pageSize === 16 ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    16 / page
                  </button>
                  <button
                    onClick={() => setPageSize(Math.max(36, stageParticipants.length))}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      pageSize > 16 ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
