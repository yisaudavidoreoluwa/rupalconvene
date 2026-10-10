import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Video, BookOpen, Compass, ShieldCheck, Zap } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans select-none">
      {/* Navigation Header */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-12 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 cursor-pointer">
          <div className="w-9 h-9 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center shadow-xs">
            <span className="font-extrabold text-base">R</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-lg text-[#0f172a] tracking-tight leading-none">
              Rupal Convene
            </span>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Engineering Video Suite
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-3 text-xs font-semibold">
          <Link
            href="/docs"
            className="text-slate-600 hover:text-[#0f172a] transition-colors hidden sm:inline"
          >
            Documentation
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold transition-all shadow-xs"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main 404 Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-2xl mx-auto">
        {/* Status Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-6 border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>HTTP 404 • Resource Not Located</span>
        </div>

        {/* 404 Graphic / Typography */}
        <div className="relative mb-6">
          <span className="text-8xl sm:text-9xl font-black tracking-tight text-slate-200 select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-md">
              <Compass className="w-10 h-10 text-blue-600 animate-spin" style={{ animationDuration: '12s' }} />
            </div>
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0f172a] mb-3">
          Conference Room or Page Not Found
        </h1>

        <p className="text-sm sm:text-base text-slate-600 mb-8 max-w-lg leading-relaxed">
          The conference room code may have concluded, the link has expired, or the page address was mistyped.
        </p>

        {/* Quick Join With Room Code */}
        <div className="w-full max-w-md bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm mb-8 text-left">
          <label htmlFor="quick-join-input" className="block text-xs font-bold text-slate-700 mb-2">
            Have a meeting invite code?
          </label>
          <form action="/" method="GET" className="flex items-center space-x-2">
            <input
              id="quick-join-input"
              name="room"
              type="text"
              placeholder="e.g. RUPAL-804-SYNC"
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono uppercase text-[#0f172a] placeholder:font-sans placeholder:normal-case placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
            >
              Join Room
            </button>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
          <Link
            href="/"
            className="w-full sm:w-auto flex-1 px-5 py-3 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
          <Link
            href="/docs"
            className="w-full sm:w-auto flex-1 px-5 py-3 rounded-full bg-white hover:bg-slate-50 text-[#0f172a] font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>View Documentation</span>
          </Link>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="mt-auto border-t border-slate-200/70 bg-white py-6 px-6 sm:px-12 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-[#0f172a] text-white flex items-center justify-center text-[9px] font-bold">
            R
          </div>
          <span className="font-bold text-[#0f172a]">Rupal Convene</span>
          <span>© 2026 Rupal Tech Solutions Ltd.</span>
        </div>

        <div className="flex items-center space-x-4 text-slate-500">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>256-Bit E2EE</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>WebRTC Mesh Active</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
