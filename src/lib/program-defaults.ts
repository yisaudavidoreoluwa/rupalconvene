import { 
  ProgramCategory, 
  ConveneProgram, 
  HackathonSquad, 
  HackathonProject, 
  WorkshopLabStep, 
  MeetupSpeaker, 
  BroadcastPoll, 
  BootcampModule, 
  BootcampAttendance 
} from '@/types/program';
import { generateInitialsAvatar } from './avatar';

export const DEFAULT_HACKATHON_SQUADS: HackathonSquad[] = [
  {
    id: 'squad-alpha',
    name: 'Squad Alpha (AI Agents)',
    leadName: 'Alex Vance',
    membersCount: 4,
    projectTitle: 'Antigravity Autonomous Code Reviewer',
    track: 'Generative AI',
    avatarColor: 'bg-blue-600',
  },
  {
    id: 'squad-beta',
    name: 'Squad Beta (Infra & Mesh)',
    leadName: 'Sophia Chen',
    membersCount: 3,
    projectTitle: 'Zero-Copy WebRTC Edge Mesh',
    track: 'Distributed Systems',
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 'squad-gamma',
    name: 'Squad Gamma (DevEx)',
    leadName: 'Marcus Vance',
    membersCount: 4,
    projectTitle: 'Instant Visual Diff & Architecture Staging',
    track: 'Developer Experience',
    avatarColor: 'bg-indigo-600',
  },
  {
    id: 'squad-delta',
    name: 'Squad Delta (FinTech)',
    leadName: 'David Kim',
    membersCount: 3,
    projectTitle: 'Quantum Safe DTLS Paywall',
    track: 'FinTech & Security',
    avatarColor: 'bg-amber-600',
  },
];

export const DEFAULT_HACKATHON_PROJECTS: HackathonProject[] = [
  {
    id: 'proj-1',
    squadName: 'Squad Alpha (AI Agents)',
    projectTitle: 'Antigravity Autonomous Code Reviewer',
    tagline: 'Multi-agent pair programmer analyzing PRs with sub-second feedback',
    githubUrl: 'https://github.com/rupal-labs/antigravity-reviewer',
    demoUrl: 'https://antigravity-review.vercel.app',
    techStack: ['Next.js 16', 'WebRTC', 'Gemini 2.5 Flash', 'TypeScript'],
    submittedAt: '16:45',
    scores: {
      innovation: 9.5,
      technical: 9.2,
      uiux: 9.0,
      impact: 9.4,
    },
    totalScore: 9.28,
  },
  {
    id: 'proj-2',
    squadName: 'Squad Beta (Infra & Mesh)',
    projectTitle: 'Zero-Copy WebRTC Edge Mesh',
    tagline: 'High-throughput P2P media routing with sub-10ms latency',
    githubUrl: 'https://github.com/rupal-labs/edge-mesh-p2p',
    demoUrl: 'https://edge-mesh.live',
    techStack: ['Rust', 'WebAssembly', 'DTLS-SRTP', 'Next.js'],
    submittedAt: '17:10',
    scores: {
      innovation: 9.0,
      technical: 9.8,
      uiux: 8.5,
      impact: 9.1,
    },
    totalScore: 9.10,
  },
];

