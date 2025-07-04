import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "demo.nutva.uz",
        port: "",
        pathname: "/uploads/**",
      },
    ],
    unoptimized: true,
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://demo.nutva.uz/api/:path*",
      },
    ];
  },

  env: {
    NEXT_PUBLIC_BASE_URL: "https://demo.nutva.uz/api",
    NEXT_PUBLIC_API_URL: "https://demo.nutva.uz/api",
  },

  eslint: {
    ignoreDuringBuilds: true, // 👈 TEMP FIX FOR CI/CD
  },
};

export default nextConfig;
