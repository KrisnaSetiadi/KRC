
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      }
    ],
  },
  webpack: (config, { isServer }) => {
    // Mengabaikan next.config.js untuk mencegah restart yang tidak perlu
    config.watchOptions.ignored = /next\.config\.ts/;
    return config;
  },
  experimental: {
    // Mengizinkan origin dari Cloud Workstations untuk pengembangan
    allowedDevOrigins: [
        "*.cloudworkstations.dev",
    ]
  }
};

export default nextConfig;
