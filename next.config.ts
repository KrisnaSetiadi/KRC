
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
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
  experimental: {
    // Opsi eksperimental lainnya dapat ditambahkan di sini jika diperlukan
  },
  // Izinkan origin dari Cloud Workstations untuk pengembangan
  allowedDevOrigins: [
    "*.cloudworkstations.dev",
  ]
};

export default nextConfig;
