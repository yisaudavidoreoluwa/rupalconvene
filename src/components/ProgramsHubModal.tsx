'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Plus, 
  Zap, 
  Wrench, 
  Users, 
  Radio, 
  GraduationCap, 
  Building2, 
  Calendar as CalendarIcon, 
  Clock, 
  ArrowRight, 
  Check, 
  Sparkles,
  ExternalLink,
  Sliders,
  Filter
} from 'lucide-react';
import { 
  ProgramCategory, 
  ConveneProgram, 
  PROGRAM_CATEGORIES_META 
} from '@/types/program';
import { INITIAL_PROGRAMS } from '@/lib/program-defaults';
import { ProgramCategorySelector } from './ProgramCategorySelector';
import { useAuth } from '@/context/AuthContext';

interface ProgramsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterProgramRoom: (roomCode: string, inviteCode: string, title: string, category: ProgramCategory) => void;
  onOpenSchedule?: () => void;
}

const CATEGORY_ICONS: Record<ProgramCategory, React.ElementType> = {
  hackathon: Zap,
  workshop: Wrench,
  meetup: Users,
  broadcast: Radio,
  bootcamp: GraduationCap,
  'architecture-demo': Building2,
};

const CATEGORY_CARD_BORDERS: Record<ProgramCategory, string> = {
  hackathon: 'border-2 border-blue-300 hover:border-blue-500',
  workshop: 'border-2 border-amber-300 hover:border-amber-500',
  meetup: 'border-2 border-emerald-300 hover:border-emerald-500',
  broadcast: 'border-2 border-rose-300 hover:border-rose-500',
  bootcamp: 'border-2 border-indigo-300 hover:border-indigo-500',
  'architecture-demo': 'border-2 border-sky-300 hover:border-sky-500',
};

const FILTER_TABS: { id: 'all' | ProgramCategory; label: string; icon?: React.ElementType }[] = [
  { id: 'all', label: 'All Programs' },
  { id: 'hackathon', label: 'Hackathons', icon: Zap },
  { id: 'workshop', label: 'Workshops', icon: Wrench },
  { id: 'meetup', label: 'Meetups', icon: Users },
  { id: 'broadcast', label: 'Broadcasts', icon: Radio },
  { id: 'bootcamp', label: 'Bootcamps', icon: GraduationCap },
  { id: 'architecture-demo', label: 'Demos', icon: Building2 },
];

function generateProgramRoomCode(cat: ProgramCategory): string {
  const num = Math.floor(100 + Math.random() * 900);
  const suffix = 
    cat === 'hackathon' ? 'HACK' :
    cat === 'workshop' ? 'LABS' :
    cat === 'meetup' ? 'MEET' :
    cat === 'broadcast' ? 'CAST' :
    cat === 'bootcamp' ? 'BOOT' : 'DEMO';
  return `RUPAL-${num}-${suffix}`;
}

