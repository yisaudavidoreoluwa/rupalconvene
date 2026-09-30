import { Participant, PitchSlide, AgendaItem, CodeFile, WhiteboardElement, ChatMessage, MeetingMinutes } from '@/types/meeting';

export const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'user-self',
    name: 'Alex Vance (You)',
    email: 'alex.vance@techconvene.io',
    role: 'tech-lead',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    organization: 'Synthetix Cloud',
    jobTitle: 'VP of Platform Engineering',
    isMuted: false,
    isVideoOff: false,
    isScreenSharing: false,
    isSpeaking: true,
    handRaised: false,
    inGreenRoom: false,
    audioLevel: 65,
  },
  {
    id: 'user-partner-1',
    name: 'Elena Rostova',
    email: 'elena@vanguardcapital.com',
    role: 'investor',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    organization: 'Vanguard Ventures',
    jobTitle: 'General Partner',
    isMuted: true,
    isVideoOff: false,
    isScreenSharing: false,
    isSpeaking: false,
    handRaised: false,
    inGreenRoom: false,
    audioLevel: 0,
  },
  {
    id: 'user-dev-2',
    name: 'Marcus Chen',
    email: 'marcus.chen@synthetix.dev',
    role: 'developer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    organization: 'Synthetix Cloud',
    jobTitle: 'Principal Distributed Systems Engineer',
    isMuted: false,
    isVideoOff: false,
    isScreenSharing: false,
    isSpeaking: false,
    handRaised: false,
    inGreenRoom: false,
    audioLevel: 10,
  },
  {
    id: 'user-partner-2',
    name: 'David Sterling',
    email: 'david.sterling@apexpartners.org',
    role: 'business-partner',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    organization: 'Apex Global Strategic',
    jobTitle: 'Chief Strategy Officer',
    isMuted: true,
    isVideoOff: false,
    isScreenSharing: false,
    isSpeaking: false,
    handRaised: true,
    inGreenRoom: false,
    audioLevel: 0,
  },
  {
    id: 'user-dev-3',
    name: 'Dr. Sophia Aris',
    email: 'sophia.aris@deepnet.ai',
    role: 'tech-lead',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    organization: 'DeepNet Intelligence',
    jobTitle: 'Head of Applied AI Research',
    isMuted: false,
    isVideoOff: false,
    isScreenSharing: false,
    isSpeaking: false,
    handRaised: false,
    inGreenRoom: true, // Waiting in backstage green room
    audioLevel: 0,
  },
  {
    id: 'user-guest-1',
    name: 'Kenji Takahashi',
    email: 'kenji@tokyotechventures.jp',
    role: 'business-partner',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    organization: 'Nordic-Asia Tech Alliance',
    jobTitle: 'Managing Director APAC',
    isMuted: true,
    isVideoOff: true,
    isScreenSharing: false,
    isSpeaking: false,
    handRaised: false,
    inGreenRoom: true, // Waiting in backstage green room
    audioLevel: 0,
  }
];

