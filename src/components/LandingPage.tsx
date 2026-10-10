'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowRight, 
  Calendar as CalendarIcon, 
  Video, 
  Code, 
  Layout, 
  ShieldCheck, 
  Users, 
  Lock, 
  Zap, 
  CheckCircle2, 
  Play, 
  ExternalLink, 
  ChevronRight, 
  ChevronDown,
  Plus, 
  Wrench, 
  Radio, 
  GraduationCap, 
  Building2,
  Mail,
  Phone,
  MapPin,
  Presentation,
  Menu,
  X
} from 'lucide-react';
import { DeviceMockup } from './DeviceMockup';
import { ConferenceCalendar } from './ConferenceCalendar';
import { ScheduleMeetingModal } from './ScheduleMeetingModal';
import { CalendarSettingsModal } from './CalendarSettingsModal';
import { SubscriptionModal } from './SubscriptionModal';
import { 
  ScheduledConference, 
  INITIAL_SCHEDULED_CONFERENCES,
  UserCalendarSettings,
  getDefaultCalendarSettings
} from '@/types/schedule';
import { useAuth } from '@/context/AuthContext';
import { UserProfileMenu } from './UserProfileMenu';

interface LandingPageProps {
  onProceedToLobby: (mode?: 'host' | 'join') => void;
  onJoinSpecificRoom: (roomCode: string, inviteCode?: string, title?: string) => void;
  onOpenDocs: () => void;
  onOpenProgramsHub?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onProceedToLobby,
  onJoinSpecificRoom,
  onOpenDocs,
  onOpenProgramsHub,
}) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const userId = user?.id || 'guest_user';

  // Modal open states
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isCalendarSettingsOpen, setIsCalendarSettingsOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isFeaturesMenuOpen, setIsFeaturesMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scheduleInitialDate, setScheduleInitialDate] = useState<string | undefined>(undefined);

  // User-specific calendar settings
  const [calendarSettings, setCalendarSettings] = useState<UserCalendarSettings>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`rupal_calendar_settings_${userId}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return getDefaultCalendarSettings(userId);
  });

  // Scheduled conferences list (clears out any old dummy conf- items to start fresh)
  const [scheduledConferences, setScheduledConferences] = useState<ScheduledConference[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('rupal_scheduled_conferences');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const clean = parsed.filter((c: any) => c && !c.id?.startsWith('conf-'));
            localStorage.setItem('rupal_scheduled_conferences', JSON.stringify(clean));
            return clean;
          }
        } catch {}
      }
    }
    return [];
  });

  // Sync calendar settings & conferences on user change or mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSettings = localStorage.getItem(`rupal_calendar_settings_${userId}`);
      if (storedSettings) {
        try {
          setCalendarSettings(JSON.parse(storedSettings));
        } catch {}
      } else {
        setCalendarSettings(getDefaultCalendarSettings(userId));
      }
    }

    // Fetch genuine user schedules from backend API
    fetch('/api/schedules')
      .then(res => res.json())
      .then(data => {
        if (data.conferences && Array.isArray(data.conferences)) {
          setScheduledConferences(prev => {
            const map = new Map<string, ScheduledConference>();
            prev.filter(c => !c.id.startsWith('conf-')).forEach(c => map.set(c.id, c));
            data.conferences.filter((c: ScheduledConference) => !c.id.startsWith('conf-')).forEach((c: ScheduledConference) => map.set(c.id, c));
            const list = Array.from(map.values());
            if (typeof window !== 'undefined') {
              localStorage.setItem('rupal_scheduled_conferences', JSON.stringify(list));
            }
            return list;
          });
        }
      })
      .catch(() => {});
  }, [userId]);

  const handleOpenSchedule = (initialDate?: string) => {
    setScheduleInitialDate(initialDate);
    setIsScheduleOpen(true);
  };

  // Quick join room input
  const [quickRoomCode, setQuickRoomCode] = useState('');

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickRoomCode.trim()) {
      onJoinSpecificRoom(quickRoomCode.trim().toUpperCase());
    } else {
      onProceedToLobby('join');
    }
  };

  const handleMeetingScheduled = (newMeeting: ScheduledConference) => {
    setScheduledConferences((prev) => {
      const updated = [newMeeting, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('rupal_scheduled_conferences', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleDeleteConference = async (id: string) => {
    setScheduledConferences(prev => {
      const updated = prev.filter(c => c.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('rupal_scheduled_conferences', JSON.stringify(updated));
      }
      return updated;
    });

    try {
      await fetch(`/api/schedules?id=${id}`, { method: 'DELETE' });
    } catch {}
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans select-none overflow-x-hidden pb-16 sm:pb-0">
      {/* ============================================================ */}
      {/* 0. SLEEK MINIMAL ANNOUNCEMENT SUB-HEADER                    */}
      {/* ============================================================ */}
      <div className="bg-[#0f172a] text-white text-[11px] font-medium py-1.5 px-6 sm:px-12 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center space-x-2 mx-auto sm:mx-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">
            WebRTC Mesh 2.0 with Gemini AI Meeting Notes
          </span>
          <span className="hidden md:inline text-slate-600">•</span>
          <span className="hidden md:inline text-slate-400">Sub-2ms peer signaling active</span>
        </div>
        <div className="hidden sm:flex items-center space-x-3 text-slate-300">
          <button
            onClick={() => setIsSubscriptionOpen(true)}
            className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer transition-colors"
          >
            Subscription Plans →
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. CLEAN & MINIMAL SPACIOUS NAVIGATION HEADER                */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/70 px-6 sm:px-12 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-9 h-9 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center shadow-xs">
            <span className="font-extrabold text-base">R</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-lg text-[#0f172a] tracking-tight leading-none whitespace-nowrap">
              Rupal Convene
            </span>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5 whitespace-nowrap">
              Engineering Video Suite
            </span>
          </div>
        </div>

        {/* Center Nav Links - Clean, Minimal & Whitespace-Nowrap */}
        <nav className="hidden lg:flex items-center space-x-6 text-xs font-semibold text-slate-600">
          {/* Features Dropdown Submenu */}
          <div 
            className="relative" 
            onMouseEnter={() => setIsFeaturesMenuOpen(true)} 
            onMouseLeave={() => setIsFeaturesMenuOpen(false)}
          >
            <a 
              href="#features"
              onClick={() => setIsFeaturesMenuOpen(false)}
              className="flex items-center space-x-1 hover:text-[#0f172a] transition-colors whitespace-nowrap cursor-pointer py-1"
            >
              <span>Features</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isFeaturesMenuOpen ? 'rotate-180 text-blue-600' : ''}`} />
            </a>

            {/* Dropdown Sub-menu */}
            {isFeaturesMenuOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-72 rounded-2xl bg-white border border-slate-200/90 shadow-xl shadow-slate-900/10 p-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150 z-50">
                <a 
                  href="#features" 
                  onClick={() => setIsFeaturesMenuOpen(false)}
                  className="flex items-start space-x-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Code className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0f172a] group-hover:text-blue-600 transition-colors">Collaborative Code IDE</div>
                    <div className="text-[11px] text-slate-500 font-normal">Multi-language execution in-call</div>
                  </div>
                </a>

                <a 
                  href="#features" 
                  onClick={() => setIsFeaturesMenuOpen(false)}
                  className="flex items-start space-x-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Layout className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0f172a] group-hover:text-emerald-600 transition-colors">Architecture Whiteboard</div>
                    <div className="text-[11px] text-slate-500 font-normal">Cloud topologies & system diagrams</div>
                  </div>
                </a>

                <a 
                  href="#features" 
                  onClick={() => setIsFeaturesMenuOpen(false)}
                  className="flex items-start space-x-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Presentation className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0f172a] group-hover:text-indigo-600 transition-colors">Pitch Deck Viewer</div>
                    <div className="text-[11px] text-slate-500 font-normal">Synchronized slides & watermarking</div>
                  </div>
                </a>

                <a 
                  href="#features" 
                  onClick={() => setIsFeaturesMenuOpen(false)}
                  className="flex items-start space-x-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0f172a] group-hover:text-amber-600 transition-colors">Gemini AI Minutes</div>
                    <div className="text-[11px] text-slate-500 font-normal">Automated notes, action items & logs</div>
                  </div>
                </a>
              </div>
            )}
          </div>

          {/* Programs Link with Optional Hub Trigger */}
          <a 
            href="#programs" 
            className="hover:text-[#0f172a] transition-colors whitespace-nowrap cursor-pointer flex items-center space-x-1"
          >
            <span>Programs</span>
            {onOpenProgramsHub && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            )}
          </a>

          {/* Calendar Link */}
          <a href="#calendar" className="hover:text-[#0f172a] transition-colors whitespace-nowrap">
            Calendar
          </a>

          {/* Subscription / Pricing Link */}
          <button
            onClick={() => setIsSubscriptionOpen(true)}
            className="hover:text-[#0f172a] transition-colors whitespace-nowrap cursor-pointer flex items-center space-x-1 text-slate-600 hover:text-slate-900"
          >
            <span>Pricing</span>
          </button>

          {/* Documentation Link */}
          <button onClick={onOpenDocs} className="hover:text-[#0f172a] transition-colors cursor-pointer whitespace-nowrap">
            Docs
          </button>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center space-x-2.5 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onProceedToLobby('host')}
                className="hidden sm:flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <span>Enter Lobby</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <UserProfileMenu onOpenCalendarSettings={() => setIsCalendarSettingsOpen(true)} />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 rounded-full text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-4 py-2 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu when hamburger is open */}
      {mobileNavOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150 text-xs font-semibold text-slate-700 shadow-md">
          <a
            href="#features"
            onClick={() => setMobileNavOpen(false)}
            className="block py-2 hover:text-[#0f172a]"
          >
            Features & Tools
          </a>
          <a
            href="#programs"
            onClick={() => setMobileNavOpen(false)}
            className="block py-2 hover:text-[#0f172a]"
          >
            Programs & Hackathons
          </a>
          <a
            href="#calendar"
            onClick={() => setMobileNavOpen(false)}
            className="block py-2 hover:text-[#0f172a]"
          >
            Calendar & Conferences
          </a>
          <button
            onClick={() => {
              setMobileNavOpen(false);
              setIsSubscriptionOpen(true);
            }}
            className="block w-full text-left py-2 hover:text-[#0f172a]"
          >
            Pricing & Subscriptions
          </button>
          <button
            onClick={() => {
              setMobileNavOpen(false);
              onOpenDocs();
            }}
            className="block w-full text-left py-2 hover:text-[#0f172a]"
          >
            Documentation & SDK
          </button>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                setMobileNavOpen(false);
                onProceedToLobby('host');
              }}
              className="w-full py-2.5 rounded-full bg-[#0f172a] text-white font-bold text-center"
            >
              Enter Meeting Lobby
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. HERO SECTION (SPACIOUS & ELEVATED)                        */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-6 pt-8 sm:pt-14 md:pt-20 pb-12 text-center flex flex-col items-center">
        {/* Main Headline with Gradient Hero Text (Item 3, No Purple) */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-[1.12]">
          <span className="text-[#0f172a]">Ultra-Fast Video Conferences for </span>
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-700 via-blue-600 to-sky-500">
            Builders & Leaders
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-slate-600 mt-5 max-w-2xl leading-relaxed">
          Host high-definition conferences with side-by-side collaborative code editing, interactive architecture whiteboards, synchronized pitch decks, and automated Gemini personal meeting notes.
        </p>

        {/* Primary Action Button Cluster */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 w-full max-w-xl">
          {/* Host Instant Meeting */}
          <button
            onClick={() => onProceedToLobby('host')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Video className="w-4 h-4" />
            <span>Host Instant Meeting</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          {/* Schedule Meeting Button */}
          <button
            onClick={() => setIsScheduleOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-[#0f172a] font-bold text-xs sm:text-sm shadow-sm border border-slate-200/80 transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <span>Schedule a Meeting</span>
          </button>

          {/* Programs & Hackathons Hub Button */}
          {onOpenProgramsHub && (
            <button
              onClick={onOpenProgramsHub}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer border border-blue-500"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Explore Programs</span>
            </button>
          )}
        </div>

        {/* Quick Join With Code Bar */}
        <form onSubmit={handleQuickJoin} className="mt-6 flex items-center space-x-2 max-w-sm w-full">
          <input
            type="text"
            placeholder="Enter Room Code (e.g. RUPAL-804-SYNC)"
            value={quickRoomCode}
            onChange={(e) => setQuickRoomCode(e.target.value.toUpperCase())}
            className="flex-1 px-4 py-2.5 rounded-full bg-white border border-slate-200 text-xs font-mono uppercase text-[#0f172a] placeholder:normal-case placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Join
          </button>
        </form>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-10 text-xs text-slate-500 font-medium">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>256-Bit DTLS/SRTP E2EE</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-blue-600" />
            <span>Sub-2ms Peer Signaling</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Lock className="w-4 h-4 text-slate-600" />
            <span>Strict Invite-Only Passcodes</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Automated AI Minutes</span>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2B. 6 PROGRAM CATEGORIES SHOWCASE                            */}
      {/* ============================================================ */}
      <section className="max-w-6xl mx-auto px-6 py-16 sm:py-20" id="programs">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
            Tailored Engineering Suites for Every Program
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-3 leading-relaxed">
            Each category unlocks specialized in-call tools — sprint clocks, interactive code labs, lightning talk timers, live polls, verifiable certificates, and cloud topology loaders.
          </p>
        </div>

        {/* 3x2 Grid with Clean Neutral Border Cards & Navy/White Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Card 1: Hackathon */}
          <div
            onClick={onOpenProgramsHub}
            className="group relative p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#0f172a] flex items-center justify-center border border-slate-200 shadow-2xs">
                  <Zap className="w-4 h-4 text-[#0f172a]" />
                </div>
                <span className="text-sm font-bold text-[#0f172a] group-hover:text-blue-600 transition-colors">
                  Hackathon
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Competitive 24–48h developer build sprint
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-blue-600">
              <span>Sprint clock & squads</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 2: Hands-on Workshop */}
          <div
            onClick={onOpenProgramsHub}
            className="group relative p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#0f172a] flex items-center justify-center border border-slate-200 shadow-2xs">
                  <Wrench className="w-4 h-4 text-[#0f172a]" />
                </div>
                <span className="text-sm font-bold text-[#0f172a] group-hover:text-blue-600 transition-colors">
                  Hands-on Workshop
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                In-depth code labs and system tutorials
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-blue-600">
              <span>Code lab steps & TA queue</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 3: Developer Meetup */}
          <div
            onClick={onOpenProgramsHub}
            className="group relative p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#0f172a] flex items-center justify-center border border-slate-200 shadow-2xs">
                  <Users className="w-4 h-4 text-[#0f172a]" />
                </div>
                <span className="text-sm font-bold text-[#0f172a] group-hover:text-blue-600 transition-colors">
                  Developer Meetup
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Community tech gathering & lightning talks
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-blue-600">
              <span>Lightning timer & Q&A</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 4: Virtual Broadcast */}
          <div
            onClick={onOpenProgramsHub}
            className="group relative p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#0f172a] flex items-center justify-center border border-slate-200 shadow-2xs">
                  <Radio className="w-4 h-4 text-[#0f172a]" />
                </div>
                <span className="text-sm font-bold text-[#0f172a] group-hover:text-blue-600 transition-colors">
                  Virtual Broadcast
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Global technical webinar or town hall
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-blue-600">
              <span>Live polling & Stage control</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 5: University Bootcamp */}
          <div
            onClick={onOpenProgramsHub}
            className="group relative p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#0f172a] flex items-center justify-center border border-slate-200 shadow-2xs">
                  <GraduationCap className="w-4 h-4 text-[#0f172a]" />
                </div>
                <span className="text-sm font-bold text-[#0f172a] group-hover:text-blue-600 transition-colors">
                  University Bootcamp
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Student training & career incubator
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-blue-600">
              <span>Roll-call & Certificates</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 6: Architecture Demo */}
          <div
            onClick={onOpenProgramsHub}
            className="group relative p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#0f172a] flex items-center justify-center border border-slate-200 shadow-2xs">
                  <Building2 className="w-4 h-4 text-[#0f172a]" />
                </div>
                <span className="text-sm font-bold text-[#0f172a] group-hover:text-blue-600 transition-colors">
                  Architecture Demo
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Executive symposium or industry tech day
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-blue-600">
              <span>Topology injection & Vault</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* View Programs Catalog CTA */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={onOpenProgramsHub}
            className="px-6 py-3.5 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold transition-all shadow-sm flex items-center space-x-2 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span>Open Programs & Cohorts Hub</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. DEVICE MOCKUP SHOWCASE (DESKTOP & MOBILE)                 */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20" id="preview">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0f172a] tracking-tight">
            Engineered for Desktop & Mobile Form Factors
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-3 leading-relaxed">
            Seamless peer-to-peer conferencing across browsers, laptops, and smartphones with synchronized AI intelligence.
          </p>
        </div>

        {/* Render Device Mockup Component */}
        <DeviceMockup />
      </section>

      {/* ============================================================ */}
      {/* 4. CONFERENCES & CALENDAR SECTION                            */}
      {/* ============================================================ */}
      <section className="max-w-6xl mx-auto px-6 py-16 sm:py-20" id="calendar">
        <ConferenceCalendar
          conferences={scheduledConferences}
          onScheduleClick={(date) => handleOpenSchedule(date)}
          onJoinConference={(code, invite, title) => onJoinSpecificRoom(code, invite, title)}
          onOpenSettings={() => setIsCalendarSettingsOpen(true)}
          onDeleteConference={handleDeleteConference}
          userCalendarSettings={calendarSettings}
        />
      </section>

      {/* ============================================================ */}
      {/* 5. WORKSPACE FEATURES MATRIX (CLEAN, NO HEAVY BORDERS)       */}
      {/* ============================================================ */}
      <section className="max-w-6xl mx-auto px-6 py-16 sm:py-20" id="features">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
            Everything your engineering team needs during a call
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
            No more switching tabs. Code, draw architecture, present slides, and take AI notes inside a single secure meeting room.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feature 1 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all border border-slate-200 hover:border-slate-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-[#0f172a] flex items-center justify-center mb-4 border border-slate-200 shadow-xs">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#0f172a]">
                Gemini AI "My Notes" Studio
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Take notes or let Gemini transcribe live speech into private summaries, bulleted highlights, and checkable action items tailored specifically for you.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-blue-600">
              <span>Personalized meeting intelligence</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all border border-slate-200 hover:border-slate-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-[#0f172a] flex items-center justify-center mb-4 border border-slate-200 shadow-xs">
                <Code className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#0f172a]">
                Side-by-Side Collaborative IDE
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Write HTML, JavaScript, CSS, or TypeScript collaboratively with instant side-by-side rendering, syntax highlighting, and host-controlled write permissions.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-blue-600">
              <span>Sub-2ms peer code synchronization</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all border border-slate-200 hover:border-slate-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-[#0f172a] flex items-center justify-center mb-4 border border-slate-200 shadow-xs">
                <Layout className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#0f172a]">
                Architectural Whiteboard & Slides
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Model complex cloud topologies, draw freehand diagrams, import PDF slides directly onto the canvas, and guide attendees with real-time laser pointers.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-blue-600">
              <span>Real-time multi-user diagramming</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all border border-slate-200 hover:border-slate-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-[#0f172a] flex items-center justify-center mb-4 border border-slate-200 shadow-xs">
                <ShieldCheck className="w-6 h-6 text-[#0f172a]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#0f172a]">
                Invite-Only Security & Green Room
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Stage keynotes and guest presenters in the backstage green room before admitting them to the main floor. Protected by cryptographic invite verification.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-blue-600">
              <span>Zero-trust meeting admittance</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. BOTTOM CALL TO ACTION CARD                                */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-20 w-full">
        <div className="bg-[#0f172a] rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to host your next high-impact conference?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Experience ultra-low latency WebRTC audio/video mesh, live collaborative IDE, and Gemini AI notes without downloading any software.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={() => onProceedToLobby('host')}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Host a Meeting Now
              </button>
              <button
                onClick={() => setIsScheduleOpen(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
              >
                Schedule for Later
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* STICKY MOBILE CTA (Docked Bottom Bar for Mobile < 640px)      */}
      {/* ============================================================ */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-3 shadow-[0_-4px_25px_rgba(15,23,42,0.08)] flex items-center justify-between gap-2.5">
        <button
          onClick={() => onProceedToLobby('host')}
          className="flex-1 py-2.5 px-3 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 cursor-pointer"
        >
          <Video className="w-3.5 h-3.5" />
          <span>Host Meeting</span>
        </button>

        <button
          onClick={() => onProceedToLobby('join')}
          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0f172a] text-xs font-bold flex items-center justify-center space-x-1.5 active:scale-95 cursor-pointer"
        >
          <span>Join Room</span>
        </button>

        <button
          onClick={() => setIsScheduleOpen(true)}
          className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-blue-600 flex items-center justify-center active:scale-95 cursor-pointer shadow-2xs"
          title="Schedule Meeting"
        >
          <CalendarIcon className="w-4 h-4" />
        </button>
      </div>

      {/* ============================================================ */}
      {/* 7. EXPANDED SAAS FOOTER WITH REAL CORPORATE DETAILS          */}
      {/* ============================================================ */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white pt-12 pb-8 px-6 sm:px-12 text-xs text-slate-500 font-sans">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-100">
          {/* Col 1: Brand & Headquarters */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-[#0f172a] text-white flex items-center justify-center text-xs font-extrabold shadow-2xs">
                R
              </div>
              <span className="font-extrabold text-sm text-[#0f172a] tracking-tight">Rupal Convene</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Enterprise WebRTC video conferencing and real-time collaboration suite with integrated Code IDE, architecture whiteboards, and Gemini AI notes.
            </p>
            <div className="pt-2 text-[11px] text-slate-600 space-y-1.5">
              <div className="flex items-start space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Lagos HQ:</strong> Rupal Tech Solutions Ltd, 12 Broad Street, Victoria Island, Lagos, Nigeria
                </span>
              </div>
              <div className="flex items-start space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>London Office:</strong> 160 Kemp House, City Road, London, EC1V 2NX, UK
                </span>
              </div>
              <div className="flex items-center space-x-1.5 pt-1">
                <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <a href="mailto:support@rupalconvene.com" className="text-blue-600 font-semibold hover:underline">
                  support@rupalconvene.com
                </a>
              </div>
              <div className="flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>+234 (0) 1 295 4480 / +44 20 7946 0912</span>
              </div>
            </div>
          </div>

          {/* Col 2: Platform & Features */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0f172a]">Convene Platform</h3>
            <ul className="space-y-1.5 text-[11px]">
              <li><a href="#features" className="hover:text-[#0f172a] transition-colors">Ultra-Fast WebRTC Mesh</a></li>
              <li><a href="#features" className="hover:text-[#0f172a] transition-colors">Collaborative Code IDE</a></li>
              <li><a href="#features" className="hover:text-[#0f172a] transition-colors">Architecture Whiteboard</a></li>
              <li><a href="#features" className="hover:text-[#0f172a] transition-colors">Synchronized Pitch Decks</a></li>
              <li><a href="#features" className="hover:text-[#0f172a] transition-colors">Gemini AI Meeting Minutes</a></li>
              <li><a href="#calendar" className="hover:text-[#0f172a] transition-colors">Interactive Calendar & Schedules</a></li>
              {onOpenProgramsHub && (
                <li>
                  <button onClick={onOpenProgramsHub} className="text-blue-600 font-semibold hover:underline cursor-pointer">
                    Programs & Hackathons Hub
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Developers & Ecosystem */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0f172a]">Developers & SDK</h3>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/docs" className="hover:text-[#0f172a] transition-colors">Developer Documentation</Link></li>
              <li><Link href="/docs" className="hover:text-[#0f172a] transition-colors">WebRTC Signaling Reference</Link></li>
              <li><Link href="/docs" className="hover:text-[#0f172a] transition-colors">DTLS/SRTP Security Specs</Link></li>
              <li><Link href="/docs" className="hover:text-[#0f172a] transition-colors">REST API & Webhooks</Link></li>
              <li className="pt-2">
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Global Relay Mesh Online</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Compliance */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0f172a]">Legal & Privacy</h3>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/privacy" className="hover:text-[#0f172a] transition-colors font-medium">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#0f172a] transition-colors font-medium">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-[#0f172a] transition-colors">GDPR & NDPR Compliance</Link></li>
              <li>
                <button
                  onClick={() => {
                    localStorage.removeItem('rupal_cookie_consent');
                    window.location.reload();
                  }}
                  className="hover:text-[#0f172a] transition-colors cursor-pointer text-slate-500 text-left"
                >
                  Cookie Preferences
                </button>
              </li>
              <li>
                <span className="inline-flex items-center space-x-1 text-slate-600 font-semibold pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>256-Bit Encrypted Sessions</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            © 2026 Rupal Tech Solutions Ltd. All rights reserved. Rupal Convene™ is a trademark of Rupal Tech Solutions.
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/privacy" className="hover:text-slate-600">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-slate-600">Terms</Link>
            <span>•</span>
            <Link href="/docs" className="hover:text-slate-600">SDK</Link>
            <span>•</span>
            <a href="mailto:support@rupalconvene.com" className="hover:text-slate-600">Support</a>
          </div>
        </div>
      </footer>

      {/* Schedule Meeting Modal */}
      <ScheduleMeetingModal
        isOpen={isScheduleOpen}
        onClose={() => {
          setIsScheduleOpen(false);
          setScheduleInitialDate(undefined);
        }}
        onMeetingScheduled={handleMeetingScheduled}
        onHostNow={(roomCode, title, inviteCode) => {
          onJoinSpecificRoom(roomCode, inviteCode, title);
        }}
        onOpenSettings={() => setIsCalendarSettingsOpen(true)}
        initialDate={scheduleInitialDate}
      />

      {/* User Calendar Settings Modal */}
      <CalendarSettingsModal
        isOpen={isCalendarSettingsOpen}
        onClose={() => setIsCalendarSettingsOpen(false)}
        userConferences={scheduledConferences}
        onSettingsSaved={(newSettings) => {
          setCalendarSettings(newSettings);
        }}
      />

      {/* SaaS Subscription Plans Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        onSelectPlan={(planId) => {
          if (planId === 'starter') {
            onProceedToLobby('host');
          } else {
            openAuthModal('signup');
          }
        }}
      />
    </div>
  );
};
