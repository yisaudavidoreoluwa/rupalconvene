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
    normalBorder: string;
    selectedBorder: string;
    selectedBg: string;
    checkBg: string;
  }[] = [
    {
      id: 'hackathon',
      title: 'Hackathon',
      subtitle: 'Competitive 24–48h developer build sprint',
      icon: <Zap className="w-4 h-4 text-blue-600" />,
      normalBorder: 'border-2 border-blue-200/90 hover:border-blue-500 bg-white hover:bg-blue-50/20',
      selectedBorder: 'border-2 border-blue-600 ring-2 ring-blue-500/20',
      selectedBg: 'bg-blue-50/50',
      checkBg: 'bg-blue-600',
    },
    {
      id: 'workshop',
      title: 'Hands-on Workshop',
      subtitle: 'In-depth code labs and system tutorials',
      icon: <Wrench className="w-4 h-4 text-amber-600" />,
      normalBorder: 'border-2 border-amber-200/90 hover:border-amber-500 bg-white hover:bg-amber-50/20',
      selectedBorder: 'border-2 border-amber-600 ring-2 ring-amber-500/20',
      selectedBg: 'bg-amber-50/50',
      checkBg: 'bg-amber-600',
    },
    {
      id: 'meetup',
      title: 'Developer Meetup',
      subtitle: 'Community tech gathering & lightning talks',
      icon: <Users className="w-4 h-4 text-emerald-600" />,
      normalBorder: 'border-2 border-emerald-200/90 hover:border-emerald-500 bg-white hover:bg-emerald-50/20',
      selectedBorder: 'border-2 border-emerald-600 ring-2 ring-emerald-500/20',
      selectedBg: 'bg-emerald-50/50',
      checkBg: 'bg-emerald-600',
    },
    {
      id: 'broadcast',
      title: 'Virtual Broadcast',
      subtitle: 'Global technical webinar or town hall',
      icon: <Radio className="w-4 h-4 text-rose-600" />,
      normalBorder: 'border-2 border-rose-200/90 hover:border-rose-500 bg-white hover:bg-rose-50/20',
      selectedBorder: 'border-2 border-rose-600 ring-2 ring-rose-500/20',
      selectedBg: 'bg-rose-50/50',
      checkBg: 'bg-rose-600',
    },
    {
      id: 'bootcamp',
      title: 'University Bootcamp',
      subtitle: 'Student training & career incubator',
      icon: <GraduationCap className="w-4 h-4 text-indigo-600" />,
      normalBorder: 'border-2 border-indigo-200/90 hover:border-indigo-500 bg-white hover:bg-indigo-50/20',
      selectedBorder: 'border-2 border-indigo-600 ring-2 ring-indigo-500/20',
      selectedBg: 'bg-indigo-50/50',
      checkBg: 'bg-indigo-600',
    },
    {
      id: 'architecture-demo',
      title: 'Architecture Demo',
      subtitle: 'Executive symposium or industry tech day',
      icon: <Building2 className="w-4 h-4 text-sky-600" />,
      normalBorder: 'border-2 border-sky-200/90 hover:border-sky-500 bg-white hover:bg-sky-50/20',
      selectedBorder: 'border-2 border-sky-600 ring-2 ring-sky-500/20',
      selectedBg: 'bg-sky-50/50',
      checkBg: 'bg-sky-600',
    },
  ];

  return (
    <div className={`w-full select-none ${className}`}>
      {showHeader && (
        <label className="block text-xs sm:text-sm font-extrabold text-[#0f172a] uppercase tracking-wider mb-2.5">
          1. SELECT PROGRAM CATEGORY <span className="text-red-500 font-bold">*</span>
        </label>
      )}

      {/* 3x2 Grid matching the screenshot with colored border cards & clean icons */}
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
                  ? `${cat.selectedBorder} ${cat.selectedBg} shadow-xs`
                  : `${cat.normalBorder}`
              }`}
            >
              {/* Card Header with Icon & Title */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2.5">
                  <span className="flex-shrink-0 flex items-center justify-center">
                    {cat.icon}
                  </span>
                  <span className={`text-sm sm:text-[15px] font-extrabold tracking-tight transition-colors ${
                    isSelected ? 'text-[#0f172a]' : 'text-[#1e293b] group-hover:text-[#0f172a]'
                  }`}>
                    {cat.title}
                  </span>
                </div>

                {isSelected && (
                  <span className={`w-4 h-4 rounded-full ${cat.checkBg} text-white flex items-center justify-center flex-shrink-0 animate-in zoom-in-75 duration-150`}>
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
