/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during builds to avoid blocking
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Environment variables - explicit configuration required
  env: {
    // Pass through the API base URL from environment variables (required)
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    // Derived API URL with /api suffix
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_BASE_URL 
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`
      : undefined,
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Security headers and CORS configuration
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';
    const allowedOrigins = process.env.NEXT_PUBLIC_ALLOWED_ORIGINS 
      ? process.env.NEXT_PUBLIC_ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000'];
    
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          // Prevent clickjacking attacks
          { key: 'X-Frame-Options', value: 'DENY' },
          // Prevent MIME type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Enable XSS protection (legacy but still useful)
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Force HTTPS in production
          ...(isProduction ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' }] : []),
          // Content Security Policy
          { 
            key: 'Content-Security-Policy', 
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.vercel.live https://*.vercel.app " + (process.env.NEXT_PUBLIC_API_BASE_URL || '') + "; frame-ancestors 'none'; base-uri 'self'; form-action 'self';" 
          },
          // Control referrer information
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Permissions policy
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
        ],
      },
      {
        // CORS headers for Next.js API routes only
        // Note: The external backend API handles its own CORS
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          // Use specific origin instead of wildcard for security
          { 
            key: "Access-Control-Allow-Origin", 
            value: isProduction && allowedOrigins.length > 0 
              ? allowedOrigins[0] 
              : (process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000")
          },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
          { key: "Access-Control-Max-Age", value: "86400" },
        ]
      }
    ]
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error on build:
      // Module not found: Can't resolve 'fs'
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
      };
    }
    return config;
  },
};

// For development with Docker Compose
if (process.env.NODE_ENV === 'development') {
  console.log('Running in development mode');
}

module.exports = nextConfig;
