import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,
  experimental: {
    serverActions: { bodySizeLimit: '50mb' },
  },
  middlewareClientMaxBodySize: 50 * 1024 * 1024,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
