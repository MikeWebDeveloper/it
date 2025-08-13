/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Optimize bundle for large JSON files
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
      }
    }
    return config
  },
  // Optimize memory usage
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  }
}

module.exports = nextConfig