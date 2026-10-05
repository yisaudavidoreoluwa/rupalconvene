'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  Globe, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Copy, 
  Download, 
  RefreshCw,
  Bell,
  Sliders,
  CheckCircle2,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { UserCalendarSettings, getDefaultCalendarSettings, ScheduledConference } from '@/types/schedule';
import { useAuth } from '@/context/AuthContext';

interface CalendarSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved?: (settings: UserCalendarSettings) => void;
  userConferences?: ScheduledConference[];
}

const COMMON_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada) - New York' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada) - Chicago' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada) - Denver' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada) - Los Angeles' },
  { value: 'Europe/London', label: 'London, Edinburgh, Dublin (GMT / BST)' },
  { value: 'Europe/Paris', label: 'Paris, Amsterdam, Berlin, Rome (CET)' },
  { value: 'Africa/Lagos', label: 'West Africa Time - Lagos, Abuja (WAT)' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time - Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India Standard Time - Mumbai, New Delhi (IST)' },
  { value: 'Asia/Singapore', label: 'Singapore, Hong Kong, Beijing (SGT)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time - Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time - Sydney (AEST)' },
];

const DAYS_OF_WEEK = [
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
  { day: 0, label: 'Sun' },
];

export const CalendarSettingsModal: React.FC<CalendarSettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsSaved,
  userConferences = [],
}) => {
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  const [settings, setSettings] = useState<UserCalendarSettings>(() => {
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

  const [activeTab, setActiveTab] = useState<'defaults' | 'hours' | 'sync'>('defaults');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Sync settings when active user changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`rupal_calendar_settings_${userId}`);
      if (stored) {
        try {
          setSettings(JSON.parse(stored));
          return;
        } catch {}
      }
    }
    setSettings(getDefaultCalendarSettings(userId));
  }, [userId]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`rupal_calendar_settings_${userId}`, JSON.stringify(settings));
    }
    // Also broadcast to backend if online
    try {
      fetch('/api/user/calendar-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      }).catch(() => {});
    } catch {}

    setSaveSuccess(true);
    if (onSettingsSaved) {
      onSettingsSaved(settings);
    }
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  const handleDetectTimezone = () => {
    try {
      const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (local) {
        setSettings(prev => ({ ...prev, timezone: local }));
      }
    } catch {}
  };

  const toggleWorkingDay = (day: number) => {
    setSettings(prev => {
      const exists = prev.workingDays.includes(day);
      const newDays = exists 
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day].sort();
      return { ...prev, workingDays: newDays };
    });
  };

  const handleCopyIcalUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://rupalconvene.vercel.app';
    const feedUrl = `${origin}/api/calendar/feed?token=${settings.icalFeedToken}&user=${encodeURIComponent(userId)}`;
    navigator.clipboard.writeText(feedUrl);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleDownloadFullCalendarIcs = () => {
    let icsEvents = '';
    const conferencesToExport = userConferences.length > 0 ? userConferences : [];

    conferencesToExport.forEach(c => {
      const icsDate = c.date.replace(/-/g, '') + 'T' + c.time.replace(/:/g, '') + '00';
      icsEvents += `
BEGIN:VEVENT
SUMMARY:${c.title}
DESCRIPTION:${c.description}\\nRoom: ${c.roomCode}\\nInvite: ${c.inviteCode}
DTSTART:${icsDate}
DURATION:PT${c.durationMinutes}M
STATUS:CONFIRMED
END:VEVENT`;
    });

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Rupal Convene//User Calendar Feed//EN
X-WR-TIMEZONE:${settings.timezone}
${icsEvents}
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rupal-convene-schedule-${userId}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-100 relative animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 pb-5 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#0f172a] tracking-tight">
              Calendar & Scheduling Settings
            </h3>
            <p className="text-xs text-slate-500">
              Personalized defaults for {user?.name || 'your user account'} ({user?.email || 'Convene User'})
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 my-4 p-1 bg-slate-100 rounded-2xl text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('defaults')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'defaults' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Meeting Defaults
          </button>
          <button
            onClick={() => setActiveTab('hours')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'hours' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Working Hours & Days
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'sync' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Calendar Sync (.ics)
          </button>
        </div>

        {/* Tab 1: Meeting Defaults & Timezone */}
        {activeTab === 'defaults' && (
          <div className="space-y-4 py-2">
            {/* Timezone Preference */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Primary Timezone</span>
                </label>
                <button
                  type="button"
                  onClick={handleDetectTimezone}
                  className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Auto-detect</span>
                </button>
              </div>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-xs"
              >
                {COMMON_TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>

            {/* Default Meeting Duration */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Default Meeting Duration</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 45, 60].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setSettings({ ...settings, defaultDurationMinutes: mins })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      settings.defaultDurationMinutes === mins
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {mins} mins
                  </button>
                ))}
              </div>
            </div>

            {/* Default Category */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Default Workspace Category
              </label>
              <select
                value={settings.defaultCategory}
                onChange={(e) => setSettings({ ...settings, defaultCategory: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-xs"
              >
                <option value="engineering">Engineering Architecture Sync</option>
                <option value="keynote">Executive Keynote & Summit</option>
                <option value="investor">Investor Syndicate Review</option>
                <option value="product">Product Launch & Live Sandbox</option>
                <option value="general">General Team Conference</option>
              </select>
            </div>

            {/* Feature Toggles */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer border border-slate-200/60">
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Auto-enable Gemini AI Notes & Summary
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Transcribe and generate structured takeaways automatically for new calls
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoEnableNotes}
                  onChange={(e) => setSettings({ ...settings, autoEnableNotes: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer border border-slate-200/60">
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Backstage Green Room by Default
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Screen attendees before admitting them to the main conference stage
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoEnableGreenRoom}
                  onChange={(e) => setSettings({ ...settings, autoEnableGreenRoom: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}

        {/* Tab 2: Working Hours & Days */}
        {activeTab === 'hours' && (
          <div className="space-y-5 py-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Active Working Days
              </label>
              <div className="flex items-center gap-2">
                {DAYS_OF_WEEK.map(({ day, label }) => {
                  const isActive = settings.workingDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleWorkingDay(day)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Work Day Starts
                </label>
                <select
                  value={settings.workingHoursStart}
                  onChange={(e) => setSettings({ ...settings, workingHoursStart: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white shadow-xs"
                >
                  {['07:00', '08:00', '08:30', '09:00', '09:30', '10:00'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Work Day Ends
                </label>
                <select
                  value={settings.workingHoursEnd}
                  onChange={(e) => setSettings({ ...settings, workingHoursEnd: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white shadow-xs"
                >
                  {['16:00', '17:00', '17:30', '18:00', '18:30', '19:00', '20:00'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Meeting Buffer Time (Padding)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[0, 5, 10].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setSettings({ ...settings, bufferMinutes: mins })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      settings.bufferMinutes === mins
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {mins === 0 ? 'No Buffer' : `${mins} min buffer`}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Prevents back-to-back scheduling by reserving breathing room between calls.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Calendar Sync & Integrations */}
        {activeTab === 'sync' && (
          <div className="space-y-4 py-2">
            {/* Connected Calendars Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-xs">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Google Calendar</span>
                    <span className="text-[10px] text-slate-500">
                      {user?.provider === 'google' ? `Connected (${user.email})` : 'Sync ready via one-click links'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-xs">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Outlook 365 & Live</span>
                    <span className="text-[10px] text-slate-500">
                      One-click export & direct add supported
                    </span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                  Ready
                </span>
              </div>
            </div>

            {/* Apple / iCal Feed Subscription */}
            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center space-x-1">
                  <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Personal Calendar Feed (iCal)</span>
                </span>
                <span className="text-[10px] text-blue-700 font-mono">Token: {settings.icalFeedToken}</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-snug">
                Subscribe to your live Rupal Convene conferences in Apple Calendar, Google Calendar, or Thunderbird.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyIcalUrl}
                  className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-blue-200 text-xs font-bold shadow-xs cursor-pointer"
                >
                  {copiedToken ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied Feed URL!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-blue-600" />
                      <span>Copy Feed URL</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadFullCalendarIcs}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .ics</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSettings(getDefaultCalendarSettings(userId))}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            Reset Defaults
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center space-x-1.5 px-6 py-2.5 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Preferences Saved!</span>
                </>
              ) : (
                <span>Save Preferences</span>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
