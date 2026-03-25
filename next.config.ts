import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,
  experimental: {
    serverActions: { bodySizeLimit: '50mb' },
    proxyClientMaxBodySize: 50 * 1024 * 1024, // 50MB for mobile photo uploads
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
