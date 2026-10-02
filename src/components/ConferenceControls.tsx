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
  Briefcase,
  MoreHorizontal,
  X
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
  onSendReaction?: (emoji: string) => void;
}

const EMOJI_LIST = ['❤️', '👏', '👍', '🔥', '🎉', '🚀'];

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
  participantCount = 1,
  unreadCount = 0,
  roomCode = 'RUPAL-804-SYNC',
  onSendReaction,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMobileTools, setShowMobileTools] = useState(false);
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

  const handleSelectEmoji = (emoji: string) => {
    if (onSendReaction) {
      onSendReaction(emoji);
    }
    setShowEmojiPicker(false);
  };

  return (
    <>
      {/* Mobile Tools Drawer Sheet */}
      {showMobileTools && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex flex-col justify-end md:hidden animate-in fade-in"
          onClick={() => setShowMobileTools(false)}
        >
          <div 
            className="bg-white rounded-t-3xl p-5 border-t border-slate-100 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm font-bold text-[#0f172a]">Workspace Suite Tools</span>
              <button 
                onClick={() => setShowMobileTools(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => {
                  onTabChange('pitch-deck');
                  setShowMobileTools(false);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl text-xs font-semibold gap-1.5 transition-colors ${
                  activeTab === 'pitch-deck' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-700'
                }`}
              >
                <Presentation className="w-5 h-5 text-blue-600" />
                <span>Presentation</span>
              </button>

              <button
                onClick={() => {
                  onTabChange('code-ide');
                  setShowMobileTools(false);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl text-xs font-semibold gap-1.5 transition-colors ${
                  activeTab === 'code-ide' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-700'
                }`}
              >
                <Code className="w-5 h-5 text-indigo-600" />
                <span>IDE Code</span>
              </button>

              <button
                onClick={() => {
                  onTabChange('whiteboard');
                  setShowMobileTools(false);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl text-xs font-semibold gap-1.5 transition-colors ${
                  activeTab === 'whiteboard' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-700'
                }`}
              >
                <Layout className="w-5 h-5 text-sky-600" />
                <span>Whiteboard</span>
              </button>

              <button
                onClick={() => {
                  onTabChange('ai-intelligence');
                  setShowMobileTools(false);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl text-xs font-semibold gap-1.5 transition-colors ${
                  activeTab === 'ai-intelligence' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-slate-50 text-slate-700'
                }`}
              >
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>AI Copilot</span>
              </button>

              <button
                onClick={() => {
                  onOpenDealRoom();
                  setShowMobileTools(false);
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl text-xs font-semibold gap-1.5 bg-slate-50 text-slate-700"
              >
                <Briefcase className="w-5 h-5 text-amber-600" />
                <span>Deal Room</span>
              </button>

              <button
                onClick={() => {
                  onTabChange('agenda');
                  setShowMobileTools(false);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl text-xs font-semibold gap-1.5 transition-colors ${
                  activeTab === 'agenda' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-700'
                }`}
              >
                <Calendar className="w-5 h-5 text-slate-600" />
                <span>Agenda</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Floating / Bottom Control Dock */}
      <div className="h-16 sm:h-20 bg-white border-t border-slate-100 px-3 sm:px-6 flex items-center justify-between z-30 select-none shadow-xs w-full relative">
        {/* Left: Meeting Time & Room Identifier */}
        <div className="hidden lg:flex items-center space-x-3 text-sm font-semibold text-[#0f172a]">
          <span className="font-mono text-xs text-slate-500">{currentTime}</span>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-bold text-[#0f172a]">{roomCode}</span>
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] text-emerald-700 font-bold">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>256-Bit E2EE</span>
          </div>
        </div>

        {/* Center: Essential Controls (Mic, Video, Screen, Tools, End) */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 mx-auto lg:mx-0 relative">
          {/* Mic Toggle */}
          <button
            onClick={onToggleMic}
            className={`p-2.5 sm:p-3 rounded-full transition-all shadow-xs active:scale-95 touch-manipulation ${
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
            className={`p-2.5 sm:p-3 rounded-full transition-all shadow-xs active:scale-95 touch-manipulation ${
              currentUser.isVideoOff
                ? 'bg-red-500 text-white hover:bg-red-600 ring-2 ring-red-200'
                : 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
            }`}
            title={currentUser.isVideoOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {currentUser.isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </button>

          {/* Screen Share (Desktop only) */}
          <button
            onClick={onToggleScreenShare}
            className={`p-2.5 sm:p-3 rounded-full transition-colors hidden sm:inline-flex touch-manipulation ${
              currentUser.isScreenSharing
                ? 'bg-blue-600 text-white'
                : 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
            }`}
            title="Share screen"
          >
            <ScreenShare className="w-4 h-4" />
          </button>

          {/* Presentation Deck Viewer (Direct Button) */}
          <button
            onClick={() => onTabChange(activeTab === 'pitch-deck' ? 'stage' : 'pitch-deck')}
            className={`p-2.5 sm:p-3 rounded-full transition-colors hidden md:inline-flex touch-manipulation ${
              activeTab === 'pitch-deck'
                ? 'bg-blue-600 text-white ring-2 ring-blue-200 shadow-sm'
                : 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
            }`}
            title="Presentation & Slide Deck"
          >
            <Presentation className="w-4 h-4" />
          </button>

          {/* In-Call Developer IDE */}
          <button
            onClick={() => onTabChange(activeTab === 'code-ide' ? 'stage' : 'code-ide')}
            className={`p-2.5 sm:p-3 rounded-full transition-colors hidden md:inline-flex touch-manipulation ${
              activeTab === 'code-ide'
                ? 'bg-blue-600 text-white ring-2 ring-blue-200 shadow-sm'
                : 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
            }`}
            title="In-Call Developer IDE"
          >
            <Code className="w-4 h-4" />
          </button>

          {/* Architecture Whiteboard */}
          <button
            onClick={() => onTabChange(activeTab === 'whiteboard' ? 'stage' : 'whiteboard')}
            className={`p-2.5 sm:p-3 rounded-full transition-colors hidden md:inline-flex touch-manipulation ${
              activeTab === 'whiteboard'
                ? 'bg-blue-600 text-white ring-2 ring-blue-200 shadow-sm'
                : 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
            }`}
            title="Architecture Whiteboard"
          >
            <Layout className="w-4 h-4" />
          </button>

          {/* Hand Raise */}
          <button
            onClick={onToggleHandRaise}
            className={`p-2.5 sm:p-3 rounded-full transition-colors touch-manipulation ${
              currentUser.handRaised
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
            }`}
            title={currentUser.handRaised ? 'Lower hand' : 'Raise hand'}
          >
            <Hand className="w-4 h-4" />
          </button>

          {/* Live Emoji Reactions Popover */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2.5 sm:p-3 rounded-full bg-[#0f172a] text-white hover:bg-[#1e293b] transition-colors touch-manipulation"
              title="React with emoji"
            >
              <Smile className="w-4 h-4 text-amber-300" />
            </button>

            {showEmojiPicker && (
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 flex items-center space-x-1 animate-in zoom-in-95 duration-150 z-50">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleSelectEmoji(emoji)}
                    className="p-2 text-xl hover:scale-125 transition-transform active:scale-95 touch-manipulation"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile "More Tools" Button */}
          <button
            onClick={() => setShowMobileTools(true)}
            className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0f172a] md:hidden touch-manipulation"
            title="More workspace tools"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* End / Leave Call Button */}
          <button
            onClick={onLeaveMeeting}
            className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 flex items-center space-x-1 touch-manipulation"
            title="Leave conference"
          >
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>

        {/* Right: AI Copilot, Chat */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Gemini AI Copilot Button */}
          <button
            onClick={() => onTabChange(activeTab === 'ai-intelligence' ? 'stage' : 'ai-intelligence')}
            className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs touch-manipulation ${
              activeTab === 'ai-intelligence'
                ? 'bg-[#0f172a] text-white'
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white'
            }`}
            title="Gemini Live Meeting Intelligence & Minutes"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          {/* Chat Drawer Toggle */}
          <button
            onClick={onToggleChat}
            className={`relative p-2 sm:p-2.5 rounded-full transition-colors touch-manipulation ${
              isChatOpen ? 'bg-[#0f172a] text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-[#0f172a]'
            }`}
            title="Chat and Q&A"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadCount > 0 && !isChatOpen && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
            )}
          </button>
        </div>
      </div>
    </>
  );
};
