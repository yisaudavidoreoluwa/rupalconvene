'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Users, 
  Plus, 
  Copy, 
  ExternalLink, 
  Check, 
  Sparkles, 
  Tag, 
  ArrowRight,
  ShieldCheck,
  Download,
  Sliders,
  Globe,
  Trash2,
  UserCheck
} from 'lucide-react';
import { 
  ScheduledConference, 
  UserCalendarSettings,
  getGoogleCalendarLink,
  getOutlookCalendarLink
} from '@/types/schedule';
import { useAuth } from '@/context/AuthContext';

interface ConferenceCalendarProps {
  conferences: ScheduledConference[];
  onScheduleClick: (date?: string) => void;
  onJoinConference: (roomCode: string, inviteCode?: string, title?: string) => void;
  onOpenSettings?: () => void;
  onDeleteConference?: (id: string) => void;
  userCalendarSettings?: UserCalendarSettings;
}

export const ConferenceCalendar: React.FC<ConferenceCalendarProps> = ({
  conferences,
  onScheduleClick,
  onJoinConference,
  onOpenSettings,
  onDeleteConference,
  userCalendarSettings,
}) => {
  const { user } = useAuth();

  // Dynamic calendar view month/year based on real current date
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  // Calendar math
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Map dates to conferences
  const conferencesByDate = useMemo(() => {
    const map: Record<string, ScheduledConference[]> = {};
    conferences.forEach((c) => {
      if (!map[c.date]) map[c.date] = [];
      map[c.date].push(c);
    });
    return map;
  }, [conferences]);

  // Count user-hosted conferences
  const myConferencesCount = useMemo(() => {
    if (!user) return 0;
    return conferences.filter(c => c.hostId === user.id || (user.email && c.hostEmail === user.email)).length;
  }, [conferences, user]);

  // Filtered conferences
  const filteredConferences = useMemo(() => {
    return conferences.filter((c) => {
      let matchFilter = true;
      if (selectedFilter === 'my-meetings') {
        matchFilter = Boolean(user && (c.hostId === user.id || (user.email && c.hostEmail === user.email)));
      } else if (selectedFilter !== 'all') {
        matchFilter = c.category === selectedFilter;
      }
      const matchDate = !selectedDate || c.date === selectedDate;
      return matchFilter && matchDate;
    });
  }, [conferences, selectedFilter, selectedDate, user]);

  const handleCopyInvite = (conf: ScheduledConference) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://rupalconvene.vercel.app';
    const link = `${origin}/?room=${conf.roomCode}&invite=${conf.inviteCode}`;
    const text = `Join "${conf.title}" on Rupal Convene:\nDate: ${conf.date} at ${conf.time} (${userCalendarSettings?.timezone || 'UTC'})\nRoom Code: ${conf.roomCode}\nPasscode: ${conf.inviteCode}\nDirect Link: ${link}`;
    navigator.clipboard.writeText(text);
    setCopiedId(conf.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownloadIcs = (conf: ScheduledConference) => {
    const icsDate = conf.date.replace(/-/g, '') + 'T' + conf.time.replace(/:/g, '') + '00';
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Rupal Convene//Conference Calendar//EN
BEGIN:VEVENT
SUMMARY:${conf.title}
DESCRIPTION:${conf.description}\\nRoom: ${conf.roomCode}\\nInvite: ${conf.inviteCode}
DTSTART:${icsDate}
DURATION:PT${conf.durationMinutes}M
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conf.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCategoryBadge = (category: ScheduledConference['category']) => {
    switch (category) {
      case 'keynote':
        return { label: 'Keynote Summit', color: 'bg-slate-100 text-[#0f172a] border-slate-200' };
      case 'investor':
        return { label: 'Syndicate Review', color: 'bg-blue-50 text-blue-800 border-blue-200/80' };
      case 'engineering':
        return { label: 'Architecture Sync', color: 'bg-slate-100 text-slate-800 border-slate-200' };
      case 'product':
        return { label: 'Product Launch', color: 'bg-blue-50 text-blue-800 border-blue-200/80' };
      default:
        return { label: 'Conference', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-8 select-none" id="calendar">
      {/* Header with Title & Action */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 gap-4 border-b border-slate-100">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
            Important Dates & Conferences
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xl">
            Explore scheduled executive keynotes, engineering reviews, and investor syndicate sessions — or reserve your own room slot.
          </p>
        </div>

        {/* Action Button Cluster */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200/80 shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Personalize your timezone, working hours, and calendar defaults"
            >
              <Sliders className="w-4 h-4 text-slate-500" />
              <span>Calendar Settings</span>
            </button>
          )}

          <button
            onClick={() => onScheduleClick()}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule a Meeting</span>
          </button>
        </div>
      </div>

      {/* User Timezone & Status Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 px-4 bg-slate-50/80 rounded-2xl border border-slate-200/60 mt-4 mb-6 gap-2 text-xs text-slate-600">
        <div className="flex items-center space-x-2">
          <Globe className="w-3.5 h-3.5 text-blue-600" />
          <span>Active Timezone: <strong className="text-slate-900 font-semibold">{userCalendarSettings?.timezone || 'UTC'}</strong></span>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="text-blue-600 font-bold hover:underline cursor-pointer ml-1"
            >
              Change
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-medium">
          <span>• 256-bit DTLS encrypted rooms</span>
          <span>• Synchronized AI transcripts</span>
        </div>
      </div>

      {/* Main Grid: Calendar on Left, Event Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================ */}
        {/* LEFT: CALENDAR MONTH GRID (7 COLS)                          */}
        {/* ============================================================ */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/70 flex flex-col justify-between">
          {/* Month Header Nav */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base sm:text-lg font-bold text-[#0f172a]">
              {monthNames[month]} {year}
            </h3>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setCurrentDate(new Date());
                  setSelectedDate(null);
                }}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-600 mb-2">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-xs">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10 sm:h-12 rounded-xl" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const events = conferencesByDate[dateStr] || [];
              const isSelected = selectedDate === dateStr;
              const hasEvents = events.length > 0;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={`h-10 sm:h-12 rounded-2xl flex flex-col items-center justify-center relative transition-all active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0f172a] text-white shadow-md font-bold'
                      : hasEvents
                      ? 'bg-blue-50/80 text-blue-900 font-bold hover:bg-blue-100'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{dayNum}</span>

                  {/* Conference Event Indicators */}
                  {hasEvents && (
                    <div className="flex items-center space-x-0.5 mt-0.5">
                      {events.slice(0, 3).map((e, idx) => (
                        <span
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-blue-300' : 'bg-blue-600'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Filter Pills with "My Meetings" support */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: `All Events (${conferences.length})` },
              ...(user ? [{ id: 'my-meetings', label: `My Scheduled Meetings (${myConferencesCount})` }] : []),
              { id: 'keynote', label: 'Keynotes' },
              { id: 'engineering', label: 'Engineering' },
              { id: 'investor', label: 'Investor/VC' },
              { id: 'product', label: 'Product Launch' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedFilter(cat.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  selectedFilter === cat.id
                    ? 'bg-[#0f172a] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT: UPCOMING CONFERENCES LIST (CARDS)                    */}
        {/* ============================================================ */}
        <div className="lg:col-span-6 space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              {selectedDate ? `Events on ${selectedDate}` : selectedFilter === 'my-meetings' ? 'Your Scheduled Conferences' : 'Upcoming Scheduled Occasions'}
            </span>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                Show All
              </button>
            )}
          </div>

          {filteredConferences.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border border-slate-200/70 shadow-sm flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-[#0f172a] mb-3 border border-slate-200 shadow-2xs">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-extrabold text-base text-[#0f172a]">
                {selectedDate 
                  ? `No Events on ${selectedDate}` 
                  : selectedFilter === 'my-meetings' 
                  ? 'No Meetings Scheduled' 
                  : 'Start Fresh — No Events Scheduled Yet'}
              </h4>
              <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                {selectedDate
                  ? `There are no conferences booked for this date yet. Schedule a new meeting on ${selectedDate} to reserve your room.`
                  : selectedFilter === 'my-meetings'
                  ? "You haven't scheduled any conferences yet. Schedule your first meeting to get direct invite links and calendar sync!"
                  : "All dummy placeholder events have been cleared. Schedule your first conference or meeting to generate invite links, room codes, and sync with your calendars."}
              </p>
              <button
                onClick={() => onScheduleClick(selectedDate || undefined)}
                className="mt-5 px-6 py-3 rounded-full bg-[#0f172a] text-white text-xs font-bold hover:bg-[#1e293b] cursor-pointer shadow-sm transition-all active:scale-95 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>{selectedDate ? `Schedule Meeting on ${selectedDate}` : 'Schedule First Meeting'}</span>
              </button>
            </div>
          ) : (
            filteredConferences.map((conf) => {
              const badge = getCategoryBadge(conf.category);
              const isCopied = copiedId === conf.id;
              const isMyMeeting = Boolean(user && (conf.hostId === user.id || (user.email && conf.hostEmail === user.email)));

              return (
                <div
                  key={conf.id}
                  className="bg-white rounded-3xl p-5 shadow-xs hover:shadow-md border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  {/* Top Bar of Card */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center space-x-1.5 mb-1.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                        {isMyMeeting && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                            <UserCheck className="w-2.5 h-2.5" />
                            <span>You are Host</span>
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm sm:text-base text-[#0f172a] leading-tight">
                        {conf.title}
                      </h4>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center space-x-1 text-xs font-bold text-blue-600">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{conf.time}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{conf.date}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {conf.description}
                  </p>

                  {/* Host info and room code */}
                  <div className="flex items-center justify-between text-xs py-2 border-t border-slate-100 mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden ring-1 ring-slate-300">
                        {conf.hostAvatar ? (
                          <img src={conf.hostAvatar} alt={conf.hostName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                            {conf.hostName[0]}
                          </div>
                        )}
                      </div>
                      <span className="font-semibold text-slate-700 text-xs">
                        {conf.hostName} <span className="text-slate-500 font-normal">({conf.hostRole || 'Host'})</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 font-mono text-[11px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                      <span>{conf.roomCode}</span>
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="flex items-center justify-between pt-1 gap-2">
                    <div className="flex items-center space-x-1">
                      {/* Copy Invite */}
                      <button
                        onClick={() => handleCopyInvite(conf)}
                        className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Copy invite details"
                      >
                        {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>

                      {/* Add to Google Calendar */}
                      <a
                        href={getGoogleCalendarLink(conf)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Add to Google Calendar"
                      >
                        <CalendarIcon className="w-4 h-4" />
                      </a>

                      {/* Download .ics */}
                      <button
                        onClick={() => handleDownloadIcs(conf)}
                        className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Download .ics for Outlook/Apple Calendar"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* Delete Meeting (only if current user is host) */}
                      {isMyMeeting && onDeleteConference && (
                        <button
                          onClick={() => {
                            if (confirm(`Cancel and delete meeting "${conf.title}"?`)) {
                              onDeleteConference(conf.id);
                            }
                          }}
                          className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Cancel scheduled meeting"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Join / Host Conference */}
                    <button
                      onClick={() => onJoinConference(conf.roomCode, conf.inviteCode, conf.title)}
                      className={`flex items-center space-x-1.5 px-4 py-2 rounded-full font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer ${
                        isMyMeeting 
                          ? 'bg-[#0f172a] hover:bg-[#1e293b] text-white' 
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      <span>{isMyMeeting ? 'Start as Host' : 'Join Conference'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
