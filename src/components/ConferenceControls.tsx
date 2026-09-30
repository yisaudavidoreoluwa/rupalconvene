'use client';

import React from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  ScreenShare, 
  Code, 
  Layout, 
  Presentation, 
  Calendar, 
  Sparkles, 
  MessageSquare, 
  Hand, 
  PhoneOff, 
  Shield, 
  Settings,
  Grid
} from 'lucide-react';
import { ActiveWorkspaceTab, Participant } from '@/types/meeting';

interface ConferenceControlsProps {
  currentUser: Participant;
  activeTab: ActiveWorkspaceTab;
  onTabChange: (tab: ActiveWorkspaceTab) => void;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleHandRaise: () => void;
  isChatOpen: boolean;
  onToggleChat: () => void;
  onLeaveMeeting: () => void;
  unreadCount?: number;
}

export const ConferenceControls: React.FC<ConferenceControlsProps> = ({
  currentUser,
  activeTab,
  onTabChange,
  onToggleMic,
  onToggleVideo,
  onToggleScreenShare,
  onToggleHandRaise,
  isChatOpen,
  onToggleChat,
  onLeaveMeeting,
  unreadCount = 0,
}) => {
  return (
    <div className="h-20 bg-slate-900/90 border-t border-slate-800/80 px-4 flex items-center justify-between z-30 select-none backdrop-blur-lg">
      {/* Left: AV Hardware Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Microphone Toggle */}
        <button
          onClick={onToggleMic}
          className={`flex items-center space-x-2 px-3 sm:px-4 py-2.5 rounded-xl font-medium text-xs transition-all shadow-md active:scale-95 ${
            currentUser.isMuted
              ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 shadow-red-500/10'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
          }`}
          title={currentUser.isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {currentUser.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
          <span className="hidden md:inline">{currentUser.isMuted ? 'Muted' : 'Mute'}</span>
        </button>

        {/* Camera Toggle */}
        <button
          onClick={onToggleVideo}
          className={`flex items-center space-x-2 px-3 sm:px-4 py-2.5 rounded-xl font-medium text-xs transition-all shadow-md active:scale-95 ${
            currentUser.isVideoOff
              ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 shadow-red-500/10'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
          }`}
          title={currentUser.isVideoOff ? 'Start Camera' : 'Stop Camera'}
        >
          {currentUser.isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4 text-emerald-400" />}
          <span className="hidden md:inline">{currentUser.isVideoOff ? 'Video Off' : 'Stop Video'}</span>
        </button>

        {/* Screen Share */}
        <button
          onClick={onToggleScreenShare}
          className={`flex items-center space-x-2 px-3 sm:px-4 py-2.5 rounded-xl font-medium text-xs transition-all shadow-md active:scale-95 ${
            currentUser.isScreenSharing
              ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
          title="Share Screen"
        >
          <ScreenShare className="w-4 h-4" />
          <span className="hidden lg:inline">{currentUser.isScreenSharing ? 'Sharing' : 'Share Screen'}</span>
        </button>
      </div>

      {/* Center: Collaborative Workspace Switcher */}
      <div className="flex items-center bg-slate-950/80 p-1 rounded-2xl border border-slate-800 shadow-xl overflow-x-auto max-w-full">
        {/* Main Stage */}
        <button
          onClick={() => onTabChange('stage')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'stage'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span className="hidden sm:inline">Main Stage</span>
        </button>

        {/* Collaborative Code IDE */}
        <button
          onClick={() => onTabChange('code-ide')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'code-ide'
              ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Code IDE</span>
        </button>

        {/* Architecture Whiteboard */}
        <button
          onClick={() => onTabChange('whiteboard')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'whiteboard'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span className="hidden sm:inline">Whiteboard</span>
        </button>

        {/* Investor Pitch Deck */}
        <button
          onClick={() => onTabChange('pitch-deck')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'pitch-deck'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Presentation className="w-4 h-4" />
          <span>Pitch Deck</span>
        </button>

        {/* Timetable & Green Room */}
        <button
          onClick={() => onTabChange('agenda')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'agenda'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="hidden md:inline">Agenda</span>
        </button>

        {/* Gemini AI Intelligence */}
        <button
          onClick={() => onTabChange('ai-intelligence')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'ai-intelligence'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="hidden lg:inline">AI Intelligence</span>
        </button>
      </div>

      {/* Right: Raise Hand, Chat Drawer Toggle & Leave Call */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Hand Raise */}
        <button
          onClick={onToggleHandRaise}
          className={`p-2.5 rounded-xl border transition-all ${
            currentUser.handRaised
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
          title={currentUser.handRaised ? 'Lower Hand' : 'Raise Hand'}
        >
          <Hand className="w-4 h-4" />
        </button>

        {/* Chat / Q&A Button */}
        <button
          onClick={onToggleChat}
          className={`relative p-2.5 rounded-xl border transition-all ${
            isChatOpen
              ? 'bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-600/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
          title="Toggle Chat & Q&A Panel"
        >
          <MessageSquare className="w-4 h-4" />
          {unreadCount > 0 && !isChatOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 text-[10px] font-bold text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* End / Leave Meeting */}
        <button
          onClick={onLeaveMeeting}
          className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all active:scale-95"
          title="Leave Conference"
        >
          <PhoneOff className="w-4 h-4" />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>
    </div>
  );
};
