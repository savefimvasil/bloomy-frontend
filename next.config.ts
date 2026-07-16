import type { NextConfig } from "next";

const backendUrl =
  process.env.BACKEND_INTERNAL_URL || "http://localhost:3000";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@bloomy/bloomy-planner"],
  allowedDevOrigins: ["192.168.1.236"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
