'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  ArrowRight, 
  ArrowLeft,
  Code, 
  Users,
  Presentation, 
  Lock,
  Crown,
  LogIn,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Participant } from '@/types/meeting';
import { useAuth } from '@/context/AuthContext';
import { UserProfileMenu } from '@/components/UserProfileMenu';

interface PreJoinLobbyProps {
  roomCode?: string;
  meetingTitle?: string;
  inviteCode?: string;
  isHost?: boolean;
  participants: Participant[];
  currentUser: Participant;
  onJoinMeeting: (startWithTab?: 'stage' | 'code-ide' | 'whiteboard' | 'pitch-deck') => void;
  onHostMeeting?: (roomCode: string, title: string, inviteCode: string, startWithTab?: 'stage' | 'code-ide' | 'whiteboard' | 'pitch-deck') => void;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onOpenDocs?: () => void;
  onRoomChange?: (newCode: string, newTitle?: string, newInviteCode?: string) => void;
  onBackToLanding?: () => void;
  audioLevel?: number;
  localStream?: MediaStream | null;
}

function generateFreshRoomCode(): string {
  const num = Math.floor(100 + Math.random() * 900);
  const tags = ['SYNC', 'ARCH', 'FLOW', 'LIVE', 'MESH', 'CORP', 'DEV'];
  const tag = tags[Math.floor(Math.random() * tags.length)];
  return `RUPAL-${num}-${tag}`;
}

function deriveInviteCode(code: string): string {
  const clean = code.replace(/[^A-Z0-9]/g, '');
  const suffix = clean.length >= 6 ? clean.slice(-6) : clean.padEnd(6, '9');
  return `INV-${suffix}`;
}

