import type { NextConfig } from 'next';
import path from 'path';

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react', 'recharts'],
    webVitalsAttribution: ['CLS', 'LCP'],
  },
  
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  env: {
    ANALYZE: process.env.ANALYZE,
  },
  
  webpack: (config, { isServer, dev }) => {
    // SVG loader
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Optimize bundle for large JSON files
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
      };
      
      // Split vendor chunks more aggressively
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            animations: {
              name: 'animations',
              test: /[\\/]node_modules[\\/](framer-motion)[\\/]/
              ,chunks: 'all',
              priority: 30,
            },
            icons: {
              name: 'icons', 
              test: /[\\/]node_modules[\\/](lucide-react)[\\/]/
              ,chunks: 'all',
              priority: 25,
            },
            charts: {
              name: 'charts',
              test: /[\\/]node_modules[\\/](recharts)[\\/]/
              ,chunks: 'all',
              priority: 20,
            },
          },
        },
      };
      
      // Tree shake unused lodash functions
      if (!dev) {
        config.resolve.alias = {
          ...config.resolve.alias,
          'lodash': 'lodash-es',
        };
      }
    }
    
    // JSON loader optimization for large files
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
      parser: {
        parse: JSON.parse,
      },
    });
    
    return config;
  },
  
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  compress: true,
  
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        // Security headers
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' vercel.live",
            "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
            "font-src 'self' fonts.gstatic.com",
            "img-src 'self' data: blob: vercel.com",
            "connect-src 'self' vercel.live",
            "worker-src 'self' blob:",
            "manifest-src 'self'",
            "frame-ancestors 'none'",
          ].join('; '),
        },
        // Performance headers
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    // API routes with different CSP
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'none'; frame-ancestors 'none'",
        },
      ],
    },
  ],
};

export default withBundleAnalyzer(nextConfig);