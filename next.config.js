/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental optimizations
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react', 'recharts'],
    webVitalsAttribution: ['CLS', 'LCP'],
  },
  
  // Bundle analyzer for production builds
  env: {
    ANALYZE: process.env.ANALYZE,
  },
  
  webpack: (config, { isServer, dev }) => {
    // Optimize bundle for large JSON files
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
      }
      
      // Split vendor chunks more aggressively
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            // Separate chunk for animations
            animations: {
              name: 'animations',
              test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
              chunks: 'all',
              priority: 30,
            },
            // Separate chunk for icons
            icons: {
              name: 'icons', 
              test: /[\\/]node_modules[\\/](lucide-react)[\\/]/,
              chunks: 'all',
              priority: 25,
            },
            // Charts in separate chunk
            charts: {
              name: 'charts',
              test: /[\\/]node_modules[\\/](recharts)[\\/]/,
              chunks: 'all',
              priority: 20,
            },
          },
        },
      }
      
      // Tree shake unused lodash functions
      if (!dev) {
        config.resolve.alias = {
          ...config.resolve.alias,
          'lodash': 'lodash-es',
        }
      }
    }
    
    // JSON loader optimization for large files
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
      parser: {
        parse: JSON.parse,
      },
    })
    
    return config
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year
  },
  
  // Enable gzip compression
  compress: true,
  
  // Optimize memory usage
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // PWA optimizations
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
}

// Bundle analyzer
if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: true,
  })
  module.exports = withBundleAnalyzer(nextConfig)
} else {
  module.exports = nextConfig
}