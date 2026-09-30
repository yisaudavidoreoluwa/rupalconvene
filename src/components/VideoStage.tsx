'use client';

import React, { useState } from 'react';
import { VideoTile } from './VideoTile';
import { Participant, StageLayout } from '@/types/meeting';
import { UserCheck, Sparkles, AlertCircle } from 'lucide-react';

interface VideoStageProps {
  participants: Participant[];
  layout: StageLayout;
  onAdmitFromGreenRoom: (participantId: string) => void;
  onMoveToGreenRoom: (participantId: string) => void;
  localVideoRef?: React.RefObject<HTMLVideoElement | null>;
  compactMode?: boolean; // For when IDE or Whiteboard is open side-by-side
}

export const VideoStage: React.FC<VideoStageProps> = ({
  participants,
  layout,
  onAdmitFromGreenRoom,
  onMoveToGreenRoom,
  localVideoRef,
  compactMode = false,
}) => {
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  const stageParticipants = participants.filter((p) => !p.inGreenRoom);
  const greenRoomParticipants = participants.filter((p) => p.inGreenRoom);

  // Active speaker or pinned participant
  const primaryParticipant = 
    stageParticipants.find((p) => p.id === pinnedId) ||
    stageParticipants.find((p) => p.isSpeaking) ||
    stageParticipants[0];

  const secondaryParticipants = stageParticipants.filter(
    (p) => p.id !== primaryParticipant?.id
  );

  return (
    <div className="relative w-full h-full flex flex-col p-3 md:p-4 overflow-hidden">
      {/* Green Room Notification Banner for Stage Admins */}
      {greenRoomParticipants.length > 0 && !compactMode && (
        <div className="mb-3 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-center justify-between shadow-lg backdrop-blur-md">
          <div className="flex items-center space-x-3 text-xs md:text-sm">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span className="font-semibold text-amber-300">
              Backstage Green Room:
            </span>
            <span className="text-slate-300 hidden sm:inline">
              {greenRoomParticipants.map((p) => `${p.name} (${p.jobTitle})`).join(', ')}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {greenRoomParticipants.map((p) => (
              <button
                key={p.id}
                onClick={() => onAdmitFromGreenRoom(p.id)}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Admit {p.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Video Layout Rendering */}
      {compactMode ? (
        /* Compact Vertical/Horizontal Ribbon for Split Workspace */
        <div className="w-full flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[300px] md:max-h-full pb-2">
          {stageParticipants.map((p) => (
            <div key={p.id} className="min-w-[200px] md:min-w-0 md:w-full h-36 flex-shrink-0">
              <VideoTile
                participant={p}
                isSelf={p.id === 'user-self'}
                isPinned={pinnedId === p.id}
                onPinToggle={() => setPinnedId(pinnedId === p.id ? null : p.id)}
                localVideoRef={p.id === 'user-self' ? localVideoRef : undefined}
              />
            </div>
          ))}
        </div>
      ) : layout === 'speaker-focus' && primaryParticipant ? (
        /* Speaker Spotlight Mode */
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          <div className="flex-1 min-h-0 relative">
            <VideoTile
              participant={primaryParticipant}
              isSelf={primaryParticipant.id === 'user-self'}
              isPinned={pinnedId === primaryParticipant.id}
              onPinToggle={() => setPinnedId(null)}
              localVideoRef={primaryParticipant.id === 'user-self' ? localVideoRef : undefined}
            />
          </div>

          {/* Bottom Thumbnails */}
          {secondaryParticipants.length > 0 && (
            <div className="h-32 sm:h-36 flex gap-3 overflow-x-auto py-1">
              {secondaryParticipants.map((p) => (
                <div key={p.id} className="w-48 sm:w-56 h-full flex-shrink-0">
                  <VideoTile
                    participant={p}
                    isSelf={p.id === 'user-self'}
                    isPinned={pinnedId === p.id}
                    onPinToggle={() => setPinnedId(p.id)}
                    onMoveToGreenRoom={() => onMoveToGreenRoom(p.id)}
                    localVideoRef={p.id === 'user-self' ? localVideoRef : undefined}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Gallery Grid Mode */
        <div 
          className={`flex-1 grid gap-3.5 sm:gap-4 auto-rows-fr ${
            stageParticipants.length <= 1
              ? 'grid-cols-1'
              : stageParticipants.length === 2
              ? 'grid-cols-1 sm:grid-cols-2'
              : stageParticipants.length <= 4
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {stageParticipants.map((p) => (
            <div key={p.id} className="w-full h-full min-h-[190px]">
              <VideoTile
                participant={p}
                isSelf={p.id === 'user-self'}
                isPinned={pinnedId === p.id}
                onPinToggle={() => setPinnedId(pinnedId === p.id ? null : p.id)}
                onMoveToGreenRoom={() => onMoveToGreenRoom(p.id)}
                localVideoRef={p.id === 'user-self' ? localVideoRef : undefined}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
