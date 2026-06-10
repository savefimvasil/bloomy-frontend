"use client";

import type { ReactNode } from "react";

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  width?: number;
  children: ReactNode;
}

export function CollapsibleSidebar({ collapsed, onToggle, width = 320, children }: Props) {
  return (
    <aside
      className="relative flex h-full shrink-0 flex-col border-l border-line bg-canvas"
      style={{ width: collapsed ? 40 : width }}
    >
      {/* Toggle tab floating on left edge */}
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
