'use client';

import React, { useState } from 'react';
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
  ShieldCheck, 
  Smile,
  Subtitles,
  Briefcase
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
  onOpenDealRoom: () => void;
  participantCount?: number;
  unreadCount?: number;
  roomCode?: string;
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
  onOpenDealRoom,
  participantCount = 6,
  unreadCount = 0,
  roomCode = 'RUPAL-901-SYNC',
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [captionsActive, setCaptionsActive] = useState(true);
  const [currentTime, setCurrentTime] = useState('14:35');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-20 bg-white border-t border-slate-100 px-4 sm:px-6 flex items-center justify-between z-30 select-none shadow-xs">
      {/* Left: Meeting Time & Room Identifier in Navy Blue */}
      <div className="hidden md:flex items-center space-x-3 text-sm font-semibold text-[#0f172a]">
        <span className="font-mono text-xs text-slate-500">{currentTime}</span>
        <span className="text-slate-300">|</span>
        <span className="text-xs font-bold text-[#0f172a]">{roomCode}</span>
        <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[10px] text-emerald-700 font-bold">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>E2EE Active</span>
        </div>
      </div>

      {/* Center: Action Buttons in Deep Navy & Accents */}
      <div className="flex items-center space-x-2 sm:space-x-2.5 mx-auto md:mx-0">
        {/* Mic Toggle */}
        <button
          onClick={onToggleMic}
          className={`p-3 rounded-full transition-all shadow-xs active:scale-95 ${
            currentUser.isMuted
              ? 'bg-red-500 text-white hover:bg-red-600 ring-2 ring-red-200'
              : 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
          }`}
          title={currentUser.isMuted ? 'Turn on microphone' : 'Turn off microphone'}
        >
          {currentUser.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Video Toggle */}
        <button
          onClick={onToggleVideo}
          className={`p-3 rounded-full transition-all shadow-xs active:scale-95 ${
            currentUser.isVideoOff
              ? 'bg-red-500 text-white hover:bg-red-600 ring-2 ring-red-200'
              : 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
          }`}
          title={currentUser.isVideoOff ? 'Turn on camera' : 'Turn off camera'}
        >
          {currentUser.isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
        </button>

        {/* Captions CC */}
        <button
          onClick={() => setCaptionsActive(!captionsActive)}
          className={`p-3 rounded-full transition-colors hidden sm:inline-flex ${
            captionsActive
              ? 'bg-blue-600 text-white'
              : 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
          }`}
          title="Turn on/off captions"
        >
          <Subtitles className="w-4 h-4" />
        </button>

        {/* Emoji Reactions Picker */}
        <div className="relative hidden sm:inline-block">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-3 rounded-full bg-[#0f172a] text-white hover:bg-[#1e293b] transition-colors"
            title="Send a reaction"
          >
            <Smile className="w-4 h-4" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-white border border-slate-100 p-2 rounded-2xl flex items-center space-x-1 shadow-xl z-50">
              {['👍', '❤️', '👏', '🎉', '🚀', '🔥'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setShowEmojiPicker(false)}
                  className="hover:scale-125 transition-transform text-lg p-1.5"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Screen Share */}
        <button
          onClick={onToggleScreenShare}
          className={`p-3 rounded-full transition-colors ${
            currentUser.isScreenSharing
              ? 'bg-blue-600 text-white'
              : 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
          }`}
          title="Share screen"
        >
          <ScreenShare className="w-4 h-4" />
        </button>

        {/* In-Call Developer IDE */}
        <button
          onClick={() => onTabChange(activeTab === 'code-ide' ? 'stage' : 'code-ide')}
          className={`p-3 rounded-full transition-colors ${
            activeTab === 'code-ide'
              ? 'bg-blue-600 text-white ring-2 ring-blue-200 shadow-sm'
              : 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
          }`}
          title="In-Call Developer IDE & Runtime Sandbox"
        >
          <Code className="w-4 h-4" />
        </button>

        {/* Architecture Whiteboard */}
        <button
          onClick={() => onTabChange(activeTab === 'whiteboard' ? 'stage' : 'whiteboard')}
          className={`p-3 rounded-full transition-colors hidden sm:inline-flex ${
            activeTab === 'whiteboard'
              ? 'bg-blue-600 text-white ring-2 ring-blue-200 shadow-sm'
              : 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
          }`}
          title="Architecture & System Whiteboard"
        >
          <Layout className="w-4 h-4" />
        </button>

        {/* Pitch Deck Presenter */}
        <button
          onClick={() => onTabChange(activeTab === 'pitch-deck' ? 'stage' : 'pitch-deck')}
          className={`p-3 rounded-full transition-colors hidden md:inline-flex ${
            activeTab === 'pitch-deck'
              ? 'bg-blue-600 text-white ring-2 ring-blue-200 shadow-sm'
              : 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
          }`}
          title="Investor Pitch Deck with Privacy Watermarks"
        >
          <Presentation className="w-4 h-4" />
        </button>

        {/* Hand Raise */}
        <button
          onClick={onToggleHandRaise}
          className={`p-3 rounded-full transition-colors ${
            currentUser.handRaised
              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
              : 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
          }`}
          title={currentUser.handRaised ? 'Lower hand' : 'Raise hand'}
        >
          <Hand className="w-4 h-4" />
        </button>

        {/* End Call Button */}
        <button
          onClick={onLeaveMeeting}
          className="px-5 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-xs transition-all active:scale-95 flex items-center space-x-1"
          title="Leave call"
        >
          <PhoneOff className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Gemini Notes Badge, People, Chat & Deal Room */}
      <div className="flex items-center space-x-2">
        {/* Gemini AI Notes Pill Button */}
        <button
          onClick={() => onTabChange(activeTab === 'ai-intelligence' ? 'stage' : 'ai-intelligence')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs ${
            activeTab === 'ai-intelligence'
              ? 'bg-[#0f172a] text-white'
              : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white'
          }`}
          title="Gemini Live Meeting Intelligence & Minutes"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          <span className="hidden xl:inline">Gemini Copilot</span>
          <span className="xl:hidden">AI</span>
        </button>

        {/* Agenda / Green Room */}
        <button
          onClick={() => onTabChange(activeTab === 'agenda' ? 'stage' : 'agenda')}
          className={`p-2.5 rounded-full transition-colors hidden sm:inline-flex ${
            activeTab === 'agenda' ? 'bg-[#0f172a] text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-[#0f172a]'
          }`}
          title="Conference Agenda & Backstage Green Room"
        >
          <Calendar className="w-4 h-4" />
        </button>

        {/* Deal Room Modal */}
        <button
          onClick={onOpenDealRoom}
          className="p-2.5 rounded-full text-slate-600 hover:bg-slate-100 hover:text-emerald-700 transition-colors hidden sm:inline-flex"
          title="Institutional Deal Room & Term Sheet"
        >
          <Briefcase className="w-4 h-4" />
        </button>

        {/* Chat Button */}
        <button
          onClick={onToggleChat}
          className={`relative p-2.5 rounded-full transition-colors ${
            isChatOpen ? 'bg-[#0f172a] text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-[#0f172a]'
          }`}
          title="Chat with everyone"
        >
          <MessageSquare className="w-4 h-4" />
          {unreadCount > 0 && !isChatOpen && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
          )}
        </button>
      </div>
    </div>
  );
};