export const INITIAL_FILES: CodeFile[] = [
  {
    id: 'gateway-ts',
    name: 'distributed-gateway.ts',
    language: 'typescript',
    isEntrypoint: true,
    content: `/**
 * @file distributed-gateway.ts
 * @module SynthetixGateway
 * Low-latency edge router with token-bucket rate limiter & token auth
 */

interface RequestContext {
  userId: string;
  ip: string;
  tier: 'enterprise' | 'growth' | 'partner';
  timestamp: number;
}

class TokenBucketRateLimiter {
  private capacity: number;
  private refillRate: number; // tokens per second
  private tokens: Map<string, number> = new Map();
  private lastRefill: Map<string, number> = new Map();

  constructor(capacity: number = 100, refillRate: number = 25) {
    this.capacity = capacity;
    this.refillRate = refillRate;
  }

  public allowRequest(key: string): { allowed: boolean; remainingTokens: number } {
    const now = Date.now() / 1000;
    const last = this.lastRefill.get(key) || now;
    const current = Math.min(this.capacity, (this.tokens.get(key) || this.capacity) + (now - last) * this.refillRate);

    if (current >= 1) {
      this.tokens.set(key, current - 1);
      this.lastRefill.set(key, now);
      return { allowed: true, remainingTokens: Math.floor(current - 1) };
    }
    return { allowed: false, remainingTokens: 0 };
  }
}

// Simulated execution run
const limiter = new TokenBucketRateLimiter(50, 10);
const partnerClient: RequestContext = {
  userId: "partner_apex_09",
  ip: "192.168.10.42",
  tier: "enterprise",
  timestamp: Date.now(),
};

console.log("--> Testing Gateway Edge Rate Limiter for Partner Endpoint...");
for (let i = 1; i <= 5; i++) {
  const result = limiter.allowRequest(partnerClient.userId);
  console.log(\`[Req #\${i}] Allowed: \${result.allowed} | Tokens Remaining: \${result.remainingTokens}\`);
}
console.log("--> Gateway test completed: All metrics within 99.99% SLA (<1.2ms p99 latency)");
`
  },
  {
    id: 'stream-py',
    name: 'realtime_event_pipeline.py',
    language: 'python',
    content: `"""
Real-time streaming anomaly detection for financial transaction streams.
Partners review high-throughput fraud scoring pipeline.
"""
import time
import math

class TransactionAnomalyDetector:
    def __init__(self, z_score_threshold=2.5):
        self.threshold = z_score_threshold
        self.rolling_window = []
        self.window_size = 50

    def process_transaction(self, tx_id, amount_usd, velocity_per_min):
        self.rolling_window.append(amount_usd)
        if len(self.rolling_window) > self.window_size:
            self.rolling_window.pop(0)

        mean = sum(self.rolling_window) / len(self.rolling_window)
        variance = sum((x - mean) ** 2 for x in self.rolling_window) / max(1, len(self.rolling_window) - 1)
        std_dev = math.sqrt(variance) if variance > 0 else 1.0

        z_score = abs(amount_usd - mean) / std_dev
        is_anomaly = z_score > self.threshold or velocity_per_min > 80

        return {
            "tx_id": tx_id,
            "amount": f"$\{amount_usd:,.2f}",
            "z_score": round(z_score, 2),
            "status": "FLAGGED_FOR_REVIEW" if is_anomaly else "CLEARED",
            "p99_latency_ms": 1.4
        }

detector = TransactionAnomalyDetector()
test_batch = [
    ("TX_9011", 450.00, 12),
    ("TX_9012", 520.00, 14),
    ("TX_9013", 480.00, 9),
    ("TX_9014", 89450.00, 94), # Intentional Spike
]

print(">>> Initializing Kafka Consumer Partition [0-3]...")
for tx_id, amt, vel in test_batch:
    res = detector.process_transaction(tx_id, amt, vel)
    print(f"[{res['status']}] {res['tx_id']}: {res['amount']} (Z: {res['z_score']}, Latency: {res['p99_latency_ms']}ms)")
`
  },
  {
    id: 'analytics-sql',
    name: 'partner_equity_ledger.sql',
    language: 'sql',
    content: `-- Partner Quarterly Performance & SLA Revenue Share Ledger
SELECT 
    p.partner_id,
    p.organization_name,
    COUNT(t.transaction_id) as total_settlements,
    ROUND(SUM(t.gross_volume_usd), 2) as aggregate_volume_usd,
    ROUND(AVG(t.settlement_latency_ms), 2) as avg_latency_ms,
    CASE 
        WHEN AVG(t.settlement_latency_ms) <= 250 THEN 'SLA Tier A+ (0.35% Rebate)'
        ELSE 'SLA Tier Standard (0.20% Rebate)'
    END as partner_performance_tier
FROM partner_directory p
JOIN transaction_ledger t ON p.partner_id = t.partner_id
WHERE t.created_at >= '2026-07-01'
GROUP BY p.partner_id, p.organization_name
ORDER BY aggregate_volume_usd DESC
LIMIT 10;
`
  }
];

