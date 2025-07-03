/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better security
  experimental: {
    // Server actions are now stable in Next.js 15
  },

  // Security headers (additional to middleware)
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ],
      },
      {
        // Additional headers for API routes
        source: '/api/(.*)',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow'
          },
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate'
          }
        ],
      }
    ]
  },

  // Image optimization security
  images: {
    domains: [
      // Add your Supabase storage domain here
      // Format: 'your-project-id.supabase.co'
    ],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // Webpack configuration for security
  webpack: (config, { dev, isServer }) => {
    // Security optimizations
    if (!dev) {
      // Remove source maps in production for security
      config.devtool = false
    }

    // Bundle analyzer security
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }

    return config
  },

  // Environment variables are automatically available
  // No need to explicitly define NODE_ENV

  // Compression and optimization
  compress: true,
  poweredByHeader: false, // Remove X-Powered-By header
  
  // Redirects for security
  async redirects() {
    return [
      // Redirect HTTP to HTTPS in production
      ...(process.env.NODE_ENV === 'production' ? [
        {
          source: '/(.*)',
          has: [
            {
              type: 'header',
              key: 'x-forwarded-proto',
              value: 'http',
            },
          ],
          destination: 'https://builddiaspora.com/$1',
          permanent: true,
        },
      ] : []),
    ]
  },

  // Rewrites for API security
  async rewrites() {
    return [
      // Hide API structure
      {
        source: '/api/health',
        destination: '/api/system/health',
      },
    ]
  },

  // Output configuration
  output: 'standalone',
  
  // TypeScript configuration
  typescript: {
    // Type checking during build
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Run ESLint during build
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig 