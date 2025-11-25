import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  async headers() {
    const securityHeaders = [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors *',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];

    return await Promise.resolve(securityHeaders);
  },
  images: {
    remotePatterns: [new URL('https://farpong.vercel.app/**')],
  },
};

export default nextConfig;
