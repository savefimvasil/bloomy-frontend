"use client";

import { useRef, useEffect } from "react";
import { mountGardenPlanner } from "@bloomy/garden-planner";
import type { GardenPlannerCoreProps } from "@bloomy/garden-planner";

export function GardenPlannerWidget(props: GardenPlannerCoreProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return mountGardenPlanner(ref.current, props);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ref} className="h-full w-full" />;
}
