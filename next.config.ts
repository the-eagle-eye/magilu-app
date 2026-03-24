import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,
  experimental: {
    serverActions: { bodySizeLimit: '10mb' },
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
