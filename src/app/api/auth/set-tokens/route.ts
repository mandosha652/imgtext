import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body.refresh_token !== 'string' ||
    typeof body.expires_in !== 'number'
  ) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { refresh_token, expires_in } = body as {
    refresh_token: string;
    expires_in: number;
  };

  const response = NextResponse.json({ ok: true });

  // Refresh token: httpOnly so JS cannot read it
  response.cookies.set('refresh_token', refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // Access token expiry mirrors the backend-issued expires_in
  // We store it as a regular (non-httpOnly) cookie so the Axios interceptor
  // can read it and inject the Authorization: Bearer header.
  const accessExpiry = Math.max(expires_in, 60); // floor at 60 s
  if (typeof body.access_token === 'string') {
    response.cookies.set('access_token', body.access_token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: accessExpiry,
    });
  }

  return response;
}
