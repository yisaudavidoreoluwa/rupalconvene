'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Radio, 
  Users, 
  Lock, 
  Copy, 
  Check, 
  LayoutGrid, 
  Maximize2, 
  Sparkles,
  Share2,
  Eye,
  EyeOff,
  Home,
  ArrowLeft
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
  const [elapsedSeconds, setElapsedSeconds] = useState(1485); // 24m 45s initially

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

  const activeStageParticipants = participants.filter((p) => !p.inGreenRoom);
  const greenRoomParticipants = participants.filter((p) => p.inGreenRoom);

  return (
    <header className="h-16 px-4 md:px-6 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between select-none relative z-30 backdrop-blur-md">
      {/* Left: Branding & Session Info */}
      <div className="flex items-center space-x-3 md:space-x-4">
        {onBackToPortal && (
          <button
            onClick={onBackToPortal}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700/60"
            title="Return to Rupal Tech Solutions Portal"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Portal</span>
          </button>
        )}

        <div className="flex items-center space-x-2.5">
          {/* Rupal colorful logo box */}
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-700 shadow-md flex items-center justify-center p-1">
            <span className="font-extrabold text-lg bg-gradient-to-tr from-blue-600 via-emerald-500 to-amber-500 bg-clip-text text-transparent">
              R
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Rupal Convene
              </span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Enterprise
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center space-x-2">
              <span className="font-medium text-slate-300 truncate max-w-[140px] md:max-w-[240px]">
                {title}
              </span>
              <span className="text-slate-600">•</span>
              <button 
                onClick={handleCopyCode} 
                className="hover:text-cyan-400 transition-colors flex items-center space-x-1 text-slate-400 font-mono text-[11px]"
                title="Click to copy meeting link"
              >
                <span>{roomCode}</span>
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-60" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Session Status & Watermark Badge */}
      <div className="hidden lg:flex items-center space-x-3">
        {/* Live Timer */}
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono font-medium">{formatTime(elapsedSeconds)}</span>
        </div>

        {/* Recording Toggle */}
        <button
          onClick={onToggleRecording}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
            isRecording
              ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
              : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${isRecording ? 'animate-pulse text-red-400' : ''}`} />
          <span>{isRecording ? 'REC 1080p' : 'Record'}</span>
        </button>

        {/* Security / Watermark Badge */}
        <button
          onClick={onToggleWatermark}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
            isWatermarkActive
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
              : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle dynamic screen-privacy watermark overlay for sensitive partner data"
        >
          {isWatermarkActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{isWatermarkActive ? 'Watermark Active' : 'Watermark Off'}</span>
        </button>

        {/* E2E Security Badge */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="font-medium text-[11px]">WebRTC Encrypted</span>
        </div>
      </div>

      {/* Right: Stage Layout, Green Room Indicator & Invite */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Green room badge if speakers waiting */}
        {greenRoomParticipants.length > 0 && (
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="font-medium">{greenRoomParticipants.length} in Green Room</span>
          </div>
        )}

        {/* Layout Switcher */}
        <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
          <button
            onClick={() => onLayoutChange('gallery')}
            className={`p-1.5 rounded-md transition-colors ${
              layout === 'gallery' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Gallery Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onLayoutChange('speaker-focus')}
            className={`p-1.5 rounded-md transition-colors ${
              layout === 'speaker-focus' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Speaker Focus View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Invite Button */}
        <button
          onClick={onOpenInvite}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-95"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Invite Partners</span>
        </button>
      </div>
    </header>
  );
};
