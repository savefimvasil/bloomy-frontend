"use client";

import { useRef, useEffect, useState } from "react";
import Script from "next/script";
import type { TilePlannerCoreProps } from "@bloomy/tile-planner";

const CDN_TOKEN = process.env.NEXT_PUBLIC_BLOOMY_CDN_TOKEN ?? "";

type TileHandle = { unmount: () => void; update: (p: Partial<TilePlannerCoreProps>) => void };

export function PlannerWidget(props: TilePlannerCoreProps) {
  const ref = useRef<HTMLDivElement>(null);
  const handleRef = useRef<TileHandle | null>(null);
  const [scriptReady, setScriptReady] = useState(
    typeof window !== "undefined" && !!window.BloomyPlanner,
  );

  // Mount once when script is ready
  useEffect(() => {
    if (!scriptReady || !ref.current) return;
    const handle = window.BloomyPlanner!.mount(ref.current, {
      ...props,
      token: CDN_TOKEN,
    });
    handleRef.current = handle;
    return () => {
      handle.unmount();
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptReady]);

  // In-place update for config / compact without remounting
  useEffect(() => {
    handleRef.current?.update({ config: props.config, compact: props.compact });
  }, [props.config, props.compact]);

  return (
    <>
      <link rel="stylesheet" href="https://cdn.bloomy.garden/tile-planner.css" />
      <Script
        src="https://cdn.bloomy.garden/tile-planner.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div ref={ref} className="h-full w-full" />
    </>
  );
}
