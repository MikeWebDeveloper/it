import type { NextConfig } from 'next';
import path from 'path';

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react', 'recharts'],
    webVitalsAttribution: ['CLS', 'LCP'],
    // Next.js 15 memory optimizations
    webpackMemoryOptimizations: true,
    webpackBuildWorker: true,
    // turbopackPersistentCaching: true, // Requires canary version
    // Reduce initial memory footprint
    preloadEntriesOnStart: false,
  },
  
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
    // Enhanced resolution for better performance
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
    resolveAlias: {
      // Tree shake optimization
      'lodash': 'lodash-es',
    },
  },
  
  env: {
    ANALYZE: process.env.ANALYZE,
    VERCEL_ENV: process.env.VERCEL_ENV,
  },
  
  // Vercel-specific optimizations
  ...(process.env.VERCEL && {
    output: 'standalone',
    poweredByHeader: false,
    generateEtags: false,
  }),
  
  webpack: (config, { isServer, dev }) => {
    // Memory optimization for production builds (Next.js 15)
    if (config.cache && !dev) {
      config.cache = Object.freeze({
        type: 'memory',
      });
    }

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
      
      // Enhanced split vendor chunks for better caching
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            // React and core framework
            framework: {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              chunks: 'all',
              priority: 40,
            },
            // Animation libraries
            animations: {
              name: 'animations',
              test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
              chunks: 'all',
              priority: 30,
            },
            // Icon libraries
            icons: {
              name: 'icons', 
              test: /[\\/]node_modules[\\/](lucide-react)[\\/]/,
              chunks: 'all',
              priority: 25,
            },
            // Chart libraries
            charts: {
              name: 'charts',
              test: /[\\/]node_modules[\\/](recharts)[\\/]/,
              chunks: 'all',
              priority: 20,
            },
            // Common vendor libraries
            vendor: {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
              chunks: 'all',
              priority: 10,
            },
          },
        },
      };
      
      // Tree shake unused lodash functions and modern module resolution
      if (!dev) {
        config.resolve.alias = {
          ...config.resolve.alias,
          'lodash': 'lodash-es',
        };
        
        // Modern module resolution for better tree shaking
        config.resolve.mainFields = ['module', 'main'];
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
    // Use tsconfig.build.json for production builds with optimizations
    tsconfigPath: process.env.NODE_ENV === 'production' ? './tsconfig.build.json' : './tsconfig.json',
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Production optimizations
  productionBrowserSourceMaps: process.env.NODE_ENV !== 'production' && !process.env.VERCEL,
  
  // Vercel build optimization
  // swcMinify: true, // Default in Next.js 15
  modularizeImports: {
    'lodash': {
      transform: 'lodash/{{member}}',
      preventFullImport: true,
    },
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
      preventFullImport: true,
    },
  },
  
  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
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