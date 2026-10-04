'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Mic, 
  Video, 
  ScreenShare, 
  Code, 
  Layout, 
  PhoneOff, 
  Lock, 
  ShieldCheck, 
  Check, 
  Info, 
  Volume2, 
  Play, 
  FileCode,
  Laptop,
  Smartphone
} from 'lucide-react';

export const DeviceMockup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'video' | 'code' | 'whiteboard'>('video');

  return (
    <div className="relative w-full max-w-6xl mx-auto my-6 select-none">
      {/* Tab Switcher for Mockup Views */}
      <div className="flex items-center justify-center space-x-2 mb-6">
        <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-slate-200/60 inline-flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'video'
                ? 'bg-[#0f172a] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>2×2 Video & Gemini Notes</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'code'
                ? 'bg-[#0f172a] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Side-by-Side IDE</span>
          </button>
          <button
            onClick={() => setActiveTab('whiteboard')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'whiteboard'
                ? 'bg-[#0f172a] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Architecture Whiteboard</span>
          </button>
        </div>
      </div>

      {/* Main Container wrapping Desktop & Mobile Mockups */}
      <div className="relative">
        {/* ============================================================ */}
        {/* 1. DESKTOP BROWSER MOCKUP                                    */}
        {/* ============================================================ */}
        <div className="rounded-3xl bg-white shadow-[0_25px_70px_-15px_rgba(15,23,42,0.15)] border border-slate-200/80 overflow-hidden transition-all duration-300">
          {/* macOS Browser Chrome Header */}
          <div className="h-11 bg-slate-100/90 border-b border-slate-200/80 px-4 flex items-center justify-between text-xs text-slate-500">
            {/* Traffic Lights */}
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-xs" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-xs" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-xs" />
            </div>

            {/* Address Bar */}
            <div className="flex items-center space-x-2 px-4 py-1 rounded-full bg-white border border-slate-200/70 shadow-xs max-w-md w-full justify-center text-[11px] font-mono text-slate-600">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span className="text-slate-400">https://</span>
              <span className="font-semibold text-slate-800">convene.rupal.tech</span>
              <span className="text-slate-400">/meet/</span>
              <span className="text-blue-600 font-bold">RUPAL-804-SYNC</span>
              <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-sans font-bold border border-emerald-200">
                256-bit DTLS
              </span>
            </div>

            {/* Window Right Action Icons */}
            <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-semibold">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline text-slate-600 font-sans">LIVE 00:24:18</span>
            </div>
          </div>

          {/* Desktop Content Stage */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-[#0a0c10] overflow-hidden flex flex-col justify-between">
            {/* VIEW 1: 2x2 Video Stage with Emerald Active Speaker and Gemini Notes */}
            {activeTab === 'video' && (
              <div className="relative flex-1 p-2 sm:p-3 grid grid-cols-2 grid-rows-2 gap-2 sm:gap-2.5 h-full">
                {/* Top-Left: Active Speaker with bright emerald ring */}
                <div className="relative rounded-2xl overflow-hidden bg-[#111318] ring-[3px] ring-[#10b981] shadow-[0_0_25px_rgba(16,185,129,0.35)]">
                  <img
                    src="/attendees/speaker-tl.png"
                    alt="Active Speaker"
                    className="w-full h-full object-cover"
                  />
                  {/* Name badge */}
                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-medium border border-white/10 flex items-center space-x-1.5">
                    <span>Aarav Mehta</span>
                    <span className="text-emerald-400 font-normal text-[10px]">• Speaking</span>
                  </div>
                  {/* Waveform */}
                  <div className="absolute bottom-2.5 right-2.5 flex items-center space-x-0.5 px-2 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
                    <span className="w-0.5 h-2 bg-[#10b981] rounded-full animate-bounce" />
                    <span className="w-0.5 h-3 bg-[#10b981] rounded-full animate-[bounce_0.6s_infinite_100ms]" />
                    <span className="w-0.5 h-2 bg-[#10b981] rounded-full animate-[bounce_0.6s_infinite_200ms]" />
                  </div>
                </div>

                {/* Top-Right: Attendee with Floating My Notes Card */}
                <div className="relative rounded-2xl overflow-hidden bg-[#111318] ring-1 ring-white/10">
                  <img
                    src="/attendees/attendee-tr.png"
                    alt="Attendee"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-medium border border-white/10">
                    Elena Rostova (Partner)
                  </div>

                  {/* Floating Gemini "My Notes" Card matching exact screenshot */}
                  <div className="absolute top-2.5 right-2.5 w-[200px] sm:w-[260px] bg-[#181a20]/95 backdrop-blur-md rounded-xl p-2.5 sm:p-3 shadow-2xl border border-white/10 text-white z-20 pointer-events-none">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-semibold">My Notes</span>
                        <Info className="w-3 h-3 text-slate-400" />
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 font-semibold">
                        Gemini
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-tight mb-2">
                      Take notes or use meeting transcript to create a personal summary <span className="font-semibold text-white">for you</span>.
                    </p>
                    <div className="space-y-1 mb-2 text-[10px] text-slate-200">
                      <div className="flex items-center justify-between">
                        <span>Use meeting transcript</span>
                        <div className="w-3.5 h-3.5 rounded bg-[#3b82f6] text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Auto-start note</span>
                        <div className="w-3.5 h-3.5 rounded bg-[#3b82f6] text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      </div>
                    </div>
                    <div className="w-full py-1.5 px-2 rounded-full bg-gradient-to-r from-[#4481eb] to-[#9b51e0] text-center font-medium text-[10px] text-white shadow-md">
                      Start taking notes
                    </div>
                  </div>
                </div>

                {/* Bottom-Left: Attendee 3 */}
                <div className="relative rounded-2xl overflow-hidden bg-[#111318] ring-1 ring-white/10">
                  <img
                    src="/attendees/attendee-bl.png"
                    alt="Attendee"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-medium border border-white/10">
                    Marcus Vance (Architect)
                  </div>
                </div>

                {/* Bottom-Right: Attendee 4 */}
                <div className="relative rounded-2xl overflow-hidden bg-[#111318] ring-1 ring-white/10">
                  <img
                    src="/attendees/attendee-br.png"
                    alt="Attendee"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-medium border border-white/10">
                    David Kim (Engineer)
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: Side-by-Side In-Call IDE & Live Preview */}
            {activeTab === 'code' && (
              <div className="relative flex-1 p-2 sm:p-3 flex gap-2 h-full">
                {/* Left: Code Editor */}
                <div className="flex-1 bg-[#0d1117] rounded-2xl p-3 border border-slate-800 text-xs font-mono text-slate-300 flex flex-col justify-between overflow-hidden">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-[11px]">
                    <div className="flex items-center space-x-1.5 text-blue-400 font-semibold">
                      <FileCode className="w-3.5 h-3.5" />
                      <span>gateway-mesh.html</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      Live Sync Active
                    </span>
                  </div>
                  <pre className="text-[11px] leading-relaxed text-slate-400 overflow-hidden my-2">
                    <span className="text-purple-400">&lt;div</span> <span className="text-sky-300">class</span>=<span className="text-emerald-300">&quot;mesh-card&quot;</span><span className="text-purple-400">&gt;</span>{'\n'}
                    {'  '}<span className="text-purple-400">&lt;h3&gt;</span>Sub-2ms Gateway Node<span className="text-purple-400">&lt;/h3&gt;</span>{'\n'}
                    {'  '}<span className="text-purple-400">&lt;span</span> <span className="text-sky-300">class</span>=<span className="text-emerald-300">&quot;badge&quot;</span><span className="text-purple-400">&gt;</span>DTLS 256-bit<span className="text-purple-400">&lt;/span&gt;</span>{'\n'}
                    <span className="text-purple-400">&lt;/div&gt;</span>
                  </pre>
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span>UTF-8 • HTML5 Sandboxed</span>
                    <span className="text-blue-400 font-bold">Latency: 1.8ms</span>
                  </div>
                </div>

                {/* Right: Live Side-by-Side Preview */}
                <div className="flex-1 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-4 border border-indigo-500/30 flex flex-col items-center justify-center text-center">
                  <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl max-w-xs w-full">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center mx-auto mb-2 shadow-lg">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                    <h4 className="text-white font-bold text-sm">Sub-2ms Gateway Node</h4>
                    <p className="text-slate-300 text-[11px] mt-1">Rendered live with instant peer propagation across WebRTC data channels.</p>
                    <span className="inline-block mt-3 px-3 py-1 rounded-full bg-emerald-500 text-white font-bold text-[10px]">
                      Operational • 99.99% Uptime
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 3: Architectural Whiteboard */}
            {activeTab === 'whiteboard' && (
              <div className="relative flex-1 p-3 bg-[#0f172a] flex items-center justify-center h-full">
                <div className="relative w-full max-w-xl h-full border border-dashed border-slate-700 rounded-2xl p-4 flex items-center justify-around">
                  {/* Node 1 */}
                  <div className="p-3 rounded-xl bg-[#1e293b] text-white border border-blue-500/40 shadow-lg text-center text-xs">
                    <span className="text-[10px] font-bold text-blue-400 block uppercase">Client Layer</span>
                    <span className="font-bold">Next.js WebRTC</span>
                  </div>

                  {/* Connecting Arrow */}
                  <div className="flex items-center text-blue-400 font-mono text-xs">
                    ──────▶
                  </div>

                  {/* Node 2 */}
                  <div className="p-3 rounded-xl bg-[#1e293b] text-white border border-emerald-500/40 shadow-lg text-center text-xs">
                    <span className="text-[10px] font-bold text-emerald-400 block uppercase">SFU Cluster</span>
                    <span className="font-bold">Edge Anycast</span>
                  </div>

                  {/* Connecting Arrow */}
                  <div className="flex items-center text-purple-400 font-mono text-xs">
                    ──────▶
                  </div>

                  {/* Node 3 */}
                  <div className="p-3 rounded-xl bg-[#1e293b] text-white border border-purple-500/40 shadow-lg text-center text-xs">
                    <span className="text-[10px] font-bold text-purple-400 block uppercase">Intelligence</span>
                    <span className="font-bold">Gemini AI Minutes</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Dock Bar */}
            <div className="h-12 bg-white/10 backdrop-blur-md border-t border-white/10 px-4 flex items-center justify-between text-white">
              <div className="flex items-center space-x-2 text-xs">
                <span className="font-bold text-white text-[11px]">RUPAL-804-SYNC</span>
                <span className="text-slate-400 text-[10px] hidden sm:inline">• 4 Participants</span>
              </div>

              {/* Bottom Buttons */}
              <div className="flex items-center space-x-1.5">
                <div className="p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700">
                  <Mic className="w-3.5 h-3.5" />
                </div>
                <div className="p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700">
                  <Video className="w-3.5 h-3.5" />
                </div>
                <div className="p-2 rounded-full bg-blue-600 text-white shadow-xs">
                  <Code className="w-3.5 h-3.5" />
                </div>
                <div className="p-2 rounded-full bg-red-600 text-white">
                  <PhoneOff className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-bold shadow-xs">
                  <Sparkles className="w-3 h-3 text-cyan-200" />
                  <span>My Notes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. FLOATING MOBILE DEVICE MOCKUP                             */}
        {/* ============================================================ */}
        <div className="hidden lg:block absolute -bottom-10 -right-6 w-[230px] rounded-[38px] p-2 bg-[#1e222b] shadow-[0_30px_70px_rgba(0,0,0,0.4)] border-4 border-[#333a48] z-30 transform hover:-translate-y-2 transition-all duration-300">
          {/* Mobile Screen Surface */}
          <div className="rounded-[30px] bg-[#0a0c10] overflow-hidden aspect-[9/18] flex flex-col justify-between text-white relative border border-white/10">
            {/* Dynamic Island / Camera Notch */}
            <div className="h-6 w-full flex items-center justify-center pt-2">
              <div className="w-16 h-3 rounded-full bg-black flex items-center justify-end px-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80" />
              </div>
            </div>

            {/* Mobile Video Feed */}
            <div className="flex-1 p-2 flex flex-col gap-1.5 overflow-hidden">
              <div className="flex-1 rounded-xl overflow-hidden bg-[#111318] ring-2 ring-[#10b981] relative">
                <img
                  src="/attendees/speaker-tl.png"
                  alt="Mobile Speaker"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-semibold">
                  Aarav (Speaking)
                </span>
              </div>
              <div className="h-16 rounded-xl overflow-hidden bg-[#111318] relative">
                <img
                  src="/attendees/attendee-tr.png"
                  alt="Mobile Attendee"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[8px]">
                  Elena
                </span>
              </div>

              {/* Floating Gemini Notes Pill on Mobile */}
              <div className="p-2 rounded-xl bg-[#181a20]/95 border border-white/10 text-white shadow-lg">
                <div className="flex items-center space-x-1 mb-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-blue-400" />
                  <span className="text-[10px] font-bold">My Notes</span>
                </div>
                <p className="text-[8px] text-slate-300 leading-tight">
                  Gemini AI summarizes audio in real time for you.
                </p>
              </div>
            </div>

            {/* Mobile Bottom Dock */}
            <div className="h-10 bg-[#111318] px-3 flex items-center justify-around border-t border-white/10">
              <Mic className="w-3 h-3 text-white" />
              <Video className="w-3 h-3 text-white" />
              <Code className="w-3 h-3 text-blue-400" />
              <PhoneOff className="w-3 h-3 text-red-500" />
            </div>
          </div>

          {/* Device Badge */}
          <div className="absolute -top-3 -left-3 px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow-md flex items-center space-x-1">
            <Smartphone className="w-3 h-3" />
            <span>Mobile Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
