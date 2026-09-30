'use client';

import React from 'react';
import { PhoneOff, AlertTriangle, X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-6 text-center space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto">
          <PhoneOff className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-white tracking-wide">
            Leave TechConvene Session?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Meeting minutes, generated action items, and whiteboard snapshots will remain accessible in your dashboard.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          {isHost && (
            <button
              onClick={onEndMeetingForAll}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-600/20 active:scale-95"
            >
              End Conference for Everyone
            </button>
          )}

          <button
            onClick={onConfirmLeave}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Leave Meeting Alone
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl text-slate-400 hover:text-white text-xs transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
