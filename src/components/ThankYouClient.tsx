'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Calendar, 
  Video, 
  ArrowRight, 
  ShieldCheck, 
  BookOpen, 
  ExternalLink,
  Clock,
  Sparkles
} from 'lucide-react';

export default function ThankYouClient() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);

  const type = searchParams.get('type') || 'schedule';
  const title = searchParams.get('title') || 'Strategic Engineering Review';
  const roomCode = searchParams.get('code') || 'RUPAL-LIVE-CONV';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const time = searchParams.get('time') || '14:00';

  const inviteUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/?room=${encodeURIComponent(roomCode)}`
    : `https://rupalconvene.vercel.app/?room=${encodeURIComponent(roomCode)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const generateGoogleCalendarUrl = () => {
    const startIso = `${date.replace(/-/g, '')}T${time.replace(/:/g, '')}00Z`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(`Join Rupal Convene conference: ${inviteUrl}`)}&location=${encodeURIComponent(inviteUrl)}&dates=${startIso}/${startIso}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans select-none">
      {/* Header */}
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

        <div className="flex items-center space-x-4 text-xs font-semibold">
          <Link href="/docs" className="text-slate-600 hover:text-[#0f172a] transition-colors hidden sm:inline">
            Documentation
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold transition-all shadow-xs"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 sm:py-16 max-w-2xl mx-auto w-full">
        {/* Success Card */}
        <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 text-center relative overflow-hidden">
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#0f172a]" />

          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-5 border border-blue-100">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Confirmation Confirmed</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
            {type === 'contact' ? 'Message Sent Successfully' : 'Your Conference Is Confirmed!'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 mt-2.5 max-w-md mx-auto leading-relaxed">
            {type === 'contact'
              ? 'Thank you for reaching out to Rupal Tech Solutions. Our engineering team will review your inquiry and follow up within 24 hours.'
              : 'Your high-definition conference room has been provisioned on our WebRTC mesh network with zero-latency signaling.'}
          </p>

          {/* Meeting Details Box */}
          {type !== 'contact' && (
            <div className="mt-8 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Meeting Title</span>
                <span className="text-xs font-bold text-[#0f172a]">{title}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Scheduled Date & Time</span>
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>{date}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>{time} UTC</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Room Code</span>
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  {roomCode}
                </span>
              </div>

              {/* Copy Invite Link */}
              <div className="pt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteUrl}
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-600 select-all"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Button Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link
              href={`/?room=${encodeURIComponent(roomCode)}`}
              className="w-full sm:w-auto flex-1 px-6 py-3 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>Enter Conference Lobby</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            {type !== 'contact' && (
              <a
                href={generateGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex-1 px-6 py-3 rounded-full bg-white hover:bg-slate-50 text-[#0f172a] font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Add to Google Calendar</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500">
            <Link href="/" className="hover:text-[#0f172a] transition-colors">
              Return to Homepage
            </Link>
            <span>•</span>
            <Link href="/docs" className="hover:text-[#0f172a] transition-colors flex items-center space-x-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Developer Guides & SDK</span>
            </Link>
          </div>
        </div>

        {/* Corporate Address & Support Information */}
        <div className="mt-8 text-center text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">Rupal Tech Solutions Ltd</p>
          <p>12 Broad Street, Victoria Island, Lagos • 160 Kemp House, City Road, London, EC1V 2NX</p>
          <p>
            Questions? Contact support at{' '}
            <a href="mailto:support@rupalconvene.com" className="text-blue-600 font-bold hover:underline">
              support@rupalconvene.com
            </a>
          </p>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200/70 bg-white py-6 px-6 sm:px-12 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-[#0f172a] text-white flex items-center justify-center text-[9px] font-bold">
            R
          </div>
          <span className="font-bold text-[#0f172a]">Rupal Convene</span>
          <span>© 2026 Rupal Tech Solutions Ltd. All rights reserved.</span>
        </div>

        <div className="flex items-center space-x-4 text-slate-500">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>256-Bit Encrypted</span>
          </span>
          <span>•</span>
          <Link href="/privacy" className="hover:text-[#0f172a]">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-[#0f172a]">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
