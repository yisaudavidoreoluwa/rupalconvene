'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Radio, 
  Copy, 
  Check, 
  LayoutGrid, 
  Maximize2, 
  Sparkles, 
  Share2, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Lock
} from 'lucide-react';
import { StageLayout, Participant } from '@/types/meeting';

interface ConferenceHeaderProps {
  title: string;
  roomCode: string;
  participants: Participant[];
  layout: StageLayout;
  onLayoutChange: (layout: StageLayout) => void;
  isWatermarkActive: boolean;
  onToggleWatermark: () => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  onOpenInvite: () => void;
  onBackToPortal?: () => void;
}

export const ConferenceHeader: React.FC<ConferenceHeaderProps> = ({
  title,
  roomCode,
  participants,
  layout,
  onLayoutChange,
  isWatermarkActive,
  onToggleWatermark,
  isRecording,
  onToggleRecording,
  onOpenInvite,
  onBackToPortal,
}) => {
  const [copied, setCopied] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(1485); // 24m 45s

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
    navigator.clipboard.writeText(`https://rupal.tech/convene/${roomCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const greenRoomParticipants = participants.filter((p) => p.inGreenRoom);

  return (
    <header className="h-16 px-4 md:px-6 bg-white border-b border-slate-200 flex items-center justify-between select-none relative z-30 shadow-sm">
      {/* Left: Branding & Session Info */}
      <div className="flex items-center space-x-3 md:space-x-4">
        {onBackToPortal && (
          <button
            onClick={onBackToPortal}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0f172a] text-xs font-semibold transition-colors border border-slate-200"
            title="Return to Pre-Join Lobby"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lobby</span>
          </button>
        )}

        <div className="flex items-center space-x-2.5">
          {/* Rupal colorful logo box */}
          <div className="w-8 h-8 rounded-lg bg-[#0f172a] border border-[#1e293b] shadow-sm flex items-center justify-center p-1">
            <span className="font-extrabold text-lg text-white">
              R
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight text-[#0f172a]">
                Rupal Convene
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-[#0f172a] border border-slate-300">
                Enterprise
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center space-x-2">
              <span className="font-medium text-slate-700 truncate max-w-[140px] md:max-w-[240px]">
                {title}
              </span>
              <span className="text-slate-400">•</span>
              <button 
                onClick={handleCopyCode} 
                className="hover:text-blue-700 transition-colors flex items-center space-x-1 text-slate-600 font-mono text-[11px]"
                title="Click to copy meeting link"
              >
                <span>{roomCode}</span>
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 opacity-60" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Session Status & Watermark Badge */}
      <div className="hidden lg:flex items-center space-x-3">
        {/* Live Timer */}
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-[#0f172a] font-semibold">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono">{formatTime(elapsedSeconds)}</span>
        </div>

        {/* Recording Toggle */}
        <button
          onClick={onToggleRecording}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
            isRecording
              ? 'bg-red-50 border-red-300 text-red-600'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${isRecording ? 'animate-pulse text-red-500' : ''}`} />
          <span>{isRecording ? 'REC 1080p' : 'Record'}</span>
        </button>

        {/* Security / Watermark Badge */}
        <button
          onClick={onToggleWatermark}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
            isWatermarkActive
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
          title="Toggle dynamic screen-privacy watermark overlay"
        >
          {isWatermarkActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{isWatermarkActive ? 'Watermark Active' : 'Watermark Off'}</span>
        </button>

        {/* E2E Security Badge */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="text-[11px]">WebRTC Encrypted</span>
        </div>
      </div>

      {/* Right: Stage Layout, Green Room Indicator & Invite */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Green room badge if speakers waiting */}
        {greenRoomParticipants.length > 0 && (
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>{greenRoomParticipants.length} in Green Room</span>
          </div>
        )}

        {/* Layout Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => onLayoutChange('gallery')}
            className={`p-1.5 rounded-md transition-colors ${
              layout === 'gallery' ? 'bg-white text-[#0f172a] shadow-sm' : 'text-slate-500 hover:text-[#0f172a]'
            }`}
            title="Gallery Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onLayoutChange('speaker-focus')}
            className={`p-1.5 rounded-md transition-colors ${
              layout === 'speaker-focus' ? 'bg-white text-[#0f172a] shadow-sm' : 'text-slate-500 hover:text-[#0f172a]'
            }`}
            title="Speaker Focus View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Invite Button (Navy Blue) */}
        <button
          onClick={onOpenInvite}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold shadow-md shadow-slate-900/10 transition-all active:scale-95"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Invite Partners</span>
        </button>
      </div>
    </header>
  );
};
