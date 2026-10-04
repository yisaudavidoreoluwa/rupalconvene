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
  Download
} from 'lucide-react';
import { ScheduledConference } from '@/types/schedule';

interface ConferenceCalendarProps {
  conferences: ScheduledConference[];
  onScheduleClick: () => void;
  onJoinConference: (roomCode: string, inviteCode?: string, title?: string) => void;
}

export const ConferenceCalendar: React.FC<ConferenceCalendarProps> = ({
  conferences,
  onScheduleClick,
  onJoinConference,
}) => {
  // Current calendar view month/year: October 2026
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 1)); // October 2026 (0-indexed month)
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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

  // Filtered conferences
  const filteredConferences = useMemo(() => {
    return conferences.filter((c) => {
      const matchCat = selectedCategory === 'all' || c.category === selectedCategory;
      const matchDate = !selectedDate || c.date === selectedDate;
      return matchCat && matchDate;
    });
  }, [conferences, selectedCategory, selectedDate]);

  const handleCopyInvite = (conf: ScheduledConference) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://rupalconvene.vercel.app';
    const link = `${origin}/?room=${conf.roomCode}&invite=${conf.inviteCode}`;
    const text = `Join "${conf.title}" on Rupal Convene:\nDate: ${conf.date} at ${conf.time}\nRoom Code: ${conf.roomCode}\nInvite Code: ${conf.inviteCode}\nDirect Link: ${link}`;
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
        return { label: 'Keynote Summit', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'investor':
        return { label: 'Syndicate Review', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'engineering':
        return { label: 'Architecture Sync', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'product':
        return { label: 'Product Launch', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: 'Conference', color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-8 select-none" id="calendar">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold mb-2">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Official Conference & Events Calendar</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
            Important Dates & Conferences
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
            Explore scheduled executive keynotes, engineering architecture reviews, and investor syndicate sessions — or schedule your own meeting.
          </p>
        </div>

        {/* Prominent Schedule Button */}
        <button
          onClick={onScheduleClick}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule a Meeting</span>
        </button>
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
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setCurrentDate(new Date(2026, 9, 1));
                  setSelectedDate(null);
                }}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
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
                            isSelected
                              ? 'bg-blue-400'
                              : e.category === 'keynote'
                              ? 'bg-purple-500'
                              : e.category === 'investor'
                              ? 'bg-emerald-500'
                              : 'bg-blue-500'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Category Filter Pills */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All Events' },
              { id: 'keynote', label: 'Keynotes' },
              { id: 'engineering', label: 'Engineering' },
              { id: 'investor', label: 'Investor/VC' },
              { id: 'product', label: 'Product Launch' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#0f172a] text-white'
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
              {selectedDate ? `Events on ${selectedDate}` : 'Upcoming Scheduled Occasions'}
            </span>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Show All
              </button>
            )}
          </div>

          {filteredConferences.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/70 shadow-sm">
              <CalendarIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-[#0f172a]">No conferences found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                No events scheduled for the selected filter. Be the first to schedule a meeting!
              </p>
              <button
                onClick={onScheduleClick}
                className="mt-4 px-4 py-2 rounded-full bg-[#0f172a] text-white text-xs font-bold hover:bg-[#1e293b]"
              >
                Schedule Now
              </button>
            </div>
          ) : (
            filteredConferences.map((conf) => {
              const badge = getCategoryBadge(conf.category);
              const isCopied = copiedId === conf.id;

              return (
                <div
                  key={conf.id}
                  className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-md border border-slate-200/70 transition-all flex flex-col justify-between"
                >
                  {/* Top Bar of Card */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border mb-1.5 ${badge.color}`}>
                        {badge.label}
                      </span>
                      <h4 className="font-bold text-sm sm:text-base text-[#0f172a] leading-tight">
                        {conf.title}
                      </h4>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center space-x-1 text-xs font-bold text-blue-600">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{conf.time}</span>
                      </div>
                      <span className="text-[10px] text-slate-600 block mt-0.5">{conf.date}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {conf.description}
                  </p>

                  {/* Host info and tags */}
                  <div className="flex items-center justify-between text-xs py-2 border-t border-slate-100 mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                        {conf.hostAvatar ? (
                          <img src={conf.hostAvatar} alt={conf.hostName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                            {conf.hostName[0]}
                          </div>
                        )}
                      </div>
                      <span className="font-semibold text-slate-700 text-xs">
                        {conf.hostName} <span className="text-slate-600 font-normal">({conf.hostRole || 'Host'})</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 font-mono text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                      <span>{conf.roomCode}</span>
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopyInvite(conf)}
                        className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="Copy invite details"
                      >
                        {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDownloadIcs(conf)}
                        className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="Add to Google/Apple Calendar (.ics)"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Join / Host Conference */}
                    <button
                      onClick={() => onJoinConference(conf.roomCode, conf.inviteCode, conf.title)}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Join Conference</span>
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