export const DEFAULT_WORKSHOP_STEPS: WorkshopLabStep[] = [
  {
    id: 'step-1',
    stepNumber: 1,
    title: 'Initialize Secure WebRTC Peer Connection',
    description: 'Establish standard STUN/TURN server configuration with modern iceCandidatePoolSize to prevent audio/video renegotiation delay.',
    codeSnippet: `// 1. Establish RTCPeerConnection with STUN iceServers
const config: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ],
  iceCandidatePoolSize: 10
};

const peerConnection = new RTCPeerConnection(config);
console.log('[WebRTC Lab] Peer connection initialized successfully');`,
    language: 'typescript',
    targetFile: 'src/lib/webrtc.ts',
    expectedOutput: 'Peer connection initialized with 10 ICE candidate pools.',
    isCompleted: true,
  },
  {
    id: 'step-2',
    stepNumber: 2,
    title: 'Attach Audio Analyser for Active Speaker Detection',
    description: 'Use the Web Audio API AnalyserNode to sample frequency bin data and calculate real-time speech amplitude without network transmission.',
    codeSnippet: `// 2. Web Audio Analyser for Speaking Detection
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 256;
analyser.smoothingTimeConstant = 0.5;

const source = audioCtx.createMediaStreamSource(localStream);
source.connect(analyser);

const dataArray = new Uint8Array(analyser.frequencyBinCount);
function checkAudioLevel() {
  analyser.getByteFrequencyData(dataArray);
  const average = dataArray.reduce((acc, v) => acc + v, 0) / dataArray.length;
  const isSpeaking = average > 18;
  return { average, isSpeaking };
}`,
    language: 'typescript',
    targetFile: 'src/hooks/useAudioDetection.ts',
    expectedOutput: 'Speech detection threshold calibrated at > 18dB average.',
    isCompleted: false,
  },
  {
    id: 'step-3',
    stepNumber: 3,
    title: 'Adaptive Video Grid Calculation',
    description: 'Implement dynamic CSS Grid classes that scale gracefully from 1 participant to 30+ attendees with multi-page pagination.',
    codeSnippet: `// 3. Adaptive Grid Class Helper
export function getAdaptiveGrid(count: number): string {
  if (count <= 1) return 'grid-cols-1 grid-rows-1 max-w-4xl mx-auto';
  if (count === 2) return 'grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1';
  if (count <= 4) return 'grid-cols-2 grid-rows-2';
  if (count <= 6) return 'grid-cols-2 md:grid-cols-3 grid-rows-3 md:grid-rows-2';
  if (count <= 9) return 'grid-cols-3 grid-rows-3';
  return 'grid-cols-3 md:grid-cols-4 grid-rows-4';
}`,
    language: 'typescript',
    targetFile: 'src/components/AdaptiveGrid.tsx',
    expectedOutput: 'Dynamic CSS class generator compiled.',
    isCompleted: false,
  },
  {
    id: 'step-4',
    stepNumber: 4,
    title: 'Deploy to Edge Infrastructure',
    description: 'Verify production bundle and publish zero-trust WebRTC signaling layer with automated TLS certification.',
    codeSnippet: `// 4. Verify Edge Health Status
const response = await fetch('/api/rooms/verify-edge', {
  headers: { 'Authorization': \`Bearer \${authToken}\` }
});
const health = await response.json();
console.log('Edge Status:', health.status);`,
    language: 'typescript',
    targetFile: 'src/lib/edge.ts',
    expectedOutput: 'Health: 200 OK (Latency: 8ms)',
    isCompleted: false,
  },
];

export const DEFAULT_MEETUP_SPEAKERS: MeetupSpeaker[] = [
  {
    id: 'speaker-1',
    name: 'Sarah Chen',
    avatar: generateInitialsAvatar('Sarah Chen'),
    role: 'Principal Architect @ CloudMesh',
    talkTitle: 'Sub-second Serverless P2P Streaming in Production',
    topicBadge: 'WebRTC & Media',
    durationMinutes: 5,
    status: 'speaking',
  },
  {
    id: 'speaker-2',
    name: 'Carlos Rodriguez',
    avatar: generateInitialsAvatar('Carlos Rodriguez'),
    role: 'Staff Engineer @ Vertex Systems',
    talkTitle: 'Building Resilient Microservices with Distributed Sagas',
    topicBadge: 'System Design',
    durationMinutes: 5,
    status: 'upcoming',
  },
  {
    id: 'speaker-3',
    name: 'Dr. Aisha Patel',
    avatar: generateInitialsAvatar('Aisha Patel'),
    role: 'ML Lead @ Anthropic Labs',
    talkTitle: 'Real-time On-device Reasoning with Gemini Flash Models',
    topicBadge: 'Artificial Intelligence',
    durationMinutes: 5,
    status: 'upcoming',
  },
  {
    id: 'speaker-4',
    name: 'Marcus Vance',
    avatar: generateInitialsAvatar('Marcus Vance'),
    role: 'Lead Architect @ Rupal Systems',
    talkTitle: 'Zero-Trust DTLS-SRTP Encryption in Enterprise Meetings',
    topicBadge: 'Security & E2EE',
    durationMinutes: 5,
    status: 'upcoming',
  },
];

