"use client";

import { useRef, useEffect } from "react";
import { mountTilePlanner } from "@bloomy/tile-planner";
import type { TilePlannerCoreProps } from "@bloomy/tile-planner";

/**
 * Thin React wrapper around mountTilePlanner.
 * Pass a `key` prop to force a full remount when planType / config changes.
 */
export function PlannerWidget(props: TilePlannerCoreProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return mountTilePlanner(ref.current, props);
    // Intentional: props snapshot at mount time. Use `key` to remount on changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ref} className="h-full w-full" />;
}
