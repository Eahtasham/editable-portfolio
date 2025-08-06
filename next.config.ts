import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    domains: ['i.ibb.co', 'localhost', 'https://eahtasham-portfolio.vercel.app/'],
  },
};

export default nextConfig;
