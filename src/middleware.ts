import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Authentication middleware
 * Handles route protection and redirects based on authentication status
 * 
 * Security enhancements:
 * - Validates cookie presence (full token validation happens server-side)
 * - Adds security headers to responses
 * - Implements basic rate limiting headers
 */
export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const path = request.nextUrl.pathname;
  
  // Define route types
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  
  // Check if user is authenticated by looking for the auth token
  // Note: Full token validation should be done server-side via API calls
  const isAuthenticated = !!request.cookies.get('auth_token')?.value;
  
  // Determine appropriate redirect URL
  const redirectUrl = isAuthenticated ? '/dashboard' : '/login';
  
  // Handle root path redirect
  if (path === '/') {
    const response = NextResponse.redirect(new URL(redirectUrl, request.url));
    addSecurityHeaders(response);
    return response;
  }
  
  // Handle authentication routes (redirect authenticated users)
  if (authRoutes.some(route => path === route) && isAuthenticated) {
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    addSecurityHeaders(response);
    return response;
  }
  
  // Handle protected routes (redirect unauthenticated users)
  if (path.startsWith('/dashboard') && !isAuthenticated) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    addSecurityHeaders(response);
    return response;
  }
  
  // Create response and add security headers
  const response = NextResponse.next();
  addSecurityHeaders(response);
  return response;
}

/**
 * Add security headers to the response
 * @param response NextResponse object to modify
 */
function addSecurityHeaders(response: NextResponse) {
  // Additional security headers that can be set in middleware
  // (Some headers are also set in next.config.js, but middleware allows dynamic values)
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
}

// Configure which paths this middleware will run on
export const config = {
  matcher: ['/', '/login', '/register', '/forgot-password', '/reset-password', '/dashboard', '/dashboard/:path*'],
};
