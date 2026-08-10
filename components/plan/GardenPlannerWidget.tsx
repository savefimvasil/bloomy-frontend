"use client";

import { useRef, useEffect, useState } from "react";
import Script from "next/script";
import type { GardenPlannerCoreProps } from "@bloomy/garden-planner";

const CDN_TOKEN = process.env.NEXT_PUBLIC_BLOOMY_CDN_TOKEN ?? "";
const CSS_HREF = "https://cdn.bloomy.garden/garden-planner.css";

export function GardenPlannerWidget(props: GardenPlannerCoreProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(
    typeof window !== "undefined" && !!window.BloomyGardenPlanner,
  );

  useEffect(() => {
    if (document.querySelector(`link[href="${CSS_HREF}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = CSS_HREF;
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (!scriptReady || !ref.current) return;
    return window.BloomyGardenPlanner!.mount(ref.current, {
      ...props,
      token: CDN_TOKEN,
    }).unmount;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptReady]);

  return (
    <>
      <Script
        src="https://cdn.bloomy.garden/garden-planner.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div ref={ref} className="h-full w-full" />
    </>
  );
}
