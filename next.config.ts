import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
        // Route API calls from the browser to the external domain
        source: "/api/:path*",
        destination: "https://demo.nutva.uz/api/:path*", // Keep this for client-side requests
      },
    ];
  },

  env: {
    // Used in server-side functions like generateMetadata, getServerSideProps, etc.
    NEXT_PUBLIC_BASE_URL: "http://localhost:5000/api",
    NEXT_PUBLIC_API_URL: "http://localhost:5000/api",
  },
};

export default nextConfig;
