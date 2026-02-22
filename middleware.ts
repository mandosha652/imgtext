import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/translate',
  '/batch',
  '/history',
  '/settings',
];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for dev auth bypass
  const devAuthBypass = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true';

  if (devAuthBypass) {
    return NextResponse.next();
  }

  // Get token from cookies (more secure than localStorage for SSR)
  const accessToken = request.cookies.get('access_token')?.value;
  const isAuthenticated = !!accessToken;

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if current route is an auth route
  const isAuthRoute = authRoutes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    // Only allow relative paths to prevent open redirect attacks
    const rawCallback =
      request.nextUrl.searchParams.get('callbackUrl') ?? pathname;
    const safeCallback =
      rawCallback.startsWith('/') && !rawCallback.startsWith('//')
        ? rawCallback
        : '/dashboard';
    loginUrl.searchParams.set('callbackUrl', safeCallback);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};