export const ProgramsHubModal: React.FC<ProgramsHubModalProps> = ({
  isOpen,
  onClose,
  onEnterProgramRoom,
  onOpenSchedule,
}) => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<ConveneProgram[]>(INITIAL_PROGRAMS);
  const [selectedFilter, setSelectedFilter] = useState<'all' | ProgramCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mode: 'browse' (catalog) | 'create' (creation wizard)
  const [viewMode, setViewMode] = useState<'browse' | 'create'>('browse');

  // Creation form state
  const [newCategory, setNewCategory] = useState<ProgramCategory>('hackathon');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDate, setNewDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [newTime, setNewTime] = useState('14:00');
  const [newDuration, setNewDuration] = useState(120);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync duration with category defaults
  const handleCategorySelect = (cat: ProgramCategory) => {
    setNewCategory(cat);
    const meta = PROGRAM_CATEGORIES_META[cat];
    if (meta) {
      setNewDuration(meta.defaultDurationMinutes);
    }
  };

  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      if (selectedFilter !== 'all' && p.category !== selectedFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.hostName.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [programs, selectedFilter, searchQuery]);

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const roomCode = generateProgramRoomCode(newCategory);
      const inviteCode = `INV-${roomCode.slice(-6)}`;
      const meta = PROGRAM_CATEGORIES_META[newCategory];

      const newProg: ConveneProgram = {
        id: `prog-${Date.now()}`,
        roomCode,
        inviteCode,
        title: newTitle.trim() || `${meta.title} Program Session`,
        description: newDescription.trim() || meta.highlightDescription,
        category: newCategory,
        hostId: user?.id || 'host-user',
        hostName: user?.name || 'Program Lead',
        hostRole: user?.jobTitle || 'Organizer',
        hostAvatar: user?.avatar || '',
        scheduledDate: newDate,
        scheduledTime: newTime,
        durationMinutes: newDuration,
        status: 'scheduled',
        tags: meta.keyFeatures,
        attendeesCount: 1,
        createdAt: new Date().toISOString(),
      };

      setPrograms((prev) => [newProg, ...prev]);
      setIsSubmitting(false);
      setViewMode('browse');
      onEnterProgramRoom(roomCode, inviteCode, newProg.title, newCategory);
      onClose();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden font-sans">
        {/* MODAL HEADER */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#0f172a] tracking-tight">
                Rupal Convene Programs Hub
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Hackathons, Hands-on Workshops, Meetups, Broadcasts, Bootcamps & Architecture Demos
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {viewMode === 'browse' ? (
              <button
                onClick={() => setViewMode('create')}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Program</span>
              </button>
            ) : (
              <button
                onClick={() => setViewMode('browse')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Back to Programs
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-[#0f172a] hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 1. BROWSE MODE                                            */}
        {/* ========================================================= */}
        {viewMode === 'browse' ? (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
            {/* Filter Tabs & Search Bar */}
            <div className="p-4 sm:p-5 bg-white border-b border-slate-100 space-y-3 flex-shrink-0">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search programs by name, track, or host..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0 text-xs font-semibold">
                  {FILTER_TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedFilter(tab.id)}
                        className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer flex items-center space-x-1.5 ${
                          selectedFilter === tab.id
                            ? 'bg-[#0f172a] text-white font-bold shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Programs Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPrograms.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-400 text-xs">
                  No programs found matching your filter criteria.
                </div>
              ) : (
                filteredPrograms.map((prog) => {
                  const meta = PROGRAM_CATEGORIES_META[prog.category];
                  const CatIcon = CATEGORY_ICONS[prog.category] || Sparkles;
                  const borderClass = CATEGORY_CARD_BORDERS[prog.category] || 'border-2 border-slate-200';
                  return (
                    <div
                      key={prog.id}
                      className={`p-5 rounded-2xl bg-white shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 ${borderClass}`}
                    >
                      <div>
                        {/* Top Badge & Room Code */}
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center space-x-1.5 ${meta.badgeBg}`}>
                            <CatIcon className="w-3.5 h-3.5" />
                            <span>{meta.title}</span>
                          </span>
                          <span className="font-mono text-xs text-slate-500 font-semibold bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
                            {prog.roomCode}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-sm sm:text-base font-extrabold text-[#0f172a] leading-snug">
                          {prog.title}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed mt-1 line-clamp-2">
                          {prog.description}
                        </p>

                        {/* Tags */}
                        <div className="flex items-center space-x-1.5 flex-wrap gap-1 mt-2.5">
                          {prog.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Footer: Host, Date & Enter Room Action */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-[11px] text-slate-500">
                          <span className="font-bold text-slate-700">{prog.hostName}</span>
                          <span className="mx-1">•</span>
                          <span>{prog.scheduledDate}</span>
                        </div>

                        <button
                          onClick={() => {
                            onEnterProgramRoom(prog.roomCode, prog.inviteCode, prog.title, prog.category);
                            onClose();
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer active:scale-95"
                        >
                          <span>Enter Room</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* 2. CREATE PROGRAM WIZARD                                  */
          /* ========================================================= */
          <form onSubmit={handleCreateProgram} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 bg-white">
            {/* Step 1: Exact UI from User's Screenshot */}
            <ProgramCategorySelector
              selectedCategory={newCategory}
              onSelectCategory={handleCategorySelect}
              showHeader={true}
            />

            {/* Step 2: Program Details */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <label className="block text-xs sm:text-sm font-extrabold text-[#0f172a] uppercase tracking-wider">
                2. CONFIGURE PROGRAM DETAILS <span className="text-red-500 font-bold">*</span>
              </label>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Program Title</label>
                <input
                  type="text"
                  required
                  placeholder={`e.g. Next-Gen ${PROGRAM_CATEGORIES_META[newCategory].title} Session`}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description & Objective</label>
                <textarea
                  rows={2}
                  placeholder="Outline the session objectives, schedule, and participant instructions..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Date, Time & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min={15}
                    max={2880}
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Launch & Submit Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setViewMode('browse')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center space-x-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? 'Launching Program...' : 'Create & Enter Program Room'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
