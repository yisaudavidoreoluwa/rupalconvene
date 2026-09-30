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
  Check
} from 'lucide-react';
import { Participant } from '@/types/meeting';

interface PreJoinLobbyProps {
  roomCode: string;
  meetingTitle: string;
  participants: Participant[];
  currentUser: Participant;
  onJoinMeeting: (startWithTab?: 'stage' | 'code-ide' | 'whiteboard' | 'pitch-deck') => void;
  onToggleMic: () => void;
  onToggleVideo: () => void;
}

export const PreJoinLobby: React.FC<PreJoinLobbyProps> = ({
  roomCode,
  meetingTitle,
  participants,
  currentUser,
  onJoinMeeting,
  onToggleMic,
  onToggleVideo,
}) => {
  const [copied, setCopied] = useState(false);
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

  const activeOthers = participants.filter((p) => p.id !== currentUser.id && !p.inGreenRoom);

  return (
    <div className="min-h-screen w-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="h-16 px-6 bg-white flex items-center justify-between border-b border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          {/* Rupal Navy Box */}
          <div className="w-8 h-8 rounded-lg bg-[#0f172a] text-white flex items-center justify-center p-1 shadow-sm">
            <span className="font-extrabold text-lg">R</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-lg text-[#0f172a] tracking-tight">Rupal Convene</span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-[#0f172a] border border-slate-300">
              Tech & Partner Edition
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-600">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 font-semibold text-[#0f172a]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>WebRTC Encrypted</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-bold text-sm">
            {currentUser.name.charAt(0)}
          </div>
        </div>
      </header>

      {/* Main Lobby Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-14">
        {/* Left: Camera & Mic Test Frame (Deep Navy Container on White Background) */}
        <div className="w-full max-w-xl flex flex-col items-center">
          <div className="relative w-full aspect-[16/10] rounded-[24px] bg-[#0f172a] border-2 border-[#1e293b] overflow-hidden shadow-2xl flex items-center justify-center">
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-[#1e293b]"
                />
                <span className="text-sm font-medium text-slate-300">Camera is off</span>
              </div>
            )}

            {/* In-Frame Hardware Controls (Mic & Video Toggles) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-3 z-20">
              <button
                onClick={onToggleMic}
                className={`p-3.5 rounded-full transition-all shadow-lg active:scale-95 ${
                  currentUser.isMuted
                    ? 'bg-[#ea4335] text-white hover:bg-[#d93025]'
                    : 'bg-[#1e293b]/90 text-white hover:bg-[#334155] backdrop-blur-md'
                }`}
                title={currentUser.isMuted ? 'Turn on microphone' : 'Turn off microphone'}
              >
                {currentUser.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={onToggleVideo}
                className={`p-3.5 rounded-full transition-all shadow-lg active:scale-95 ${
                  currentUser.isVideoOff
                    ? 'bg-[#ea4335] text-white hover:bg-[#d93025]'
                    : 'bg-[#1e293b]/90 text-white hover:bg-[#334155] backdrop-blur-md'
                }`}
                title={currentUser.isVideoOff ? 'Turn on camera' : 'Turn off camera'}
              >
                {currentUser.isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
            </div>

            {/* Visual audio indicator */}
            {!currentUser.isMuted && (
              <div className="absolute top-4 left-4 p-2 rounded-full bg-[#0f172a]/70 backdrop-blur-md border border-[#334155] flex items-center space-x-1">
                <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce" />
                <span className="w-1 h-3.5 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_100ms]" />
                <span className="w-1 h-2 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_200ms]" />
              </div>
            )}

            {/* AI Notes Indicator */}
            <div className="absolute top-4 right-4 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600/90 to-indigo-600/90 text-white text-xs font-semibold shadow-md backdrop-blur-md border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Rupal AI Notes Ready</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 mt-3 text-xs text-slate-500 font-medium">
            <span>Microphone calibrated</span>
            <span>•</span>
            <span>1080p HD Video</span>
            <span>•</span>
            <button onClick={handleCopy} className="hover:text-[#0f172a] transition-colors flex items-center space-x-1">
              <span>{roomCode}</span>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Right: Meeting Join Actions (White Background with Navy Blue Accents) */}
        <div className="w-full max-w-md space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
              Ready to join?
            </h1>
            <p className="text-base text-slate-600 mt-1 font-normal">
              {meetingTitle}
            </p>
          </div>

          {/* Attendees already in the call */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#0f172a]">
              <Users className="w-4 h-4 text-blue-600" />
              <span>{activeOthers.length} participants already in meeting</span>
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto py-1">
              {activeOthers.map((p) => (
                <div key={p.id} className="relative group flex-shrink-0" title={`${p.name} (${p.role})`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-1 ring-white" />
                </div>
              ))}
              <span className="text-xs text-slate-500 pl-1 font-medium">
                {activeOthers.map((p) => p.name.split(' ')[0]).join(', ')}
              </span>
            </div>
          </div>

          {/* Action Buttons (Navy Blue) */}
          <div className="space-y-3">
            <button
              onClick={() => onJoinMeeting('stage')}
              className="w-full py-3.5 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-sm shadow-lg shadow-slate-900/15 transition-all active:scale-98 flex items-center justify-center space-x-2"
            >
              <span>Join now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onJoinMeeting('code-ide')}
              className="w-full py-3 rounded-full bg-white hover:bg-slate-50 text-[#0f172a] font-bold text-sm border-2 border-[#0f172a] transition-colors flex items-center justify-center space-x-2 shadow-sm"
            >
              <Code className="w-4 h-4 text-blue-600" />
              <span>Join with In-Call Code IDE</span>
            </button>
          </div>

          <div className="pt-2 text-xs text-slate-500 leading-relaxed">
            By joining, you agree to Rupal Convene&apos;s verified enterprise privacy watermarking and session recording policies.
          </div>
        </div>
      </main>
    </div>
  );
};
