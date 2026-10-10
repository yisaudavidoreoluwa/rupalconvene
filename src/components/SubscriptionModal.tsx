'use client';

import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Building2, 
  Users, 
  Code, 
  Bot 
} from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan?: (planId: string) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
}) => {
  const [annualBilling, setAnnualBilling] = useState(true);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Ideal for independent developers and small startup squads.',
      price: '$0',
      period: 'Forever free',
      highlighted: false,
      badge: 'Free Tier',
      cta: 'Start Free Now',
      features: [
        'Up to 30+ live mesh peers',
        'In-call Collaborative Code IDE',
        'Architecture Whiteboard canvas',
        '256-Bit DTLS/SRTP encryption',
        'Standard community support',
      ],
    },
    {
      id: 'business',
      name: 'Business Pro',
      description: 'Built for fast-growing engineering teams and technology leads.',
      price: annualBilling ? '$12' : '$15',
      period: 'per seat / month',
      highlighted: true,
      badge: 'Most Popular',
      cta: 'Upgrade to Business',
      features: [
        'All Starter features included',
        'Gemini AI Live Meeting Notes & Minutes',
        'Synchronized Pitch Deck Viewer',
        'Dynamic identity watermarking',
        'Full Google & Outlook calendar sync',
        'Priority peer signaling routing',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise Mesh',
      description: 'For organizations needing custom security and dedicated relays.',
      price: annualBilling ? '$32' : '$39',
      period: 'per seat / month',
      highlighted: false,
      badge: 'Custom Relay',
      cta: 'Contact Enterprise',
      features: [
        'All Business Pro features',
        'Confidential Deal Room audit logs',
        'Dedicated SFU & regional TURN nodes',
        'Single Sign-On (SSO / SAML / Okta)',
        '99.99% enterprise uptime SLA',
        'Dedicated Solutions Architect',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-10 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Transparent SaaS Plans</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
            Flexible Subscriptions for High-Performance Teams
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Choose the ideal tier for your engineering conferences, hackathons, and confidential diligence deal rooms.
          </p>

          {/* Billing Switcher */}
          <div className="pt-3 flex items-center justify-center space-x-3 text-xs font-semibold text-slate-600">
            <span className={!annualBilling ? 'text-[#0f172a] font-bold' : ''}>Monthly</span>
            <button
              onClick={() => setAnnualBilling(!annualBilling)}
              className="w-11 h-6 rounded-full bg-[#0f172a] p-1 transition-colors relative cursor-pointer"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  annualBilling ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={annualBilling ? 'text-[#0f172a] font-bold flex items-center gap-1.5' : ''}>
              Annual Billing
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
                p.highlighted
                  ? 'bg-slate-50 border-2 border-[#0f172a] shadow-lg shadow-slate-200/60'
                  : 'bg-white border border-slate-200/90 shadow-2xs hover:shadow-sm'
              }`}
            >
              {p.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#0f172a] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                  {p.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-extrabold text-base text-[#0f172a]">{p.name}</h3>
                  {!p.highlighted && (
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {p.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 min-h-[32px] leading-relaxed mb-4">
                  {p.description}
                </p>

                <div className="mb-6 pb-6 border-b border-slate-200/60">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl sm:text-4xl font-black text-[#0f172a] tracking-tight">
                      {p.price}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      /{p.period}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-2.5 text-xs text-slate-600 mb-6">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => {
                  if (onSelectPlan) onSelectPlan(p.id);
                  onClose();
                }}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95 ${
                  p.highlighted
                    ? 'bg-[#0f172a] hover:bg-[#1e293b] text-white shadow-md'
                    : 'bg-white hover:bg-slate-100 text-[#0f172a] border border-slate-200'
                }`}
              >
                <span>{p.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 text-center sm:text-left">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>30-Day Money-Back Guarantee • Cancel Anytime • No Lock-In</span>
          </div>
          <div>
            Need custom invoices? Contact{' '}
            <a href="mailto:billing@rupalconvene.com" className="text-blue-600 font-semibold hover:underline">
              billing@rupalconvene.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
