'use client';

import React from 'react';
import { PhoneOff, X } from 'lucide-react';

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLeave: () => void;
  onEndMeetingForAll: () => void;
  isHost?: boolean;
}

export const LeaveModal: React.FC<LeaveModalProps> = ({
  isOpen,
  onClose,
  onConfirmLeave,
  onEndMeetingForAll,
  isHost = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden p-6 text-center space-y-5 text-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <PhoneOff className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#0f172a] tracking-tight">
            Leave Rupal Convene Session?
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            Meeting minutes, generated action items, and whiteboard snapshots will remain accessible in your dashboard.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          {isHost && (
            <button
              onClick={onEndMeetingForAll}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
            >
              End Conference for Everyone
            </button>
          )}

          <button
            onClick={onConfirmLeave}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0f172a] text-xs font-semibold transition-colors"
          >
            Leave Meeting Alone
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
