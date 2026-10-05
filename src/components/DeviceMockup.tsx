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
  Check, 
  Laptop,
  Smartphone,
  Columns,
  CheckCircle2,
  Zap,
  MousePointer2,
  Pencil,
  Square,
  StickyNote,
  FileCode
} from 'lucide-react';

export const DeviceMockup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'video' | 'code' | 'whiteboard'>('video');
  const [deviceView, setDeviceView] = useState<'dual' | 'desktop' | 'mobile'>('dual');
  
  // Interactive state for checkable action items in Gemini Notes
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: false,
  });

  const toggleActionItem = (index: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto my-6 select-none font-sans">
      {/* ============================================================ */}
      {/* CONTROLS BAR: Feature Tabs + Device View Switcher            */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 px-2">
        {/* Left: Feature View Tabs */}
        <div className="bg-slate-100/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 inline-flex items-center space-x-1 shadow-xs">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'video'
                ? 'bg-[#0f172a] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>2×2 Video & Gemini Notes</span>
          </button>
          
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'code'
                ? 'bg-[#0f172a] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Side-by-Side IDE</span>
          </button>
          
          <button
            onClick={() => setActiveTab('whiteboard')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'whiteboard'
                ? 'bg-[#0f172a] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Architecture Whiteboard</span>
          </button>
        </div>

        {/* Right: Device Form Factor Switcher */}
        <div className="bg-slate-100/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 inline-flex items-center space-x-1 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 px-2 hidden sm:inline">
            View:
          </span>
          <button
            onClick={() => setDeviceView('dual')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              deviceView === 'dual'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Side-by-side Desktop and Mobile preview"
          >
            <Columns className="w-3.5 h-3.5 text-blue-600" />
            <span>Dual Showcase</span>
          </button>
          <button
            onClick={() => setDeviceView('desktop')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              deviceView === 'desktop'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Desktop browser view"
          >
            <Laptop className="w-3.5 h-3.5 text-slate-700" />
            <span>Desktop Pro</span>
          </button>
          <button
            onClick={() => setDeviceView('mobile')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              deviceView === 'mobile'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Handheld mobile app view"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
            <span>Mobile App</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MAIN SHOWCASE CONTAINER (SPACIOUS & CLEAN)                   */}
      {/* ============================================================ */}
      <div className={`transition-all duration-300 ${
        deviceView === 'dual' 
          ? 'grid grid-cols-1 lg:grid-cols-12 gap-8 items-start' 
          : 'flex justify-center'
      }`}>
        
        {/* ========================================================== */}
        {/* 1. DESKTOP BROWSER MOCKUP                                  */}
        {/* ========================================================== */}
        {(deviceView === 'dual' || deviceView === 'desktop') && (
          <div className={`w-full transition-all duration-300 ${
            deviceView === 'dual' ? 'lg:col-span-8' : 'max-w-5xl'
          }`}>
            <div className="rounded-3xl bg-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.12)] border border-slate-200/90 overflow-hidden ring-1 ring-slate-900/5">
              
              {/* macOS Browser Chrome Header */}
              <div className="h-12 bg-slate-100/90 border-b border-slate-200/80 px-4 flex items-center justify-between text-xs text-slate-500">
                {/* Traffic Lights */}
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-xs border border-black/10" />
                  <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-xs border border-black/10" />
                  <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-xs border border-black/10" />
                </div>

                {/* Address Bar */}
                <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs max-w-md w-full justify-center text-[11px] font-mono text-slate-600">
                  <Lock className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-400">https://</span>
                  <span className="font-semibold text-slate-800">convene.rupal.tech</span>
                  <span className="text-slate-400">/meet/</span>
                  <span className="text-blue-600 font-bold">RUPAL-804-SYNC</span>
                  <span className="hidden sm:inline-block ml-2 text-[9px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-sans font-bold border border-emerald-200">
                    256-bit DTLS
                  </span>
                </div>

                {/* Right Status Indicators */}
                <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-semibold">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-slate-700 font-sans font-bold">LIVE 00:24:18</span>
                  <span className="hidden md:inline text-slate-400 font-mono">• 1.8ms</span>
                </div>
              </div>

              {/* Desktop Workspace Stage */}
              <div className="relative aspect-[16/10] sm:aspect-[16/9.5] w-full bg-[#0a0c10] overflow-hidden flex flex-col justify-between">
                
                {/* ---------------------------------------------------- */}
                {/* VIEW 1: 2x2 Video Stage + Docked Gemini Notes Sidebar */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'video' && (
                  <div className="relative flex-1 p-3 grid grid-cols-1 md:grid-cols-12 gap-3 h-full overflow-hidden">
                    
                    {/* Left 65%: 2x2 Clean Video Grid (All 4 participants clear!) */}
                    <div className="md:col-span-8 grid grid-cols-2 grid-rows-2 gap-2.5 h-full">
                      
                      {/* 1. Top-Left: Active Speaker (Aarav Mehta) */}
                      <div className="relative rounded-2xl overflow-hidden bg-[#111318] ring-2 ring-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center justify-center">
                        <img
                          src="/attendees/speaker-tl.png"
                          alt="Aarav Mehta (Active Speaker)"
                          className="w-full h-full object-cover"
                        />
                        {/* Name & Speaking Badge */}
                        <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-md text-white text-[11px] font-medium border border-white/10 flex items-center space-x-1.5 shadow-sm">
                          <span>Aarav Mehta</span>
                          <span className="text-emerald-400 font-bold text-[10px] flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                            Speaking
                          </span>
                        </div>
                        {/* Live Audio Equalizer Waveform */}
                        <div className="absolute bottom-2 right-2 flex items-center space-x-0.5 px-2 py-1 rounded-lg bg-black/65 backdrop-blur-md border border-white/10">
                          <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-bounce" />
                          <span className="w-0.5 h-3.5 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_100ms]" />
                          <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_200ms]" />
                        </div>
                      </div>

                      {/* 2. Top-Right: Elena Rostova (CLEAN & UNOBSTRUCTED) */}
                      <div className="relative rounded-2xl overflow-hidden bg-[#111318] ring-1 ring-white/10 flex items-center justify-center">
                        <img
                          src="/attendees/attendee-tr.png"
                          alt="Elena Rostova"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-md text-white text-[11px] font-medium border border-white/10 shadow-sm flex items-center space-x-1.5">
                          <span>Elena Rostova (Partner)</span>
                        </div>
                        <div className="absolute top-2 right-2 p-1 rounded-md bg-black/50 backdrop-blur-md text-slate-300 border border-white/10">
                          <Mic className="w-3 h-3 text-emerald-400" />
                        </div>
                      </div>

                      {/* 3. Bottom-Left: Marcus Vance (Architect) */}
                      <div className="relative rounded-2xl overflow-hidden bg-[#111318] ring-1 ring-white/10 flex items-center justify-center">
                        <img
                          src="/attendees/attendee-bl.png"
                          alt="Marcus Vance"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-md text-white text-[11px] font-medium border border-white/10 shadow-sm">
                          Marcus Vance (Architect)
                        </div>
                        <div className="absolute top-2 right-2 p-1 rounded-md bg-black/50 backdrop-blur-md text-slate-300 border border-white/10">
                          <Mic className="w-3 h-3 text-emerald-400" />
                        </div>
                      </div>

                      {/* 4. Bottom-Right: David Kim (Lead Engineer - 100% VISIBLE!) */}
                      <div className="relative rounded-2xl overflow-hidden bg-[#111318] ring-1 ring-white/10 flex items-center justify-center">
                        <img
                          src="/attendees/attendee-br.png"
                          alt="David Kim"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-md text-white text-[11px] font-medium border border-white/10 shadow-sm">
                          David Kim (Lead Engineer)
                        </div>
                        <div className="absolute top-2 right-2 p-1 rounded-md bg-black/50 backdrop-blur-md text-slate-300 border border-white/10">
                          <Mic className="w-3 h-3 text-emerald-400" />
                        </div>
                      </div>
                    </div>

                    {/* Right 35%: DOCKED GEMINI LIVE NOTES & INTELLIGENCE PANEL */}
                    <div className="md:col-span-4 bg-[#12161f]/95 backdrop-blur-xl rounded-2xl border border-white/10 p-3 sm:p-3.5 flex flex-col justify-between text-white shadow-xl overflow-hidden">
                      {/* Notes Header */}
                      <div>
                        <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                          <div className="flex items-center space-x-1.5">
                            <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xs">
                              <Sparkles className="w-3 h-3 text-cyan-200" />
                            </div>
                            <span className="text-xs font-bold text-white tracking-tight">
                              Gemini 3.5 Notes
                            </span>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1 animate-pulse" />
                            Live Sync
                          </span>
                        </div>

                        {/* Summary Section */}
                        <div className="mt-2.5 space-y-1.5">
                          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            Executive Highlights
                          </div>
                          <div className="bg-white/5 rounded-xl p-2.5 border border-white/5 space-y-1.5 text-[10.5px] text-slate-300 leading-snug">
                            <p className="flex items-start space-x-1.5">
                              <span className="text-blue-400 font-bold">•</span>
                              <span>
                                <strong className="text-white font-semibold">Edge Mesh:</strong> Verified sub-2ms WebRTC SFU peer connectivity across regions.
                              </span>
                            </p>
                            <p className="flex items-start space-x-1.5">
                              <span className="text-indigo-400 font-bold">•</span>
                              <span>
                                <strong className="text-white font-semibold">Collaborative IDE:</strong> Multi-cursor syncing ready for browser release.
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Interactive Action Items Section */}
                        <div className="mt-2.5 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            <span>Action Items</span>
                            <span className="text-emerald-400 font-semibold normal-case">
                              {Object.values(checkedItems).filter(Boolean).length}/3 Done
                            </span>
                          </div>

                          <div className="space-y-1">
                            {[
                              { text: 'Benchmark cellular packet loss recovery', owner: 'Marcus' },
                              { text: 'Finalize WebRTC ICE candidate gathering', owner: 'David' },
                              { text: 'Review keynote presentation deck', owner: 'Elena' },
                            ].map((item, idx) => (
                              <div
                                key={idx}
                                onClick={() => toggleActionItem(idx)}
                                className={`flex items-center justify-between p-1.5 rounded-lg border text-[10.5px] cursor-pointer transition-all ${
                                  checkedItems[idx]
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-300'
                                    : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <div className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors ${
                                    checkedItems[idx] ? 'bg-emerald-500 text-white' : 'border border-slate-500'
                                  }`}>
                                    {checkedItems[idx] && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                  </div>
                                  <span className={checkedItems[idx] ? 'line-through text-slate-400' : 'text-slate-200'}>
                                    {item.text}
                                  </span>
                                </div>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-slate-400 font-medium">
                                  {item.owner}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Notes Footer */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Auto-saved to Cloud</span>
                        </span>
                        <span className="text-blue-400 font-medium hover:underline cursor-pointer">
                          Export to Docs
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* VIEW 2: Side-by-Side In-Call IDE & Live Preview      */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'code' && (
                  <div className="relative flex-1 p-3 grid grid-cols-1 md:grid-cols-2 gap-3 h-full overflow-hidden">
                    {/* Left: Code Editor with Monaco styling */}
                    <div className="bg-[#0d1117] rounded-2xl p-3 border border-slate-800 text-xs font-mono text-slate-300 flex flex-col justify-between overflow-hidden shadow-inner">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px]">
                          <div className="flex items-center space-x-2 text-blue-400 font-semibold">
                            <FileCode className="w-3.5 h-3.5" />
                            <span>gateway-mesh.ts</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] text-emerald-400 font-medium">
                              3 Peers Editing
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-2.5 font-mono text-[11px] leading-relaxed text-slate-400">
                          <div className="flex space-x-3">
                            <span className="text-slate-600 select-none">1</span>
                            <span><span className="text-purple-400">export const</span> <span className="text-blue-300">meshConfig</span> = &#123;</span>
                          </div>
                          <div className="flex space-x-3">
                            <span className="text-slate-600 select-none">2</span>
                            <span className="pl-4"><span className="text-slate-300">encryption:</span> <span className="text-emerald-300">&quot;DTLS-256&quot;</span>,</span>
                          </div>
                          <div className="flex space-x-3">
                            <span className="text-slate-600 select-none">3</span>
                            <span className="pl-4"><span className="text-slate-300">targetLatencyMs:</span> <span className="text-amber-300">1.8</span>,</span>
                          </div>
                          <div className="flex space-x-3">
                            <span className="text-slate-600 select-none">4</span>
                            <span className="pl-4"><span className="text-slate-300">sfuAnycast:</span> <span className="text-purple-400">true</span>,</span>
                          </div>
                          <div className="flex space-x-3">
                            <span className="text-slate-600 select-none">5</span>
                            <span className="pl-4"><span className="text-slate-300">signaling:</span> <span className="text-emerald-300">&quot;webrtc-data-channel&quot;</span>,</span>
                          </div>
                          <div className="flex space-x-3">
                            <span className="text-slate-600 select-none">6</span>
                            <span>&#125;;</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-sans">
                        <span>TypeScript 5.8 • UTF-8</span>
                        <span className="text-blue-400 font-bold font-mono">Signaling Latency: 1.8ms</span>
                      </div>
                    </div>

                    {/* Right: Live Side-by-Side Preview */}
                    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-5 border border-indigo-500/30 flex flex-col items-center justify-center text-center shadow-lg relative">
                      <div className="w-full max-w-xs bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center mx-auto shadow-md">
                          <Zap className="w-5 h-5 fill-white text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-sm">Sub-2ms Gateway Node</h4>
                          <p className="text-slate-300 text-[11px] mt-1">
                            Rendered live across distributed WebRTC data channels with instant peer propagation.
                          </p>
                        </div>
                        <div className="pt-2 flex items-center justify-center space-x-2">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">
                            Operational • 99.99% Uptime
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* VIEW 3: Architectural Whiteboard Canvas             */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'whiteboard' && (
                  <div className="relative flex-1 p-3 bg-[#0a0d14] flex flex-col justify-between h-full overflow-hidden">
                    {/* Dotted Canvas Background Grid */}
                    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none" />

                    {/* Whiteboard Floating Toolbar */}
                    <div className="relative z-10 self-center flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#181f2e]/90 backdrop-blur-md border border-white/10 shadow-lg text-slate-300 text-xs">
                      <button className="p-1 rounded-md bg-blue-600 text-white shadow-xs">
                        <MousePointer2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1 rounded-md hover:bg-white/10 text-slate-300">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1 rounded-md hover:bg-white/10 text-slate-300">
                        <Square className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1 rounded-md hover:bg-white/10 text-slate-300">
                        <StickyNote className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-px h-3 bg-slate-700" />
                      <span className="text-[10px] text-slate-400 font-semibold px-1">Canvas: 100%</span>
                    </div>

                    {/* Flowchart Nodes */}
                    <div className="relative z-10 flex-1 flex items-center justify-around px-4">
                      {/* Node 1 */}
                      <div className="p-3 rounded-2xl bg-[#161f30] text-white border border-blue-500/40 shadow-xl text-center min-w-[120px]">
                        <span className="text-[9px] font-extrabold text-blue-400 uppercase tracking-wider block">
                          Client Mesh
                        </span>
                        <span className="text-xs font-bold text-slate-100">Next.js WebRTC</span>
                      </div>

                      <div className="text-blue-400 font-mono text-xs flex items-center space-x-1 animate-pulse">
                        <span className="text-slate-500">────────▶</span>
                      </div>

                      {/* Node 2 */}
                      <div className="p-3 rounded-2xl bg-[#161f30] text-white border border-emerald-500/40 shadow-xl text-center min-w-[120px]">
                        <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-wider block">
                          SFU Routing
                        </span>
                        <span className="text-xs font-bold text-slate-100">Anycast Cluster</span>
                      </div>

                      <div className="text-purple-400 font-mono text-xs flex items-center space-x-1 animate-pulse">
                        <span className="text-slate-500">────────▶</span>
                      </div>

                      {/* Node 3 */}
                      <div className="p-3 rounded-2xl bg-[#161f30] text-white border border-purple-500/40 shadow-xl text-center min-w-[120px]">
                        <span className="text-[9px] font-extrabold text-purple-400 uppercase tracking-wider block">
                          AI Engine
                        </span>
                        <span className="text-xs font-bold text-slate-100">Gemini 3.5 Realtime</span>
                      </div>
                    </div>

                    {/* Collaborator Cursor Indicators */}
                    <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-400 px-2">
                      <div className="flex items-center space-x-1.5 text-blue-400 font-medium">
                        <MousePointer2 className="w-3 h-3 text-blue-400" />
                        <span>Aarav Mehta is diagramming</span>
                      </div>
                      <span className="text-slate-500">Vector Canvas Synced</span>
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* Desktop Bottom Meeting Dock Bar                      */}
                {/* ---------------------------------------------------- */}
                <div className="h-12 bg-[#0f131a]/95 backdrop-blur-md border-t border-white/10 px-4 flex items-center justify-between text-white">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-bold text-slate-200 text-[11px] font-mono">RUPAL-804-SYNC</span>
                    <span className="text-slate-500 text-[10px] hidden sm:inline">• 4 Participants</span>
                  </div>

                  {/* Call Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer">
                      <Mic className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer">
                      <Video className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors cursor-pointer">
                      <ScreenShare className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-2 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-xs transition-colors cursor-pointer">
                      <PhoneOff className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Right Status Pill */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-bold">
                      <Sparkles className="w-3 h-3 text-cyan-300" />
                      <span>Gemini Notes Active</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* 2. MOBILE PHONE MOCKUP (CLEAN, PROPORTIONED, NO OVERLAP)   */}
        {/* ========================================================== */}
        {(deviceView === 'dual' || deviceView === 'mobile') && (
          <div className={`transition-all duration-300 flex flex-col items-center ${
            deviceView === 'dual' ? 'lg:col-span-4' : 'w-full max-w-[340px]'
          }`}>
            
            {/* Phone Outer Shell (iPhone 16 Pro Style Titanium Bezel) */}
            <div className="relative w-[280px] sm:w-[300px] rounded-[48px] p-3 bg-[#1e232e] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] border-4 border-[#333a4a] ring-1 ring-white/10">
              
              {/* Dynamic Island / Notch Sensor Bar */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-30 flex items-center justify-between px-2.5 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80" />
                <div className="flex items-center space-x-1 text-[8px] text-emerald-400 font-bold font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>24:18</span>
                </div>
              </div>

              {/* Mobile Screen Surface */}
              <div className="rounded-[38px] bg-[#0a0c10] overflow-hidden aspect-[9/18.5] flex flex-col justify-between text-white relative border border-white/10 shadow-inner">
                
                {/* Mobile Top Status Header */}
                <div className="pt-7 px-4 pb-2 flex items-center justify-between text-[10px] text-slate-400 z-20">
                  <span className="font-semibold text-white">Rupal Mobile</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[8px] font-bold">
                    DTLS 256
                  </span>
                </div>

                {/* Mobile Screen Body Content (Adapts to Active Tab) */}
                <div className="flex-1 px-3 py-1 flex flex-col justify-between overflow-hidden relative z-10">
                  
                  {activeTab === 'video' && (
                    <div className="flex-1 flex flex-col justify-between space-y-2">
                      {/* Primary Mobile Video Feed: Active Speaker Aarav */}
                      <div className="relative flex-1 rounded-2xl overflow-hidden bg-[#111318] ring-2 ring-emerald-500/80 shadow-md">
                        <img
                          src="/attendees/speaker-tl.png"
                          alt="Mobile Active Speaker"
                          className="w-full h-full object-cover"
                        />
                        {/* Speaker Name Tag */}
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-bold text-white flex items-center space-x-1">
                          <span>Aarav</span>
                          <span className="text-emerald-400">• Speaking</span>
                        </div>

                        {/* Floating Attendee PIP Tile (Elena) */}
                        <div className="absolute top-2 right-2 w-16 aspect-video rounded-xl overflow-hidden bg-black/80 ring-1 ring-white/20 shadow-lg">
                          <img
                            src="/attendees/attendee-tr.png"
                            alt="PIP Attendee"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-0.5 left-1 text-[7px] text-white font-bold bg-black/50 px-1 rounded">
                            Elena
                          </span>
                        </div>
                      </div>

                      {/* Mobile Gemini Live Summary Card */}
                      <div className="p-2.5 rounded-2xl bg-[#161c28]/95 border border-white/10 shadow-lg space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-blue-400">
                            <Sparkles className="w-3 h-3 text-cyan-300" />
                            <span className="text-[10px] font-bold text-white">Gemini Live</span>
                          </div>
                          <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 font-semibold">
                            Auto-sync
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-300 leading-snug">
                          Sub-2ms edge SFU mesh architecture approved. Action items assigned.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'code' && (
                    <div className="flex-1 flex flex-col justify-between space-y-2 py-2">
                      <div className="flex-1 rounded-2xl bg-[#0f1420] border border-white/10 p-3 font-mono text-[9px] text-slate-300 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-1.5 border-b border-white/10 text-blue-400 font-bold">
                            <span>gateway-mesh.ts</span>
                            <span className="text-emerald-400 text-[8px]">Live Synced</span>
                          </div>
                          <div className="mt-2 space-y-1 text-slate-400">
                            <div><span className="text-purple-400">export const</span> config = &#123;</div>
                            <div className="pl-2">encryption: <span className="text-emerald-300">&quot;DTLS-256&quot;</span>,</div>
                            <div className="pl-2">latency: <span className="text-amber-300">1.8ms</span></div>
                            <div>&#125;;</div>
                          </div>
                        </div>
                        <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-center text-blue-300 text-[9px] font-bold">
                          ✓ Peer Code Approved
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'whiteboard' && (
                    <div className="flex-1 flex flex-col justify-center items-center p-2">
                      <div className="w-full rounded-2xl bg-[#111726] border border-white/10 p-3 text-center space-y-2 shadow-md">
                        <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center mx-auto border border-purple-500/30">
                          <Layout className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-white block">
                          Architecture Whiteboard
                        </span>
                        <p className="text-[8px] text-slate-300">
                          Live vector sync active. Multi-user cloud topology viewport.
                        </p>
                        <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[8px] font-bold">
                          Pinch to Zoom Enabled
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Mobile Floating Bottom Call Action Bar */}
                  <div className="pt-2 pb-1">
                    <div className="h-10 bg-[#151922]/90 backdrop-blur-md rounded-2xl px-3 flex items-center justify-around border border-white/10 shadow-lg">
                      <button className="p-1.5 rounded-lg bg-white/10 text-white">
                        <Mic className="w-3 h-3" />
                      </button>
                      <button className="p-1.5 rounded-lg bg-white/10 text-white">
                        <Video className="w-3 h-3" />
                      </button>
                      <button className="p-1.5 rounded-lg bg-blue-600 text-white">
                        <Code className="w-3 h-3" />
                      </button>
                      <button className="p-1.5 rounded-lg bg-red-600 text-white">
                        <PhoneOff className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                </div>

                {/* Mobile Bottom Home Indicator Bar */}
                <div className="h-4 w-full flex items-center justify-center pb-1">
                  <div className="w-24 h-1 rounded-full bg-white/30" />
                </div>
              </div>

              {/* Mobile Native Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold shadow-md flex items-center space-x-1 border border-slate-700 whitespace-nowrap">
                <Smartphone className="w-3 h-3 text-blue-400" />
                <span>Mobile Native (iOS & Android)</span>
              </div>
            </div>

            {/* Mobile Feature Description Text below mockup */}
            <p className="text-[11px] text-slate-400 font-medium text-center mt-4 max-w-[260px] leading-tight">
              Instant handoff from laptop to phone with zero call interruption.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
