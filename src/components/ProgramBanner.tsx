'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Wrench, 
  Users, 
  Radio, 
  GraduationCap, 
  Building2, 
  ChevronRight, 
  Sparkles,
  Clock,
  Volume2,
  Sliders,
  CheckCircle2,
  Award
} from 'lucide-react';
import { ProgramCategory, PROGRAM_CATEGORIES_META, ConveneProgram } from '@/types/program';

interface ProgramBannerProps {
  program?: ConveneProgram | null;
  activeCategory: ProgramCategory;
  onOpenSuite: () => void;
  onChangeCategory?: (cat: ProgramCategory) => void;
  className?: string;
  isHost?: boolean;
}

export const ProgramBanner: React.FC<ProgramBannerProps> = ({
  program,
  activeCategory,
  onOpenSuite,
  onChangeCategory,
  className = '',
  isHost = false,
}) => {
  const meta = PROGRAM_CATEGORIES_META[activeCategory] || PROGRAM_CATEGORIES_META['hackathon'];

  // Simulated countdown for hackathon or lightning talk
  const [countdownSeconds, setCountdownSeconds] = useState(
    activeCategory === 'hackathon' ? 24 * 3600 - 320 : activeCategory === 'meetup' ? 275 : 3600
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusPill = () => {
    switch (activeCategory) {
      case 'hackathon':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>Sprint: {formatCountdown(countdownSeconds)} remaining</span>
          </span>
        );
      case 'workshop':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>Step 2 of 4 • Code Lab Active</span>
          </span>
        );
      case 'meetup':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-semibold">
            <Clock className="w-3 h-3 text-blue-400" />
            <span>Lightning Talk: {formatCountdown(countdownSeconds)}</span>
          </span>
        );
      case 'broadcast':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>{program?.attendeesCount ? `${program.attendeesCount} Viewers` : 'Broadcast Stage'} • Live Polling</span>
          </span>
        );
      case 'bootcamp':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-semibold">
            <CheckCircle2 className="w-3 h-3 text-blue-400" />
            <span>{program?.title || 'Bootcamp Cohort'} • Roll-Call Active</span>
          </span>
        );
      case 'architecture-demo':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-semibold">
            <Award className="w-3 h-3 text-blue-400" />
            <span>Microservices Mesh Topology • Deal Room</span>
          </span>
        );
    }
  };

  const getCategoryIcon = () => {
    switch (activeCategory) {
      case 'hackathon': return <Zap className="w-3.5 h-3.5 text-blue-400" />;
      case 'workshop': return <Wrench className="w-3.5 h-3.5 text-blue-400" />;
      case 'meetup': return <Users className="w-3.5 h-3.5 text-blue-400" />;
      case 'broadcast': return <Radio className="w-3.5 h-3.5 text-blue-400" />;
      case 'bootcamp': return <GraduationCap className="w-3.5 h-3.5 text-blue-400" />;
      case 'architecture-demo': return <Building2 className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className={`w-full bg-[#111318]/95 border-b border-white/10 px-3 sm:px-5 py-2 flex items-center justify-between text-white backdrop-blur-md z-20 select-none shadow-md ${className}`}>
      {/* Left: Program Category & Title */}
      <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-white/10 text-xs font-bold border border-white/10 flex-shrink-0">
          <span>{getCategoryIcon()}</span>
          <span className="hidden xs:inline">{meta.title}</span>
        </div>

        <div className="flex items-center space-x-2 min-w-0">
          <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-[320px] md:max-w-md">
            {program?.title || `${meta.title} Program Suite`}
          </span>

          <div className="hidden sm:flex items-center">
            {getStatusPill()}
          </div>
        </div>
      </div>

      {/* Right: Quick Tools Button & Category Selector */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        {/* Switch Program Category Dropdown / Pill */}
        {onChangeCategory && isHost && (
          <select
            value={activeCategory}
            onChange={(e) => onChangeCategory(e.target.value as ProgramCategory)}
            className="bg-[#181a20] border border-white/15 text-slate-300 text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 cursor-pointer hidden md:inline-block font-sans"
            title="Switch Program Mode for this conference"
          >
            <option value="hackathon">Hackathon Mode</option>
            <option value="workshop">Hands-on Workshop</option>
            <option value="meetup">Developer Meetup</option>
            <option value="broadcast">Virtual Broadcast</option>
            <option value="bootcamp">University Bootcamp</option>
            <option value="architecture-demo">Architecture Demo</option>
          </select>
        )}

        <button
          onClick={onOpenSuite}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{meta.title} Suite</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
        </button>
      </div>
    </div>
  );
};
