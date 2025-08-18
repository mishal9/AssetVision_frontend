/**
 * Simple Rate Limiting Utility for Demo Mode
 * Provides basic DoS protection and abuse prevention
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup interval to remove expired entries
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Cleanup every minute

/**
 * Rate limit configuration
 */
export const RATE_LIMITS = {
  DEMO_ACCESS: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 demo sessions per IP per 15 minutes
  },
  DEMO_API: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute per session
  },
  DEMO_AI_CHAT: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 AI chat messages per minute
  },
};

/**
 * Check if a request should be rate limited
 */
export function checkRateLimit(
  identifier: string,
  limit: { windowMs: number; maxRequests: number }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = `${identifier}:${Math.floor(now / limit.windowMs)}`;
  
  const entry = rateLimitStore.get(key);
  
  if (!entry) {
    // First request in this window
    const resetTime = now + limit.windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: limit.maxRequests - 1,
      resetTime,
    };
  }
  
  if (entry.count >= limit.maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }
  
  // Increment counter
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return {
    allowed: true,
    remaining: limit.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client IP from request headers (for Next.js)
 */
export function getClientIP(headers: Headers): string {
  // Try various headers that might contain the real IP
  const xForwardedFor = headers.get('x-forwarded-for');
  const xRealIp = headers.get('x-real-ip');
  const xClientIp = headers.get('x-client-ip');
  
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return xForwardedFor.split(',')[0].trim();
  }
  
  if (xRealIp) {
    return xRealIp;
  }
  
  if (xClientIp) {
    return xClientIp;
  }
  
  // Fallback
  return 'unknown';
}

/**
 * Rate limiting middleware function
 */
export function createRateLimiter(
  limit: { windowMs: number; maxRequests: number },
  keyGenerator: (identifier: string) => string = (id) => id
) {
  return (identifier: string) => {
    const key = keyGenerator(identifier);
    return checkRateLimit(key, limit);
  };
}

/**
 * Demo-specific rate limiters
 */
export const demoAccessLimiter = createRateLimiter(
  RATE_LIMITS.DEMO_ACCESS,
  (ip) => `demo_access:${ip}`
);

export const demoApiLimiter = createRateLimiter(
  RATE_LIMITS.DEMO_API,
  (sessionId) => `demo_api:${sessionId}`
);

export const demoAiChatLimiter = createRateLimiter(
  RATE_LIMITS.DEMO_AI_CHAT,
  (sessionId) => `demo_ai:${sessionId}`
);

/**
 * Security headers for demo mode
 */
export const DEMO_SECURITY_HEADERS = {
  'X-Demo-Mode': 'true',
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Cache-Control': 'no-cache, no-store, must-revalidate, private',
  'Pragma': 'no-cache',
  'Expires': '0',
};

/**
 * Validate demo session
 */
export function validateDemoSession(sessionId: string | null): boolean {
  if (!sessionId) return false;
  
  // Basic session ID format validation
  const sessionRegex = /^demo_\d+_[a-z0-9]+$/;
  return sessionRegex.test(sessionId);
}

/**
 * Check for suspicious activity patterns
 */
export function detectSuspiciousActivity(
  ip: string,
  userAgent: string | null,
  sessionId: string | null
): { suspicious: boolean; reason?: string } {
  // Check for missing user agent (potential bot)
  if (!userAgent || userAgent.trim().length === 0) {
    return { suspicious: true, reason: 'Missing user agent' };
  }
  
  // Check for suspicious user agents
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /postman/i,
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    return { suspicious: true, reason: 'Suspicious user agent' };
  }
  
  // Check session ID format
  if (sessionId && !validateDemoSession(sessionId)) {
    return { suspicious: true, reason: 'Invalid session format' };
  }
  
  return { suspicious: false };
}

/**
 * Log security events (in production, send to monitoring service)
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, any>,
  severity: 'low' | 'medium' | 'high' = 'medium'
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    details,
  };
  
  // In development, just console log
  if (process.env.NODE_ENV === 'development') {
    console.warn('Security Event:', logEntry);
  }
  
  // In production, you would send this to your monitoring service
  // e.g., Sentry, DataDog, CloudWatch, etc.
}
