'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Copy, 
  ArrowRight,
  Download,
  Users,
  Sliders,
  ExternalLink,
  Globe
} from 'lucide-react';
import { 
  ScheduledConference, 
  UserCalendarSettings, 
  getDefaultCalendarSettings,
  getGoogleCalendarLink,
  getOutlookCalendarLink
} from '@/types/schedule';
import { useAuth } from '@/context/AuthContext';
import { ProgramCategorySelector } from '@/components/ProgramCategorySelector';
import { ProgramCategory } from '@/types/program';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMeetingScheduled: (newMeeting: ScheduledConference) => void;
  onHostNow?: (roomCode: string, title: string, inviteCode: string) => void;
  onOpenSettings?: () => void;
}

function generateRoomCode(): string {
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

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  onMeetingScheduled,
  onHostNow,
  onOpenSettings,
}) => {
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  // Load user's saved calendar settings
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

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Format tomorrow date as default YYYY-MM-DD
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('14:00');
  const [duration, setDuration] = useState(calendarSettings.defaultDurationMinutes || 45);
  const [category, setCategory] = useState<ScheduledConference['category']>(calendarSettings.defaultCategory || 'engineering');
  const [enableNotes, setEnableNotes] = useState(calendarSettings.autoEnableNotes ?? true);
  const [enableGreenRoom, setEnableGreenRoom] = useState(calendarSettings.autoEnableGreenRoom ?? true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduledResult, setScheduledResult] = useState<ScheduledConference | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync settings when modal opens or user changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`rupal_calendar_settings_${userId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCalendarSettings(parsed);
          setDuration(parsed.defaultDurationMinutes || 45);
          setCategory(parsed.defaultCategory || 'engineering');
          setEnableNotes(parsed.autoEnableNotes ?? true);
          setEnableGreenRoom(parsed.autoEnableGreenRoom ?? true);
          return;
        } catch {}
      }
    }
    const def = getDefaultCalendarSettings(userId);
    setCalendarSettings(def);
    setDuration(def.defaultDurationMinutes);
    setCategory(def.defaultCategory);
    setEnableNotes(def.autoEnableNotes);
    setEnableGreenRoom(def.autoEnableGreenRoom);
  }, [userId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const roomCode = generateRoomCode();
    const inviteCode = deriveInviteCode(roomCode);
    const meetingTitle = title.trim() || 'Executive & Engineering Review';

    const newMeeting: ScheduledConference = {
      id: `sched-${Date.now()}`,
      title: meetingTitle,
      description: description.trim() || 'Scheduled conference session powered by Rupal Convene.',
      date,
      time,
      durationMinutes: Number(duration),
      category,
      hostName: user?.name || 'Meeting Host',
      hostAvatar: user?.avatar || '',
      hostRole: user?.jobTitle || 'Organizer',
      hostId: user?.id || 'guest_user',
      hostEmail: user?.email || '',
      roomCode,
      inviteCode,
      attendeesCount: 1,
      tags: [category.toUpperCase(), 'WebRTC', 'Encrypted'],
      enableNotes,
      enableGreenRoom,
      timezone: calendarSettings.timezone,
      createdAt: new Date().toISOString(),
    };

    try {
      // 1. Persist room in rooms table
      await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          title: meetingTitle,
          description: newMeeting.description,
          hostId: user?.id || 'host_user',
          hostName: newMeeting.hostName,
          inviteCode,
          isInviteOnly: true,
        }),
      });

      // 2. Persist scheduled conference in schedules table
      await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMeeting),
      });
    } catch (err) {
      console.warn('Backend room registration fallback:', err);
    } finally {
      setIsSubmitting(false);
      setScheduledResult(newMeeting);
      onMeetingScheduled(newMeeting);
    }
  };

  const handleCopyLink = () => {
    if (!scheduledResult) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://rupalconvene.vercel.app';
    const link = `${origin}/?room=${scheduledResult.roomCode}&invite=${scheduledResult.inviteCode}`;
    const text = `Scheduled Conference: "${scheduledResult.title}"\nDate: ${scheduledResult.date} at ${scheduledResult.time} (${calendarSettings.timezone})\nRoom Code: ${scheduledResult.roomCode}\nInvite Code: ${scheduledResult.inviteCode}\nJoin Link: ${link}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadIcs = () => {
    if (!scheduledResult) return;
    const icsDate = scheduledResult.date.replace(/-/g, '') + 'T' + scheduledResult.time.replace(/:/g, '') + '00';
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Rupal Convene//Conference Schedule//EN
BEGIN:VEVENT
SUMMARY:${scheduledResult.title}
DESCRIPTION:${scheduledResult.description}\\nRoom: ${scheduledResult.roomCode}\\nInvite: ${scheduledResult.inviteCode}
DTSTART:${icsDate}
DURATION:PT${scheduledResult.durationMinutes}M
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scheduledResult.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-100 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. SUCCESS VIEW */}
        {scheduledResult ? (
          <div className="text-center py-2 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <Check className="w-7 h-7 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-[#0f172a]">
                Conference Scheduled!
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Saved to your personal calendar. Room is provisioned with 256-bit DTLS encryption.
              </p>
            </div>

            {/* Room Credentials Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 text-left space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Conference Title:</span>
                <span className="font-bold text-[#0f172a] truncate max-w-[200px]">{scheduledResult.title}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Date & Time:</span>
                <span className="font-bold text-blue-600">
                  {scheduledResult.date} at {scheduledResult.time} ({calendarSettings.timezone})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Room Code:</span>
                <span className="font-mono font-bold text-[#0f172a]">{scheduledResult.roomCode}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Invite Passcode:</span>
                <span className="font-mono font-bold text-emerald-600">{scheduledResult.inviteCode}</span>
              </div>
            </div>

            {/* Quick Calendar Integration Links */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={getGoogleCalendarLink(scheduledResult)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all border border-blue-200/60"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Add to Google Cal</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
              </a>

              <a
                href={getOutlookCalendarLink(scheduledResult)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all border border-indigo-200/60"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Add to Outlook</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Link Copied!' : 'Copy Invite Link'}</span>
              </button>

              <button
                onClick={handleDownloadIcs}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download .ics</span>
              </button>
            </div>

            {/* Host Now Button */}
            {onHostNow && (
              <button
                onClick={() => {
                  onHostNow(scheduledResult.roomCode, scheduledResult.title, scheduledResult.inviteCode);
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Enter Room & Host Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          /* 2. FORM VIEW */
          <div>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold mb-1">
                  <CalendarIcon className="w-3 h-3" />
                  <span>Meeting Host Scheduler</span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#0f172a]">
                  Schedule a Meeting
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Host for: <span className="font-semibold text-slate-800">{user?.name || 'Guest Organizer'}</span>
                </p>
              </div>

              {/* Quick Settings Shortcut */}
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSettings();
                  }}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold transition-colors cursor-pointer"
                  title="Customize your calendar defaults"
                >
                  <Sliders className="w-3 h-3 text-slate-500" />
                  <span>Defaults</span>
                </button>
              )}
            </div>

            {/* Timezone pill */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200/60 mb-3 text-[11px] text-slate-600">
              <span className="flex items-center space-x-1.5 font-medium">
                <Globe className="w-3 h-3 text-blue-600" />
                <span>Timezone: {calendarSettings.timezone}</span>
              </span>
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSettings();
                  }}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Change
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Meeting Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Edge Mesh Architecture Review"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0f172a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Exact Program Category 3x2 Selector from Mockup */}
              <div className="pt-1">
                <ProgramCategorySelector
                  selectedCategory={(category as ProgramCategory) || 'hackathon'}
                  onSelectCategory={(cat) => setCategory(cat)}
                  showHeader={true}
                />
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Duration Row */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Expected Duration
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 45, 60].map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        duration === d
                          ? 'bg-[#0f172a] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Description / Agenda */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Key Agenda (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Goals, agenda items, or deliverables..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-[#0f172a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-1 border-t border-slate-100 text-xs text-slate-700">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableNotes}
                    onChange={(e) => setEnableNotes(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>Auto-activate Gemini AI Live Note-Taking</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableGreenRoom}
                    onChange={(e) => setEnableGreenRoom(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>Require Host Admission (Backstage Green Room)</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Scheduling Conference...</span>
                ) : (
                  <>
                    <CalendarIcon className="w-4 h-4" />
                    <span>Confirm & Schedule Meeting</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
