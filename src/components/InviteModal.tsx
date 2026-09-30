'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Share2, Mail, Shield, UserPlus } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, roomCode }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'developer' | 'investor' | 'business-partner'>('developer');
  const [invitedList, setInvitedList] = useState<string[]>([]);

  if (!isOpen) return null;

  const meetingUrl = `https://techconvene.io/meet/${roomCode}`;

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

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInvitedList((prev) => [...prev, `${inviteEmail.trim()} (${selectedRole})`]);
    setInviteEmail('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Invite Partners & Engineers
              </h3>
              <p className="text-xs text-slate-400">
                Grant role-based access with NDA and runtime privileges
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs sm:text-sm">
          {/* Direct Meeting Link */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
              Secure Conference URL
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={meetingUrl}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Quick Room Code */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
              Room Access Code
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-cyan-400 tracking-wider">
                {roomCode}
              </div>
              <button
                onClick={handleCopyCode}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                {copiedCode ? 'Copied' : 'Copy Code'}
              </button>
            </div>
          </div>

          {/* Email Invite Dispatch */}
          <form onSubmit={handleSendInvite} className="space-y-3 pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Direct Invite via Email
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
              />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="developer">Developer</option>
                <option value="investor">Investor / VC</option>
                <option value="business-partner">Partner</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={!inviteEmail.trim()}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-40"
            >
              Send Direct Room Invite
            </button>
          </form>

          {/* Invited list */}
          {invitedList.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400">Dispatched Invites:</span>
              {invitedList.map((inv, idx) => (
                <div key={idx} className="text-xs text-emerald-400 flex items-center space-x-1.5">
                  <Check className="w-3 h-3" />
                  <span>{inv}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
