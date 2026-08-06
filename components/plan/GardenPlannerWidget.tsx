"use client";

import { useRef, useEffect } from "react";
import { mountGardenPlanner } from "@bloomy/garden-planner";
import type { GardenPlannerCoreProps } from "@bloomy/garden-planner";

/**
 * Thin React wrapper around mountGardenPlanner.
 * Pass a `key` prop to force a full remount when the plan changes.
 */
export function GardenPlannerWidget(props: GardenPlannerCoreProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return mountGardenPlanner(ref.current, props);
    // Intentional: props snapshot at mount time. Use `key` to remount on changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ref} className="h-full w-full" />;
}
