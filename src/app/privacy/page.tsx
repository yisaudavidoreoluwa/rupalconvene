import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Rupal Convene',
  description:
    'Read the Rupal Convene Privacy Policy. Learn how we safeguard your video, audio, code collaboration data, and personal information in compliance with GDPR, NDPR, and CCPA.',
  alternates: {
    canonical: 'https://rupalconvene.vercel.app/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | Rupal Convene',
    description:
      'Learn how Rupal Convene safeguards your video, audio, code collaboration data, and personal information in compliance with GDPR, NDPR, and CCPA.',
    url: 'https://rupalconvene.vercel.app/privacy',
    siteName: 'Rupal Convene',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans select-none">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-12 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 cursor-pointer">
          <div className="w-9 h-9 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center shadow-xs">
            <span className="font-extrabold text-base">R</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-lg text-[#0f172a] tracking-tight leading-none">
              Rupal Convene
            </span>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Legal & Privacy
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-4 text-xs font-semibold">
          <Link href="/terms" className="text-slate-600 hover:text-[#0f172a] transition-colors hidden sm:inline">
            Terms of Service
          </Link>
          <Link
            href="/"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold transition-all shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Convene</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 sm:py-16">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 sm:p-14 space-y-10">
          {/* Header Banner */}
          <div className="border-b border-slate-100 pb-8">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-4 border border-blue-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Enterprise Privacy & Zero-Knowledge Architecture</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
              Effective Date: October 10, 2026 • Version 2.4 • Rupal Tech Solutions Ltd
            </p>
          </div>

          {/* Quick Summary Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <Lock className="w-5 h-5 text-blue-600 mb-2" />
              <h2 className="text-xs font-bold text-[#0f172a]">End-to-End Encryption</h2>
              <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                Audio and video media streams are encrypted via DTLS/SRTP directly between peers.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <Eye className="w-5 h-5 text-blue-600 mb-2" />
              <h2 className="text-xs font-bold text-[#0f172a]">Zero Stream Retention</h2>
              <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                We do not record, tap, or store raw video or audio streams on our signaling relays.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <FileText className="w-5 h-5 text-blue-600 mb-2" />
              <h2 className="text-xs font-bold text-[#0f172a]">GDPR & NDPR Compliant</h2>
              <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                Full transparency with complete rights to data access, portability, and deletion.
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#0f172a] flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-xs">1</span>
              <span>Identity of the Data Controller</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              This Privacy Policy explains how <strong>Rupal Tech Solutions Ltd</strong> (&quot;Rupal Convene&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, protects, and discloses personal information when you use our video conferencing application, real-time collaboration suites (Code Workspace, Architecture Whiteboard, Pitch Deck Viewer, Agenda), and developer SDKs located at{' '}
              <a href="https://rupalconvene.vercel.app" className="text-blue-600 font-semibold underline">
                rupalconvene.vercel.app
              </a>.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong>Corporate Headquarters:</strong> Rupal Tech Solutions Ltd, 12 Broad Street, Victoria Island, Lagos, Nigeria.<br />
              <strong>Liaison Office:</strong> 160 Kemp House, City Road, London, EC1V 2NX, United Kingdom.<br />
              <strong>Data Protection Officer:</strong> <a href="mailto:privacy@rupalconvene.com" className="text-blue-600 font-semibold">privacy@rupalconvene.com</a>
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#0f172a] flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-xs">2</span>
              <span>Information We Collect</span>
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p><strong>A. Account & Profile Information:</strong> When you register an account or verify your identity, we collect your name, email address, job title, and authentication provider identifiers (Google, GitHub, LinkedIn, or Email/Password credentials).</p>
              <p><strong>B. Conference Session Data:</strong> We generate and store conference session metadata including room codes, conference start/end timestamps, invite permissions, attendee lists, and agenda milestones.</p>
              <p><strong>C. Ephemeral Media Streams:</strong> Video and audio media packets transmitted between participants travel peer-to-peer or through encrypted TURN/STUN relays. Raw media packets are never inspected, decrypted, or stored on our servers.</p>
              <p><strong>D. Collaborative Artifacts:</strong> Any code files created in the Code Workspace, whiteboard vectors, or slides shared in a conference remain the intellectual property of your team and are persisted in secure encrypted storage only for the duration of the room lifecycle.</p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#0f172a] flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-xs">3</span>
              <span>Gemini AI Intelligence & Personal Notes</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Rupal Convene features optional Gemini AI integration for automated meeting note generation, agenda tracking, and action items. When activated:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-600">
              <li>Meeting audio transcripts are processed in real time using enterprise zero-data-retention APIs.</li>
              <li>Your proprietary discussions, code snippets, and whiteboard designs are <strong>never</strong> used to train Google or Rupal generative models.</li>
              <li>Generated meeting notes are stored in your secure personal account and can be deleted at any time with a single click.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#0f172a] flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-xs">4</span>
              <span>Cookies and Local Storage</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We use strictly necessary cookies and browser <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 font-mono text-xs">localStorage</code> to maintain authenticated sessions, store your selected microphone/camera device IDs, preserve calendar preferences, and protect against CSRF attacks. We do not sell user data to advertising networks.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#0f172a] flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-xs">5</span>
              <span>Your Rights (GDPR, NDPR, and CCPA)</span>
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p>Regardless of your geographic location, you enjoy full data sovereignty under our platform:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Right of Access & Portability:</strong> Request an export of your account metadata and meeting histories.</li>
                <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> Request full deletion of your account and all associated conference artifacts.</li>
                <li><strong>Right to Rectification:</strong> Update or correct your profile information anytime through the dashboard.</li>
              </ul>
              <p>
                To exercise any of these rights, email our Data Protection Officer at{' '}
                <a href="mailto:privacy@rupalconvene.com" className="text-blue-600 font-bold hover:underline">
                  privacy@rupalconvene.com
                </a>.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#0f172a] flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-xs">6</span>
              <span>Contact & Complaints</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              For questions, inquiries, or privacy-related requests:
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
              <p><strong>Email:</strong> support@rupalconvene.com / privacy@rupalconvene.com</p>
              <p><strong>Telephone:</strong> +234 (0) 1 295 4480 / +44 20 7946 0912</p>
              <p><strong>Physical Address:</strong> Rupal Tech Solutions Ltd, 12 Broad Street, Victoria Island, Lagos, Nigeria.</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/70 bg-white py-6 px-6 sm:px-12 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-[#0f172a] text-white flex items-center justify-center text-[9px] font-bold">
            R
          </div>
          <span className="font-bold text-[#0f172a]">Rupal Convene</span>
          <span>© 2026 Rupal Tech Solutions Ltd.</span>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/terms" className="hover:text-[#0f172a]">Terms of Service</Link>
          <span>•</span>
          <Link href="/docs" className="hover:text-[#0f172a]">API & Docs</Link>
          <span>•</span>
          <Link href="/" className="hover:text-[#0f172a]">Return Home</Link>
        </div>
      </footer>
    </div>
  );
}
