'use client';

import React, { useState } from 'react';
import { 
  X, 
  Briefcase, 
  FileText, 
  Download, 
  ShieldCheck, 
  DollarSign, 
  CheckCircle, 
  Check, 
  ExternalLink 
} from 'lucide-react';

interface DealRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DealRoomModal: React.FC<DealRoomModalProps> = ({ isOpen, onClose }) => {
  const [signed, setSigned] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Institutional Deal Room & Term Sheet
              </h3>
              <p className="text-xs text-slate-400">
                Synthetix Series B Strategic Syndicate Room
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* Syndicate Summary Banner */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Syndicate Allocation Status
              </div>
              <div className="text-xl font-bold text-white mt-0.5">
                $35,000,000 Series B Round
              </div>
              <div className="text-xs text-slate-300 mt-1">
                Vanguard Ventures (Lead) & Apex Global Strategic (Co-Lead)
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-semibold text-xs border border-emerald-500/40">
              Open Syndicate
            </div>
          </div>

          {/* Key Term Highlights */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Core Covenant Summary
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-xs">Pre-Money Valuation</span>
                <div className="text-base font-bold text-white mt-0.5">$145M USD</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-xs">Liquidation Preference</span>
                <div className="text-base font-bold text-white mt-0.5">1x Non-Participating</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-xs">Governance / Board</span>
                <div className="text-base font-bold text-white mt-0.5">1 Investor / 2 Founders / 1 Indep</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-xs">Information & Audit Rights</span>
                <div className="text-base font-bold text-white mt-0.5">Monthly Financials + SLA Telemetry</div>
              </div>
            </div>
          </div>

          {/* Document Verification & Attachments */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Confidential Diligence Documents
            </div>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-violet-400" />
                  <div>
                    <div className="font-semibold text-slate-200">Synthetix_Series_B_Term_Sheet_v4.2.pdf</div>
                    <div className="text-[11px] text-slate-400">Signed NDA Verified • 1.8 MB</div>
                  </div>
                </div>
                <button 
                  onClick={() => alert("Downloading verified Term Sheet package...")}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="font-semibold text-slate-200">SOC2_Type_II_Compliance_Report_2026.pdf</div>
                    <div className="text-[11px] text-slate-400">Enterprise Security Attestation • 4.2 MB</div>
                  </div>
                </div>
                <button 
                  onClick={() => alert("Downloading SOC2 Compliance package...")}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Audited Digital Vault Encryption</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => setSigned(true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95"
            >
              {signed ? <Check className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
              <span>{signed ? 'Sign Request Dispatched' : 'Request Partner Signoff'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
