import { Participant, PitchSlide, AgendaItem, CodeFile, WhiteboardElement, ChatMessage, MeetingMinutes } from '@/types/meeting';
import { generateInitialsAvatar } from './avatar';

export const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'user-self',
    name: 'You (Host)',
    email: 'host@rupalconvene.io',
    role: 'tech-lead',
    avatar: generateInitialsAvatar('You Host'),
    organization: 'Rupal Tech Solutions',
    jobTitle: 'Meeting Host & Lead Engineer',
    isMuted: false,
    isVideoOff: false,
    isScreenSharing: false,
    isSpeaking: false,
    handRaised: false,
    inGreenRoom: false,
    audioLevel: 0,
  }
];

export const INITIAL_FILES: CodeFile[] = [
  {
    id: 'index-ts',
    name: 'index.ts',
    language: 'typescript',
    isEntrypoint: true,
    content: `// Rupal Convene In-Call Code Sandbox
// Execute TypeScript, Python & Go collaboratively in real-time

export async function main() {
  const session = {
    platform: "Rupal Convene",
    encryption: "DTLS-SRTP 256-bit AES",
    timestamp: new Date().toISOString()
  };

  console.log("Runtime active for session:", session.platform);
  console.log("Connected with sub-2ms audio/video latency.");
  return session;
}

main();`,
  },
  {
    id: 'benchmark-py',
    name: 'benchmark.py',
    language: 'python',
    content: `# Rupal Convene Python Benchmark Runner
import time

def run_performance_test():
    start = time.perf_counter()
    data = [x ** 2 for x in range(10000)]
    elapsed_ms = (time.perf_counter() - start) * 1000
    print(f"Computed 10,000 operations in {elapsed_ms:.2f}ms")
    return elapsed_ms

run_performance_test()`,
  }
];

export const INITIAL_WHITEBOARD_ELEMENTS: WhiteboardElement[] = [];

export const INITIAL_SLIDES: PitchSlide[] = [
  {
    id: 1,
    title: 'Rupal Convene Platform Session',
    category: 'Executive Overview',
    subtitle: 'Strategic Technical Architecture & Partner Sync',
    bulletPoints: [
      'Welcome to Rupal Convene conference suite.',
      'Real-time WebRTC audio/video mesh with 4K screen sharing.',
      'In-call collaborative code sandbox and system whiteboard.',
      'Confidential presentation deck viewer with dynamic watermarking.',
    ],
    metrics: [
      { label: 'Audio Latency', value: '< 120ms', change: 'Opus 48kHz', positive: true },
      { label: 'Security', value: '256-bit', change: 'E2EE AES', positive: true },
      { label: 'Resolution', value: '4K 60FPS', change: 'AV1 / VP9', positive: true },
      { label: 'AI Copilot', value: 'Gemini 1.5', change: 'Real-time', positive: true },
    ],
    speakerNotes: 'Start by welcoming all team members and business partners to the conference session.',
  },
  {
    id: 2,
    title: 'Architecture & Scalability Roadmap',
    category: 'System Architecture',
    subtitle: 'Distributed Edge Mesh with Selective Forwarding Units (SFU)',
    bulletPoints: [
      'Edge clustering for low-latency peer media streaming.',
      'Automated fallback between P2P mesh and SFU based on participant count.',
      'Integrated In-Call IDE for live testing and technical evaluations.',
      'Hardware-accelerated dynamic privacy watermarking on presentations.',
    ],
    metrics: [
      { label: 'Edge Nodes', value: '24 Regions', change: 'Global', positive: true },
      { label: 'Packet Loss', value: '< 0.05%', change: 'FEC Enabled', positive: true },
    ],
    speakerNotes: 'Highlight the reliability and security of the distributed WebRTC media topology.',
  }
];

export const INITIAL_AGENDA: AgendaItem[] = [
  {
    id: 'agenda-1',
    title: 'Welcome, Introductions & Platform Setup',
    time: '00:00',
    durationMinutes: 10,
    speakerIds: ['user-self'],
    status: 'current',
    track: 'Joint',
    description: 'Verify audio/video devices, review session goals, and introduce participants.',
  },
  {
    id: 'agenda-2',
    title: 'Technical Architecture & Code Review',
    time: '00:10',
    durationMinutes: 25,
    speakerIds: ['user-self'],
    status: 'upcoming',
    track: 'Engineering',
    description: 'Collaborative live code review in the In-Call IDE and interactive whiteboard design.',
  },
  {
    id: 'agenda-3',
    title: 'Strategic Priorities, Q&A & Action Items',
    time: '00:35',
    durationMinutes: 15,
    speakerIds: ['user-self'],
    status: 'upcoming',
    track: 'Executive',
    description: 'Review AI-generated meeting minutes, confirm action items, and address questions.',
  }
];

export const INITIAL_CHAT: ChatMessage[] = [
  {
    id: 'msg-system-init',
    senderId: 'system',
    senderName: 'Rupal Convene',
    senderRole: 'host',
    senderAvatar: generateInitialsAvatar('Rupal Convene'),
    text: 'Conference room initialized. End-to-end DTLS-SRTP 256-bit encryption active.',
    timestamp: '00:00',
    type: 'system',
  }
];

export const INITIAL_MINUTES: MeetingMinutes = {
  id: 'min-init',
  generatedAt: 'Ready to capture',
  executiveSummary: 'Conference session in progress. Gemini AI Copilot will automatically analyze conversation and generate structured minutes, decisions, and action items.',
  keyTechnicalDecisions: [
    'Audio/Video streaming secured via DTLS-SRTP 256-bit AES encryption.',
    'Collaborative In-Call IDE ready for live multi-language code execution.'
  ],
  actionItems: [
    {
      id: 'act-1',
      task: 'Review conference objectives and confirm agenda topics',
      assignee: 'Host',
      assigneeRole: 'tech-lead',
      priority: 'high',
      due: 'End of Call',
      status: 'pending',
    }
  ],
  risksAndBlockers: [],
  investorHighlights: [
    'Live meeting intelligence active with automated debrief export.'
  ],
};
