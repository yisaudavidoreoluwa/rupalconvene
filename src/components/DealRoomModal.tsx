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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800">
        {/* Header */}
        <div className="p-5 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-700">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0f172a] tracking-tight">
                Institutional Deal Room & Term Sheet
              </h3>
              <p className="text-xs text-slate-500">
                Synthetix Series B Strategic Syndicate Room • Rupal Convene Verified
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* Syndicate Summary Banner */}
          <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                Syndicate Allocation Status
              </div>
              <div className="text-2xl font-extrabold text-[#0f172a] mt-0.5">
                $35,000,000 Series B Round
              </div>
              <div className="text-xs text-slate-600 mt-1">
                Vanguard Ventures (Lead) & Apex Global Strategic (Co-Lead)
              </div>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-white text-blue-700 font-bold text-xs shadow-xs border border-blue-200/60">
              Open Syndicate
            </div>
          </div>

          {/* Key Term Highlights */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Core Covenant Summary
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 text-xs">Pre-Money Valuation</span>
                <div className="text-base font-bold text-[#0f172a] mt-0.5">$145M USD</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 text-xs">Liquidation Preference</span>
                <div className="text-base font-bold text-[#0f172a] mt-0.5">1x Non-Participating</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 text-xs">Governance / Board</span>
                <div className="text-base font-bold text-[#0f172a] mt-0.5">1 Investor / 2 Founders / 1 Indep</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 text-xs">Information & Audit Rights</span>
                <div className="text-base font-bold text-[#0f172a] mt-0.5">Monthly Financials + SLA Telemetry</div>
              </div>
            </div>
          </div>

          {/* Document Verification & Attachments */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Protected Due Diligence Artifacts
            </div>
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100/80 transition-colors">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-xs font-bold text-[#0f172a]">
                      Series_B_Term_Sheet_Executed_Draft_v4.pdf
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Signed by Legal Counsel • SHA-256 Verified
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => alert('Downloading watermarked Term Sheet PDF with viewer cryptographic watermark')}
                  className="p-2 rounded-xl bg-white hover:bg-slate-200 text-[#0f172a] transition-colors shadow-xs"
                  title="Download confidential copy"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100/80 transition-colors">
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="text-xs font-bold text-[#0f172a]">
                      SOC2_Type_II_Audit_Report_2026.pdf
                    </div>
                    <div className="text-[11px] text-slate-500">
                      PwC Attestation • Sub-2ms Latency Benchmark Logs Attached
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => alert('Downloading SOC2 Audit Report with encrypted digital signature')}
                  className="p-2 rounded-xl bg-white hover:bg-slate-200 text-[#0f172a] transition-colors shadow-xs"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Electronic NDA Signing */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-slate-600">
                <span className="font-bold text-[#0f172a]">Confidentiality Undertaking:</span> All attendees in this syndicate session are bound by the bilateral Rupal Tech Solutions NDA. Proprietary architecture slides and financial models are encrypted.
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={signed}
                  onChange={(e) => setSigned(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-700">
                  I accept and counter-sign the Syndicate NDA
                </span>
              </label>

              <button
                disabled={!signed}
                onClick={() => {
                  alert('NDA electronically counter-signed. Access token logged to audit ledger.');
                  onClose();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  signed
                    ? 'bg-[#0f172a] hover:bg-[#1e293b] text-white active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Sign & Access Cap Table
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
