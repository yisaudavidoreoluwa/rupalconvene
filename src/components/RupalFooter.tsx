'use client';

import React from 'react';
import { ShieldCheck, Video, Globe2 } from 'lucide-react';

export const RupalFooter: React.FC = () => {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800 select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-10 text-xs sm:text-sm">
        {/* Brand Column */}
        <div className="col-span-2 space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center p-1">
              <span className="font-extrabold text-base bg-gradient-to-tr from-blue-600 via-emerald-500 to-amber-500 bg-clip-text text-transparent">
                R
              </span>
            </div>
            <span className="font-bold text-white text-base">Rupal Tech solutions</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
            Technology that moves your business forward. Build, modernize, and scale with connected solutions in cloud, AI, cybersecurity, and digital engineering.
          </p>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs pt-1">
            <ShieldCheck className="w-4 h-4" />
            <span>SOC2 Type II & WebRTC Encrypted</span>
          </div>
        </div>

        {/* Products */}
        <div>
          <div className="font-semibold text-white uppercase text-xs tracking-wider mb-3">Products</div>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="hover:text-white transition-colors cursor-pointer font-medium text-blue-400">Rupal Convene</li>
            <li className="hover:text-white transition-colors cursor-pointer">RupalShield Asset Defense</li>
            <li className="hover:text-white transition-colors cursor-pointer">Rupal Cloud Infrastructure</li>
            <li className="hover:text-white transition-colors cursor-pointer">Rupal Intelligence Suite</li>
          </ul>
        </div>

        {/* Solutions */}
        <div>
          <div className="font-semibold text-white uppercase text-xs tracking-wider mb-3">Solutions</div>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="hover:text-white transition-colors cursor-pointer">Developer Collaboration</li>
            <li className="hover:text-white transition-colors cursor-pointer">Investor Roadshows & Deal Rooms</li>
            <li className="hover:text-white transition-colors cursor-pointer">Enterprise Green Rooms</li>
            <li className="hover:text-white transition-colors cursor-pointer">Sandboxed Code Runtime</li>
          </ul>
        </div>

        {/* Enterprise */}
        <div>
          <div className="font-semibold text-white uppercase text-xs tracking-wider mb-3">Company</div>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="hover:text-white transition-colors cursor-pointer">About Rupal Tech</li>
            <li className="hover:text-white transition-colors cursor-pointer">Security & Watermarks</li>
            <li className="hover:text-white transition-colors cursor-pointer">Terms of Service</li>
            <li className="hover:text-white transition-colors cursor-pointer">Privacy Policy</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <div>© 2026 Rupal Tech solutions. All rights reserved.</div>
        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
          <span>Global Network</span>
          <span>•</span>
          <span>99.99% Availability</span>
          <span>•</span>
          <span>Privacy Watermarked</span>
        </div>
      </div>
    </footer>
  );
};
