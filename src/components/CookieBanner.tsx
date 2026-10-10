'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Cookie, X, Check, Sliders, ChevronDown, ChevronUp } from 'lucide-react';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  functional: boolean;
  decidedAt: string;
}

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [functionalEnabled, setFunctionalEnabled] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('rupal_cookie_consent');
      if (!stored) {
        // Show after a brief delay so page loads smoothly
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rupal_cookie_consent', JSON.stringify(prefs));
      window.dispatchEvent(new CustomEvent('rupal-cookie-consent-updated', { detail: prefs }));
    }
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      functional: true,
      decidedAt: new Date().toISOString(),
    });
  };

  const handleEssentialOnly = () => {
    saveConsent({
      essential: true,
      analytics: false,
      functional: false,
      decidedAt: new Date().toISOString(),
    });
  };

  const handleSaveCustom = () => {
    saveConsent({
      essential: true,
      analytics: analyticsEnabled,
      functional: functionalEnabled,
      decidedAt: new Date().toISOString(),
    });
  };

  if (!isVisible) return null;

  return (
    <aside 
      aria-label="Cookie and Privacy Consent" 
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-lg w-auto bg-white rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.18)] p-5 sm:p-6 text-slate-800 font-sans select-none animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start space-x-3.5">
        <div className="w-10 h-10 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center shrink-0 shadow-xs">
          <Cookie className="w-5 h-5 text-blue-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0f172a] tracking-tight">
              Privacy & Cookie Preferences
            </h2>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Close banner (essential only applied)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            We use essential cookies and local storage to route peer-to-peer WebRTC streams, remember your microphone and camera devices, and keep your conference sessions secure. Read our{' '}
            <Link href="/privacy" className="text-blue-600 font-semibold hover:underline">
              Privacy Policy
            </Link>.
          </p>

          {/* Collapsible Granular Preferences */}
          {showPreferences && (
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5 animate-in fade-in duration-200">
              {/* Essential */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                <div>
                  <span className="font-bold text-[#0f172a] block">Strictly Necessary</span>
                  <span className="text-[11px] text-slate-500">Required for WebRTC media signaling and session auth.</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-200/60 px-2 py-0.5 rounded">
                  Always Active
                </span>
              </div>

              {/* Functional */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                <div>
                  <span className="font-bold text-[#0f172a] block">Functional Preferences</span>
                  <span className="text-[11px] text-slate-500">Saves calendar defaults, audio levels, and IDE themes.</span>
                </div>
                <input
                  type="checkbox"
                  checked={functionalEnabled}
                  onChange={(e) => setFunctionalEnabled(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                <div>
                  <span className="font-bold text-[#0f172a] block">Telemetry & Performance</span>
                  <span className="text-[11px] text-slate-500">Anonymous packet loss metrics to improve network mesh.</span>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Action Button Row */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-1">
            <button
              onClick={showPreferences ? handleSaveCustom : handleAcceptAll}
              className="px-4 py-2 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              {showPreferences ? 'Save Preferences' : 'Accept All'}
            </button>

            <button
              onClick={handleEssentialOnly}
              className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              Essential Only
            </button>

            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="px-2.5 py-2 text-slate-500 hover:text-[#0f172a] text-xs font-semibold flex items-center space-x-1 cursor-pointer ml-auto"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showPreferences ? 'Hide' : 'Customize'}</span>
              {showPreferences ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
