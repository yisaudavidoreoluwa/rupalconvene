'use client';

import React from 'react';
import { CheckCircle2, Monitor, Download, Phone, Volume2, Mic, Video, PhoneOff } from 'lucide-react';

interface RupalDeviceSectionProps {
  onLaunchInBrowser: () => void;
}

export const RupalDeviceSection: React.FC<RupalDeviceSectionProps> = ({ onLaunchInBrowser }) => {
  const features = [
    'Instant zero-download browser access on Chrome, Safari, Firefox & Edge',
    'Native iOS & Android apps with background noise suppression',
    'Auto-sync meetings across phone, tablet, laptop, and conference rooms',
    'Adaptive low-bandwidth mode so calls never drop on cellular data',
  ];

  return (
    <section id="devices" className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white border-t border-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Headline, Checkmarks & Action Buttons (Matching Image 4) */}
        <div className="lg:col-span-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Meet on any device
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Join on your mobile phone or tablet via the Rupal Convene app, available on the{' '}
            <span className="text-blue-600 font-medium cursor-pointer hover:underline">App Store</span> and{' '}
            <span className="text-blue-600 font-medium cursor-pointer hover:underline">Play Store</span>. Or connect directly from your computer browser – no software install needed.
          </p>

          <div className="space-y-4 pt-2">
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-slate-700 leading-normal">
                  {feat}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              onClick={onLaunchInBrowser}
              className="flex items-center space-x-2 px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all active:scale-95"
            >
              <Monitor className="w-4 h-4" />
              <span>Launch in Browser</span>
            </button>

            <button
              onClick={() => alert("Rupal Convene App: iOS & Android binaries ready for installation.")}
              className="flex items-center space-x-2 px-6 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download App</span>
            </button>
          </div>
        </div>

        {/* Right Column: Smartphone Mockup Preview (Matching Image 4) */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-[280px] sm:w-[320px] aspect-[9/18] rounded-[42px] bg-slate-950 p-3 shadow-2xl border-4 border-slate-800 overflow-hidden flex flex-col justify-between">
            {/* Phone Screen Notch / Speaker */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-950 rounded-full z-20" />

            {/* Live Video Call Background (Canyon landscape view matching Image 4) */}
            <div className="absolute inset-0 w-full h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80"
                alt="Mobile meeting stream"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Split Screen presentation notification badge */}
            <div className="relative z-10 pt-10 px-2">
              <div className="p-2.5 rounded-xl bg-white/95 text-slate-800 text-[10px] font-semibold shadow-md backdrop-blur-md">
                Split-screen presentation with live participant grid
              </div>
            </div>

            {/* Bottom: Inset PIP tile & Mobile Controls */}
            <div className="relative z-10 p-2 space-y-4">
              {/* Mobile PIP Tile */}
              <div className="self-end ml-auto w-24 aspect-video rounded-xl bg-slate-900 border-2 border-blue-500 overflow-hidden shadow-lg relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80"
                  alt="You"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 right-1 p-0.5 rounded-full bg-blue-600 text-white">
                  <Volume2 className="w-2 h-2" />
                </div>
                <div className="absolute bottom-0.5 left-1 text-[8px] font-bold text-white bg-black/50 px-1 rounded">
                  You
                </div>
              </div>

              {/* Floating Mobile Call Action Controls */}
              <div className="flex items-center justify-center space-x-3 bg-slate-900/80 p-2 rounded-full backdrop-blur-md border border-slate-700/60">
                <button 
                  onClick={onLaunchInBrowser}
                  className="p-2.5 rounded-full bg-red-600 text-white shadow-md hover:bg-red-500 transition-colors"
                >
                  <PhoneOff className="w-4 h-4" />
                </button>
                <div className="p-2.5 rounded-full bg-slate-800 text-white">
                  <Video className="w-4 h-4" />
                </div>
                <div className="p-2.5 rounded-full bg-slate-800 text-white">
                  <Mic className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
