import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Authentication middleware
 * Handles route protection and redirects based on authentication status
 */
export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const path = request.nextUrl.pathname;
  
  // Define route types
  const authRoutes = ['/login', '/register', '/forgot-password'];
  
  // Debug: Log all cookies
  const allCookies = request.cookies.getAll();
  console.log('🍪 Middleware: All cookies for path', path, ':', allCookies);
  
  // Check if user is authenticated by looking for the auth token
  // Try multiple possible cookie names that Django might use
  const possibleCookieNames = ['auth_token', 'access_token', 'jwt_token', 'access', 'token', 'refresh_token', 'sessionid'];
  let authTokenCookie = null;
  let isAuthenticated = false;
  
  // Debug: Check each cookie individually
  console.log('🍪 Middleware: Checking for auth cookies...');
  for (const cookieName of possibleCookieNames) {
    const cookie = request.cookies.get(cookieName);
    console.log(`🍪 Middleware: Checking '${cookieName}':`, cookie?.value ? `FOUND (${cookie.value.substring(0, 20)}...)` : 'NOT FOUND');
    if (cookie?.value) {
      authTokenCookie = cookie;
      isAuthenticated = true;
      console.log(`🍪 Middleware: Using auth cookie '${cookieName}' for authentication`);
      break;
    }
  }
  
  // Additional debug: Check if we have Django session cookie as fallback
  const sessionCookie = request.cookies.get('sessionid');
  if (sessionCookie && !isAuthenticated) {
    console.log('🍪 Middleware: Found Django session cookie, treating as authenticated');
    isAuthenticated = true;
  }
  
  console.log('🍪 Middleware: Final auth status:', isAuthenticated);
  
  // Determine appropriate redirect URL
  const redirectUrl = isAuthenticated ? '/dashboard' : '/login';
  
  // Handle root path redirect
  if (path === '/') {
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }
  
  // Handle authentication routes (redirect authenticated users)
  if (authRoutes.some(route => path === route) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Handle protected routes (redirect unauthenticated users)
  if (path.startsWith('/dashboard') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

// Configure which paths this middleware will run on
export const config = {
  matcher: ['/', '/login', '/register', '/forgot-password', '/dashboard', '/dashboard/:path*'],
};