export const INITIAL_WHITEBOARD_ELEMENTS: WhiteboardElement[] = [
  {
    id: 'node-client',
    type: 'rect',
    x: 80,
    y: 180,
    width: 140,
    height: 70,
    label: 'Client WebRTC / Next.js',
    color: '#06b6d4',
    fillColor: '#083344'
  },
  {
    id: 'node-lb',
    type: 'service',
    x: 280,
    y: 180,
    width: 140,
    height: 70,
    label: 'Cloudflare Edge / Anycast',
    color: '#8b5cf6',
    fillColor: '#2e1065'
  },
  {
    id: 'node-gateway',
    type: 'cloud',
    x: 480,
    y: 180,
    width: 160,
    height: 80,
    label: 'API Gateway & SFU Cluster',
    color: '#3b82f6',
    fillColor: '#172554'
  },
  {
    id: 'node-kafka',
    type: 'rect',
    x: 700,
    y: 110,
    width: 150,
    height: 65,
    label: 'Kafka Event Stream',
    color: '#f59e0b',
    fillColor: '#451a03'
  },
  {
    id: 'node-db',
    type: 'database',
    x: 700,
    y: 250,
    width: 150,
    height: 70,
    label: 'PostgreSQL Distributed DB',
    color: '#10b981',
    fillColor: '#022c22'
  },
  {
    id: 'node-ai',
    type: 'sticky',
    x: 480,
    y: 320,
    width: 160,
    height: 80,
    label: 'Gemini 1.5/2.0 Realtime AI Transcription & Minutes',
    color: '#ec4899',
    fillColor: '#500724'
  }
];

export const INITIAL_SLIDES: PitchSlide[] = [
  {
    id: 1,
    category: 'Executive Overview',
    title: 'Synthetix & TechConvene Q3 Sync',
    subtitle: 'Strategic Developer-Partner Synergy & Platform Scale Review',
    bulletPoints: [
      'Bridging high-speed engineering pipelines with executive decision-making',
      'Zero-setup real-time collaborative workspace with embedded runtime',
      'Real-time automated compliance, watermarking, and AI meeting intelligence'
    ],
    metrics: [
      { label: 'ARR Run-rate', value: '$14.2M', change: '+184% YoY', positive: true },
      { label: 'P99 Latency', value: '1.2ms', change: '-45% ms', positive: true },
      { label: 'Enterprise NRR', value: '142%', change: '+12%', positive: true }
    ],
    speakerNotes: 'Welcome partners and technical leads. Today we demonstrate how our low-latency infrastructure delivers both dev agility and partner governance.',
  },
  {
    id: 2,
    category: 'Technology Moat',
    title: 'Distributed Real-Time Architecture',
    subtitle: 'Ultra-low latency mesh routing with integrated sandboxed execution',
    bulletPoints: [
      'Sub-50ms glass-to-glass global media streaming via optimized WebRTC mesh',
      'Browser-level sandboxed runtime enabling instant code review without VPN',
      'Dynamic per-viewer screen-privacy watermarking preventing IP leakage',
      'Native Gemini multi-speaker speech-to-text pipeline with semantic indexing'
    ],
    metrics: [
      { label: 'Edge Nodes', value: '280+', change: '36 Countries', positive: true },
      { label: 'Uptime SLA', value: '99.995%', change: 'Zero Incidents', positive: true }
    ],
    speakerNotes: 'Highlight our competitive differentiator: developers can execute actual code snippets and test APIs while partners review live financial metrics in the same frame.',
  },
  {
    id: 3,
    category: 'Financials & Commercial Roadmap',
    title: 'Partner Revenue Share & Scaled Rollout',
    subtitle: 'Tiered integration models for Global System Integrators & Venture Funds',
    bulletPoints: [
      'Q4 2026: Expansion into 12 tier-one institutional banks and high-frequency funds',
      'SaaS license model + usage-based compute for AI-driven post-meeting synthesis',
      'Joint partner advisory board establishing security watermarking industry standard'
    ],
    metrics: [
      { label: 'Gross Margin', value: '82.4%', change: '+4.1%', positive: true },
      { label: 'Pipeline Val', value: '$48M', change: 'Across 40 Enterprises', positive: true }
    ],
    speakerNotes: 'David & Elena: Notice the gross margins reflect our lightweight edge computing footprint. We can open the floor for Q&A on valuation.',
  }
];

