import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 110,
          background: '#0f172a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 800,
          borderRadius: 36,
          boxShadow: 'inset 0 0 20px rgba(37, 99, 235, 0.4)',
        }}
      >
        R
      </div>
    ),
    {
      ...size,
    }
  );
}
