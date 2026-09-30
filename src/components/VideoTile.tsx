'use client';

import React from 'react';
import { 
  Mic, 
  MicOff, 
  Pin, 
  Volume2 
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
      className={`group relative w-full h-full rounded-2xl overflow-hidden bg-[#0a192f] transition-all duration-200 flex flex-col justify-between shadow-xs select-none ${
        participant.isSpeaking
          ? 'ring-2 ring-emerald-500 shadow-emerald-500/10'
          : isPinned
          ? 'ring-2 ring-blue-500'
          : 'ring-1 ring-slate-800/60 hover:ring-slate-700'
      }`}
    >
      {/* Video Content Layer */}
      <div className="absolute inset-0 w-full h-full bg-[#0a192f] flex items-center justify-center overflow-hidden">
        {isSelf && localVideoRef ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform -scale-x-100 ${
              participant.isVideoOff ? 'hidden' : 'block'
            }`}
          />
        ) : null}

        {/* Fallback Avatar Screen */}
        {(!isSelf || participant.isVideoOff) && (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#0f172a] via-[#0a192f] to-[#0f172a]">
            <div className="relative mb-3">
              <img
                src={participant.avatar}
                alt={participant.name}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-lg transition-transform group-hover:scale-105 ${
                  participant.isSpeaking
                    ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#0a192f]'
                    : 'ring-1 ring-slate-700'
                }`}
              />
              {participant.isSpeaking && (
                <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-white shadow-xs">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                </div>
              )}
            </div>

            <div className="text-center z-10">
              <div className="text-sm font-bold text-white truncate max-w-[200px]">
                {participant.name} {isSelf && '(You)'}
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-[200px] font-medium">
                {participant.jobTitle}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Bar: Role Pill & Mic Status */}
      <div className="relative z-10 p-2.5 flex items-center justify-between w-full">
        <div className="flex items-center space-x-1.5">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase backdrop-blur-md ${badge.color}`}>
            {badge.label}
          </span>
          {participant.handRaised && (
            <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">
              ✋ Hand Raised
            </span>
          )}
        </div>

        {/* Top-Right Mute Badge */}
        <div className="flex items-center space-x-1">
          {participant.isMuted && (
            <div className="p-1 rounded-full bg-red-500 text-white shadow-xs" title="Muted">
              <MicOff className="w-3 h-3" />
            </div>
          )}

          {onPinToggle && (
            <button
              onClick={onPinToggle}
              className={`p-1 rounded bg-[#0f172a]/80 text-slate-400 hover:text-white transition-opacity opacity-0 group-hover:opacity-100 ${
                isPinned ? 'opacity-100 text-blue-400' : ''
              }`}
              title={isPinned ? 'Unpin' : 'Pin tile'}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Bar: Name Tag in Navy Pill */}
      <div className="relative z-10 p-2.5 flex items-center justify-between w-full">
        <div className="px-2.5 py-1 rounded-md bg-[#0f172a]/90 text-white text-xs font-semibold backdrop-blur-md flex items-center space-x-1.5 shadow-xs">
          <span>{participant.name} {isSelf && '(You)'}</span>
        </div>

        {/* Speaking Waveform Indicator */}
        {participant.isSpeaking && (
          <div className="flex items-center space-x-0.5 px-2 py-1 rounded-md bg-[#0f172a]/90">
            <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-bounce" />
            <span className="w-0.5 h-3.5 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_100ms]" />
            <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_200ms]" />
          </div>
        )}
      </div>
    </div>
  );
};
