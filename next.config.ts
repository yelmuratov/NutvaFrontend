import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "api.nutvahealth.uz",
				port: "",
				pathname: "/uploads/**",
			},
		],
		unoptimized: true,
	},

	async rewrites() {
		return [
			{
				source: "/api/:path((?!auth).*)",
				destination: "https://api.nutvahealth.uz/api/:path*",
			},
		];
	},

	env: {
		NEXT_PUBLIC_BASE_URL: "https://api.nutvahealth.uz/api",
		NEXT_PUBLIC_API_URL: "https://api.nutvahealth.uz/api",
	},
};

export default nextConfig;