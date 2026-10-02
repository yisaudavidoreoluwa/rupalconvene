'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Lock,
  AlertTriangle,
  Loader2,
  Crown,
  KeyRound,
  RefreshCw,
  Mail,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { Participant } from '@/types/meeting';
import { useAuth } from '@/context/AuthContext';
import { UserProfileMenu } from '@/components/UserProfileMenu';

interface PreJoinLobbyProps {
  roomCode: string;
  meetingTitle: string;
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
  roomCode,
  meetingTitle,
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
  audioLevel = 0,
  localStream,
}) => {
  const { user, isAuthenticated, loginWithProvider, openAuthModal, isLoading } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Tab mode: 'host' (Launch as host) or 'join' (Join by invite)
  // If user arrived with an invite parameter or specific room, default to 'join', otherwise 'host'
  const [mode, setMode] = useState<'host' | 'join'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('invite') || params.get('room')) return 'join';
    }
    return initialIsHost ? 'host' : 'host';
  });

  // Host Mode Form States
  const [hostRoomCode, setHostRoomCode] = useState<string>(roomCode || generateFreshRoomCode());
  const [hostTitle, setHostTitle] = useState<string>(meetingTitle || 'Engineering Architecture & Strategy Review');
  const [hostInviteCode, setHostInviteCode] = useState<string>(
    initialInviteCode || deriveInviteCode(roomCode || 'RUPAL-804-SYNC')
  );
  const [copiedHostLink, setCopiedHostLink] = useState(false);
  const [copiedHostInvite, setCopiedHostInvite] = useState(false);
  const [isLaunchingHost, setIsLaunchingHost] = useState(false);

  // Join Mode Form States
  const [joinRoomCode, setJoinRoomCode] = useState<string>(roomCode);
  const [joinInviteCode, setJoinInviteCode] = useState<string>(initialInviteCode);
  const [copiedJoinLink, setCopiedJoinLink] = useState(false);

  // Verification state for Join Mode
  const [validationState, setValidationState] = useState<'checking' | 'valid' | 'invite_required' | 'unknown_room'>('checking');
  const [hostInfo, setHostInfo] = useState<{ id?: string; name?: string; role?: string } | null>(null);

  // Auto-sync initial invite code from props or URL
  useEffect(() => {
    if (initialInviteCode && !joinInviteCode) {
      setJoinInviteCode(initialInviteCode);
    }
  }, [initialInviteCode, joinInviteCode]);

  // Validate room existence and verify invite passcode
  const verifyRoomAndInvite = useCallback(async (codeToVerify: string, passcodeToVerify?: string) => {
    if (!codeToVerify) return;
    setValidationState('checking');
    try {
      const inviteParam = passcodeToVerify ? `?invite=${encodeURIComponent(passcodeToVerify.trim())}` : '';
      const res = await fetch(`/api/rooms/${codeToVerify}${inviteParam}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.room) {
          setHostInfo(data.host || { name: 'Authorized Host' });
          
          if (data.isInviteOnly) {
            if (data.isInviteValid) {
              setValidationState('valid');
            } else {
              setValidationState('invite_required');
            }
          } else {
            setValidationState('valid');
          }
          return;
        }
      }
      setValidationState('unknown_room');
      setHostInfo(null);
    } catch {
      setValidationState('unknown_room');
      setHostInfo(null);
    }
  }, []);

  // Trigger verification when in join mode
  useEffect(() => {
    if (mode === 'join' && joinRoomCode) {
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

  // Regenerate fresh room code for hosting
  const handleRegenerateHostCode = () => {
    const fresh = generateFreshRoomCode();
    const freshInvite = deriveInviteCode(fresh);
    setHostRoomCode(fresh);
    setHostInviteCode(freshInvite);
    if (onRoomChange) {
      onRoomChange(fresh, hostTitle, freshInvite);
    }
  };

  // Launch Meeting as Host
  const handleLaunchMeetingAsHost = async (tab?: 'stage' | 'code-ide' | 'whiteboard' | 'pitch-deck') => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    setIsLaunchingHost(true);
    try {
      // Register room in backend
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: hostRoomCode,
          title: hostTitle,
          hostId: user?.id || 'host_user',
          hostName: user?.name || 'Conference Host',
          hostRole: 'host',
          hostAvatar: user?.avatar || '',
          inviteCode: hostInviteCode,
          isInviteOnly: true,
        })
      });
      const data = await res.json();
      const finalCode = data.room?.roomCode || hostRoomCode;
      const finalInvite = data.room?.inviteCode || hostInviteCode;

      if (onHostMeeting) {
        onHostMeeting(finalCode, hostTitle, finalInvite, tab);
      } else {
        if (onRoomChange) onRoomChange(finalCode, hostTitle, finalInvite);
        onJoinMeeting(tab);
      }
    } catch {
      if (onHostMeeting) {
        onHostMeeting(hostRoomCode, hostTitle, hostInviteCode, tab);
      } else {
        if (onRoomChange) onRoomChange(hostRoomCode, hostTitle, hostInviteCode);
        onJoinMeeting(tab);
      }
    } finally {
      setIsLaunchingHost(false);
    }
  };

  // Join meeting via verified invite
  const handleAttemptJoin = (tab?: 'stage' | 'code-ide' | 'whiteboard' | 'pitch-deck') => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    // Strict Invite Check: Cannot join if room unknown or invite passcode not verified
    if (validationState !== 'valid') {
      return;
    }
    if (onRoomChange) {
      onRoomChange(joinRoomCode, undefined, joinInviteCode);
    }
    onJoinMeeting(tab);
  };

  // Direct meeting URLs
  const hostMeetingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}?room=${hostRoomCode}&invite=${hostInviteCode}`
    : `https://rupalconvene.vercel.app?room=${hostRoomCode}&invite=${hostInviteCode}`;

  const copyHostInviteLink = () => {
    navigator.clipboard.writeText(hostMeetingUrl);
    setCopiedHostLink(true);
    setTimeout(() => setCopiedHostLink(false), 2000);
  };

  const copyHostPasscode = () => {
    navigator.clipboard.writeText(hostInviteCode);
    setCopiedHostInvite(true);
    setTimeout(() => setCopiedHostInvite(false), 2000);
  };

  const activeOthers = participants.filter((p) => p.id !== currentUser.id && !p.inGreenRoom);

  return (
    <div className="min-h-screen w-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans select-none overflow-x-hidden">
      {/* Top Header */}
      <header className="h-16 px-4 sm:px-6 bg-white flex items-center justify-between border-b border-slate-100 shadow-xs flex-shrink-0">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="w-8 h-8 rounded-xl bg-[#0f172a] text-white flex items-center justify-center p-1 shadow-xs">
            <span className="font-extrabold text-base">R</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-sm sm:text-base text-[#0f172a] tracking-tight">Rupal Convene</span>
            <span className="hidden sm:inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-[#0f172a]">
              Enterprise Suite
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 text-xs text-slate-600">
          {onOpenDocs && (
            <button
              onClick={onOpenDocs}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold transition-colors touch-manipulation"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden xs:inline">Docs & API</span>
            </button>
          )}

          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit E2EE</span>
          </div>

          <UserProfileMenu />
        </div>
      </header>

      {/* Main Lobby Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-10 lg:gap-14">
        {/* Left: Camera & Mic Test Frame */}
        <div className="w-full max-w-lg lg:max-w-xl flex flex-col items-center">
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-3xl bg-[#0a192f] overflow-hidden shadow-xl flex items-center justify-center border border-slate-800">
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
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                  <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Media Pipeline Inactive</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">
                    Sign in with Google, GitHub, or Discord to activate your camera, mic, and encryption keys.
                  </p>
                </div>
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 touch-manipulation cursor-pointer"
                >
                  Authenticate to Activate
                </button>
              </div>
            ) : (
              currentUser.isVideoOff && (
                <div className="flex flex-col items-center justify-center space-y-3 text-white p-4">
                  <img
                    src={user?.avatar || currentUser.avatar}
                    alt={user?.name || currentUser.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-[#1e293b] shadow-lg"
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
                  className={`p-3 rounded-full transition-all shadow-md active:scale-95 touch-manipulation ${
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
                  className={`p-3 rounded-full transition-all shadow-md active:scale-95 touch-manipulation ${
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
              <div className="absolute top-4 left-4 px-2.5 py-1.5 rounded-full bg-[#0f172a]/80 backdrop-blur-md border border-slate-700/50 flex items-center space-x-1.5 shadow-xs">
                <div className="flex items-center space-x-0.5">
                  <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce" />
                  <span className="w-1 h-3.5 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_100ms]" />
                  <span className="w-1 h-2 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_200ms]" />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Live</span>
              </div>
            )}

            {/* Copilot Badge */}
            <div className="absolute top-4 right-4 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900/80 text-white text-[11px] font-semibold shadow-xs backdrop-blur-md border border-slate-700/50">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>AI Copilot Ready</span>
            </div>
          </div>

          {/* Real-time Microphone VU Meter Bar */}
          {isAuthenticated && (
            <div className="w-full mt-3 px-4 py-2.5 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                <Mic className={`w-3.5 h-3.5 ${currentUser.isMuted ? 'text-red-500' : 'text-emerald-600'}`} />
                <span>{currentUser.isMuted ? 'Microphone Muted' : 'Voice Input Level'}</span>
              </div>
              {!currentUser.isMuted ? (
                <div className="flex items-center space-x-1 w-28 sm:w-36 h-2 bg-slate-100 rounded-full overflow-hidden p-0.5">
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

          {/* Security details pill */}
          <div className="flex items-center space-x-3 mt-3 text-xs text-slate-500 font-medium">
            <span>{isAuthenticated ? 'Media Pipeline Ready' : 'Authentication Required'}</span>
            <span>•</span>
            <span>HD WebRTC</span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Strict Invite-Only</span>
            </span>
          </div>
        </div>

        {/* Right: Meeting Management & Access Gateway */}
        <div className="w-full max-w-md space-y-4">
          {/* Pathway Tabs: Host a Meeting vs Join by Invite */}
          <div className="flex bg-slate-200/70 p-1 rounded-2xl shadow-inner">
            <button
              type="button"
              onClick={() => setMode('host')}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'host'
                  ? 'bg-[#0f172a] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Crown className={`w-4 h-4 ${mode === 'host' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>Host a Meeting</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('join')}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'join'
                  ? 'bg-[#0f172a] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className={`w-4 h-4 ${mode === 'join' ? 'text-blue-400' : 'text-slate-500'}`} />
              <span>Join by Invite</span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* MODE 1: HOST A MEETING                                   */}
          {/* ======================================================== */}
          {mode === 'host' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider border border-amber-200/60 mb-1.5">
                  <Crown className="w-3 h-3 text-amber-600" />
                  <span>Host Privileges Enabled</span>
                </div>
                <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
                  Launch Your Private Conference
                </h1>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Start your own encrypted room. Non-host attendees can only enter with your unique invite passcode or direct link.
                </p>
              </div>

              {/* Host Setup Inputs */}
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Meeting Title
                  </label>
                  <input
                    type="text"
                    value={hostTitle}
                    onChange={(e) => setHostTitle(e.target.value)}
                    placeholder="e.g. Architecture & Security Review"
                    className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-blue-500 text-[#0f172a]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* Generated Room Code */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Room Code</span>
                      <button
                        type="button"
                        onClick={handleRegenerateHostCode}
                        className="text-slate-400 hover:text-slate-700 transition-colors"
                        title="Generate different room code"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-mono font-bold text-xs text-[#0f172a] block truncate">
                      {hostRoomCode}
                    </span>
                  </div>

                  {/* Generated Invite Passcode */}
                  <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-200/80">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-blue-800 uppercase">Invite Passcode</span>
                      <button
                        type="button"
                        onClick={copyHostPasscode}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Copy invite passcode"
                      >
                        {copiedHostInvite ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <span className="font-mono font-extrabold text-xs text-blue-700 block truncate">
                      {hostInviteCode}
                    </span>
                  </div>
                </div>

                {/* Direct Link 1-Click Copy */}
                <div className="pt-1 flex items-center justify-between text-xs bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-1.5 text-slate-600 truncate">
                    <Lock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="text-[11px] truncate">Invite Link: {hostRoomCode}</span>
                  </div>
                  <button
                    type="button"
                    onClick={copyHostInviteLink}
                    className="text-blue-600 hover:underline font-bold text-[11px] flex items-center gap-1 flex-shrink-0 cursor-pointer"
                  >
                    {copiedHostLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHostLink ? 'Link Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* Host Launch Actions */}
              {!isAuthenticated ? (
                <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-sm space-y-2.5 text-center">
                  <p className="text-xs text-slate-600 font-medium">
                    Authenticate to assign yourself as the verified room Host.
                  </p>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="w-full py-3 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer"
                  >
                    Sign In to Host Meeting
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => handleLaunchMeetingAsHost('stage')}
                    disabled={isLaunchingHost}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm bg-[#0f172a] hover:bg-[#1e293b] text-white shadow-md shadow-slate-900/10 transition-all flex items-center justify-center space-x-2 active:scale-98 cursor-pointer"
                  >
                    {isLaunchingHost ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                        <span>Initializing Encrypted Room...</span>
                      </>
                    ) : (
                      <>
                        <Crown className="w-4 h-4 text-amber-400" />
                        <span>Launch Meeting as Host</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleLaunchMeetingAsHost('code-ide')}
                      disabled={isLaunchingHost}
                      className="py-2.5 px-3 rounded-xl font-semibold text-xs bg-slate-100 hover:bg-slate-200 text-[#0f172a] transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Code className="w-3.5 h-3.5 text-blue-600" />
                      <span>Host with IDE</span>
                    </button>

                    <button
                      onClick={() => handleLaunchMeetingAsHost('pitch-deck')}
                      disabled={isLaunchingHost}
                      className="py-2.5 px-3 rounded-xl font-semibold text-xs bg-slate-100 hover:bg-slate-200 text-[#0f172a] transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Presentation className="w-3.5 h-3.5 text-blue-600" />
                      <span>Host with Deck</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 2: JOIN BY INVITE ONLY                              */}
          {/* ======================================================== */}
          {mode === 'join' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-extrabold uppercase tracking-wider border border-blue-200/60 mb-1.5">
                  <KeyRound className="w-3 h-3 text-blue-600" />
                  <span>Strict Invite-Only Session</span>
                </div>
                <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
                  Join with Invite Passcode
                </h1>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Enter the conference Room Code and Invite Passcode dispatched by your host to unlock access.
                </p>
              </div>

              {/* Attendee Code & Passcode Inputs */}
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={joinRoomCode}
                    onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                    placeholder="e.g. RUPAL-804-SYNC"
                    className="w-full px-3 py-2 text-xs font-mono uppercase font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-blue-500 text-[#0f172a]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Invite Passcode
                    </label>
                    <span className="text-[10px] font-semibold text-blue-600">Required</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={joinInviteCode}
                      onChange={(e) => setJoinInviteCode(e.target.value.toUpperCase())}
                      placeholder="e.g. INV-04SYNC"
                      className="flex-1 px-3 py-2 text-xs font-mono uppercase font-extrabold bg-slate-50 border border-slate-200 rounded-xl focus:outline-blue-500 text-blue-700"
                    />
                    <button
                      type="button"
                      onClick={() => verifyRoomAndInvite(joinRoomCode, joinInviteCode)}
                      className="px-3.5 py-2 bg-[#0f172a] text-white rounded-xl text-xs font-bold transition-transform active:scale-95 cursor-pointer"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              </div>

              {/* Verification Feedback Banner */}
              {validationState === 'checking' && (
                <div className="flex items-center space-x-2 text-xs text-slate-500 py-1.5 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Verifying room registry & invite credentials...</span>
                </div>
              )}

              {/* Success: Invite Verified */}
              {validationState === 'valid' && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Invite Passcode Verified • Authorized by {hostInfo?.name || 'Host'}</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    Credentials validated. You are permitted to enter the encrypted conference session.
                  </p>
                </div>
              )}

              {/* Warning: Invite Missing or Incorrect */}
              {validationState === 'invite_required' && (
                <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                    <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>🔒 Private Conference — Invite Passcode Required</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Meeting <span className="font-mono font-bold">{joinRoomCode}</span> is strictly invite-only. Enter the invite passcode provided by the meeting host (<span className="font-bold">{hostInfo?.name || 'Authorized Host'}</span>) or click the direct invite link.
                  </p>
                  <div className="pt-1 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setMode('host')}
                      className="text-amber-900 hover:underline font-bold text-[11px]"
                    >
                      Host your own meeting instead →
                    </button>
                  </div>
                </div>
              )}

              {/* Warning: Unknown Room */}
              {validationState === 'unknown_room' && (
                <div className="p-3.5 rounded-2xl bg-red-50/90 border border-red-200 text-red-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-red-900">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>Unknown Conference Room</span>
                  </div>
                  <p className="text-[11px] text-red-800 leading-relaxed">
                    Room <span className="font-mono font-bold">{joinRoomCode}</span> does not exist or has not been started by a host. Check the room code or start this room as Host.
                  </p>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setHostRoomCode(joinRoomCode);
                        setHostInviteCode(deriveInviteCode(joinRoomCode));
                        setMode('host');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>Start this room as Host</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Authentication Gate or Join Buttons */}
              {!isAuthenticated ? (
                <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-sm space-y-2.5 text-center">
                  <p className="text-xs text-slate-600 font-medium">
                    Authenticate to join the verified session.
                  </p>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="w-full py-3 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer"
                  >
                    Sign In to Join
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <button
                    onClick={() => handleAttemptJoin('stage')}
                    disabled={validationState !== 'valid'}
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 ${
                      validationState === 'valid'
                        ? 'bg-[#0f172a] hover:bg-[#1e293b] text-white active:scale-98 cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                    }`}
                  >
                    <span>
                      {validationState === 'checking'
                        ? 'Verifying Invite...'
                        : validationState === 'invite_required'
                        ? '🔒 Invite Passcode Required'
                        : validationState === 'unknown_room'
                        ? 'Unknown Room'
                        : 'Join Conference Stage'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAttemptJoin('code-ide')}
                      disabled={validationState !== 'valid'}
                      className={`py-2.5 px-3 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 ${
                        validationState === 'valid'
                          ? 'bg-slate-100 hover:bg-slate-200 text-[#0f172a] cursor-pointer'
                          : 'bg-slate-100/50 text-slate-400 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <Code className="w-3.5 h-3.5 text-blue-600" />
                      <span>Join with IDE</span>
                    </button>

                    <button
                      onClick={() => handleAttemptJoin('pitch-deck')}
                      disabled={validationState !== 'valid'}
                      className={`py-2.5 px-3 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 ${
                        validationState === 'valid'
                          ? 'bg-slate-100 hover:bg-slate-200 text-[#0f172a] cursor-pointer'
                          : 'bg-slate-100/50 text-slate-400 cursor-not-allowed opacity-60'
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
            <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-1.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#0f172a]">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>{activeOthers.length} {activeOthers.length === 1 ? 'peer' : 'peers'} active in session</span>
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
          )}

          <div className="text-[11px] text-slate-400 leading-relaxed text-center pt-2">
            Encrypted with 256-bit DTLS-SRTP • Strict Invite Authentication Enforced
          </div>
        </div>
      </main>
    </div>
  );
};
