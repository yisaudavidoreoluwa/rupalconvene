'use client';

import React, { useState } from 'react';
import { Sparkles, Globe2, Languages, MessageSquare, Bot, ArrowRight, Check } from 'lucide-react';

interface RupalAIFeatureSectionProps {
  onExploreAI: () => void;
}

export const RupalAIFeatureSection: React.FC<RupalAIFeatureSectionProps> = ({ onExploreAI }) => {
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [aiPrompt, setAiPrompt] = useState("What is today's agenda?");
  const [aiResponse, setAiResponse] = useState<string | null>(
    "Today's agenda covers: 1. Distributed rate limiter review (1.2ms p99 latency target), 2. Streaming anomaly fraud pipeline, 3. Series B syndicate allocation with Vanguard & Apex."
  );

  return (
    <section id="ai-section" className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white border-t border-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Visual with AI Notes, Speech Translation & Gemini Window (Matching Image 3) */}
        <div className="lg:col-span-6 relative flex justify-center">
          <div className="relative w-full max-w-[500px]">
            {/* Main Portrait Card */}
            <div className="relative aspect-square sm:aspect-[4/3] rounded-3xl bg-slate-100 overflow-hidden shadow-xl border-4 border-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80"
                alt="AI Meeting Attendee"
                className="w-full h-full object-cover"
              />

              {/* Floating "Gemini is taking notes" badge */}
              <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-slate-900/90 text-white text-xs font-semibold shadow-lg backdrop-blur-md border border-slate-700/60 flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Rupal AI is taking notes</span>
              </div>
            </div>

            {/* Floating Speech Translation Card (Matching Image 3) */}
            <div className="absolute -bottom-6 -left-4 sm:-left-6 w-64 p-3.5 rounded-2xl bg-slate-900/95 text-white border border-slate-700/80 shadow-2xl backdrop-blur-md">
              <div className="flex items-center space-x-2 mb-2">
                <div className="p-1 rounded-md bg-blue-500/20 text-blue-400">
                  <Languages className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Speech translation</div>
                  <div className="text-[10px] text-slate-400">Translating in real-time</div>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                  <span className="text-slate-400">Spoken:</span>
                  <span className="font-semibold text-slate-200">{sourceLang}</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                  <span className="text-slate-400">Heard:</span>
                  <span className="font-semibold text-emerald-400">{targetLang}</span>
                </div>
              </div>
            </div>

            {/* Floating Gemini Copilot Interactive Query Card (Matching Image 3) */}
            <div className="absolute -top-6 -right-4 sm:-right-6 w-72 p-3.5 rounded-2xl bg-slate-900/95 text-white border border-violet-500/40 shadow-2xl backdrop-blur-md">
              <div className="flex items-center space-x-2 pb-2 mb-2 border-b border-slate-800">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-bold">Rupal AI Copilot</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-800/90 text-xs text-slate-200 mb-2 border border-slate-700">
                &ldquo;{aiPrompt}&rdquo;
              </div>

              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold text-violet-400 flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
                  <span>Synthesized from live transcript</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug line-clamp-3">
                  {aiResponse}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Copy & Value Proposition matching Image 3 */}
        <div className="lg:col-span-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Drive decisions and action with AI-enhanced meetings
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Turn discussions into next steps instantly. With Rupal AI & Gemini in Rupal Convene automating your notes, translating conversations, and surfacing key technical and financial insights, your team can focus entirely on making choices and moving work forward.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-medium text-slate-700">
                Automated executive debriefs, technical decisions, and assigned action items.
              </span>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-medium text-slate-700">
                Live speech translation across 40+ global languages with subtitle sync.
              </span>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-medium text-slate-700">
                In-meeting Code & Whiteboard explanation for technical leads and investor partners.
              </span>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={onExploreAI}
              className="inline-flex items-center space-x-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>Explore Rupal AI in Convene</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