export const DEFAULT_BROADCAST_POLLS: BroadcastPoll[] = [
  {
    id: 'poll-1',
    question: 'Which architecture pattern does your engineering team prioritize in 2026?',
    options: [
      { id: 'opt-1', text: 'Distributed Event-Driven Mesh (Kafka/NATS)', votes: 142 },
      { id: 'opt-2', text: 'Modular Monolith with CockroachDB', votes: 88 },
      { id: 'opt-3', text: 'Serverless Edge Functions + WebAssembly', votes: 112 },
      { id: 'opt-4', text: 'Autonomous AI Multi-Agent Orchestration', votes: 94 },
    ],
    totalVotes: 436,
    isActive: true,
  },
  {
    id: 'poll-2',
    question: 'What is your average video conferencing participant scale?',
    options: [
      { id: 'opt-2a', text: 'Small team sync (2 - 8 people)', votes: 65 },
      { id: 'opt-2b', text: 'Cross-functional engineering (10 - 30+ people)', votes: 184 },
      { id: 'opt-2c', text: 'Global All-Hands & Webinars (100 - 1000+ people)', votes: 98 },
    ],
    totalVotes: 347,
    isActive: false,
  }
];

export const DEFAULT_BOOTCAMP_MODULES: BootcampModule[] = [
  {
    id: 'mod-1',
    moduleNumber: 1,
    title: 'Cloud-Native Distributed Systems & Microservices',
    topics: ['API Gateways', 'gRPC vs REST', 'Circuit Breakers', 'Distributed Tracing'],
    isCompleted: true,
  },
  {
    id: 'mod-2',
    moduleNumber: 2,
    title: 'Real-Time Communication: WebSockets, WebRTC & P2P Media',
    topics: ['SDP Offer/Answer Negotiation', 'ICE Candidates', 'Audio Analysers', 'Screen Capture API'],
    isCompleted: true,
  },
  {
    id: 'mod-3',
    moduleNumber: 3,
    title: 'Modern Frontend Architecture: React 19 & Next.js Turbopack',
    topics: ['Server Components', 'Streaming SSR', 'State Machines', 'Tailwind CSS v4'],
    isCompleted: false,
  },
  {
    id: 'mod-4',
    moduleNumber: 4,
    title: 'Capstone Project: High-Performance Collaborative SaaS Suite',
    topics: ['Collaborative Code IDE', 'Interactive Whiteboard', 'Production Security & E2EE'],
    isCompleted: false,
  },
];

export const DEFAULT_BOOTCAMP_ATTENDANCE: BootcampAttendance[] = [
  { studentId: 'stu-1', studentName: 'Alex Rivera', studentAvatar: generateInitialsAvatar('Alex Rivera'), email: 'alex@stanford.edu', isCheckedIn: true, checkInTime: '09:02 AM' },
  { studentId: 'stu-2', studentName: 'Jordan Lee', studentAvatar: generateInitialsAvatar('Jordan Lee'), email: 'jordan@mit.edu', isCheckedIn: true, checkInTime: '08:58 AM' },
  { studentId: 'stu-3', studentName: 'Priya Sharma', studentAvatar: generateInitialsAvatar('Priya Sharma'), email: 'priya@berkeley.edu', isCheckedIn: true, checkInTime: '09:05 AM' },
  { studentId: 'stu-4', studentName: 'Mateo Gomez', studentAvatar: generateInitialsAvatar('Mateo Gomez'), email: 'mateo@cmu.edu', isCheckedIn: false },
  { studentId: 'stu-5', studentName: 'Zoe Katsaros', studentAvatar: generateInitialsAvatar('Zoe Katsaros'), email: 'zoe@oxford.ac.uk', isCheckedIn: true, checkInTime: '09:01 AM' },
];

export const INITIAL_PROGRAMS: ConveneProgram[] = [];
