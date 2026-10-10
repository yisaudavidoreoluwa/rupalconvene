'use client';

import React, { useState, useEffect } from 'react';
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
  Plus,
  Wrench,
  Radio,
  GraduationCap,
  Building2
} from 'lucide-react';
import { DeviceMockup } from './DeviceMockup';
import { ConferenceCalendar } from './ConferenceCalendar';
import { ScheduleMeetingModal } from './ScheduleMeetingModal';
import { CalendarSettingsModal } from './CalendarSettingsModal';
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
    <div className="min-h-screen w-full bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans select-none overflow-x-hidden">
      {/* ============================================================ */}
      {/* 1. MINIMAL SPACIOUS NAVIGATION HEADER                        */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] px-6 sm:px-12 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-9 h-9 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center shadow-sm">
            <span className="font-extrabold text-base">R</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-lg text-[#0f172a] tracking-tight leading-none">
              Rupal Convene
            </span>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Engineering Video Suite
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center space-x-5 text-xs font-semibold text-slate-600">
          <a href="#programs" className="hover:text-[#0f172a] transition-colors">
            Program Categories
          </a>
          <a href="#preview" className="hover:text-[#0f172a] transition-colors">
            Device Mockup
          </a>
          <a href="#calendar" className="hover:text-[#0f172a] transition-colors">
            Conferences & Calendar
          </a>
          <a href="#features" className="hover:text-[#0f172a] transition-colors">
            Workspace Tools
          </a>
          {onOpenProgramsHub && (
            <button
              onClick={onOpenProgramsHub}
              className="hover:text-blue-700 transition-colors cursor-pointer flex items-center space-x-1.5 text-blue-600 font-bold bg-blue-50 hover:bg-blue-100/70 px-3 py-1.5 rounded-full border border-blue-200/60 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>Programs & Hackathons</span>
            </button>
          )}
          <button onClick={onOpenDocs} className="hover:text-[#0f172a] transition-colors cursor-pointer">
            Documentation
          </button>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center space-x-2.5">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onProceedToLobby('host')}
                className="hidden sm:flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <span>Enter Meeting Lobby</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <UserProfileMenu onOpenCalendarSettings={() => setIsCalendarSettingsOpen(true)} />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 rounded-full text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-4 py-2 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. HERO SECTION (SPACIOUS & ELEVATED)                        */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-6 pt-16 sm:pt-24 pb-16 text-center flex flex-col items-center">
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
      {/* 7. MINIMAL FOOTER                                            */}
      {/* ============================================================ */}
      <footer className="mt-auto border-t border-slate-200/70 bg-white py-8 px-6 sm:px-12 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-lg bg-[#0f172a] text-white flex items-center justify-center text-[10px] font-bold">
            R
          </div>
          <span className="font-bold text-[#0f172a]">Rupal Convene</span>
          <span>© 2026. Enterprise WebRTC & Gemini AI Intelligence.</span>
        </div>

        <div className="flex items-center space-x-5 font-medium">
          <button onClick={onOpenDocs} className="hover:text-[#0f172a] transition-colors cursor-pointer">
            Documentation & SDK
          </button>
          <span className="text-slate-300">•</span>
          <button onClick={() => setIsScheduleOpen(true)} className="hover:text-[#0f172a] transition-colors cursor-pointer">
            Schedule Conference
          </button>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-600 font-semibold flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
            Mesh Online
          </span>
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
    </div>
  );
};
