import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Authentication and Demo Mode middleware
 * Handles route protection, redirects, and demo mode routing
 */
export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const path = request.nextUrl.pathname;
  
  // Define route types
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const publicRoutes = ['/demo', '/demo/dashboard'];
  
  // Check for exit demo parameter
  const isExitingDemo = request.nextUrl.searchParams.get('exit_demo') === 'true';
  
  // Check for demo mode (but not if we're explicitly exiting)
  const isDemoMode = !isExitingDemo && (
    request.cookies.get('demo_mode')?.value === 'true' || 
    request.nextUrl.searchParams.get('demo') === 'true'
  );
  
  // Check if user is authenticated by looking for the auth token
  const isAuthenticated = !!request.cookies.get('auth_token')?.value;
  
  // Handle exit demo case
  if (isExitingDemo) {
    const response = NextResponse.next();
    // Clear demo mode cookie
    response.cookies.delete('demo_mode');
    console.log('Middleware: Clearing demo mode cookie due to exit_demo parameter');
    return response;
  }
  
  // Demo mode handling
  if (path.startsWith('/demo')) {
    // Allow access to demo routes
    const response = NextResponse.next();
    
    // Set demo mode cookie if not already set
    if (!request.cookies.get('demo_mode')) {
      response.cookies.set('demo_mode', 'true', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 6 * 60 * 60, // 6 hours
      });
    }
    
    // Add security headers for demo mode
    response.headers.set('X-Demo-Mode', 'true');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    
    return response;
  }
  
  // If in demo mode but not on demo route, redirect to demo dashboard
  if (isDemoMode && !path.startsWith('/demo')) {
    return NextResponse.redirect(new URL('/demo/dashboard', request.url));
  }
  
  // Rate limiting for demo routes (basic IP-based)
  if (path.startsWith('/demo')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `demo_rate_limit_${ip}`;
    
    // In a real implementation, you'd use Redis or similar for rate limiting
    // For now, we'll add the header for downstream handling
    const response = NextResponse.next();
    response.headers.set('X-Client-IP', ip);
    return response;
  }
  
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
  matcher: ['/', '/login', '/register', '/forgot-password', '/reset-password', '/dashboard', '/dashboard/:path*', '/demo', '/demo/:path*'],
};
