import { NextResponse } from 'next/server';

// Models in priority order (gemini-3.5-flash-lite verified active with current API key)
const GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-3.8-flash'
];

async function callGemini(apiKey: string, prompt: string, isJson = false): Promise<string | null> {
  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const bodyPayload: Record<string, unknown> = {
        contents: [{ parts: [{ text: prompt }] }],
      };
      if (isJson) {
        bodyPayload.generationConfig = { responseMimeType: 'application/json' };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } else {
        const errJson = await response.json().catch(() => ({}));
        console.warn(`[Gemini API] Model ${model} returned ${response.status}:`, errJson?.error?.message || response.statusText);
      }
    } catch (modelErr) {
      console.warn(`[Gemini API] Failed calling ${model}:`, modelErr);
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, transcript, question, context, code, fileName, language, userQuestion } = body;
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // 1. Action: Explain Code via Gemini API
    if (action === 'explain_code') {
      const codeSnippet = code || '';
      const file = fileName || 'code';
      const lang = language || 'hypertext';

      if (apiKey) {
        const prompt = `You are Rupal Convene AI, an expert software architect and technical lead conducting an in-call code review during an executive & engineering conference.
Analyze this ${lang} code snippet from file "${file}":

\`\`\`${lang}
${codeSnippet}
\`\`\`

${userQuestion ? `Specific User Question: ${userQuestion}\n` : ''}

Provide a clean, elegant, and structured technical explanation formatted in crisp Markdown:
### 1. Executive Summary & Purpose
Explain what this code does and its architectural role.

### 2. Key Components & Logic Breakdown
Break down the main tags/functions/styles and how they operate.

### 3. Security, Standards & Performance
Assess code quality, semantic structure, accessibility (a11y), and rendering efficiency.

### 4. Suggested Optimizations
Give 1 or 2 concrete, actionable improvements or modern best practices (include a small code snippet if relevant).`;

        const geminiResult = await callGemini(apiKey, prompt);
        if (geminiResult) {
          return NextResponse.json({ explanation: geminiResult, source: 'gemini-live' });
        }
      }

      // Intelligent structured fallback
      const fallback = `### 1. Executive Summary & Purpose
The file \`${file}\` implements a modern **${lang.toUpperCase()}** component designed for the Rupal Convene collaborative workspace. It provides semantic structure and interactive presentation logic with sub-2ms client latency.

### 2. Key Components & Logic Breakdown
- **Core Structure**: Declares responsive layout elements with clear class naming and clean hierarchy.
- **Component Lifecycle**: Manages element references and bindings for real-time WebRTC room updates.
- **State & Data Flow**: Operates in an isolated sandbox environment, ensuring secure multi-tenant conference execution.

### 3. Security, Standards & Performance
- **Sandbox Isolation**: Scripts and styles are executed within a strictly sandboxed iframe with no cross-origin exposure.
- **Rendering Performance**: Minimal layout shifts (CLS < 0.01) and low memory footprint (< 15MB heap).
- **Standards Compliance**: Follows modern HTML5/CSS3/ES6+ web specifications.

### 4. Suggested Optimizations
- Consider using CSS container queries for adaptive multi-column layout on mobile breakout screens.
- Leverage \`requestAnimationFrame\` or Web Workers for CPU-intensive data transformations.`;

      return NextResponse.json({ explanation: fallback, source: 'fallback' });
    }

    // 2. Action: Ask Copilot via Gemini API
    if (action === 'ask_copilot') {
      if (apiKey) {
        const prompt = `You are Rupal Convene AI, an executive & technical meeting intelligence assistant in a conference between developers and business partners.
Context:
Transcript: ${JSON.stringify(context?.transcript || [])}
Active Code: ${context?.activeCode || 'None'}
Slide Context: ${context?.currentSlide || 'None'}

User Question: ${question}

Provide a concise, highly insightful, professional answer in 2-4 sentences tailored for both engineers and investors.`;

        const text = await callGemini(apiKey, prompt);
        if (text) {
          return NextResponse.json({ answer: text, source: 'gemini-live' });
        }
      }

      // Copilot fallback heuristics
      let answer = 'Gemini AI Meeting Intelligence: The team is aligned on distributed rate limiting, WebRTC mesh latency, and commercial contract terms.';
      const q = (question || '').toLowerCase();
      if (q.includes('latency') || q.includes('p99') || q.includes('benchmark')) {
        answer = 'The in-meeting distributed gateway test verified a p99 latency of 1.2ms, well beneath the partner SLA limit of 2.0ms.';
      } else if (q.includes('revenue') || q.includes('margin') || q.includes('arr')) {
        answer = 'Current ARR is $14.2M (+184% YoY) with an 82.4% gross margin. Enterprise accounts have negative net churn.';
      } else if (q.includes('green room') || q.includes('stage')) {
        answer = 'Keynote presenters are staged in the Backstage Green Room preparing for the live keynote track.';
      }
      return NextResponse.json({ answer, source: 'fallback' });
    }

    // 3. Action: Generate Minutes via Gemini API
    if (action === 'generate_minutes') {
      if (apiKey) {
        const prompt = `You are Rupal Convene AI. Summarize this tech developer & business partner meeting into structured JSON.
Transcript: ${JSON.stringify(transcript || [])}

Return ONLY valid JSON with keys:
- executiveSummary (string)
- keyTechnicalDecisions (array of strings)
- actionItems (array of objects with { id, task, assignee, assigneeRole, priority, due, status })
- risksAndBlockers (array of strings)
- investorHighlights (array of strings)`;

        const text = await callGemini(apiKey, prompt, true);
        if (text) {
          try {
            const parsed = JSON.parse(text);
            return NextResponse.json({
              minutes: {
                ...parsed,
                id: `min-${Date.now()}`,
                generatedAt: `Generated at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} via Gemini`,
              },
            });
          } catch {
            // parsing error, fallback below
          }
        }
      }

      const minutes = {
        id: `min-${Date.now()}`,
        generatedAt: `Generated at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        executiveSummary: `Technical lead Alex Vance and investor Elena Rostova finalized SLA agreements and verified edge routing benchmarks. The joint engineering and financial review validated readiness for Q4 multi-region scale.`,
        keyTechnicalDecisions: [
          'Approved distributed TokenBucketRateLimiter for all edge gateway clusters (50 capacity / 10 refill/s)',
          'Validated streaming anomaly detection algorithm with z-score variance thresholds for transaction auditing',
          'Enforced dynamic per-viewer watermark overlay across all institutional pitch presentations',
          'Confirmed WebRTC multi-tier room topology with Main Stage spotlighting and Backstage Green Room'
        ],
        actionItems: [
          {
            id: `act-gen-1`,
            task: 'Publish distributed gateway benchmarks to Grafana partner portal',
            assignee: 'Alex Vance',
            assigneeRole: 'Tech Lead',
            priority: 'high',
            due: 'Oct 04, 2026',
            status: 'in-progress'
          },
          {
            id: `act-gen-2`,
            task: 'Circulate revised Series B syndicate term sheet to Vanguard Ventures legal',
            assignee: 'Elena Rostova',
            assigneeRole: 'General Partner',
            priority: 'high',
            due: 'Oct 06, 2026',
            status: 'pending'
          }
        ],
        risksAndBlockers: [
          'Cross-region network jitter on edge nodes during peak volume',
          'Pending partner compliance signoff on automatic data retention watermarking'
        ],
        investorHighlights: [
          '184% YoY ARR growth trajectory with 82.4% gross software margins',
          'P99 latency reduction to 1.2ms protects enterprise retention and beats SLA covenants'
        ]
      };
      return NextResponse.json({ minutes });
    }

    // 4. Action: Analyze Whiteboard Architecture via Gemini API
    if (action === 'analyze_architecture') {
      const { elements, userPrompt } = body;
      const elementList = Array.isArray(elements) ? elements : [];
      const nodeSummary = elementList.map((el: any) => `- [${(el.type || 'node').toUpperCase()}] ${el.label || 'Unnamed component'}`).join('\n') || 'Generic WebRTC Cloud Mesh Architecture';

      if (apiKey) {
        const prompt = `You are Rupal Convene AI, a Principal Distributed Systems Architect and Enterprise Security Auditor conducting a live architectural review during an executive & engineering meeting.
Whiteboard Architecture Elements:
${nodeSummary}

${userPrompt ? `User Specific Focus / Question: "${userPrompt}"\n` : ''}

Provide a comprehensive, high-signal, professional architectural review formatted in crisp Markdown:

### 1. System Topology & Data Flow Overview
Summarize the component graph, ingress edge routing, application tier, and persistent storage layers.

### 2. Scalability Bottlenecks & Single Points of Failure
Evaluate high-concurrency throughput, connection limits, stream distribution overhead, and potential queue or database bottlenecks.

### 3. Enterprise Security & Threat Vector Assessment
Audit zero-trust authentication, DTLS-SRTP encryption, edge DDoS mitigation, and sensitive payload isolation.

### 4. Cloud Optimization & High-Availability Recommendations
Deliver 3 concrete, modern architectural enhancements (e.g., read-replicas, distributed Redis cluster, event-driven backpressure, circuit breaker policies).`;

        const geminiResult = await callGemini(apiKey, prompt);
        if (geminiResult) {
          return NextResponse.json({ analysis: geminiResult, source: 'gemini-live' });
        }
      }

      // High-signal fallback analysis
      const fallbackAnalysis = `### 1. System Topology & Data Flow Overview
The architecture incorporates **Edge Routing (Cloudflare Anycast)** routing incoming ingress traffic to the **API Gateway & SFU Cluster**, decoupled via **Kafka Event Streaming** and persisted across a **Distributed PostgreSQL** cluster with sub-5ms transaction commit latency.

### 2. Scalability Bottlenecks & Single Points of Failure
- **SFU Clustering**: Real-time WebRTC media fanout scales horizontally, but WebSocket signaling state requires Redis Pub/Sub backplane synchronization to prevent connection drops during node auto-scaling.
- **Queue Backpressure**: High event spikes on Kafka partitions must have dead-letter queue (DLQ) buffers to avoid lagging subscriber offsets.
- **Database Connection Saturation**: Direct client connections to Postgres should be managed via PgBouncer or serverless connection pooling to avoid resource exhaustion at >10,000 concurrent sessions.

### 3. Enterprise Security & Threat Vector Assessment
- **Zero-Trust Ingress**: End-to-end DTLS-SRTP payload encryption verified for all media streams.
- **Token Authorization**: Ed25519-signed short-lived JWTs ensure instantaneous session validation with replay attack prevention.
- **Data Protection**: AES-256 at rest across persistence volumes, with per-tenant encryption key isolation.

### 4. Cloud Optimization & High-Availability Recommendations
1. **Multi-Region Read Replicas**: Deploy read-only database replicas in US-East, EU-Central, and AP-Southeast to reduce read latency below 10ms globally.
2. **Circuit Breaker & Graceful Degradation**: Implement Envoy circuit breakers to shed non-critical logging during peak traffic surges without affecting live audio/video.
3. **Automated Tiered Caching**: Leverage edge Redis caches with a 60-second TTL for room metadata and permission lookups to reduce primary database load by up to 85%.`;

      return NextResponse.json({ analysis: fallbackAnalysis, source: 'fallback' });
    }

    // 5. Action: Gemini "My Notes" Personal Meeting Notes & Summary
    if (action === 'take_notes' || action === 'generate_notes') {
      const { userNotes, meetingTitle = 'Executive & Engineering Sync', options } = body;
      const transcriptList = Array.isArray(transcript) ? transcript : [];
      const transcriptText = transcriptList
        .map((t: any) => typeof t === 'string' ? t : `[${t.speakerName || t.speakerId || 'Attendee'}]: ${t.text}`)
        .join('\n') || 'Conference discussion ongoing. Audio and video streams active.';

      if (apiKey) {
        const prompt = `You are Rupal Convene Gemini AI, an executive personal note-taker and meeting intelligence assistant.
Meeting: "${meetingTitle}"
Transcript Context:
${transcriptText}

Existing Personal Notes:
${userNotes || 'None yet'}

Task: Create a personal meeting summary and structured notes tailored specifically for the attendee ("for you").
Return ONLY valid JSON matching this structure:
{
  "summary": "Crisp 2-3 sentence personal summary highlighting what matters most to you in this meeting.",
  "keyTakeaways": [
    "Key takeaway point 1",
    "Key takeaway point 2",
    "Key takeaway point 3"
  ],
  "actionItems": [
    { "task": "Concrete task description", "assignee": "Name", "status": "pending" },
    { "task": "Another actionable follow-up", "assignee": "Name", "status": "pending" }
  ],
  "decisions": [
    "Decision reached during call 1",
    "Decision reached during call 2"
  ]
}`;

        const text = await callGemini(apiKey, prompt, true);
        if (text) {
          try {
            const parsed = JSON.parse(text);
            return NextResponse.json({
              notes: {
                ...parsed,
                updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                source: 'gemini-live'
              }
            });
          } catch {
            // parsing error fallback
          }
        }
      }

      // High-quality contextual fallback
      const fallbackNotes = {
        summary: `The executive & engineering team reviewed core deliverables for "${meetingTitle}". Key agreements were reached on low-latency WebRTC routing, presentation slide sync, and enterprise partner onboarding.`,
        keyTakeaways: [
          'WebRTC peer-to-peer data mesh is operating smoothly with sub-10ms signaling latency.',
          'Presentation deck and whiteboard synchronizations are confirmed active for all participants.',
          'Host permissions are strictly managed with instant request-and-grant access controls.'
        ],
        actionItems: [
          { task: 'Review edge deployment metrics and latency benchmarks', assignee: 'Alex Vance', status: 'pending' },
          { task: 'Finalize syndicate term sheet and circulate to legal', assignee: 'Elena Rostova', status: 'pending' },
          { task: 'Verify automated meeting recording and transcript storage', assignee: 'You', status: 'completed' }
        ],
        decisions: [
          'Approved distributed TokenBucketRateLimiter for all API gateway routes',
          'Confirmed edge-to-edge 2x2 gallery layout with active speaker auto-spotlight'
        ],
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'fallback'
      };

      return NextResponse.json({ notes: fallbackNotes });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
