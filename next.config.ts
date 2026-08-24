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
        transpilePackages: ["@tily/tile-planner", "@bloomy/garden-planner"],
        webpack(config: Parameters<NonNullable<NextConfig["webpack"]>>[0]) {
          const tileSrc    = path.resolve(__dirname, "../tily-packages/tile-planner/src");
          const gardenSrc  = path.resolve(__dirname, "../tily-packages/garden-planner/src");
          const sharedSrc  = path.resolve(__dirname, "../tily-packages/shared");
          config.resolve = config.resolve ?? {};
          config.resolve.alias = {
            "@tily/tile-planner": tileSrc + "/index.ts",
            // tile-planner internal paths
            "@/lib":        tileSrc + "/lib",
            "@/tile":       tileSrc + "/tile",
            // garden-planner internal paths
            "@/garden":      gardenSrc + "/garden",
            "@/calculator":  gardenSrc + "/calculator",
            // shared paths
            "~/lib":         sharedSrc + "/lib",
            "~/ui":          sharedSrc + "/ui",
            "~/canvas":      sharedSrc + "/canvas",
            "~/mount-utils": sharedSrc + "/mount-utils",
            ...config.resolve.alias,
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
