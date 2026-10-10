import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Scale, FileCheck, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Rupal Convene',
  description:
    'Read the Rupal Convene Terms & Conditions. Learn about service usage, intellectual property ownership, acceptable use, and conference host responsibilities.',
  alternates: {
    canonical: 'https://rupalconvene.vercel.app/terms',
  },
  openGraph: {
    title: 'Terms & Conditions | Rupal Convene',
    description:
      'Read the Rupal Convene Terms & Conditions. Learn about service usage, intellectual property ownership, acceptable use, and conference host responsibilities.',
    url: 'https://rupalconvene.vercel.app/terms',
    siteName: 'Rupal Convene',
  },
};

export default function TermsPage() {
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
              Legal & Compliance
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-4 text-xs font-semibold">
          <Link href="/privacy" className="text-slate-600 hover:text-[#0f172a] transition-colors hidden sm:inline">
            Privacy Policy
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
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-4 border border-slate-200">
              <Scale className="w-3.5 h-3.5 text-blue-600" />
              <span>Terms of Service Agreement</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
              Terms & Conditions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
              Last Updated: October 10, 2026 • Version 2.2 • Rupal Tech Solutions Ltd
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#0f172a] flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-xs">1</span>
              <span>Acceptance of Terms</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              By accessing, browsing, or creating a conference room on <strong>Rupal Convene</strong> (&quot;the Service&quot;), operated by <strong>Rupal Tech Solutions Ltd</strong> (&quot;Rupal&quot;, &quot;we&quot;, &quot;us&quot;), you agree to be bound by these Terms and Conditions and our Privacy Policy. If you are entering into this agreement on behalf of a company or legal entity, you represent that you have the authority to bind such entity.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#0f172a] flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-xs">2</span>
              <span>Description of Service</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Rupal Convene provides high-performance WebRTC-based video conferencing, audio mesh communications, collaborative Code Workspaces, Architecture Whiteboards, synchronized Pitch Deck Viewers, Deal Room sandboxes, and AI-assisted meeting note generation.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#0f172a] flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-xs">3</span>
              <span>Host Responsibilities & Room Security</span>
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p>When you host a conference room:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>You are responsible for managing access permissions (Green Room admissions, stage participant promotions, and deal room passwords).</li>
                <li>You agree not to distribute room codes or confidential session passwords to unauthorized parties.</li>
                <li>You retain full administrative rights to remove, mute, or ban disruptive participants from your active session.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#0f172a] flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-xs">4</span>
              <span>Acceptable Use Policy</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              You agree that you will NOT use the Service to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <li>Upload or execute malicious software, viruses, or unauthorized scripts inside the collaborative Code Workspace.</li>
              <li>Record or broadcast other participants without their explicit, informed consent under applicable state or federal law.</li>
              <li>Transmit obscene, abusive, defamatory, or infringing content over video, audio, or chat streams.</li>
              <li>Attempt to reverse-engineer, decompile, or bypass the WebRTC signaling layer or authentication mechanisms.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#0f172a] flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-xs">5</span>
              <span>Intellectual Property & Customer Content</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong>You retain 100% ownership and copyright</strong> of all source code, software architecture diagrams, slides, text messages, and meeting notes produced during your conference sessions. Rupal claims zero proprietary rights or licenses over your proprietary deliverables.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#0f172a] flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-xs">6</span>
              <span>Service Availability & SLA</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We strive to maintain a 99.9% uptime for the signaling infrastructure and peer mesh relay network. However, the Service is provided &quot;as is&quot; without warranties of uninterrupted service resulting from ISP network partitions, local firewall restrictions, or device hardware incompatibilities.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#0f172a] flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-xs">7</span>
              <span>Limitation of Liability</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To the maximum extent permitted by applicable law, Rupal Tech Solutions Ltd shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#0f172a] flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-xs">8</span>
              <span>Corporate Contact Information</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Inquiries regarding these terms should be directed to our corporate legal team:
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
              <p><strong>Entity:</strong> Rupal Tech Solutions Ltd</p>
              <p><strong>Email:</strong> legal@rupalconvene.com / support@rupalconvene.com</p>
              <p><strong>Telephone:</strong> +234 (0) 1 295 4480 / +44 20 7946 0912</p>
              <p><strong>Registered Address:</strong> 12 Broad Street, Victoria Island, Lagos, Nigeria.</p>
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
          <Link href="/privacy" className="hover:text-[#0f172a]">Privacy Policy</Link>
          <span>•</span>
          <Link href="/docs" className="hover:text-[#0f172a]">API & Docs</Link>
          <span>•</span>
          <Link href="/" className="hover:text-[#0f172a]">Return Home</Link>
        </div>
      </footer>
    </div>
  );
}
