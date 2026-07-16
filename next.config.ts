import path from "path";
import type { NextConfig } from "next";

const backendUrl =
  process.env.BACKEND_INTERNAL_URL || "http://localhost:3000";

const plannerSrc = path.resolve(__dirname, "../bloomy-packages/planner/src");

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
  webpack(config) {
    config.resolve.alias["@bloomy/bloomy-planner"] = plannerSrc;
    config.resolve.modules = [
      path.resolve(__dirname, "node_modules"),
      "node_modules",
    ];
    return config;
  },
};

export default nextConfig;
