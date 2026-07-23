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
          const plannerSrc = path.resolve(__dirname, "../bloomy-packages/planner/src");
          // Planner-internal @/X imports must come BEFORE Next.js's generic @/ alias
          // (webpack first-match wins). The planner uses five @/ namespaces:
          //   @/canvas, @/garden, @/sidebar, @/ui  — not used by the frontend at all
          //   @/lib/*  — some sub-paths overlap with frontend's lib/, so alias only
          //              the specific files the planner needs, not the whole @/lib.
          config.resolve.alias = {
            "@/canvas":            path.resolve(plannerSrc, "canvas"),
            "@/garden":            path.resolve(plannerSrc, "garden"),
            "@/sidebar":           path.resolve(plannerSrc, "sidebar"),
            "@/ui":                path.resolve(plannerSrc, "ui"),
            "@/lib/constants":     path.resolve(plannerSrc, "lib/constants"),
            "@/lib/types":         path.resolve(plannerSrc, "lib/types"),
            "@/lib/geometry":      path.resolve(plannerSrc, "lib/geometry"),
            "@/lib/labels":        path.resolve(plannerSrc, "lib/labels"),
            "@/lib/hooks":         path.resolve(plannerSrc, "lib/hooks"),
            "@/lib/optimal-patterns": path.resolve(plannerSrc, "lib/optimal-patterns"),
            "@/lib/config":        path.resolve(plannerSrc, "lib/config"),
            ...config.resolve.alias,
            react:    path.resolve(__dirname, "node_modules/react"),
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
