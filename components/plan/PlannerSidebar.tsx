"use client";

import type { PlannerState, PlannerAction } from "@/lib/plan/types";
import { CollapsibleSidebar } from "@/components/ui/layout/CollapsibleSidebar";
import { Button } from "@/components/ui/button";
import { IndoorSidebarContent } from "./sidebar/IndoorSidebarContent";
import { OutdoorSidebarContent } from "./sidebar/OutdoorSidebarContent";
import { UploadFloorplanButton } from "./UploadFloorplanButton";

interface Props {
  state: PlannerState;
  dispatch: React.Dispatch<PlannerAction>;
  editingShape: boolean;
  onToggleEditShape: () => void;
  onExport: () => void;
  onExportPdf: () => void;
  onExportJson: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function PlannerSidebar({
  state, dispatch, editingShape,
  onToggleEditShape, onExport, onExportPdf, onExportJson,
  collapsed, onToggleCollapse,
}: Props) {
  const isIndoor = state.planType === "indoor";

  return (
    <CollapsibleSidebar collapsed={collapsed} onToggle={onToggleCollapse}>
      <div>
        <h2 className="text-base font-semibold text-ink">
          {isIndoor ? "Indoor Planner" : "Patio Tile Planner"}
        </h2>
        <p className="mt-0.5 text-xs text-muted">
          {isIndoor
            ? "Drag the room on the canvas to reposition."
            : "Drag the patio on the canvas to reposition it."}
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
        <UploadFloorplanButton dispatch={dispatch} />
      </div>

      <div className="h-px bg-line" />

      {isIndoor ? (
        <IndoorSidebarContent
          state={state}
          dispatch={dispatch}
          onExport={onExport}
          onExportPdf={onExportPdf}
          onExportJson={onExportJson}
        />
      ) : (
        <OutdoorSidebarContent
          state={state}
          dispatch={dispatch}
          onExport={onExport}
          onExportPdf={onExportPdf}
          onExportJson={onExportJson}
        />
      )}
    </CollapsibleSidebar>
  );
}
