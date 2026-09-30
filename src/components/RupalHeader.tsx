'use client';

import React, { useState } from 'react';
import { Search, Sparkles, ChevronDown, Video, Shield, Cloud, Bot, ArrowRight, Menu, X } from 'lucide-react';

interface RupalHeaderProps {
  onStartMeeting: () => void;
  onSignIn?: () => void;
}

export const RupalHeader: React.FC<RupalHeaderProps> = ({ onStartMeeting, onSignIn }) => {
  const [productsOpen, setProductsOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Left: Rupal Tech Solutions Logo */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            {/* Colorful Rupal Tech logo icon matching screenshots */}
            <div className="relative w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center p-1 overflow-hidden">
              <span className="font-extrabold text-xl bg-gradient-to-tr from-blue-600 via-emerald-500 to-amber-500 bg-clip-text text-transparent">
                R
              </span>
              <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500" />
            </div>

            <div className="flex flex-col leading-tight">
              <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                Rupal Tech
              </span>
              <span className="text-[11px] font-medium text-slate-500 tracking-wide">
                solutions
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 pl-4 text-sm font-medium text-slate-700">
            {/* Solutions Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setSolutionsOpen(!solutionsOpen); setProductsOpen(false); }}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <span>Solutions</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {solutionsOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white border border-slate-100 shadow-xl p-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer">
                    <div className="font-semibold text-slate-900 text-xs">Enterprise Engineering</div>
                    <div className="text-[11px] text-slate-500">Full-stack digital modernization</div>
                  </div>
                  <div className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer">
                    <div className="font-semibold text-slate-900 text-xs">Partner Collaboration</div>
                    <div className="text-[11px] text-slate-500">Low-latency meeting infrastructure</div>
                  </div>
                  <div className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer">
                    <div className="font-semibold text-slate-900 text-xs">Cloud & Security</div>
                    <div className="text-[11px] text-slate-500">Zero-trust architecture</div>
                  </div>
                </div>
              )}
            </div>

            {/* Products Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setProductsOpen(!productsOpen); setSolutionsOpen(false); }}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <span>Products</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {productsOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white border border-slate-100 shadow-xl p-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-2.5 bg-blue-50/60 rounded-xl cursor-pointer border border-blue-100">
                    <div className="flex items-center space-x-2 text-blue-600 font-semibold text-xs">
                      <Video className="w-4 h-4" />
                      <span>Rupal Convene</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 bg-blue-600 text-white rounded-full">New</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">Conference SaaS for tech developers & business partners</div>
                  </div>

                  <div className="p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer">
                    <div className="flex items-center space-x-2 text-slate-900 font-semibold text-xs">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      <span>RupalShield</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Asset defense & device ownership registry</div>
                  </div>

                  <div className="p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer">
                    <div className="flex items-center space-x-2 text-slate-900 font-semibold text-xs">
                      <Cloud className="w-4 h-4 text-indigo-500" />
                      <span>Rupal Cloud Services</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Scalable cloud and edge server delivery</div>
                  </div>
                </div>
              )}
            </div>

            <a href="#devices" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-colors">
              Industries
            </a>

            {/* AI tab with gradient sparkle */}
            <a href="#ai-section" className="flex items-center space-x-1 px-3 py-2 rounded-lg text-violet-700 font-semibold hover:bg-violet-50 transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-violet-600" />
              <span>AI</span>
            </a>

            <a href="#pricing" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-colors">
              Pricing
            </a>

            <a href="#resources" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-colors">
              Resources
            </a>
          </nav>
        </div>

        {/* Right: Search, Sign in, Primary Call to Action */}
        <div className="flex items-center space-x-3">
          <button 
            className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Search Rupal Solutions"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={onSignIn}
            className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          >
            Sign in
          </button>

          {/* Primary CTA matching Google Meet / Rupal Meet screenshot */}
          <button
            onClick={onStartMeeting}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <span>Try Meet for work</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-4 border-t border-slate-100 bg-white space-y-2 text-sm font-medium">
          <a href="#features" className="block py-2 text-slate-700">Features</a>
          <a href="#ai-section" className="block py-2 text-violet-700 font-semibold flex items-center space-x-1">
            <Sparkles className="w-4 h-4" />
            <span>Rupal AI in Convene</span>
          </a>
          <a href="#devices" className="block py-2 text-slate-700">Supported Devices</a>
          <button
            onClick={onStartMeeting}
            className="w-full mt-2 py-2.5 rounded-full bg-[#1a73e8] text-white font-semibold text-center"
          >
            Launch Rupal Convene
          </button>
        </div>
      )}
    </header>
  );
};
