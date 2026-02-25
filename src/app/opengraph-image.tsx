import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const runtime = 'nodejs';

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 8 6 6" />
          <path d="m4 14 6-6 2-3" />
          <path d="M2 5h12" />
          <path d="M7 2h1" />
          <path d="m22 22-5-10-5 10" />
          <path d="M14 18h6" />
        </svg>
        <span
          style={{
            fontSize: '72px',
            fontWeight: 700,
            color: 'white',
            letterSpacing: '-2px',
          }}
        >
          ImgText
        </span>
      </div>
      <span
        style={{
          fontSize: '28px',
          color: '#94a3b8',
          maxWidth: '700px',
          textAlign: 'center',
          lineHeight: 1.4,
        }}
      >
        AI-Powered Image Translation
      </span>
      <span
        style={{
          fontSize: '20px',
          color: '#64748b',
          marginTop: '16px',
        }}
      >
        Translate text in images instantly — 11 European languages
      </span>
    </div>,
    { ...size }
  );
}
