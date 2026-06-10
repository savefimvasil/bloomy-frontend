"use client";

import type { PlannerState, PlannerAction } from "@/lib/plan/types";
import { TileControls } from "./TileControls";
import { StatsPanel } from "./StatsPanel";

interface Props {
  state: PlannerState;
  tooManyTiles: boolean;
  dispatch: React.Dispatch<PlannerAction>;
  editingShape: boolean;
  onToggleEditShape: () => void;
  onExport: () => void;
  onExportPdf: () => void;
}

export function PlannerSidebar({ state, tooManyTiles, dispatch, editingShape, onToggleEditShape, onExport, onExportPdf }: Props) {
  return (
    <aside className="flex h-full w-80 shrink-0 flex-col gap-6 overflow-y-auto border-l border-line bg-canvas px-4 pb-5 pt-20">
      <div>
        <h2 className="text-base font-semibold text-ink">Patio Tile Planner</h2>
        <p className="mt-0.5 text-xs text-muted">Drag the patio on the canvas to reposition it.</p>
      </div>

      <button
        onClick={onToggleEditShape}
        className={
          editingShape
            ? "w-full rounded border border-amber-400 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
            : "w-full rounded border border-leaf bg-leaf/10 px-3 py-2 text-sm font-medium text-forest transition hover:bg-leaf/20"
        }
      >
        {editingShape ? "Done editing shape" : "Edit shape"}
      </button>

      <div className="h-px bg-line" />

      <TileControls tileSize={state.tileSize} rotation={state.rotation} chessMode={state.chessMode} dispatch={dispatch} />

      <div className="h-px bg-line" />

      <StatsPanel stats={state.stats} tooManyTiles={tooManyTiles} chessMode={state.chessMode} onExport={onExport} onExportPdf={onExportPdf} />
    </aside>
  );
}
