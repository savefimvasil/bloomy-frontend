import path from "path";
import type { NextConfig } from "next";

const backendUrl =
  process.env.BACKEND_INTERNAL_URL || "http://localhost:3000";

const isDockerBuild = process.env.DOCKER_BUILD === "1";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["192.168.1.236"],
  // Local dev: compile planner source directly; ensure single React instance.
  // Docker: planner is pre-built to dist/ — no transpile or alias needed.
  ...(isDockerBuild
    ? {}
    : {
        transpilePackages: ["@bloomy/bloomy-planner"],
        webpack(config) {
          config.resolve.alias = {
            ...config.resolve.alias,
            react: path.resolve(__dirname, "node_modules/react"),
            "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
          };
          return config;
        },
      }),
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
