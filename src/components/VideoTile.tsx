'use client';

import React from 'react';
import { 
  Mic, 
  MicOff, 
  Pin, 
  MoreVertical, 
  Shield, 
  Briefcase, 
  Code, 
  Sparkles, 
  TrendingUp,
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
}

export const VideoTile: React.FC<VideoTileProps> = ({
  participant,
  isSelf = false,
  isPinned = false,
  onPinToggle,
  onMoveToGreenRoom,
  localVideoRef,
}) => {
  const getRoleBadge = (role: ParticipantRole) => {
    switch (role) {
      case 'tech-lead':
        return {
          label: 'Tech Lead',
          className: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
          icon: <Code className="w-3 h-3 text-violet-400" />
        };
      case 'developer':
        return {
          label: 'Engineer',
          className: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          icon: <Code className="w-3 h-3 text-cyan-400" />
        };
      case 'investor':
        return {
          label: 'Investor / VC',
          className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: <TrendingUp className="w-3 h-3 text-emerald-400" />
        };
      case 'business-partner':
        return {
          label: 'Partner',
          className: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          icon: <Briefcase className="w-3 h-3 text-indigo-400" />
        };
      case 'host':
        return {
          label: 'Host',
          className: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: <Shield className="w-3 h-3 text-amber-400" />
        };
      default:
        return {
          label: 'Guest',
          className: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
          icon: null
        };
    }
  };

  const badge = getRoleBadge(participant.role);

  return (
    <div 
      className={`group relative rounded-2xl overflow-hidden bg-slate-900 border transition-all duration-300 flex flex-col justify-between shadow-xl ${
        participant.isSpeaking
          ? 'ring-2 ring-emerald-500/80 border-emerald-500/50 shadow-emerald-500/10'
          : isPinned
          ? 'ring-2 ring-violet-500/70 border-violet-500/50'
          : 'border-slate-800 hover:border-slate-700/80'
      }`}
    >
      {/* Background / Video Feed */}
      <div className="absolute inset-0 w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
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

        {/* Fallback Avatar & Simulated Video Background */}
        {(!isSelf || participant.isVideoOff) && (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
            {/* Ambient background glow matching role */}
            <div 
              className={`absolute w-36 h-36 rounded-full blur-3xl opacity-20 ${
                participant.role === 'tech-lead' || participant.role === 'developer'
                  ? 'bg-violet-600'
                  : participant.role === 'investor'
                  ? 'bg-emerald-600'
                  : 'bg-indigo-600'
              }`}
            />
            
            <div className="relative mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={participant.avatar}
                alt={participant.name}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-2 shadow-2xl transition-transform duration-300 group-hover:scale-105 ${
                  participant.isSpeaking
                    ? 'ring-emerald-400 ring-offset-2 ring-offset-slate-950'
                    : 'ring-slate-700'
                }`}
              />
              {participant.isSpeaking && (
                <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full shadow-lg text-white">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                </div>
              )}
            </div>

            <div className="text-center z-10">
              <div className="text-sm font-semibold text-white tracking-wide truncate max-w-[200px]">
                {participant.name} {isSelf && '(You)'}
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                {participant.jobTitle} • {participant.organization}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Bar: Role Badge & Quick Actions */}
      <div className="relative z-10 p-3 flex items-center justify-between w-full bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-transparent">
        <div className="flex items-center space-x-1.5">
          <span 
            className={`flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wider uppercase border backdrop-blur-md ${badge.className}`}
          >
            {badge.icon}
            <span>{badge.label}</span>
          </span>

          {participant.handRaised && (
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold animate-bounce">
              ✋ Raised Hand
            </span>
          )}
        </div>

        {/* Hover Action Buttons */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 bg-slate-900/80 p-1 rounded-lg border border-slate-700/50 backdrop-blur-md">
          {onPinToggle && (
            <button
              onClick={onPinToggle}
              className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                isPinned ? 'text-violet-400' : 'text-slate-400 hover:text-white'
              }`}
              title={isPinned ? 'Unpin' : 'Pin Stage'}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
          )}
          {onMoveToGreenRoom && !isSelf && (
            <button
              onClick={onMoveToGreenRoom}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 transition-colors"
              title="Send to Green Room"
            >
              Green Room
            </button>
          )}
        </div>
      </div>

      {/* Bottom Bar: Name & Mic Status & Speech Meter */}
      <div className="relative z-10 p-3 flex items-center justify-between w-full bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent">
        <div className="flex items-center space-x-2">
          <div 
            className={`p-1.5 rounded-full backdrop-blur-md ${
              participant.isMuted 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {participant.isMuted ? (
              <MicOff className="w-3 h-3" />
            ) : (
              <Mic className="w-3 h-3" />
            )}
          </div>
          
          <span className="text-xs font-medium text-slate-200 truncate max-w-[150px] shadow-sm">
            {participant.name} {isSelf && '(You)'}
          </span>
        </div>

        {/* Audio Waveform Indicator */}
        {participant.isSpeaking && (
          <div className="flex items-center space-x-0.5 px-2 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/30">
            <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_100ms]" />
            <span className="w-0.5 h-3.5 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_200ms]" />
            <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_300ms]" />
            <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_150ms]" />
          </div>
        )}
      </div>
    </div>
  );
};
