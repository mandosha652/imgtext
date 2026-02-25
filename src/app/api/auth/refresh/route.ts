import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
  }

  let backendData: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  };

  try {
    const backendRes = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!backendRes.ok) {
      const errorText = await backendRes.text().catch(() => '');
      return NextResponse.json(
        { error: 'Refresh failed', detail: errorText },
        { status: backendRes.status }
      );
    }

    backendData = await backendRes.json();
  } catch {
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 });
  }

  if (!backendData.access_token || !backendData.refresh_token) {
    return NextResponse.json(
      { error: 'Invalid backend response' },
      { status: 502 }
    );
  }

  const accessExpiry = Math.max(backendData.expires_in ?? 900, 60);

  const response = NextResponse.json({
    access_token: backendData.access_token,
    expires_in: backendData.expires_in,
  });

  response.cookies.set('access_token', backendData.access_token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: accessExpiry,
  });

  response.cookies.set('refresh_token', backendData.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
