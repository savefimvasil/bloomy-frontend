"use client";

import { useEffect, useState, type ReactNode } from "react";

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  width?: number;
  children: ReactNode;
}

function useIsMobile(bp = 768) {
  const [is, setIs] = useState(false);
  useEffect(() => {
    const fn = () => setIs(window.innerWidth < bp);
    fn();
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [bp]);
  return is;
}

export function CollapsibleSidebar({ collapsed, onToggle, width = 320, children }: Props) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div
        className="shrink-0 overflow-hidden border-t border-line bg-canvas transition-all duration-200"
        style={{ height: collapsed ? 48 : "50vh" }}
      >
        {/* Drag-handle strip */}
        <button
          onClick={onToggle}
          className="flex h-12 w-full items-center justify-between px-4"
          aria-label={collapsed ? "Expand settings" : "Collapse settings"}
        >
          <span className="text-sm font-medium text-ink">Settings</span>
          <span className="text-xs text-muted">{collapsed ? "▲" : "▼"}</span>
        </button>

        {!collapsed && (
          <div
            className="flex flex-col gap-4 overflow-y-auto px-4 pb-6"
            style={{ height: "calc(50vh - 48px)" }}
          >
            {children}
          </div>
        )}
      </div>
    );
  }

  // Desktop: right sidebar
  return (
    <aside
      className="relative flex h-full shrink-0 flex-col border-l border-line bg-canvas"
      style={{ width: collapsed ? 40 : width }}
    >
      <button
        onClick={onToggle}
        className="absolute -left-3 top-1/2 z-20 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-canvas text-xs text-muted shadow-sm transition hover:scale-110 hover:bg-mist hover:text-ink"
        title={collapsed ? "Expand panel" : "Collapse panel"}
        aria-label={collapsed ? "Expand panel" : "Collapse panel"}
      >
        {collapsed ? "‹" : "›"}
      </button>

      {!collapsed && (
        <div className="flex h-full flex-col gap-6 overflow-y-auto px-4 p-5">
          {children}
        </div>
      )}
    </aside>
  );
}
