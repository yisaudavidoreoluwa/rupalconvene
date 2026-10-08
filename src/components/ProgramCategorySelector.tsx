'use client';

import React from 'react';
import { 
  Zap, 
  Wrench, 
  Users, 
  Radio, 
  GraduationCap, 
  Building2, 
  Check 
} from 'lucide-react';
import { ProgramCategory } from '@/types/program';

interface ProgramCategorySelectorProps {
  selectedCategory: ProgramCategory;
  onSelectCategory: (category: ProgramCategory) => void;
  className?: string;
  showHeader?: boolean;
}

export const ProgramCategorySelector: React.FC<ProgramCategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory,
  className = '',
  showHeader = true,
}) => {
  const categories: {
    id: ProgramCategory;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'hackathon',
      title: 'Hackathon',
      subtitle: 'Competitive 24–48h developer build sprint',
      icon: <Zap className="w-4 h-4 text-[#0f172a]" />,
    },
    {
      id: 'workshop',
      title: 'Hands-on Workshop',
      subtitle: 'In-depth code labs and system tutorials',
      icon: <Wrench className="w-4 h-4 text-[#0f172a]" />,
    },
    {
      id: 'meetup',
      title: 'Developer Meetup',
      subtitle: 'Community tech gathering & lightning talks',
      icon: <Users className="w-4 h-4 text-[#0f172a]" />,
    },
    {
      id: 'broadcast',
      title: 'Virtual Broadcast',
      subtitle: 'Global technical webinar or town hall',
      icon: <Radio className="w-4 h-4 text-[#0f172a]" />,
    },
    {
      id: 'bootcamp',
      title: 'University Bootcamp',
      subtitle: 'Student training & career incubator',
      icon: <GraduationCap className="w-4 h-4 text-[#0f172a]" />,
    },
    {
      id: 'architecture-demo',
      title: 'Architecture Demo',
      subtitle: 'Executive symposium or industry tech day',
      icon: <Building2 className="w-4 h-4 text-[#0f172a]" />,
    },
  ];

  return (
    <div className={`w-full select-none ${className}`}>
      {showHeader && (
        <label className="block text-xs sm:text-sm font-extrabold text-[#0f172a] uppercase tracking-wider mb-2.5">
          1. SELECT PROGRAM CATEGORY <span className="text-red-500 font-bold">*</span>
        </label>
      )}

      {/* 3x2 Grid with clean neutral border cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`group relative text-left p-4 sm:p-4.5 rounded-2xl transition-all duration-200 cursor-pointer focus:outline-none flex flex-col justify-between min-h-[96px] shadow-2xs ${
                isSelected
                  ? 'border-2 border-[#0f172a] bg-slate-50 ring-1 ring-slate-900/10 shadow-xs'
                  : 'border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              {/* Card Header with Icon & Title */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2.5">
                  <span className="flex-shrink-0 flex items-center justify-center p-1.5 rounded-lg bg-slate-100 text-[#0f172a] border border-slate-200/80">
                    {cat.icon}
                  </span>
                  <span className={`text-sm sm:text-[15px] font-extrabold tracking-tight transition-colors ${
                    isSelected ? 'text-[#0f172a]' : 'text-[#1e293b] group-hover:text-blue-600'
                  }`}>
                    {cat.title}
                  </span>
                </div>

                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-[#0f172a] text-white flex items-center justify-center flex-shrink-0 animate-in zoom-in-75 duration-150">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Subtitle description */}
              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                {cat.subtitle}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
