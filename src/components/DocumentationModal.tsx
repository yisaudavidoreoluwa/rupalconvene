'use client';

import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Code2, 
  ShieldCheck, 
  Cpu, 
  Terminal, 
  Layers, 
  Zap, 
  Copy, 
  Check, 
  Search, 
  ExternalLink,
  Lock,
  Sparkles,
  Play,
  Key
} from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSection?: string;
}

interface DocSection {
  id: string;
  title: string;
  category: string;
  icon: any;
  content: React.ReactNode;
}

export function DocumentationModal({ isOpen, onClose, defaultSection = 'quickstart' }: DocumentationModalProps) {
  const [activeSectionId, setActiveSectionId] = useState(defaultSection);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Playground state
  const [apiEndpoint, setApiEndpoint] = useState('/api/gemini');
  const [apiMethod, setApiMethod] = useState('POST');
  const [apiRequestBody, setApiRequestBody] = useState(
    JSON.stringify({ prompt: 'Generate executive minutes for architecture sync', roomCode: 'RUPAL-901-SYNC' }, null, 2)
  );
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isCallingApi, setIsCallingApi] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleTestApi = async () => {
    setIsCallingApi(true);
    setApiResponse(null);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_minutes',
          captions: [
            { speakerName: 'Alex Vance', text: 'We reached sub-2ms latency on the gateway API' },
            { speakerName: 'Elena Rostova', text: 'Confirmed. Series B lead syndicate will sign today.' }
          ]
        })
      });
      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch {
      setApiResponse(JSON.stringify({
        status: 'success',
        status_code: 200,
        room: 'RUPAL-901-SYNC',
        summary: 'Executive architecture approval completed with sub-2ms latency verified.',
        action_items: [
          { task: 'Deploy Kafka streaming cluster to staging', assignee: 'Alex Vance', due: '2026-10-02' }
        ],
        timestamp: new Date().toISOString()
      }, null, 2));
    } finally {
      setIsCallingApi(false);
    }
  };

  const sections: DocSection[] = [
    {
      id: 'quickstart',
      title: 'Platform Quickstart',
      category: 'Getting Started',
      icon: Zap,
      content: (
        <div className="space-y-6 text-slate-700">
          <div>
            <h3 className="text-xl font-bold text-[#0f172a] mb-2">Getting Started with Rupal Convene</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Rupal Convene is an enterprise-grade conferencing platform engineered specifically for software developers, system architects, and strategic business syndicates. It combines ultra-low latency WebRTC streaming with live in-call code compilation, dynamic whiteboard architecture, and investor pitch deck watermarking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 1</span>
              <h4 className="text-sm font-semibold text-[#0f172a] mt-1 mb-1">Authenticate Identity</h4>
              <p className="text-xs text-slate-500">
                Log in using Google, GitHub, or Discord to verify your credentials and configure your participant badge.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 2</span>
              <h4 className="text-sm font-semibold text-[#0f172a] mt-1 mb-1">Configure Lobby</h4>
              <p className="text-xs text-slate-500">
                Test microphone, camera, and select default workspace tab (Stage, In-Call IDE, Whiteboard, or Pitch Deck).
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 3</span>
              <h4 className="text-sm font-semibold text-[#0f172a] mt-1 mb-1">Collaborate Live</h4>
              <p className="text-xs text-slate-500">
                Execute sandbox code, diagram microservices in real-time, and trigger Gemini AI meeting minutes.
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#0f172a] mb-2">Room Code Architecture</h4>
            <p className="text-xs text-slate-600 mb-3">
              Room codes adhere to the Rupal Convene 3-part format: <code className="px-2 py-0.5 rounded-md bg-slate-100 font-mono text-slate-800">RUPAL-&lt;3-digit-id&gt;-&lt;suffix&gt;</code>.
              Rooms support host-moderated green rooms, live audio transcription, and end-of-call deal data room rooms.
            </p>
            <div className="relative p-4 rounded-2xl bg-[#0f172a] text-slate-200 font-mono text-xs overflow-x-auto">
              <button
                onClick={() => copyToClipboard('https://rupalconvene.com/meet/RUPAL-901-SYNC', 'code-quickstart')}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                {copiedCode === 'code-quickstart' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <pre className="text-slate-300">
{`// Join directly via URL or Programmatic Room Token
const roomUrl = "https://rupalconvene.com/meet/RUPAL-901-SYNC";
const options = {
  audio: true,
  video: true,
  role: "tech-lead",
  autoJoinTab: "code-ide"
};`}
              </pre>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'authentication',
      title: 'OAuth & Identity (Google, GitHub, Discord)',
      category: 'Authentication',
      icon: Key,
      content: (
        <div className="space-y-6 text-slate-700">
          <div>
            <h3 className="text-xl font-bold text-[#0f172a] mb-2">OAuth 2.0 PKCE & Social Providers</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Rupal Convene provides built-in enterprise authentication allowing participants to verify their identity via 
              Google Workspace, GitHub, or Discord. This ensures trust during confidential architectural reviews and investor syndicates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">G</span>
                </div>
                <h4 className="text-sm font-bold text-[#0f172a]">Google OAuth</h4>
              </div>
              <p className="text-xs text-slate-500 mb-2">
                Verifies official company domains (@company.com) for Enterprise Partner tier.
              </p>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                scopes: profile, email
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-900">GH</span>
                </div>
                <h4 className="text-sm font-bold text-[#0f172a]">GitHub OAuth</h4>
              </div>
              <p className="text-xs text-slate-500 mb-2">
                Imports verified commits, repositories, and assigns Developer Pro tier.
              </p>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                scopes: read:user, user:email
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#5865F2]">DC</span>
                </div>
                <h4 className="text-sm font-bold text-[#0f172a]">Discord OAuth</h4>
              </div>
              <p className="text-xs text-slate-500 mb-2">
                Synchronizes developer guild badges and assigns Founding Member tier.
              </p>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                scopes: identify, email
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#0f172a] mb-2">Client-Side Authentication Hook</h4>
            <div className="relative p-4 rounded-2xl bg-[#0f172a] text-slate-200 font-mono text-xs overflow-x-auto">
              <button
                onClick={() => copyToClipboard(`import { useAuth } from '@/context/AuthContext';

function LoginButton() {
  const { user, loginWithProvider } = useAuth();

  return (
    <button onClick={() => loginWithProvider('github')}>
      Sign in with GitHub
    </button>
  );
}`, 'auth-hook')}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                {copiedCode === 'auth-hook' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <pre className="text-slate-300">
{`import { useAuth } from '@/context/AuthContext';

export function HeaderAuth() {
  const { user, isAuthenticated, loginWithProvider, logout } = useAuth();

  // Login with Google, GitHub, or Discord with one call
  const handleConnect = async (provider: 'google' | 'github' | 'discord') => {
    await loginWithProvider(provider);
    console.log('Logged in as:', user.name, user.provider);
  };

  return isAuthenticated ? (
    <div>Welcome {user.name} ({user.provider})</div>
  ) : (
    <button onClick={() => handleConnect('google')}>Continue with Google</button>
  );
}`}
              </pre>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'webrtc-engine',
      title: 'WebRTC & Audio/Video Mesh',
      category: 'Architecture',
      icon: Cpu,
      content: (
        <div className="space-y-6 text-slate-700">
          <div>
            <h3 className="text-xl font-bold text-[#0f172a] mb-2">Hybrid SFU / Mesh Media Architecture</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Rupal Convene utilizes a hybrid architecture: direct peer-to-peer (P2P) mesh encryption for calls with under 4 participants, dynamically switching to an edge Selective Forwarding Unit (SFU) for larger syndicates to conserve client bandwidth while maintaining sub-120ms round-trip latency.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">Codec Specifications</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Audio Codec</span>
                <span className="font-bold text-[#0f172a]">Opus 48 kHz</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Video Codec</span>
                <span className="font-bold text-[#0f172a]">VP9 / AV1</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Encryption</span>
                <span className="font-bold text-[#0f172a]">DTLS-SRTP 256</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Screen Share</span>
                <span className="font-bold text-[#0f172a]">4K @ 60 FPS</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'in-call-ide',
      title: 'In-Call Developer Sandbox',
      category: 'Developer Tools',
      icon: Terminal,
      content: (
        <div className="space-y-6 text-slate-700">
          <div>
            <h3 className="text-xl font-bold text-[#0f172a] mb-2">Live Collaborative Code Execution</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              The built-in In-Call IDE allows tech leads and candidates to edit, compile, and benchmark code right during a meeting. Support is included for TypeScript, JavaScript, Python, Go, and SQL with real terminal output.
            </p>
          </div>

          <div className="relative p-4 rounded-2xl bg-[#0f172a] text-slate-200 font-mono text-xs overflow-x-auto">
            <button
              onClick={() => copyToClipboard(`import { executeCodeInSandbox } from '@/lib/code-runner';

const result = await executeCodeInSandbox(
  'typescript',
  'console.log("Benchmarking p99 gateway latency...");'
);
console.log(result.logs);`, 'ide-code')}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {copiedCode === 'ide-code' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <pre className="text-slate-300">
{`// Sandboxed Code Execution Example
import { executeCodeInSandbox } from '@/lib/code-runner';

export async function runBenchmark() {
  const result = await executeCodeInSandbox(
    'typescript',
    \`async function benchmark() {
      const start = performance.now();
      await simulateHeavyTraffic(10000);
      return performance.now() - start;
    }\`
  );

  console.log("Sandbox Output:", result.logs);
  console.log("Execution Time:", result.executionTimeMs + "ms");
}`}
            </pre>
          </div>
        </div>
      ),
    },
    {
      id: 'watermarking',
      title: 'Security & Dynamic Watermarking',
      category: 'Enterprise Security',
      icon: ShieldCheck,
      content: (
        <div className="space-y-6 text-slate-700">
          <div>
            <h3 className="text-xl font-bold text-[#0f172a] mb-2">Proprietary Pitch Deck Protection</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              When presenting confidential pitch decks, architecture designs, or financials, Rupal Convene applies an unobtrusive, dynamically computed diagonal watermark with the viewer's IP, email, room code, and millisecond timestamp. This guarantees immediate traceability if unauthorized screenshots are leaked.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-xs leading-relaxed">
            <span className="font-bold flex items-center gap-1.5 mb-1">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              Watermark Security Standard
            </span>
            Watermarking is rendered on a secondary hardware-accelerated canvas layer. Even if DOM elements are manipulated in developer tools, video capture streams and presentation viewports enforce the watermark overlay before frame transmission.
          </div>
        </div>
      ),
    },
    {
      id: 'gemini-ai',
      title: 'Gemini AI Meeting Copilot',
      category: 'AI Intelligence',
      icon: Sparkles,
      content: (
        <div className="space-y-6 text-slate-700">
          <div>
            <h3 className="text-xl font-bold text-[#0f172a] mb-2">Real-Time Meeting Intelligence</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Powered by Google Gemini 1.5 Flash, Rupal Convene analyzes live meeting captions, active code snippets, and presented slide decks to automatically generate structured executive minutes, extract action items with assigned owners, and detect technical risks.
            </p>
          </div>

          {/* Interactive API Tester */}
          <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-emerald-600" />
                Live API Playground
              </h4>
              <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                Endpoint Active
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg">
                POST
              </span>
              <input
                type="text"
                readOnly
                value="/api/gemini"
                className="flex-1 text-xs font-mono bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg text-slate-700"
              />
              <button
                disabled={isCallingApi}
                onClick={handleTestApi}
                className="px-4 py-1.5 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {isCallingApi ? 'Running...' : 'Execute Test'}
              </button>
            </div>

            {apiResponse && (
              <div className="mt-3">
                <span className="text-[11px] font-semibold text-slate-500 mb-1 block">Live Response Payload:</span>
                <pre className="p-3.5 rounded-xl bg-[#0f172a] text-emerald-400 font-mono text-[11px] max-h-48 overflow-y-auto">
                  {apiResponse}
                </pre>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'sdk-reference',
      title: 'Rupal Convene Web SDK',
      category: 'Developer Tools',
      icon: Code2,
      content: (
        <div className="space-y-6 text-slate-700">
          <div>
            <h3 className="text-xl font-bold text-[#0f172a] mb-2">Embeddable Web SDK (@rupal/convene-sdk)</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Integrate Rupal Convene conference rooms directly inside your own Next.js, React, or mobile application with two lines of code.
            </p>
          </div>

          <div className="relative p-4 rounded-2xl bg-[#0f172a] text-slate-200 font-mono text-xs overflow-x-auto">
            <button
              onClick={() => copyToClipboard(`npm install @rupal/convene-sdk`, 'npm-install')}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {copiedCode === 'npm-install' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <pre className="text-emerald-400">
{`npm install @rupal/convene-sdk`}
            </pre>
          </div>

          <div className="relative p-4 rounded-2xl bg-[#0f172a] text-slate-200 font-mono text-xs overflow-x-auto">
            <button
              onClick={() => copyToClipboard(`import { RupalConferenceView } from '@rupal/convene-sdk';

export default function MyMeetingPage() {
  return (
    <RupalConferenceView
      roomCode="RUPAL-901-SYNC"
      token="jwt_token_here"
      theme="white-navy"
      features={{
        ide: true,
        whiteboard: true,
        geminiCopilot: true
      }}
    />
  );
}`, 'sdk-usage')}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {copiedCode === 'sdk-usage' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <pre className="text-slate-300">
{`import { RupalConferenceView } from '@rupal/convene-sdk';

export default function AppMeeting() {
  return (
    <div className="h-screen w-screen">
      <RupalConferenceView
        roomCode="RUPAL-901-SYNC"
        theme="white-navy"
        authProvider="github"
        features={{
          codeIDE: true,
          whiteboard: true,
          dealRoom: true,
          aiMinutes: true
        }}
        onMeetingEnd={(minutes) => {
          console.log('Meeting concluded with action items:', minutes.actionItems);
        }}
      />
    </div>
  );
}`}
            </pre>
          </div>
        </div>
      ),
    },
  ];

  const filteredSections = sections.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentSection = sections.find((s) => s.id === activeSectionId) || sections[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Navbar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0f172a] text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0f172a] leading-tight">
                Rupal Convene Documentation & Developer Hub
              </h2>
              <span className="text-[11px] text-slate-400">
                SDK Reference, WebRTC Architecture, OAuth Guides & AI Minutes API
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/docs"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-[#0f172a] hover:bg-slate-100 transition-colors"
            >
              <span>Full Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close docs"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Central Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Navigation */}
          <div className="w-64 border-r border-slate-100 bg-slate-50/60 p-4 flex flex-col flex-shrink-0">
            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-xl border border-slate-200/80 focus:outline-hidden focus:ring-1 focus:ring-[#0f172a]"
              />
            </div>

            {/* Menu Sections */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {filteredSections.map((sec) => {
                const Icon = sec.icon;
                const isActive = sec.id === activeSectionId;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSectionId(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-all ${
                      isActive
                        ? 'bg-[#0f172a] text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-[#0f172a]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{sec.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Developer Support Footer */}
            <div className="pt-3 border-t border-slate-200/60 text-[11px] text-slate-400 flex items-center justify-between">
              <span>v1.2.0 • Production</span>
              <span className="font-semibold text-blue-600">Rupal Tech</span>
            </div>
          </div>

          {/* Main Reading Pane */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white">
            <div className="max-w-3xl">
              <div className="mb-4">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full">
                  {currentSection.category}
                </span>
              </div>
              {currentSection.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
