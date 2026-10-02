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
    id: 'index-html',
    name: 'index.html',
    language: 'html',
    isEntrypoint: true,
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rupal Convene Live Dashboard</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="convene-card">
    <header class="header">
      <div class="brand">
        <span class="dot"></span>
        <h1>Rupal Convene</h1>
      </div>
      <span class="badge">Hypertext Live v3.0</span>
    </header>

    <section class="metrics-grid">
      <div class="metric">
        <span class="label">Media Latency</span>
        <span class="val" id="latency">1.2ms</span>
      </div>
      <div class="metric">
        <span class="label">Encryption</span>
        <span class="val">256-Bit E2EE</span>
      </div>
      <div class="metric">
        <span class="label">AI Copilot</span>
        <span class="val">Gemini 3.5</span>
      </div>
    </section>

    <footer class="footer">
      <button id="pingBtn" class="btn">Ping Network Gateways</button>
      <p id="statusMsg">Connected via WebRTC mesh node #804-SYNC</p>
    </footer>
  </div>

  <script src="app.ts"></script>
</body>
</html>`,
  },
  {
    id: 'styles-css',
    name: 'styles.css',
    language: 'css',
    content: `/* Rupal Convene Minimalist Hypertext Design */
:root {
  --navy: #0f172a;
  --navy-dark: #0a192f;
  --accent: #2563eb;
  --emerald: #10b981;
  --slate: #64748b;
  --bg: #f8fafc;
}

body {
  margin: 0;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

.convene-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 28px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand h1 {
  font-size: 18px;
  color: var(--navy);
  margin: 0;
}

.dot {
  width: 10px;
  height: 10px;
  background: var(--emerald);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.badge {
  background: #eff6ff;
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.metric {
  background: #f8fafc;
  border: 1px solid #edf2f7;
  padding: 12px;
  border-radius: 12px;
  text-align: center;
}

.metric .label {
  display: block;
  font-size: 10px;
  color: var(--slate);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.metric .val {
  font-size: 13px;
  font-weight: 700;
  color: var(--navy);
}

.btn {
  width: 100%;
  padding: 12px;
  background: var(--navy);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.9;
}

#statusMsg {
  font-size: 11px;
  color: var(--slate);
  text-align: center;
  margin-top: 12px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
}`,
  },
  {
    id: 'app-ts',
    name: 'app.ts',
    language: 'typescript',
    content: `// Rupal Convene Interactive Hypertext DOM Controller
function initializeSession() {
  const latencyEl = document.getElementById('latency');
  const pingBtn = document.getElementById('pingBtn');
  const statusMsg = document.getElementById('statusMsg');

  let pingCount = 0;

  if (pingBtn) {
    pingBtn.addEventListener('click', () => {
      pingCount++;
      const randomLatency = (Math.random() * 0.8 + 0.8).toFixed(1);
      
      if (latencyEl) {
        latencyEl.textContent = \`\${randomLatency}ms\`;
        latencyEl.style.color = '#10b981';
      }

      if (statusMsg) {
        statusMsg.textContent = \`Ping #\${pingCount} acknowledged by edge node in \${randomLatency}ms (DTLS 256-bit).\`;
      }
    });
  }

  console.log('[Hypertext App] Initialized. Event listeners attached.');
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSession);
  } else {
    initializeSession();
  }
}`,
  },
  {
    id: 'document-md',
    name: 'document.md',
    language: 'markdown',
    content: `# Rupal Convene Hypertext Architecture & Protocol

### Executive Overview
Rupal Convene incorporates a synchronized hypertext code runner directly inside encrypted video conference rooms.

| Component | Standard | Latency | Security |
| :--- | :--- | :--- | :--- |
| **Video Streams** | WebRTC / VP9 | < 120ms | DTLS-SRTP 256-Bit |
| **Code IDE** | Hypertext DOM Sandbox | < 2ms | Isolated Iframe / Worker |
| **AI Copilot** | Google Gemini 3.5 Flash | Real-time | Enterprise Encrypted |

### Key Capabilities
- **Live HTML/CSS/JS Rendering**: Real-time interactive preview of hypertext documents.
- **Collaborative Sync**: In-call peer broadcasts on slide and code changes.
- **Gemini Intelligence**: 1-click explanation and optimization advice.`,
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
