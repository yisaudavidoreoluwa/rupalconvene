'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Share2, Mail, Shield, UserPlus } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  inviteCode?: string;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, roomCode, inviteCode }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'developer' | 'investor' | 'business-partner'>('developer');
  const [invitedList, setInvitedList] = useState<string[]>([]);

  if (!isOpen) return null;

  // Resolved invite passcode
  const cleanCode = roomCode.replace(/[^A-Z0-9]/g, '');
  const activeInviteCode = inviteCode || `INV-${cleanCode.length >= 6 ? cleanCode.slice(-6) : cleanCode.padEnd(6, '9')}`;

  const meetingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}?room=${roomCode}&invite=${activeInviteCode}`
    : `https://rupalconvene.vercel.app?room=${roomCode}&invite=${activeInviteCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(activeInviteCode);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInvitedList((prev) => [...prev, `${inviteEmail.trim()} (${selectedRole})`]);
    setInviteEmail('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-800">
        {/* Header */}
        <div className="p-5 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-700">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0f172a] tracking-tight">
                Invite Partners & Engineers
              </h3>
              <p className="text-xs text-slate-500">
                Conference is strictly invite-only. Share credentials or send direct pass.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs sm:text-sm max-h-[80vh] overflow-y-auto">
          {/* Direct Meeting Link (Includes ?invite=...) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                Direct Invite Link (Auto-Authorized)
              </label>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Pre-Verified
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={meetingUrl}
                className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:outline-hidden"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-semibold transition-colors shadow-xs active:scale-95"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Recipients clicking this link are automatically verified to join without typing the passcode.
            </p>
          </div>

          {/* Room Code & Invite Passcode Side-by-Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Quick Room Code */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Room Access Code
              </label>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-blue-700 tracking-wider truncate">
                  {roomCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs"
                  title="Copy room code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Invite Passcode */}
            <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-2xl">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                  Invite Passcode
                </label>
                <span className="text-[9px] font-extrabold text-blue-600 uppercase bg-blue-100/80 px-1.5 py-0.5 rounded">
                  Required
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono font-extrabold text-xs text-[#0f172a] tracking-wider truncate">
                  {activeInviteCode}
                </span>
                <button
                  onClick={handleCopyInvite}
                  className="p-1.5 rounded-lg bg-white hover:bg-blue-100 text-blue-700 transition-colors shadow-2xs"
                  title="Copy invite passcode"
                >
                  {copiedInvite ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Role-Based Email Invite */}
          <form onSubmit={handleSendInvite} className="space-y-3 pt-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
              Direct Role-Based Invite
            </label>

            <div className="grid grid-cols-3 gap-2">
              {(['developer', 'investor', 'business-partner'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-medium capitalize transition-all ${
                    selectedRole === r
                      ? 'bg-[#0f172a] text-white font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                  }`}
                >
                  {r.replace('-', ' ')}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="email"
                placeholder="colleague@syndicate.io"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0f172a]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center space-x-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </form>

          {/* Dispatched Invites List */}
          {invitedList.length > 0 && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Invites Sent in Session:</span>
              {invitedList.map((inv, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-slate-700">
                  <span>{inv}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                    Pass Dispatched
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Footer note */}
          <div className="pt-2 border-t border-slate-100 flex items-center space-x-2 text-[11px] text-slate-500">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Invitations require OAuth verification (Google, GitHub, or Discord).</span>
          </div>
        </div>
      </div>
    </div>
  );
};
