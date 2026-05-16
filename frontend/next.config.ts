import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://api-stg.canting.my.id/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
