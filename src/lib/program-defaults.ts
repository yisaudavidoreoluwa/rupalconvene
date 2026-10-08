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
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    role: 'Principal Architect @ CloudMesh',
    talkTitle: 'Sub-second Serverless P2P Streaming in Production',
    topicBadge: 'WebRTC & Media',
    durationMinutes: 5,
    status: 'speaking',
  },
  {
    id: 'speaker-2',
    name: 'Carlos Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
    role: 'Staff Engineer @ Vertex Systems',
    talkTitle: 'Building Resilient Microservices with Distributed Sagas',
    topicBadge: 'System Design',
    durationMinutes: 5,
    status: 'upcoming',
  },
  {
    id: 'speaker-3',
    name: 'Dr. Aisha Patel',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
    role: 'ML Lead @ Anthropic Labs',
    talkTitle: 'Real-time On-device Reasoning with Gemini Flash Models',
    topicBadge: 'Artificial Intelligence',
    durationMinutes: 5,
    status: 'upcoming',
  },
  {
    id: 'speaker-4',
    name: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
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
  { studentId: 'stu-1', studentName: 'Alex Rivera', studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&h=128&q=80', email: 'alex@stanford.edu', isCheckedIn: true, checkInTime: '09:02 AM' },
  { studentId: 'stu-2', studentName: 'Jordan Lee', studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&h=128&q=80', email: 'jordan@mit.edu', isCheckedIn: true, checkInTime: '08:58 AM' },
  { studentId: 'stu-3', studentName: 'Priya Sharma', studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&h=128&q=80', email: 'priya@berkeley.edu', isCheckedIn: true, checkInTime: '09:05 AM' },
  { studentId: 'stu-4', studentName: 'Mateo Gomez', studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&h=128&q=80', email: 'mateo@cmu.edu', isCheckedIn: false },
  { studentId: 'stu-5', studentName: 'Zoe Katsaros', studentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=128&h=128&q=80', email: 'zoe@oxford.ac.uk', isCheckedIn: true, checkInTime: '09:01 AM' },
];

export const INITIAL_PROGRAMS: ConveneProgram[] = [
  {
    id: 'prog-hackathon-2026',
    roomCode: 'RUPAL-980-HACK',
    inviteCode: 'INV-80HACK',
    title: 'Global AI & Cloud Infrastructure Hackathon',
    description: 'Competitive 48-hour build sprint. 30+ development teams building next-gen autonomous agent tooling and distributed real-time cloud infrastructure.',
    category: 'hackathon',
    hostId: 'host-elena',
    hostName: 'Elena Rostova',
    hostRole: 'Managing Partner @ Syndicate VC',
    hostAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
    scheduledDate: '2026-10-15',
    scheduledTime: '10:00',
    durationMinutes: 2880, // 48h
    status: 'live',
    tags: ['AI Agents', 'Distributed Mesh', '48h Sprint', '$50k Prizes'],
    attendeesCount: 64,
    hackathonConfig: {
      sprintHours: 48,
      endsAt: new Date(Date.now() + 28 * 3600 * 1000).toISOString(),
      squads: DEFAULT_HACKATHON_SQUADS,
      projects: DEFAULT_HACKATHON_PROJECTS,
      isSubmissionsOpen: true,
    },
    createdAt: '2026-10-01T12:00:00Z',
  },
  {
    id: 'prog-workshop-webrtc',
    roomCode: 'RUPAL-420-LABS',
    inviteCode: 'INV-20LABS',
    title: 'Hands-on Code Lab: Zero-Copy WebRTC & Audio Analysers',
    description: 'In-depth code labs and system tutorials with step-by-step interactive exercises, live code copying to the IDE, and instructor checkpoint pushes.',
    category: 'workshop',
    hostId: 'host-marcus',
    hostName: 'Marcus Vance',
    hostRole: 'Principal Architect @ Rupal Systems',
    hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
    scheduledDate: '2026-10-16',
    scheduledTime: '14:00',
    durationMinutes: 120,
    status: 'scheduled',
    tags: ['Code Lab', 'WebRTC', 'TypeScript', 'Hands-on'],
    attendeesCount: 38,
    workshopConfig: {
      labTitle: 'Building Resilient Media Streams & 30+ Peer Mesh',
      activeStepIndex: 1,
      steps: DEFAULT_WORKSHOP_STEPS,
      helpRequests: [],
    },
    createdAt: '2026-10-02T15:00:00Z',
  },
  {
    id: 'prog-meetup-cloud',
    roomCode: 'RUPAL-710-MEET',
    inviteCode: 'INV-10MEET',
    title: 'Silicon Valley Cloud & Systems Developer Meetup',
    description: 'Community tech gathering featuring 5-minute lightning talks, live upvoted Q&A, and virtual reaction soundboards with industry leaders.',
    category: 'meetup',
    hostId: 'host-sarah',
    hostName: 'Sarah Jenkins',
    hostRole: 'Director of Developer Relations',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    scheduledDate: '2026-10-18',
    scheduledTime: '18:30',
    durationMinutes: 90,
    status: 'scheduled',
    tags: ['Lightning Talks', 'Community Q&A', 'Microservices', 'Networking'],
    attendeesCount: 82,
    meetupConfig: {
      currentSpeakerId: 'speaker-1',
      speakers: DEFAULT_MEETUP_SPEAKERS,
      lightningSecondsRemaining: 245,
      isTimerRunning: true,
    },
    createdAt: '2026-10-03T10:00:00Z',
  },
  {
    id: 'prog-broadcast-summit',
    roomCode: 'RUPAL-100-CAST',
    inviteCode: 'INV-00CAST',
    title: 'Global Tech Keynote & Virtual Broadcast Town Hall',
    description: 'Global technical webinar and executive town hall with audience vs stage separation, live audience polling, and stage promotion.',
    category: 'broadcast',
    hostId: 'host-david',
    hostName: 'David Kim',
    hostRole: 'Staff Engineer & VP Tech Strategy',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
    scheduledDate: '2026-10-20',
    scheduledTime: '11:00',
    durationMinutes: 60,
    status: 'scheduled',
    tags: ['Webinar', 'Town Hall', 'Live Polling', 'Broadcast Stage'],
    attendeesCount: 342,
    broadcastConfig: {
      viewerCount: 342,
      stageHostIds: ['host-david', 'host-elena'],
      polls: DEFAULT_BROADCAST_POLLS,
    },
    createdAt: '2026-10-04T08:00:00Z',
  },
  {
    id: 'prog-bootcamp-cohort',
    roomCode: 'RUPAL-550-BOOT',
    inviteCode: 'INV-50BOOT',
    title: 'University Full-Stack & Systems Engineering Bootcamp',
    description: 'Cohort-based university student incubator with live roll-call attendance check-in, syllabus module progression, and verifiable completion certificates.',
    category: 'bootcamp',
    hostId: 'host-aisha',
    hostName: 'Dr. Aisha Patel',
    hostRole: 'Professor & Lead Instructor',
    hostAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
    scheduledDate: '2026-10-22',
    scheduledTime: '09:00',
    durationMinutes: 180,
    status: 'scheduled',
    tags: ['University Cohort', 'Roll Call', 'Syllabus', 'Certificates'],
    attendeesCount: 28,
    bootcampConfig: {
      cohortName: 'Fall 2026 Advanced Cloud Cohort #4',
      modules: DEFAULT_BOOTCAMP_MODULES,
      attendance: DEFAULT_BOOTCAMP_ATTENDANCE,
    },
    createdAt: '2026-10-05T09:00:00Z',
  },
  {
    id: 'prog-architecture-demo',
    roomCode: 'RUPAL-880-DEMO',
    inviteCode: 'INV-80DEMO',
    title: 'Enterprise Architecture Demo & Executive Symposium',
    description: 'High-stakes executive symposium and industry tech day. Pre-loaded microservices blueprints, executive deal room document vault, and technical spec exporter.',
    category: 'architecture-demo',
    hostId: 'host-marcus',
    hostName: 'Marcus Vance',
    hostRole: 'Principal Enterprise Architect',
    hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
    scheduledDate: '2026-10-25',
    scheduledTime: '15:00',
    durationMinutes: 75,
    status: 'scheduled',
    tags: ['System Topology', 'Executive Vault', 'Deal Room', 'Architecture Specs'],
    attendeesCount: 22,
    architectureConfig: {
      activeTopologyId: 'topo-microservices',
      specSummary: 'Distributed high-concurrency event-driven architecture featuring API Gateway, Redis clustering, CockroachDB distributed ledger, and zero-trust DTLS-SRTP signaling.',
    },
    createdAt: '2026-10-06T14:00:00Z',
  },
];