export const INITIAL_AGENDA: AgendaItem[] = [
  {
    id: 'ag-1',
    title: 'Platform Architecture & Live Code Run',
    time: '14:30 - 14:50',
    durationMinutes: 20,
    speakerIds: ['user-self', 'user-dev-2'],
    status: 'current',
    track: 'Engineering',
    description: 'Deep dive into rate limiter algorithms and streaming fraud anomaly detector execution.'
  },
  {
    id: 'ag-2',
    title: 'Investor Strategy & Q4 Growth Targets',
    time: '14:50 - 15:15',
    durationMinutes: 25,
    speakerIds: ['user-partner-1', 'user-partner-2'],
    status: 'upcoming',
    track: 'Executive',
    description: 'Review Series B term sheet milestones, commercial distribution agreements, and expansion plans.'
  },
  {
    id: 'ag-3',
    title: 'AI Intelligence & Backstage Green Room Keynote',
    time: '15:15 - 15:30',
    durationMinutes: 15,
    speakerIds: ['user-dev-3', 'user-guest-1'],
    status: 'upcoming',
    track: 'Joint',
    description: 'Live demo by Dr. Sophia Aris transitioning from backstage green room to main conference stage.'
  }
];

export const INITIAL_CHAT: ChatMessage[] = [
  {
    id: 'c-1',
    senderId: 'user-partner-1',
    senderName: 'Elena Rostova',
    senderRole: 'investor',
    senderAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    text: "Can Alex run the latency benchmark on the distributed gateway file? We need to verify if p99 holds under 2ms.",
    timestamp: '14:32',
    type: 'qa',
    upvotes: 3
  },
  {
    id: 'c-2',
    senderId: 'user-self',
    senderName: 'Alex Vance',
    senderRole: 'tech-lead',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    text: "Executing right now in the In-Call IDE sandbox. You'll see the terminal output stream in real time!",
    timestamp: '14:33',
    type: 'chat'
  },
  {
    id: 'c-3',
    senderId: 'user-dev-2',
    senderName: 'Marcus Chen',
    senderRole: 'developer',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    text: "I added the anomaly detector Python script in tab 2 for the fraud review pipeline.",
    timestamp: '14:34',
    type: 'code-share'
  }
];

export const INITIAL_MINUTES: MeetingMinutes = {
  id: 'min-q3-sync',
  generatedAt: 'Live Sync Active',
  executiveSummary: 'Synthetix Tech Lead Alex Vance and Investor Partners reviewed edge infrastructure benchmarks and agreed to advance Series B syndicate terms. P99 latency confirmed at 1.2ms, beating SLA covenants.',
  keyTechnicalDecisions: [
    'Approved distributed token-bucket rate limiter for edge deployment across 280 PoPs',
    'Integrated Kafka event partitioning with Python anomaly scoring for sub-2ms fraud triage',
    'Enforced strict per-viewer watermark policy for all institutional partner presentations'
  ],
  actionItems: [
    {
      id: 'act-1',
      task: 'Finalize Edge Gateway benchmark report with automated Grafana export',
      assignee: 'Alex Vance',
      assigneeRole: 'VP Platform Eng',
      priority: 'high',
      due: 'Oct 04, 2026',
      status: 'in-progress'
    },
    {
      id: 'act-2',
      task: 'Circulate revised Series B Syndicate Term Sheet to Vanguard Ventures legal',
      assignee: 'Elena Rostova',
      assigneeRole: 'General Partner',
      priority: 'high',
      due: 'Oct 06, 2026',
      status: 'pending'
    },
    {
      id: 'act-3',
      task: 'Prepare Backstage Green Room Keynote for APAC Tech Summit',
      assignee: 'Dr. Sophia Aris',
      assigneeRole: 'Head of AI',
      priority: 'medium',
      due: 'Oct 10, 2026',
      status: 'pending'
    }
  ],
  risksAndBlockers: [
    'Cross-region Kafka replication lag during Asian market peak trading hours',
    'Hardware security module (HSM) compliance signoff for Frankfurt data center'
  ],
  investorHighlights: [
    '184% YoY ARR growth trajectory with 82.4% gross software margins',
    'High retention with negative net churn in Enterprise Tier accounts'
  ]
};
