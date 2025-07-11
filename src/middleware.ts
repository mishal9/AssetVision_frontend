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
  
  // Check if user is authenticated by looking for the auth token
  const isAuthenticated = !!request.cookies.get('auth_token')?.value;
  
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
