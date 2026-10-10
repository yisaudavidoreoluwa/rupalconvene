import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Validate event structure
    if (!body || !body.eventName) {
      return NextResponse.json({ error: 'Missing eventName' }, { status: 400 });
    }

    // Telemetry log in server console (anonymized)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Convene Telemetry] ${body.eventName}:`, body.path);
    }

    return NextResponse.json({ success: true, recordedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
