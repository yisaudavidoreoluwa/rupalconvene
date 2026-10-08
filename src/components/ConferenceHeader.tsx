'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Radio, 
  Copy, 
  Check, 
  LayoutGrid, 
  Maximize2, 
  UserPlus, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { StageLayout, Participant } from '@/types/meeting';
import { UserProfileMenu } from '@/components/UserProfileMenu';

interface ConferenceHeaderProps {
  title: string;
  roomCode: string;
  inviteCode?: string;
  participants: Participant[];
  layout: StageLayout;
  onLayoutChange: (layout: StageLayout) => void;
  isWatermarkActive: boolean;
  onToggleWatermark: () => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  onOpenInvite: () => void;
  onOpenDocs?: () => void;
  onBackToPortal?: () => void;
  onOpenProgramSuite?: () => void;
  activeProgramCategory?: string;
}

export const ConferenceHeader: React.FC<ConferenceHeaderProps> = ({
  title,
  roomCode,
  inviteCode,
  participants,
  layout,
  onLayoutChange,
  isWatermarkActive,
  onToggleWatermark,
  isRecording,
  onToggleRecording,
  onOpenInvite,
  onOpenDocs,
  onBackToPortal,
  onOpenProgramSuite,
  activeProgramCategory,
}) => {
  const [copied, setCopied] = useState(false);
  // Meeting timer starts at 00:00 when the meeting begins
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyCode = () => {
    const cleanCode = roomCode.replace(/[^A-Z0-9]/g, '');
    const activeInvite = inviteCode || `INV-${cleanCode.length >= 6 ? cleanCode.slice(-6) : cleanCode.padEnd(6, '9')}`;
    const meetingUrl = typeof window !== 'undefined'
      ? `${window.location.origin}?room=${roomCode}&invite=${activeInvite}`
      : `https://rupalconvene.vercel.app?room=${roomCode}&invite=${activeInvite}`;
    navigator.clipboard.writeText(meetingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const greenRoomParticipants = participants.filter((p) => p.inGreenRoom);

  return (
    <header className="h-14 px-3 sm:px-5 bg-white flex items-center justify-between select-none relative z-30 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)]">
      {/* Left: Branding & Session Room Info */}
      <div className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0">
        {onBackToPortal && (
          <button
            onClick={onBackToPortal}
            className="p-1.5 rounded-xl text-slate-500 hover:text-[#0f172a] hover:bg-slate-50 transition-colors touch-manipulation flex-shrink-0"
            title="Return to Pre-Join Lobby"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center space-x-2.5 min-w-0">
          {/* Rupal clean navy logo */}
          <div className="w-7 h-7 rounded-xl bg-[#0f172a] shadow-xs flex items-center justify-center p-1 flex-shrink-0">
            <span className="font-extrabold text-sm text-white">R</span>
          </div>

          <div className="flex items-center space-x-2 min-w-0">
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#0f172a] whitespace-nowrap hidden xs:inline">
              Rupal Convene
            </span>

            {/* Room Code with Copy Link */}
            <div className="flex items-center space-x-1.5 pl-1 text-xs">
              <span className="text-slate-300 hidden sm:inline">•</span>
              <button 
                onClick={handleCopyCode} 
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-blue-600 font-mono text-[11px] font-medium transition-colors shadow-2xs"
                title="Copy conference invite link"
              >
                <span>{roomCode}</span>
                {copied ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Live Session Indicators (Streamlined & Minimal) */}
      <div className="hidden md:flex items-center space-x-2">
        {/* Live Timer Pill - starts at 00:00 on meeting start */}
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-50 text-[11px] text-[#0f172a] font-semibold shadow-2xs">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-slate-700">{formatTime(elapsedSeconds)}</span>
        </div>

        {/* Recording Toggle */}
        <button
          onClick={onToggleRecording}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all shadow-2xs ${
            isRecording
              ? 'bg-red-50 text-red-600 ring-1 ring-red-200'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
          }`}
          title={isRecording ? 'Stop Recording' : 'Start 1080p Cloud Recording'}
        >
          <Radio className={`w-3 h-3 ${isRecording ? 'animate-pulse text-red-500' : 'text-slate-400'}`} />
          <span>{isRecording ? 'REC 1080p' : 'Record'}</span>
        </button>

        {/* Dynamic Watermark Security Toggle */}
        <button
          onClick={onToggleWatermark}
          className={`p-1.5 rounded-full transition-all text-xs shadow-2xs ${
            isWatermarkActive
              ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-500'
          }`}
          title={isWatermarkActive ? 'Watermark Active (Click to toggle)' : 'Watermark Inactive'}
        >
          {isWatermarkActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        {/* Subtle E2EE Shield */}
        <div 
          className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium shadow-2xs"
          title="256-bit DTLS-SRTP End-to-End Encryption Verified"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden lg:inline text-[10px] font-semibold">E2EE</span>
        </div>

        {/* Green room badge if speakers waiting */}
        {greenRoomParticipants.length > 0 && (
          <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-semibold animate-pulse shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>{greenRoomParticipants.length} Waiting</span>
          </div>
        )}
      </div>

      {/* Right: Layout, Documentation, Invite & User Profile */}
      <div className="flex items-center space-x-2 sm:space-x-2.5">
        {/* Layout Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl">
          <button
            onClick={() => onLayoutChange('gallery')}
            className={`p-1.5 rounded-lg transition-colors ${
              layout === 'gallery' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-slate-500 hover:text-[#0f172a]'
            }`}
            title="Gallery Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onLayoutChange('speaker-focus')}
            className={`p-1.5 rounded-lg transition-colors ${
              layout === 'speaker-focus' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-slate-500 hover:text-[#0f172a]'
            }`}
            title="Speaker Focus View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Program Suite Button */}
        {onOpenProgramSuite && (
          <button
            onClick={onOpenProgramSuite}
            className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-95 touch-manipulation"
            title="Open Program Suite (Hackathon, Workshop, Meetup, Broadcast, Bootcamp, Demo)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">Program Suite</span>
          </button>
        )}

        {/* Docs Button */}
        {onOpenDocs && (
          <button
            onClick={onOpenDocs}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors flex items-center space-x-1"
            title="Open Documentation & API Specs"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden xl:inline text-[11px]">Docs</span>
          </button>
        )}

        {/* Invite Button (Navy Pill) */}
        <button
          onClick={onOpenInvite}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold transition-all shadow-xs active:scale-95 touch-manipulation"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Invite</span>
        </button>

        {/* User Profile */}
        <UserProfileMenu />
      </div>
    </header>
  );
};
