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

// Admin routes — require the admin_authenticated session cookie
const adminRoutes = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Maintenance mode: block all visitors unless they have the bypass cookie
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';
  const maintenanceSecret = process.env.MAINTENANCE_SECRET || '';

  if (maintenanceMode) {
    // Allow the maintenance page itself
    if (pathname === '/maintenance') {
      return NextResponse.next();
    }

    // Check for bypass cookie
    const bypassCookie = request.cookies.get('maintenance_bypass')?.value;
    if (bypassCookie === maintenanceSecret && maintenanceSecret) {
      return NextResponse.next();
    }

    // Check if visitor is providing the secret via query param to bypass
    const urlSecret = request.nextUrl.searchParams.get('secret');
    if (urlSecret === maintenanceSecret && maintenanceSecret) {
      const response = NextResponse.redirect(new URL(pathname, request.url));
      response.cookies.set('maintenance_bypass', maintenanceSecret, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return response;
    }

    // Block everyone else — return a simple maintenance response
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ImgText — Coming Soon</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #09090b; color: #fafafa; }
    .container { text-align: center; padding: 2rem; }
    h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; }
    p { font-size: 1.125rem; color: #a1a1aa; max-width: 400px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>ImgText</h1>
    <p>We're working on something great. Check back soon.</p>
  </div>
</body>
</html>`,
      {
        status: 503,
        headers: { 'Content-Type': 'text/html', 'Retry-After': '86400' },
      }
    );
  }

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

  // Check if current route is an admin route
  const isAdminRoute = adminRoutes.some(
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

  // Guard admin routes: require the session cookie set by AdminAuthGate
  if (isAdminRoute) {
    const adminAuthenticated = request.cookies.get(
      'admin_authenticated'
    )?.value;
    if (!adminAuthenticated) {
      // Redirect to admin root where AdminAuthGate will prompt for the key
      if (pathname !== '/admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
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
