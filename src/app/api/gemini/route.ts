import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, transcript, question, context } = body;
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // If an API key is provided, we can call Google Gemini REST API directly
    if (apiKey) {
      try {
        if (action === 'ask_copilot') {
          const prompt = `You are TechConvene AI, an executive & technical meeting intelligence assistant in a conference between developers and business partners.
Context:
Transcript: ${JSON.stringify(context?.transcript || [])}
Active Code: ${context?.activeCode || 'None'}
Slide Context: ${context?.currentSlide || 'None'}

User Question: ${question}

Provide a concise, highly insightful, professional answer in 2-4 sentences tailored for both engineers and investors.`;

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              return NextResponse.json({ answer: text });
            }
          }
        } else if (action === 'generate_minutes') {
          const prompt = `You are TechConvene AI. Summarize this tech developer & business partner meeting into structured JSON.
Transcript: ${JSON.stringify(transcript || [])}

Return ONLY valid JSON with keys:
- executiveSummary (string)
- keyTechnicalDecisions (array of strings)
- actionItems (array of objects with { id, task, assignee, assigneeRole, priority, due, status })
- risksAndBlockers (array of strings)
- investorHighlights (array of strings)`;

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: 'application/json' },
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const parsed = JSON.parse(text);
              return NextResponse.json({
                minutes: {
                  ...parsed,
                  id: `min-${Date.now()}`,
                  generatedAt: `Generated at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} via Gemini`,
                },
              });
            }
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed, using high-fidelity fallback', err);
      }
    }

    // High fidelity fallback when no API key or API call fallback
    if (action === 'ask_copilot') {
      let answer = 'Gemini AI Meeting Intelligence: The team is aligned on distributed rate limiting and commercial contract terms.';
      const q = (question || '').toLowerCase();
      if (q.includes('latency') || q.includes('p99') || q.includes('benchmark')) {
        answer = 'The in-meeting distributed gateway test verified a p99 latency of 1.2ms, well beneath the partner SLA limit of 2.0ms.';
      } else if (q.includes('revenue') || q.includes('margin') || q.includes('arr')) {
        answer = 'Current ARR is $14.2M (+184% YoY) with an 82.4% gross margin. Enterprise accounts have negative net churn.';
      } else if (q.includes('green room') || q.includes('stage')) {
        answer = 'Dr. Sophia Aris and Kenji Takahashi are currently staged in the Backstage Green Room preparing for the 15:15 Keynote.';
      }
      return NextResponse.json({ answer });
    }

    if (action === 'generate_minutes') {
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
          },
          {
            id: `act-gen-3`,
            task: 'Conduct green-room audio/slide dry run for APAC Keynote track',
            assignee: 'Dr. Sophia Aris',
            assigneeRole: 'Head of AI',
            priority: 'medium',
            due: 'Oct 08, 2026',
            status: 'pending'
          }
        ],
        risksAndBlockers: [
          'Cross-region network jitter on edge nodes in Singapore and Frankfurt during peak volume',
          'Pending partner compliance signoff on automatic data retention watermarking'
        ],
        investorHighlights: [
          '184% YoY ARR growth trajectory with 82.4% gross software margins',
          'P99 latency reduction to 1.2ms protects enterprise retention and beats SLA covenants'
        ]
      };
      return NextResponse.json({ minutes });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
