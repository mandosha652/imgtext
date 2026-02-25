import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { MAINTENANCE_HTML } from '@/lib/maintenance-html';

const protectedRoutes = [
  '/dashboard',
  '/translate',
  '/batch',
  '/history',
  '/settings',
];
const authRoutes = ['/login', '/signup'];
const adminRoutes = ['/admin'];

function matchesRoute(pathname: string, routes: string[]) {
  return routes.some(r => pathname === r || pathname.startsWith(`${r}/`));
}

function handleMaintenance(request: NextRequest): NextResponse | null {
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';
  const secret = process.env.MAINTENANCE_SECRET || '';
  if (!maintenanceMode) return null;

  const { pathname } = request.nextUrl;

  if (pathname === '/maintenance') return NextResponse.next();

  // Bypass via cookie
  if (secret && request.cookies.get('maintenance_bypass')?.value === secret) {
    return NextResponse.next();
  }

  // Bypass via ?secret= query param — sets cookie for future requests
  if (secret && request.nextUrl.searchParams.get('secret') === secret) {
    const response = NextResponse.redirect(new URL(pathname, request.url));
    response.cookies.set('maintenance_bypass', secret, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  return new NextResponse(MAINTENANCE_HTML, {
    status: 503,
    headers: { 'Content-Type': 'text/html', 'Retry-After': '86400' },
  });
}

export function proxy(request: NextRequest) {
  const maintenance = handleMaintenance(request);
  if (maintenance) return maintenance;

  if (process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true') {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const isAuthenticated = !!request.cookies.get('access_token')?.value;

  // Redirect unauthenticated users to login
  if (matchesRoute(pathname, protectedRoutes) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    const rawCallback =
      request.nextUrl.searchParams.get('callbackUrl') ?? pathname;
    const safeCallback =
      rawCallback.startsWith('/') && !rawCallback.startsWith('//')
        ? rawCallback
        : '/dashboard';
    loginUrl.searchParams.set('callbackUrl', safeCallback);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (matchesRoute(pathname, authRoutes) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Guard admin routes — require session cookie set by AdminAuthGate
  if (matchesRoute(pathname, adminRoutes)) {
    if (
      !request.cookies.get('admin_authenticated')?.value &&
      pathname !== '/admin'
    ) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)'],
};
