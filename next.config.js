/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during builds to avoid blocking
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Environment variables
  env: {
    // Use NEXT_PUBLIC_WS_URL if set, otherwise use the Docker service URL if in production, otherwise use the host's IP
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 
      'wss://cl3fc954-8000.use.devtunnels.ms/ws/market-data/',
    // Add backend URL for direct API calls
    NEXT_PUBLIC_API_URL: 'https://cl3fc954-8000.use.devtunnels.ms/api',
  },
  
  // We don't need to add CORS headers in Next.js config since we're making direct calls to the backend
  // The backend needs to be configured to allow requests from our frontend domain
  async headers() {
    return [];
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
  
  // CORS headers
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      },
      {
        // WebSocket connection
        source: "/ws/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "*" },
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
  console.log('NEXT_PUBLIC_WS_URL:', nextConfig.env.NEXT_PUBLIC_WS_URL);
}

module.exports = nextConfig;
