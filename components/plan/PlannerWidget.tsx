"use client";

import { useRef, useEffect } from "react";
import { mountTilePlanner } from "@bloomy/tile-planner";
import type { TilePlannerCoreProps, TilePlannerHandle } from "@bloomy/tile-planner";

export function PlannerWidget(props: TilePlannerCoreProps) {
  const ref       = useRef<HTMLDivElement>(null);
  const handleRef = useRef<TilePlannerHandle | null>(null);

  // Mount once
  useEffect(() => {
    if (!ref.current) return;
    const handle = mountTilePlanner(ref.current, props);
    handleRef.current = handle;
    return () => {
      handle.unmount();
      handleRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Smooth in-place update for config (engineering flag) and compact toggle.
  // root.render() reconciles without unmounting — canvas state is preserved.
  useEffect(() => {
    handleRef.current?.update({ config: props.config, compact: props.compact });
  }, [props.config, props.compact]);

  return <div ref={ref} className="h-full w-full" />;
}
