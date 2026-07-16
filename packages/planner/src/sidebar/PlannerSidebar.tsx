"use client";

import type { PlannerState, PlannerAction } from "../lib/types";
import type { PlannerConfig } from "../lib/config/types";
import { CollapsibleSidebar } from "@/components/ui/layout/CollapsibleSidebar";
import { Button } from "@/components/ui/button";
import { SidebarContent } from "./sections/SidebarContent";

interface Props {
  config: PlannerConfig;
  state: PlannerState;
  dispatch: React.Dispatch<PlannerAction>;
  editingShape: boolean;
  onToggleEditShape: () => void;
  onExport: () => void;
  onExportPdf: () => void;
  onExportJson: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  uploadNode?: React.ReactNode;
}

export function PlannerSidebar({
  config,
  state,
  dispatch,
  editingShape,
  onToggleEditShape,
  onExport,
  onExportPdf,
  onExportJson,
  collapsed,
  onToggleCollapse,
  uploadNode,
}: Props) {
  return (
    <CollapsibleSidebar collapsed={collapsed} onToggle={onToggleCollapse}>
      <div>
        <h2 className="text-base font-semibold text-ink">
          {config.label ?? "Planner"}
        </h2>
        <p className="mt-0.5 text-xs text-muted">
          {config.description ?? "Drag the shape on the canvas to reposition it."}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          onClick={onToggleEditShape}
          className={
            editingShape
              ? "w-full border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100"
              : "w-full border-leaf bg-leaf/10 text-forest hover:bg-leaf/20"
          }
        >
          {editingShape ? "Done editing shape" : "Edit shape"}
        </Button>
        {uploadNode}
      </div>

      <div className="h-px bg-line" />

      <SidebarContent
        config={config}
        state={state}
        dispatch={dispatch}
        onExport={onExport}
        onExportPdf={onExportPdf}
        onExportJson={onExportJson}
      />
    </CollapsibleSidebar>
  );
}
