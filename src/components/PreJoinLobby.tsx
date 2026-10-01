'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Code, 
  Users,
  Copy, 
  Check,
  BookOpen,
  Presentation,
  PlusCircle,
  Hash
} from 'lucide-react';
import { Participant } from '@/types/meeting';
import { useAuth } from '@/context/AuthContext';
import { UserProfileMenu } from '@/components/UserProfileMenu';

interface PreJoinLobbyProps {
  roomCode: string;
  meetingTitle: string;
  participants: Participant[];
  currentUser: Participant;
  onJoinMeeting: (startWithTab?: 'stage' | 'code-ide' | 'whiteboard' | 'pitch-deck') => void;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onOpenDocs?: () => void;
  onRoomChange?: (newCode: string, newTitle?: string) => void;
}

export const PreJoinLobby: React.FC<PreJoinLobbyProps> = ({
  roomCode,
  meetingTitle,
  participants,
  currentUser,
  onJoinMeeting,
  onToggleMic,
  onToggleVideo,
  onOpenDocs,
  onRoomChange,
}) => {
  const { user, loginWithProvider, openAuthModal } = useAuth();
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState(roomCode);
  const [isChangingRoom, setIsChangingRoom] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    async function getMedia() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && !currentUser.isVideoOff) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
      } catch (e) {
        console.info('Preview stream deferred or running in sandbox mode.', e);
      }
    }
    getMedia();
  }, [currentUser.isVideoOff]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://rupal.tech/convene/${roomCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateNewRoom = async () => {
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId: user.id,
          hostName: user.name,
          hostRole: user.role,
        })
      });
      const data = await res.json();
      if (data.success && data.room) {
        if (onRoomChange) {
          onRoomChange(data.room.roomCode, data.room.title);
          setInputCode(data.room.roomCode);
        }
      }
    } catch {
      // Fallback
      const randomCode = `RUPAL-${Math.floor(100 + Math.random() * 900)}-SYNC`;
      if (onRoomChange) {
        onRoomChange(randomCode, 'Live Engineering Conference');
        setInputCode(randomCode);
      }
    }
  };

  const handleApplyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const clean = inputCode.trim().toUpperCase();
    if (onRoomChange) {
      onRoomChange(clean);
    }
    setIsChangingRoom(false);
  };

  const activeOthers = participants.filter((p) => p.id !== currentUser.id && !p.inGreenRoom);

  return (
    <div className="min-h-screen w-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="h-16 px-6 bg-white flex items-center justify-between border-b border-slate-100 shadow-xs">
        <div className="flex items-center space-x-3">
          {/* Rupal Navy Box */}
          <div className="w-8 h-8 rounded-xl bg-[#0f172a] text-white flex items-center justify-center p-1 shadow-xs">
            <span className="font-extrabold text-base">R</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-base text-[#0f172a] tracking-tight">Rupal Convene</span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-[#0f172a]">
              Developer & Partner Suite
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-600">
          {onOpenDocs && (
            <button
              onClick={onOpenDocs}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Docs & API</span>
            </button>
          )}

          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit E2EE</span>
          </div>

          <UserProfileMenu />
        </div>
      </header>

      {/* Main Lobby Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-14">
        {/* Left: Camera & Mic Test Frame (Deep Navy Container with Clean Rounded Geometry) */}
        <div className="w-full max-w-xl flex flex-col items-center">
          <div className="relative w-full aspect-[16/10] rounded-3xl bg-[#0f172a] overflow-hidden shadow-xl flex items-center justify-center">
            {/* Live Camera Stream */}
            {!currentUser.isVideoOff ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : null}

            {/* Avatar Fallback */}
            {currentUser.isVideoOff && (
              <div className="flex flex-col items-center justify-center space-y-3 text-white">
                <img
                  src={user.avatar || currentUser.avatar}
                  alt={user.name || currentUser.name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-[#1e293b]"
                />
                <div className="text-center">
                  <span className="text-sm font-semibold text-slate-200 block">{user.name}</span>
                  <span className="text-xs text-slate-400 capitalize">{user.provider} Account Verified</span>
                </div>
              </div>
            )}

            {/* In-Frame Hardware Controls (Mic & Video Toggles) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-3 z-20">
              <button
                onClick={onToggleMic}
                className={`p-3 rounded-full transition-all shadow-md active:scale-95 ${
                  currentUser.isMuted
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-[#1e293b]/90 text-white hover:bg-[#334155] backdrop-blur-md'
                }`}
                title={currentUser.isMuted ? 'Turn on microphone' : 'Turn off microphone'}
              >
                {currentUser.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={onToggleVideo}
                className={`p-3 rounded-full transition-all shadow-md active:scale-95 ${
                  currentUser.isVideoOff
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-[#1e293b]/90 text-white hover:bg-[#334155] backdrop-blur-md'
                }`}
                title={currentUser.isVideoOff ? 'Turn on camera' : 'Turn off camera'}
              >
                {currentUser.isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </button>
            </div>

            {/* Visual audio indicator */}
            {!currentUser.isMuted && (
              <div className="absolute top-4 left-4 p-2 rounded-full bg-[#0f172a]/80 backdrop-blur-md border border-slate-700/50 flex items-center space-x-1">
                <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce" />
                <span className="w-1 h-3.5 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_100ms]" />
                <span className="w-1 h-2 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_200ms]" />
              </div>
            )}

            {/* AI Notes Indicator */}
            <div className="absolute top-4 right-4 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900/80 text-white text-xs font-semibold shadow-xs backdrop-blur-md border border-slate-700/50">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Gemini AI Copilot Ready</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 mt-3 text-xs text-slate-500 font-medium">
            <span>Mic calibrated</span>
            <span>•</span>
            <span>1080p WebRTC</span>
            <span>•</span>
            <button onClick={handleCopy} className="hover:text-[#0f172a] transition-colors flex items-center space-x-1 font-mono">
              <span>{roomCode}</span>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Right: Meeting Join Actions (Clean White Background with Navy Blue Accents) */}
        <div className="w-full max-w-md space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full">
                Active Conference Room
              </span>
              <button
                onClick={() => setIsChangingRoom(!isChangingRoom)}
                className="text-xs text-slate-500 hover:text-[#0f172a] font-medium"
              >
                {isChangingRoom ? 'Cancel' : 'Change Room'}
              </button>
            </div>

            {isChangingRoom ? (
              <form onSubmit={handleApplyCode} className="mt-3 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="e.g. RUPAL-901-SYNC"
                    className="flex-1 px-3 py-2 text-xs font-mono uppercase bg-white border border-slate-200 rounded-xl"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#0f172a] text-white rounded-xl text-xs font-bold"
                  >
                    Apply
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleCreateNewRoom}
                  className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Generate New Instant Room</span>
                </button>
              </form>
            ) : (
              <>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight mt-2">
                  Ready to join?
                </h1>
                <p className="text-sm text-slate-600 mt-1 font-normal">
                  {meetingTitle}
                </p>
              </>
            )}
          </div>

          {/* Social OAuth Quick Login Bar */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Signing in as:</span>
              <button
                onClick={() => openAuthModal('login')}
                className="text-blue-600 hover:underline font-semibold text-[11px]"
              >
                Change Account
              </button>
            </div>
            
            <div className="flex items-center gap-2 pt-1">
              {/* Google */}
              <button
                onClick={() => loginWithProvider('google')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all ${
                  user.provider === 'google'
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
                title="Sign in with Google"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.39 7.35 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.16 0 9.99 0 12s.45 3.84 1.25 5.42l4.03-3.13z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.61 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z" />
                </svg>
                <span>Google</span>
              </button>

              {/* GitHub */}
              <button
                onClick={() => loginWithProvider('github')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all ${
                  user.provider === 'github'
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
                title="Sign in with GitHub"
              >
                <svg className="w-3.5 h-3.5 fill-current flex-shrink-0" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub</span>
              </button>

              {/* Discord */}
              <button
                onClick={() => loginWithProvider('discord')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all ${
                  user.provider === 'discord'
                    ? 'bg-[#5865F2] text-white font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
                title="Sign in with Discord"
              >
                <svg className="w-3.5 h-3.5 fill-current flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                <span>Discord</span>
              </button>
            </div>
          </div>

          {/* Attendees status block */}
          {activeOthers.length > 0 ? (
            <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-1.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#0f172a]">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>{activeOthers.length} participants already in session</span>
              </div>
              <div className="flex items-center space-x-2 overflow-x-auto py-1">
                {activeOthers.map((p) => (
                  <div key={p.id} className="relative group flex-shrink-0" title={`${p.name} (${p.role})`}>
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                  </div>
                ))}
                <span className="text-xs text-slate-500 pl-1 font-medium truncate">
                  {activeOthers.map((p) => p.name.split(' ')[0]).join(', ')}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>You are the first to join. Ready to start!</span>
              </div>
              <button
                onClick={handleCopy}
                className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Link</span>
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={() => onJoinMeeting('stage')}
              className="w-full py-3.5 rounded-2xl bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-sm shadow-md shadow-slate-900/10 transition-all active:scale-98 flex items-center justify-center space-x-2"
            >
              <span>Join Conference</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onJoinMeeting('code-ide')}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0f172a] font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <Code className="w-3.5 h-3.5 text-blue-600" />
                <span>Join with IDE</span>
              </button>

              <button
                onClick={() => onJoinMeeting('pitch-deck')}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0f172a] font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <Presentation className="w-3.5 h-3.5 text-blue-600" />
                <span>Join with Deck</span>
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 leading-relaxed text-center">
            Encrypted with 256-bit DTLS-SRTP • Watermarked with viewer credentials
          </div>
        </div>
      </main>
    </div>
  );
};
