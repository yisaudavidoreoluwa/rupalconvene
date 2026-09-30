'use client';

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert, 
  FileText, 
  TrendingUp, 
  Briefcase 
} from 'lucide-react';
import { PitchSlide, Participant } from '@/types/meeting';

interface PitchDeckViewerProps {
  slides: PitchSlide[];
  currentSlideIndex: number;
  onSlideChange: (index: number) => void;
  isWatermarkActive: boolean;
  currentUser: Participant;
  onOpenDealRoom: () => void;
}

export const PitchDeckViewer: React.FC<PitchDeckViewerProps> = ({
  slides,
  currentSlideIndex,
  onSlideChange,
  isWatermarkActive,
  currentUser,
  onOpenDealRoom,
}) => {
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);
  const slide = slides[currentSlideIndex] || slides[0];

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      onSlideChange(currentSlideIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      onSlideChange(currentSlideIndex + 1);
    }
  };

  const watermarkString = `CONFIDENTIAL • ${currentUser.name.toUpperCase()} (${currentUser.organization.toUpperCase()}) • ${currentUser.email} • REALTIME AUDITED SESSION`;

  return (
    <div className="w-full h-full flex flex-col bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs relative select-none">
      {/* Dynamic Screen-Privacy Watermark Overlay (Navy Tone) */}
      {isWatermarkActive && (
        <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden flex flex-col justify-around py-8 opacity-20">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="text-[#0f172a] font-mono text-[11px] sm:text-xs font-black tracking-widest uppercase transform -rotate-12 whitespace-nowrap text-center select-none"
            >
              {watermarkString} • {watermarkString}
            </div>
          ))}
        </div>
      )}

      {/* Top Presentation Bar (White & Navy) */}
      <div className="h-12 bg-white border-b border-slate-100 px-4 flex items-center justify-between z-20">
        <div className="flex items-center space-x-3">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-[#0f172a] border border-slate-300">
            {slide.category}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Slide {currentSlideIndex + 1} of {slides.length}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Deal Room Button */}
          <button
            onClick={onOpenDealRoom}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-colors shadow-sm"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Open Deal Room & Terms</span>
          </button>

          {/* Toggle Speaker Notes */}
          <button
            onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
              showSpeakerNotes
                ? 'bg-[#0f172a] text-white border-[#0f172a]'
                : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 inline mr-1" />
            Notes
          </button>

          {/* Navigation Arrows */}
          <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={handlePrev}
              disabled={currentSlideIndex === 0}
              className="p-1 rounded text-slate-700 hover:text-[#0f172a] disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentSlideIndex === slides.length - 1}
              className="p-1 rounded text-slate-700 hover:text-[#0f172a] disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide Main Presentation Canvas (White Background & Navy Typography) */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 overflow-y-auto bg-gradient-to-br from-white via-slate-50 to-white relative z-10">
        <div>
          {/* Header & Subtitle */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
              {slide.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium">
              {slide.subtitle}
            </p>
          </div>

          {/* Metric Highlights Grid */}
          {slide.metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4 mb-8">
              {slide.metrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm"
                >
                  <div className="text-xs text-slate-500 font-semibold mb-1">
                    {metric.label}
                  </div>
                  <div className="text-2xl font-black text-[#0f172a] tracking-tight">
                    {metric.value}
                  </div>
                  {metric.change && (
                    <div className="text-xs font-bold text-emerald-600 mt-1 flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{metric.change}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Bullet Points */}
          <div className="space-y-3">
            {slide.bulletPoints.map((point, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#0f172a] mt-2 flex-shrink-0" />
                <span className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal">
                  {point}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Slide Footer */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-700" />
            <span className="font-semibold text-slate-700">Rupal Convene Syndicate 2026</span>
          </div>
          <span className="font-bold text-[#0f172a]">Strictly Confidential</span>
        </div>
      </div>

      {/* Speaker Notes Drawer (Collapsible) */}
      {showSpeakerNotes && (
        <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 z-20">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-1">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Speaker & Presenter Notes</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {slide.speakerNotes}
          </p>
        </div>
      )}
    </div>
  );
};
