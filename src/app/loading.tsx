import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 select-none font-sans">
      <div className="relative flex items-center justify-center mb-6">
        {/* Pulsing Outer Ring */}
        <div className="w-16 h-16 rounded-3xl bg-blue-100/60 animate-ping absolute" />
        
        {/* Navy Brand Logo Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center shadow-lg relative z-10">
          <span className="font-extrabold text-2xl tracking-tight">R</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-sm font-bold text-[#0f172a] tracking-tight">
        <span>Rupal Convene</span>
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
      </div>

      <p className="text-xs text-slate-400 mt-1 font-medium">
        Connecting to real-time WebRTC mesh...
      </p>

      {/* Modern Progress Bar */}
      <div className="w-48 h-1 bg-slate-200 rounded-full mt-6 overflow-hidden">
        <div className="w-full h-full bg-[#0f172a] rounded-full animate-pulse" />
      </div>
    </div>
  );
}
