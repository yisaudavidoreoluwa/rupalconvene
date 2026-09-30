'use client';

import React, { useState } from 'react';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Sparkles, 
  Info, 
  PhoneOff, 
  Smile, 
  Subtitles, 
  Share2, 
  MoreVertical, 
  ExternalLink,
  Volume2,
  ChevronDown,
  Check
} from 'lucide-react';

interface RupalHeroProps {
  onJoinMeeting: (code: string) => void;
  onEnterFullWorkspace: () => void;
  onSignIn: () => void;
}

export const RupalHero: React.FC<RupalHeroProps> = ({
  onJoinMeeting,
  onEnterFullWorkspace,
  onSignIn,
}) => {
  const [meetingCodeInput, setMeetingCodeInput] = useState('1234');
  const [previewMicMuted, setPreviewMicMuted] = useState(false);
  const [previewVideoOff, setPreviewVideoOff] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (meetingCodeInput.trim()) {
      onJoinMeeting(meetingCodeInput.trim());
    }
  };

  const triggerReaction = (emoji: string) => {
    setReaction(emoji);
    setShowEmojiPicker(false);
    setTimeout(() => setReaction(null), 2500);
  };

  return (
    <section className="relative w-full pt-8 pb-16 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Headline, Copy & Meeting Launcher */}
        <div className="lg:col-span-6 space-y-6">
          {/* Product Label matching screenshots */}
          <div className="inline-flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-400/90 flex items-center justify-center shadow-sm">
              <Video className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-lg tracking-tight">
              Rupal Convene
            </span>
          </div>

          {/* Large Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
            Video conferencing for business
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl">
            Unlock premium features like recordings, in-call IDE sandboxes, and AI note-taking to make every meeting more productive and secure.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onEnterFullWorkspace}
              className="px-7 py-3 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
              Try Meet for work
            </button>

            <button
              onClick={onSignIn}
              className="px-7 py-3 rounded-full bg-white hover:bg-slate-50 text-[#1a73e8] font-semibold text-sm border border-slate-300 transition-colors"
            >
              Sign in
            </button>
          </div>

          {/* Quick Join Meeting Form matching screenshot 5 */}
          <div className="pt-6">
            <form onSubmit={handleJoin} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-slate-700 font-medium whitespace-nowrap">
                Join a meeting now
              </span>

              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={meetingCodeInput}
                  onChange={(e) => setMeetingCodeInput(e.target.value)}
                  className="w-36 sm:w-44 px-3 py-1.5 rounded-lg border border-blue-500 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold text-xs transition-colors shadow-sm"
              >
                Join
              </button>

              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                title="Enter the conference code shared by your host or partner"
              >
                <Info className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: High-Fidelity Meeting Frame Preview (matching Image 1, 2, 5) */}
        <div className="lg:col-span-6 relative flex justify-center">
          <div className="relative w-full max-w-[560px] aspect-[16/10] rounded-[28px] sm:rounded-[36px] bg-slate-950 p-2 sm:p-2.5 shadow-2xl border-4 border-slate-800/80 overflow-hidden flex flex-col justify-between group">
            {/* Main Video Stream Background */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1000&auto=format&fit=crop&q=80"
                alt="Presenter"
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  previewVideoOff ? 'opacity-20' : 'opacity-100'
                }`}
              />

              {previewVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-semibold">
                  Camera is turned off
                </div>
              )}
            </div>

            {/* Top Right Floating Badge: "Gemini is taking notes" */}
            <div className="relative z-10 flex justify-end p-2 sm:p-3">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600/95 to-indigo-600/95 text-white text-xs font-semibold shadow-lg backdrop-blur-md border border-white/20 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Gemini is taking notes</span>
              </div>
            </div>

            {/* Reaction floating animation */}
            {reaction && (
              <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none animate-bounce text-6xl">
                {reaction}
              </div>
            )}

            {/* Bottom Section: PIP Inset & Meeting Call Toolbar */}
            <div className="relative z-10 p-2 sm:p-3 flex flex-col space-y-3">
              {/* Inset PIP Tile for Marcus (On-site) */}
              <div className="self-end w-32 sm:w-40 aspect-video rounded-xl bg-slate-900 border-2 border-blue-500 overflow-hidden shadow-xl relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"
                  alt="Marcus"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 right-1 p-0.5 rounded-full bg-blue-600 text-white shadow">
                  <Volume2 className="w-2.5 h-2.5 animate-pulse" />
                </div>
                <div className="absolute bottom-1 left-1.5 text-[9px] font-semibold text-white bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
                  Marcus (On-site)
                </div>
              </div>

              {/* Floating Bottom Call Controls Bar matching screenshot 5 */}
              <div className="self-center flex items-center space-x-1.5 sm:space-x-2 bg-slate-900/90 border border-slate-700/80 px-3 py-2 rounded-full shadow-2xl backdrop-blur-md">
                {/* Mic */}
                <button
                  onClick={() => setPreviewMicMuted(!previewMicMuted)}
                  className={`p-2 rounded-full transition-colors ${
                    previewMicMuted ? 'bg-red-500 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                  title={previewMicMuted ? 'Unmute' : 'Mute'}
                >
                  {previewMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>

                {/* Video */}
                <button
                  onClick={() => setPreviewVideoOff(!previewVideoOff)}
                  className={`p-2 rounded-full transition-colors ${
                    previewVideoOff ? 'bg-red-500 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                  title={previewVideoOff ? 'Turn on camera' : 'Turn off camera'}
                >
                  {previewVideoOff ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                </button>

                {/* Closed Captions */}
                <button
                  onClick={() => alert("Captions enabled: Rupal AI speech-to-text active.")}
                  className="p-2 rounded-full text-slate-300 hover:bg-slate-800 transition-colors"
                  title="Closed Captions"
                >
                  <Subtitles className="w-3.5 h-3.5" />
                </button>

                {/* Reactions Picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 rounded-full text-slate-300 hover:bg-slate-800 transition-colors"
                    title="Send Reaction"
                  >
                    <Smile className="w-3.5 h-3.5" />
                  </button>

                  {showEmojiPicker && (
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 p-1.5 rounded-full flex items-center space-x-1 shadow-xl">
                      {['👍', '❤️', '👏', '🎉', '🚀'].map((em) => (
                        <button
                          key={em}
                          onClick={() => triggerReaction(em)}
                          className="hover:scale-125 transition-transform text-base p-1"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Screen Share */}
                <button
                  onClick={onEnterFullWorkspace}
                  className="p-2 rounded-full text-slate-300 hover:bg-slate-800 transition-colors"
                  title="Share Screen & Open Collaborative Workspace"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>

                {/* More options */}
                <button
                  onClick={onEnterFullWorkspace}
                  className="p-2 rounded-full text-slate-300 hover:bg-slate-800 transition-colors"
                  title="Open Conference Room"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {/* Red End Call Button */}
                <button
                  onClick={onEnterFullWorkspace}
                  className="px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center space-x-1 shadow-md transition-colors"
                  title="Enter Full Conference"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Hover overlay hint */}
            <div 
              onClick={onEnterFullWorkspace}
              className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px] z-20"
            >
              <div className="px-5 py-2.5 rounded-full bg-white text-slate-900 font-bold text-xs shadow-2xl flex items-center space-x-2 transform scale-95 group-hover:scale-100 transition-transform">
                <span>Enter Live Conference Suite</span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explore features scroll anchor */}
      <div className="flex justify-center pt-8">
        <a
          href="#features"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-600 border border-slate-200 transition-colors"
        >
          <span>Explore features</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </a>
      </div>
    </section>
  );
};
