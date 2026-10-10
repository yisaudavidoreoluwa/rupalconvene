import { ImageResponse } from 'next/og';

export const alt = 'Rupal Convene | Ultra-Fast Video Conferences for Builders & Leaders';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0f172a',
          backgroundImage: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 75%)',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          color: 'white',
          position: 'relative',
        }}
      >
        {/* Subtle background glow */}
        <div
          style={{
            position: 'absolute',
            top: '-150px',
            right: '-150px',
            width: '400px',
            height: '400px',
            background: 'rgba(37, 99, 235, 0.25)',
            borderRadius: '9999px',
            filter: 'blur(80px)',
          }}
        />

        {/* Top Header Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 900,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              R
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                Rupal Convene
              </span>
              <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>
                Enterprise Engineering Video Suite
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: '14px',
              fontWeight: 700,
              color: '#60a5fa',
            }}
          >
            <span>Sub-2ms WebRTC Mesh</span>
          </div>
        </div>

        {/* Center Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: '1000px',
            gap: '20px',
          }}
        >
          <h1
            style={{
              fontSize: '56px',
              fontWeight: 900,
              letterSpacing: '-1.5px',
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Ultra-Fast Video Conferences for{' '}
            <span style={{ color: '#38bdf8' }}>Builders & Leaders</span>
          </h1>

          <p
            style={{
              fontSize: '22px',
              color: '#cbd5e1',
              maxWidth: '850px',
              lineHeight: 1.45,
              margin: 0,
            }}
          >
            Collaborative code editing, architecture whiteboards, synchronized pitch decks, and automated Gemini AI personal meeting notes.
          </p>
        </div>

        {/* Bottom Feature Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            width: '100%',
          }}
        >
          {[
            'Code Workspace IDE',
            'Architecture Whiteboard',
            'Synchronized Pitch Decks',
            'Gemini AI Meeting Notes',
            '256-Bit DTLS/SRTP E2EE',
          ].map((feature) => (
            <div
              key={feature}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                fontSize: '13px',
                fontWeight: 700,
                color: '#e2e8f0',
              }}
            >
              {feature}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
