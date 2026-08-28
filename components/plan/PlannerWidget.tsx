"use client";

import { useRef, useEffect } from "react";
import { mountTilePlanner } from "@tily/tile-planner";
import type { TilePlannerCoreProps, TilePlannerHandle } from "@tily/tile-planner";

export function PlannerWidget(props: TilePlannerCoreProps) {
  const ref = useRef<HTMLDivElement>(null);
  const handleRef = useRef<TilePlannerHandle | null>(null);

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

  useEffect(() => {
    handleRef.current?.update({ config: props.config, compact: props.compact, size: props.size });
  }, [props.config, props.compact, props.size]);

  return <div ref={ref} className="h-full w-full" />;
}
