'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface RupalSubNavProps {
  activePill: string;
  onSelectPill: (pill: string) => void;
}

export const RupalSubNav: React.FC<RupalSubNavProps> = ({ activePill, onSelectPill }) => {
  const pills = [
    { id: 'ai', label: 'Rupal AI in Meet', isAI: true },
    { id: 'flexible', label: 'Flexible' },
    { id: 'enhance', label: 'Enhance' },
    { id: 'collaborate', label: 'Collaborate' },
    { id: 'secure', label: 'Secure' },
    { id: 'premium', label: 'Premium' },
    { id: 'customers', label: 'Customers' },
    { id: 'faqs', label: 'FAQs' },
  ];

  return (
    <div className="w-full flex justify-center py-4 px-4 overflow-x-auto select-none bg-white">
      <div className="inline-flex items-center space-x-1.5 p-1 bg-slate-100/90 rounded-full border border-slate-200/80 shadow-inner">
        {pills.map((pill) => {
          const isActive = activePill === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => onSelectPill(pill.id)}
              className={`flex items-center space-x-1 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {pill.isAI && (
                <Sparkles className="w-3.5 h-3.5 text-violet-600 fill-violet-600" />
              )}
              <span className={pill.isAI ? 'text-violet-700' : ''}>{pill.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
