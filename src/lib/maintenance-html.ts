export const MAINTENANCE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ImgText — Coming Soon</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #09090b;
      color: #fafafa;
      overflow: hidden;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .bg-glow {
      position: fixed;
      border-radius: 50%;
      filter: blur(100px);
      opacity: 0.15;
      pointer-events: none;
    }
    .bg-glow-1 {
      width: 600px; height: 600px;
      top: -200px; left: -100px;
      background: #3b82f6;
      animation: float 20s ease-in-out infinite;
    }
    .bg-glow-2 {
      width: 500px; height: 500px;
      bottom: -200px; right: -100px;
      background: #8b5cf6;
      animation: float 25s ease-in-out infinite reverse;
    }
    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -30px) scale(1.05); }
      66% { transform: translate(-20px, 20px) scale(0.95); }
    }

    .container {
      text-align: center;
      padding: 2rem;
      position: relative;
      z-index: 1;
      max-width: 480px;
      animation: fadeIn 0.8s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .logo-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 64px; height: 64px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 2rem;
    }
    .logo-icon svg { width: 32px; height: 32px; color: #a1a1aa; }

    h1 {
      font-size: 2.25rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      margin-bottom: 0.75rem;
    }
    .tagline {
      font-size: 1.125rem;
      color: #a1a1aa;
      line-height: 1.6;
      margin-bottom: 2.5rem;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 0.8125rem;
      color: #a1a1aa;
      font-weight: 500;
    }
    .status-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #22c55e;
      position: relative;
    }
    .status-dot::after {
      content: '';
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      background: #22c55e;
      opacity: 0.4;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.4; }
      50% { transform: scale(1.8); opacity: 0; }
    }

    .divider {
      width: 48px;
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: 2rem auto;
    }

    .footer-text { font-size: 0.8125rem; color: #52525b; }
    .footer-text a {
      color: #71717a;
      text-decoration: none;
      transition: color 0.15s ease;
    }
    .footer-text a:hover { color: #a1a1aa; }
  </style>
</head>
<body>
  <div class="bg-glow bg-glow-1"></div>
  <div class="bg-glow bg-glow-2"></div>
  <div class="container">
    <div class="logo-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>
      </svg>
    </div>
    <h1>ImgText</h1>
    <p class="tagline">We&rsquo;re building something great.<br>Check back soon.</p>
    <div class="status-pill">
      <span class="status-dot"></span>
      Under active development
    </div>
    <div class="divider"></div>
  </div>
</body>
</html>`;
