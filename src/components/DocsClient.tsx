'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  ArrowLeft, 
  Zap, 
  Key, 
  Cpu, 
  Terminal, 
  ShieldCheck, 
  Sparkles, 
  Code2, 
  Copy, 
  Check, 
  Search,
  ExternalLink,
  ChevronRight,
  Play
} from 'lucide-react';
import { UserProfileMenu } from '@/components/UserProfileMenu';
import { AuthProviderComponent } from '@/context/AuthContext';
import { AuthModal } from '@/components/AuthModal';

export default function DocsPage() {
  return (
    <AuthProviderComponent>
      <DocsContent />
      <AuthModal />
    </AuthProviderComponent>
  );
}

function DocsContent() {
  const [activeTab, setActiveTab] = useState('quickstart');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const navItems = [
    { id: 'quickstart', label: 'Platform Overview', icon: Zap },
    { id: 'auth', label: 'Google, GitHub & Discord OAuth', icon: Key },
    { id: 'api', label: 'REST API & SQLite Database', icon: Code2 },
    { id: 'storage', label: 'File Storage & Deck Uploads', icon: ShieldCheck },
    { id: 'webrtc', label: 'WebRTC Mesh & SFU Engine', icon: Cpu },
    { id: 'ide', label: 'In-Call Developer IDE', icon: Terminal },
    { id: 'watermark', label: 'Dynamic Pitch Watermarking', icon: ShieldCheck },
    { id: 'gemini', label: 'Gemini AI Live Copilot', icon: Sparkles },
    { id: 'sdk', label: 'Rupal Convene Web SDK', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-[#0f172a] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              R
            </div>
            <div>
              <span className="font-bold text-[#0f172a] text-sm tracking-tight group-hover:text-blue-600 transition-colors">
                Rupal Convene
              </span>
              <span className="text-[10px] text-slate-400 block -mt-0.5">Developer Hub</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-600">
            <Link href="/" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Conference Room</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <UserProfileMenu />
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Left Navigation */}
        <aside className="w-64 border-r border-slate-100 p-6 hidden lg:block sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            Documentation Index
          </div>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left transition-all ${
                    isActive
                      ? 'bg-[#0f172a] text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-[#0f172a]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 p-4 rounded-2xl bg-blue-50/60 border border-blue-100/80">
            <h4 className="text-xs font-bold text-blue-900 mb-1">Need Enterprise Deployment?</h4>
            <p className="text-[11px] text-blue-700 leading-relaxed mb-3">
              Deploy on-premise WebRTC media nodes with custom TURN servers and compliance policies.
            </p>
            <a
              href="mailto:support@rupalconvene.com"
              className="inline-block text-[11px] font-semibold text-blue-800 hover:underline"
            >
              Contact Rupal Tech Solutions →
            </a>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 space-y-1.5">
            <p className="font-semibold text-slate-600">Rupal Tech Solutions Ltd</p>
            <p>12 Broad St, Lagos • 160 Kemp House, London</p>
            <div className="flex items-center space-x-2 pt-1 text-slate-500">
              <Link href="/privacy" className="hover:text-blue-600">Privacy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-blue-600">Terms</Link>
              <span>•</span>
              <Link href="/" className="hover:text-blue-600">Home</Link>
            </div>
          </div>
        </aside>

        {/* Central Content */}
        <main className="flex-1 p-6 md:p-10 max-w-4xl">
          {activeTab === 'quickstart' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Overview</span>
                <h1 className="text-3xl font-extrabold text-[#0f172a] mt-1 mb-3">Rupal Convene Platform Overview</h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Rupal Convene is an all-in-one conferencing environment built for technical engineering teams, startup founders, and syndicate partners. Unlike generic video meeting software, Rupal Convene embeds a collaborative in-call developer IDE, cloud architecture whiteboard, and confidential pitch deck viewer protected by dynamic watermarks.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <h3 className="text-sm font-bold text-[#0f172a] mb-1">For Engineering Teams</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Collaborate on live code during system design interviews, deploy test snippets in an isolated sandbox, and diagram Kubernetes microservices in real-time.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <h3 className="text-sm font-bold text-[#0f172a] mb-1">For Business Syndicates</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Present confidential pitch decks with dynamic IP and timestamp watermarking to prevent unauthorized leaks, backed by automated Gemini meeting minutes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'auth' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Identity</span>
                <h1 className="text-3xl font-extrabold text-[#0f172a] mt-1 mb-3">Google, GitHub & Discord OAuth</h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Authenticate your participants with OAuth 2.0 PKCE. Rupal Convene natively supports Google Workspace, GitHub developer accounts, and Discord developer syndicates with instantaneous profile synchronization.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                <h3 className="text-sm font-bold text-[#0f172a]">Authentication Flow Architecture</h3>
                <div className="relative p-4 rounded-xl bg-[#0f172a] text-slate-200 font-mono text-xs overflow-x-auto">
                  <button
                    onClick={() => copyText(`const { loginWithProvider } = useAuth();
await loginWithProvider('google');`, 'oauth-code')}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-300"
                  >
                    {copiedId === 'oauth-code' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <pre className="text-slate-300">
{`// Trigger OAuth Provider Login
import { useAuth } from '@/context/AuthContext';

export function LoginButtons() {
  const { loginWithProvider } = useAuth();

  return (
    <div className="flex gap-2">
      <button onClick={() => loginWithProvider('google')}>Google</button>
      <button onClick={() => loginWithProvider('github')}>GitHub</button>
      <button onClick={() => loginWithProvider('discord')}>Discord</button>
    </div>
  );
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Endpoints</span>
                <h1 className="text-3xl font-extrabold text-[#0f172a] mt-1 mb-3">REST API & SQLite Database</h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Rupal Convene features a high-performance backend backed by embedded SQLite (<code className="text-xs font-mono bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded">node:sqlite</code>). State for rooms, participants, code files, and messages are automatically preserved with sub-millisecond query execution.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">POST /api/rooms</span>
                    <span className="text-[11px] text-slate-400">Initialize conference room</span>
                  </div>
                  <p className="text-xs text-slate-600">Create an active conference session with initial code buffer and WebRTC signaling tokens.</p>
                  <div className="p-3 rounded-xl bg-[#0f172a] text-slate-200 font-mono text-[11px] overflow-x-auto">
{`// Request Body
{
  "roomCode": "dev-alpha-99",
  "title": "System Architecture Review",
  "hostId": "usr_dev_10",
  "isWatermarkActive": true
}`}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">GET /api/rooms/[code]</span>
                    <span className="text-[11px] text-slate-400">Fetch room state</span>
                  </div>
                  <p className="text-xs text-slate-600">Retrieves room details, active participants, code files, and chat messages in a single response.</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">POST /api/rooms/[code]/messages</span>
                    <span className="text-[11px] text-slate-400">Persist chat message</span>
                  </div>
                  <p className="text-xs text-slate-600">Send standard chat messages or code snippet messages directly to the room database.</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">POST /api/rooms/[code]/files</span>
                    <span className="text-[11px] text-slate-400">Sync collaborative code</span>
                  </div>
                  <p className="text-xs text-slate-600">Updates room code files across all participants, supporting TypeScript, Python, and Go.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">File System</span>
                <h1 className="text-3xl font-extrabold text-[#0f172a] mt-1 mb-3">File Storage & Deck Uploads</h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Upload confidential pitch decks, investor tear-sheets, and whiteboard diagrams. Files are verified, saved to disk, and indexed in the SQLite <code className="text-xs font-mono bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded">storage_files</code> catalog.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">POST /api/storage/upload</span>
                  <span className="text-[11px] text-slate-400">Multipart upload (max 50MB)</span>
                </div>
                <p className="text-xs text-slate-600">Handles PDF decks, images (PNG, JPEG, WebP), and documents. Automatically parses and updates active slides in real-time.</p>
                <div className="p-3 rounded-xl bg-[#0f172a] text-slate-200 font-mono text-[11px] overflow-x-auto">
{`const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('roomId', 'room_abc123');

const res = await fetch('/api/storage/upload', {
  method: 'POST',
  body: formData
});
const data = await res.json();
// => { success: true, url: "/uploads/file_xyz.pdf", file: { originalName: "deck.pdf" } }`}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'webrtc' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Streaming</span>
                <h1 className="text-3xl font-extrabold text-[#0f172a] mt-1 mb-3">WebRTC Mesh & SFU Engine</h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Real-time audio and video are negotiated via standard RTCPeerConnection with STUN/TURN failover. Opus audio streams at 48kHz with active echo cancellation, while VP9/AV1 video adapts dynamically based on network telemetry.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'ide' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Developer Sandbox</span>
                <h1 className="text-3xl font-extrabold text-[#0f172a] mt-1 mb-3">In-Call Developer IDE</h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Execute TypeScript, Python, and Go code in real-time during meetings. Benchmarks and terminal output are shared across all connected room participants with zero lag.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'watermark' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Security</span>
                <h1 className="text-3xl font-extrabold text-[#0f172a] mt-1 mb-3">Dynamic Pitch Watermarking</h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Pitch decks, cap tables, and financial projections feature an invisible or visible diagonal watermark containing the viewer's verified identity, IP address, and timestamp to prevent unauthorized leaks.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'gemini' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">AI Copilot</span>
                <h1 className="text-3xl font-extrabold text-[#0f172a] mt-1 mb-3">Gemini AI Live Copilot</h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Powered by Gemini 1.5 Flash, the copilot continuously monitors live conversation captions and compiles executive summaries, action item checklists, and technical decisions.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'sdk' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">SDK Reference</span>
                <h1 className="text-3xl font-extrabold text-[#0f172a] mt-1 mb-3">Rupal Convene Web SDK</h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Embed full conference calls, collaborative IDEs, and deal rooms into your own web applications using <code className="text-xs font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded">@rupal/convene-sdk</code>.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