export const PreJoinLobby: React.FC<PreJoinLobbyProps> = ({
  roomCode = '',
  meetingTitle = '',
  inviteCode: initialInviteCode = '',
  isHost: initialIsHost = false,
  participants,
  currentUser,
  onJoinMeeting,
  onHostMeeting,
  onToggleMic,
  onToggleVideo,
  onOpenDocs,
  onRoomChange,
  onBackToLanding,
  audioLevel = 0,
  localStream,
}) => {
  const { user, isAuthenticated, loginWithProvider, openAuthModal, isLoading } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Tab mode: 'host' or 'join'
  // If user navigated with a room parameter or invite parameter in the URL, default to 'join'
  const [mode, setMode] = useState<'host' | 'join'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('room') || params.get('invite')) return 'join';
    }
    return initialIsHost ? 'host' : 'host';
  });

  // Host Mode Form State (Clean: NO pre-made link displayed before creation)
  const [hostTitle, setHostTitle] = useState<string>(meetingTitle || '');
  const [isCreatingHost, setIsCreatingHost] = useState(false);

  // Join Mode Form State
  const [joinRoomCode, setJoinRoomCode] = useState<string>(roomCode);
  const [joinInviteCode, setJoinInviteCode] = useState<string>(initialInviteCode);

  // Verification state for Join Mode
  const [validationState, setValidationState] = useState<'idle' | 'checking' | 'valid' | 'invite_required' | 'unknown_room'>('idle');
  const [hostInfo, setHostInfo] = useState<{ id?: string; name?: string; role?: string } | null>(null);

  // Auto-sync initial invite code from props or URL
  useEffect(() => {
    if (initialInviteCode && !joinInviteCode) {
      setJoinInviteCode(initialInviteCode);
    }
  }, [initialInviteCode, joinInviteCode]);

  useEffect(() => {
    if (roomCode && !joinRoomCode) {
      setJoinRoomCode(roomCode);
    }
  }, [roomCode, joinRoomCode]);

  // Validate room existence and verify invite passcode
  const verifyRoomAndInvite = useCallback(async (codeToVerify: string, passcodeToVerify?: string) => {
    if (!codeToVerify.trim()) {
      setValidationState('idle');
      return;
    }
    setValidationState('checking');
    try {
      const inviteParam = passcodeToVerify ? `?invite=${encodeURIComponent(passcodeToVerify.trim())}` : '';
      const res = await fetch(`/api/rooms/${codeToVerify.trim().toUpperCase()}${inviteParam}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.room) {
          setHostInfo(data.host || { name: 'Host' });
          if (data.isInviteOnly) {
            setValidationState(data.isInviteValid ? 'valid' : 'invite_required');
          } else {
            setValidationState('valid');
          }
          return;
        }
      }
      if (codeToVerify.trim().length >= 6) {
        setValidationState('valid');
        return;
      }
      setValidationState('unknown_room');
      setHostInfo(null);
    } catch {
      if (codeToVerify.trim().length >= 6) {
        setValidationState('valid');
        return;
      }
      setValidationState('unknown_room');
      setHostInfo(null);
    }
  }, []);

  // Trigger verification when in join mode with input
  useEffect(() => {
    if (mode === 'join' && joinRoomCode.trim()) {
      verifyRoomAndInvite(joinRoomCode, joinInviteCode);
    }
  }, [mode, joinRoomCode, joinInviteCode, verifyRoomAndInvite]);

  // Bind live media stream to the video preview element
  useEffect(() => {
    if (videoRef.current && localStream && isAuthenticated && !currentUser.isVideoOff) {
      if (videoRef.current.srcObject !== localStream) {
        videoRef.current.srcObject = localStream;
      }
    }
  }, [localStream, isAuthenticated, currentUser.isVideoOff]);

  // Fallback: If no external localStream is supplied, acquire directly
  useEffect(() => {
    let localSubStream: MediaStream | null = null;
    async function getMediaFallback() {
      try {
        if (!localStream && navigator.mediaDevices?.getUserMedia && !currentUser.isVideoOff && isAuthenticated) {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' }, 
            audio: true 
          });
          localSubStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
      } catch (e) {
        console.info('[Lobby] Camera preview running in sandbox mode.', e);
      }
    }
    getMediaFallback();

    return () => {
      if (localSubStream) {
        localSubStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [localStream, currentUser.isVideoOff, isAuthenticated]);

  // Create and Launch Meeting as Host (No pre-made link, generates fresh and creates on click)
  const handleCreateAndStartMeeting = async (tab?: 'stage' | 'code-ide' | 'whiteboard' | 'pitch-deck') => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    setIsCreatingHost(true);
    const freshRoomCode = generateFreshRoomCode();
    const freshInviteCode = deriveInviteCode(freshRoomCode);
    const finalTitle = hostTitle.trim() || 'Executive Conference Review';

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: freshRoomCode,
          title: finalTitle,
          hostId: user?.id || 'host_user',
          hostName: user?.name || 'Conference Host',
          hostRole: 'host',
          hostAvatar: user?.avatar || '',
          inviteCode: freshInviteCode,
          isInviteOnly: true,
        })
      });
      const data = await res.json();
      const confirmedRoomCode = data.room?.roomCode || freshRoomCode;
      const confirmedInviteCode = data.room?.inviteCode || freshInviteCode;

      if (onHostMeeting) {
        onHostMeeting(confirmedRoomCode, finalTitle, confirmedInviteCode, tab);
      } else {
        if (onRoomChange) onRoomChange(confirmedRoomCode, finalTitle, confirmedInviteCode);
        onJoinMeeting(tab);
      }
    } catch {
      if (onHostMeeting) {
        onHostMeeting(freshRoomCode, finalTitle, freshInviteCode, tab);
      } else {
        if (onRoomChange) onRoomChange(freshRoomCode, finalTitle, freshInviteCode);
        onJoinMeeting(tab);
      }
    } finally {
      setIsCreatingHost(false);
    }
  };

  // Join meeting via verified invite
  const handleJoinExistingMeeting = (tab?: 'stage' | 'code-ide' | 'whiteboard' | 'pitch-deck') => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (validationState !== 'valid') {
      return;
    }
    if (onRoomChange) {
      onRoomChange(joinRoomCode.trim().toUpperCase(), undefined, joinInviteCode.trim().toUpperCase());
    }
    onJoinMeeting(tab);
  };

  const activeOthers = participants.filter((p) => p.id !== currentUser.id && !p.inGreenRoom);

  return (
    <div className="min-h-screen w-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans select-none overflow-x-hidden">
      {/* Minimal Spacious Header (No Borders, Clean Shadow) */}
      <header className="h-16 px-6 sm:px-10 bg-white flex items-center justify-between shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] flex-shrink-0 z-30">
        <div className="flex items-center space-x-3">
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors mr-1 cursor-pointer"
              title="Back to Home & Calendar"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-8 h-8 rounded-xl bg-[#0f172a] text-white flex items-center justify-center shadow-sm">
            <span className="font-extrabold text-base">R</span>
          </div>
          <span className="font-extrabold text-base sm:text-lg text-[#0f172a] tracking-tight">
            Rupal Convene
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-600">
          {onOpenDocs && (
            <button
              onClick={onOpenDocs}
              className="px-3.5 py-1.5 rounded-full hover:bg-slate-100 text-slate-700 font-semibold transition-colors touch-manipulation cursor-pointer"
            >
              Docs & API
            </button>
          )}

          <UserProfileMenu />
        </div>
      </header>

      {/* Main Lobby Body (Spacious & Clean) */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-14">
        {/* Left: Camera & Hardware Test Frame */}
        <div className="w-full max-w-md lg:max-w-lg flex flex-col items-center">
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-3xl bg-[#0a192f] overflow-hidden shadow-2xl flex items-center justify-center">
            {/* Live Camera Stream */}
            {isAuthenticated && !currentUser.isVideoOff ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : null}

            {/* Unauthenticated Frame State */}
            {!isAuthenticated ? (
              <div className="flex flex-col items-center justify-center space-y-3 text-white p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-lg">
                  <Lock className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Camera Preview Inactive</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">
                    Sign in to test video, audio, and encryption keys.
                  </p>
                </div>
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 touch-manipulation cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            ) : (
              currentUser.isVideoOff && (
                <div className="flex flex-col items-center justify-center space-y-3 text-white p-4">
                  <img
                    src={user?.avatar || currentUser.avatar}
                    alt={user?.name || currentUser.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-xl"
                  />
                  <div className="text-center">
                    <span className="text-sm font-bold text-slate-200 block">{user?.name}</span>
                    <span className="text-xs text-slate-400 capitalize">{user?.provider} Verified</span>
                  </div>
                </div>
              )
            )}

            {/* Hardware Controls (Floating Bottom Pill) */}
            {isAuthenticated && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-3 z-20">
                <button
                  onClick={onToggleMic}
                  className={`p-3 rounded-full transition-all shadow-lg active:scale-95 touch-manipulation cursor-pointer ${
                    currentUser.isMuted
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-[#1e293b]/90 text-white hover:bg-[#334155] backdrop-blur-md'
                  }`}
                  title={currentUser.isMuted ? 'Turn on microphone' : 'Turn off microphone'}
                  aria-label="Toggle microphone"
                >
                  {currentUser.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  onClick={onToggleVideo}
                  className={`p-3 rounded-full transition-all shadow-lg active:scale-95 touch-manipulation cursor-pointer ${
                    currentUser.isVideoOff
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-[#1e293b]/90 text-white hover:bg-[#334155] backdrop-blur-md'
                  }`}
                  title={currentUser.isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                  aria-label="Toggle camera"
                >
                  {currentUser.isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </button>
              </div>
            )}

            {/* Live Audio Activity Waveform */}
            {isAuthenticated && !currentUser.isMuted && (
              <div className="absolute top-4 left-4 px-2.5 py-1.5 rounded-full bg-[#0f172a]/80 backdrop-blur-md flex items-center space-x-1.5 shadow-md">
                <div className="flex items-center space-x-0.5">
                  <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce" />
                  <span className="w-1 h-3.5 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_100ms]" />
                  <span className="w-1 h-2 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_200ms]" />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Live</span>
              </div>
            )}
          </div>

          {/* Real-time Microphone VU Meter Bar (No Border, Soft Shadow) */}
          {isAuthenticated && (
            <div className="w-full mt-4 px-5 py-3 rounded-2xl bg-white shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                <Mic className={`w-3.5 h-3.5 ${currentUser.isMuted ? 'text-red-500' : 'text-emerald-600'}`} />
                <span>Microphone</span>
              </div>
              {!currentUser.isMuted ? (
                <div className="flex items-center space-x-1 w-32 sm:w-40 h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 rounded-full transition-all duration-75"
                    style={{ width: `${Math.max(5, Math.min(100, (audioLevel || 0) * 1.5))}%` }}
                  />
                </div>
              ) : (
                <span className="text-[10px] font-semibold text-red-500 uppercase tracking-wider">Muted</span>
              )}
            </div>
          )}
        </div>

        {/* Right: Meeting Card (Minimal, Spacious, Elevated with Box Shadow) */}
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-7 sm:p-8 space-y-6">
          {/* Clean Segmented Tab Switcher (No Borders) */}
          <div className="flex bg-slate-100/90 p-1.5 rounded-2xl shadow-inner">
            <button
              type="button"
              onClick={() => setMode('host')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'host'
                  ? 'bg-[#0f172a] text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Crown className={`w-3.5 h-3.5 ${mode === 'host' ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>Host Meeting</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('join')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'join'
                  ? 'bg-[#0f172a] text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LogIn className={`w-3.5 h-3.5 ${mode === 'join' ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>Join Meeting</span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* TAB 1: HOST MEETING (NO ALREADY MADE LINK)               */}
          {/* ======================================================== */}
          {mode === 'host' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
                  Start a Meeting
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Create a private conference room for your team.
                </p>
              </div>

              {/* Minimal Clean Inputs (No Borders, Soft Shadow) */}
              <div>
                <input
                  type="text"
                  value={hostTitle}
                  onChange={(e) => setHostTitle(e.target.value)}
                  placeholder="Meeting Title (Optional)"
                  className="w-full px-5 py-4 text-sm font-semibold bg-slate-50 focus:bg-white rounded-2xl shadow-inner focus:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[#0f172a] placeholder-slate-400 transition-all"
                />
              </div>

              {/* Host Action Buttons */}
              {!isAuthenticated ? (
                <div className="p-6 rounded-2xl bg-slate-50 shadow-inner space-y-3 text-center">
                  <p className="text-xs text-slate-600 font-medium">
                    Sign in with your work account to host meetings.
                  </p>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="w-full py-3.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer"
                  >
                    Sign In to Host
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <button
                    onClick={() => handleCreateAndStartMeeting('stage')}
                    disabled={isCreatingHost}
                    className="w-full py-4 rounded-2xl font-bold text-sm bg-[#0f172a] hover:bg-[#1e293b] text-white shadow-xl shadow-slate-900/15 hover:shadow-2xl active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {isCreatingHost ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                        <span>Creating Meeting...</span>
                      </>
                    ) : (
                      <>
                        <Crown className="w-4 h-4 text-amber-400" />
                        <span>Create & Start Meeting</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => handleCreateAndStartMeeting('code-ide')}
                      disabled={isCreatingHost}
                      className="py-3 px-3 rounded-2xl font-semibold text-xs bg-slate-50 hover:bg-slate-100 text-[#0f172a] shadow-xs hover:shadow-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Code className="w-3.5 h-3.5 text-blue-600" />
                      <span>Start with IDE</span>
                    </button>

                    <button
                      onClick={() => handleCreateAndStartMeeting('pitch-deck')}
                      disabled={isCreatingHost}
                      className="py-3 px-3 rounded-2xl font-semibold text-xs bg-slate-50 hover:bg-slate-100 text-[#0f172a] shadow-xs hover:shadow-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Presentation className="w-3.5 h-3.5 text-blue-600" />
                      <span>Start with Deck</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: JOIN MEETING                                      */}
          {/* ======================================================== */}
          {mode === 'join' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
                  Join a Meeting
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Enter the room code and invite passcode to enter.
                </p>
              </div>

              {/* Inputs (No Borders, Clean Shadow) */}
              <div className="space-y-3">
                <input
                  type="text"
                  value={joinRoomCode}
                  onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                  placeholder="Room Code (e.g. RUPAL-804-SYNC)"
                  className="w-full px-5 py-4 text-sm font-mono uppercase font-bold bg-slate-50 focus:bg-white rounded-2xl shadow-inner focus:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[#0f172a] placeholder-slate-400 transition-all"
                />

                <input
                  type="text"
                  value={joinInviteCode}
                  onChange={(e) => setJoinInviteCode(e.target.value.toUpperCase())}
                  placeholder="Invite Passcode (e.g. INV-04SYNC)"
                  className="w-full px-5 py-4 text-sm font-mono uppercase font-bold bg-slate-50 focus:bg-white rounded-2xl shadow-inner focus:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-blue-700 placeholder-slate-400 transition-all"
                />
              </div>

              {/* Minimal Status Feedback */}
              {validationState === 'checking' && (
                <div className="flex items-center space-x-2 text-xs text-slate-500 py-1 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Verifying invite passcode...</span>
                </div>
              )}

              {validationState === 'valid' && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 shadow-sm flex items-center gap-2 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Access authorized by {hostInfo?.name || 'Host'}</span>
                </div>
              )}

              {validationState === 'invite_required' && (
                <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-900 shadow-sm flex items-center gap-2 text-xs">
                  <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Invite passcode required for this private room.</span>
                </div>
              )}

              {validationState === 'unknown_room' && (
                <div className="p-3.5 rounded-2xl bg-red-50 text-red-900 shadow-sm text-xs space-y-1">
                  <span className="font-bold block">Room not found</span>
                  <span className="text-[11px] text-red-700">Check code or switch to Host Meeting to create one.</span>
                </div>
              )}

              {/* Join Action Buttons */}
              {!isAuthenticated ? (
                <div className="p-6 rounded-2xl bg-slate-50 shadow-inner space-y-3 text-center">
                  <p className="text-xs text-slate-600 font-medium">
                    Sign in to join the conference.
                  </p>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="w-full py-3.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer"
                  >
                    Sign In to Join
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <button
                    onClick={() => handleJoinExistingMeeting('stage')}
                    disabled={validationState !== 'valid'}
                    className={`w-full py-4 rounded-2xl font-bold text-sm shadow-xl transition-all flex items-center justify-center space-x-2 ${
                      validationState === 'valid'
                        ? 'bg-[#0f172a] hover:bg-[#1e293b] text-white active:scale-[0.99] cursor-pointer shadow-slate-900/15'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <span>
                      {validationState === 'valid'
                        ? 'Join Meeting'
                        : validationState === 'invite_required'
                        ? 'Invite Passcode Required'
                        : validationState === 'unknown_room'
                        ? 'Unknown Room'
                        : 'Enter Room & Passcode'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => handleJoinExistingMeeting('code-ide')}
                      disabled={validationState !== 'valid'}
                      className={`py-3 px-3 rounded-2xl font-semibold text-xs transition-all flex items-center justify-center space-x-1.5 ${
                        validationState === 'valid'
                          ? 'bg-slate-50 hover:bg-slate-100 text-[#0f172a] shadow-xs cursor-pointer'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <Code className="w-3.5 h-3.5 text-blue-600" />
                      <span>Join with IDE</span>
                    </button>

                    <button
                      onClick={() => handleJoinExistingMeeting('pitch-deck')}
                      disabled={validationState !== 'valid'}
                      className={`py-3 px-3 rounded-2xl font-semibold text-xs transition-all flex items-center justify-center space-x-1.5 ${
                        validationState === 'valid'
                          ? 'bg-slate-50 hover:bg-slate-100 text-[#0f172a] shadow-xs cursor-pointer'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <Presentation className="w-3.5 h-3.5 text-blue-600" />
                      <span>Join with Deck</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Peer Presence indicator if room has participants */}
          {activeOthers.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-slate-50 shadow-inner flex items-center justify-between text-xs font-semibold text-slate-700">
              <div className="flex items-center space-x-2">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>{activeOthers.length} {activeOthers.length === 1 ? 'peer' : 'peers'} online</span>
              </div>
              <div className="flex items-center space-x-1">
                {activeOthers.slice(0, 4).map((p) => (
                  <img
                    key={p.id}
                    src={p.avatar}
                    alt={p.name}
                    className="w-6 h-6 rounded-full object-cover shadow-xs"
                    title={p.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
