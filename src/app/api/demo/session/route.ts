import { NextRequest, NextResponse } from 'next/server';
import { 
  demoAccessLimiter, 
  getClientIP, 
  detectSuspiciousActivity,
  logSecurityEvent,
  DEMO_SECURITY_HEADERS,
  validateDemoSession
} from '@/utils/rate-limit';

/**
 * Demo Session API Route
 * Handles demo session creation and validation with security controls
 */

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request.headers);
    const userAgent = request.headers.get('user-agent');
    
    // Rate limiting
    const rateLimitResult = demoAccessLimiter(ip);
    if (!rateLimitResult.allowed) {
      logSecurityEvent('demo_rate_limit_exceeded', { ip, userAgent }, 'medium');
      
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          message: 'Too many demo sessions created. Please try again later.',
          resetTime: rateLimitResult.resetTime
        },
        { 
          status: 429,
          headers: {
            ...DEMO_SECURITY_HEADERS,
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          }
        }
      );
    }
    
    // Suspicious activity detection
    const suspiciousCheck = detectSuspiciousActivity(ip, userAgent, null);
    if (suspiciousCheck.suspicious) {
      logSecurityEvent('demo_suspicious_activity', { 
        ip, 
        userAgent, 
        reason: suspiciousCheck.reason 
      }, 'high');
      
      return NextResponse.json(
        { error: 'Access denied', message: 'Suspicious activity detected' },
        { status: 403, headers: DEMO_SECURITY_HEADERS }
      );
    }
    
    // Generate demo session
    const sessionId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + (6 * 60 * 60 * 1000)); // 6 hours
    
    // Log successful demo session creation
    logSecurityEvent('demo_session_created', { 
      sessionId, 
      ip, 
      userAgent: userAgent?.substring(0, 100) // Truncate for logging
    }, 'low');
    
    const response = NextResponse.json({
      success: true,
      sessionId,
      expiresAt: expiresAt.toISOString(),
      user: {
        id: 999999,
        username: 'demo_user',
        email: 'demo@alphaoptimize.com',
        avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=4f46e5&color=fff',
      }
    });
    
    // Set security headers
    Object.entries(DEMO_SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    // Set rate limit headers
    response.headers.set('X-RateLimit-Limit', '10');
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
    
    return response;
    
  } catch (error) {
    console.error('Demo session creation error:', error);
    
    logSecurityEvent('demo_session_error', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 'medium');
    
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to create demo session' },
      { status: 500, headers: DEMO_SECURITY_HEADERS }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId');
    const ip = getClientIP(request.headers);
    
    if (!sessionId || !validateDemoSession(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid session', message: 'Session ID is required and must be valid' },
        { status: 400, headers: DEMO_SECURITY_HEADERS }
      );
    }
    
    // In a real implementation, you would validate the session against a database
    // For demo purposes, we'll just validate the format and return success
    
    return NextResponse.json({
      success: true,
      valid: true,
      sessionId,
    }, {
      headers: DEMO_SECURITY_HEADERS
    });
    
  } catch (error) {
    console.error('Demo session validation error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to validate session' },
      { status: 500, headers: DEMO_SECURITY_HEADERS }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId');
    const ip = getClientIP(request.headers);
    
    if (!sessionId || !validateDemoSession(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid session', message: 'Session ID is required and must be valid' },
        { status: 400, headers: DEMO_SECURITY_HEADERS }
      );
    }
    
    // Log session cleanup
    logSecurityEvent('demo_session_deleted', { 
      sessionId, 
      ip 
    }, 'low');
    
    return NextResponse.json({
      success: true,
      message: 'Demo session cleaned up successfully',
    }, {
      headers: DEMO_SECURITY_HEADERS
    });
    
  } catch (error) {
    console.error('Demo session cleanup error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to cleanup session' },
      { status: 500, headers: DEMO_SECURITY_HEADERS }
    );
  }
}
