import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  reactStrictMode: true,
  
  // Image optimization
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
    ],
  },
  
  // Reduce bundle size by excluding source maps in production
  productionBrowserSourceMaps: false,
  
  // Turbopack configuration for Next.js 16
  turbopack: {},
};

export default nextConfig;
