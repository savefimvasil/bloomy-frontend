"use client";

import type { PlannerState, PlannerAction, InstallationPattern, TileSize } from "@/lib/plan/types";
import { outdoorConfig } from "@/lib/plan/config/outdoorConfig";
import { TILE_PRESETS } from "@/lib/plan/constants";
import { resolveTileSize } from "@/lib/plan/geometry";
import { SizeSelector } from "./SizeSelector";
import { PatternSelector } from "./PatternSelector";
import { GroutControl } from "./GroutControl";
import { StatsPanel } from "@/components/plan/StatsPanel";

interface Props {
  state: PlannerState;
  dispatch: React.Dispatch<PlannerAction>;
  onExport: () => void;
  onExportPdf: () => void;
  onExportJson: () => void;
}

const btnBase = "flex-1 rounded border px-3 py-1.5 text-xs font-medium transition";
const activeBtn = `${btnBase} border-leaf bg-leaf/15 text-forest`;
const inactiveBtn = `${btnBase} border-line bg-paper text-muted hover:border-leaf/50`;

export function OutdoorSidebarContent({ state, dispatch, onExport, onExportPdf, onExportJson }: Props) {
  const materialDef = outdoorConfig.materials[0];

  const { width: tileW, height: tileH } = resolveTileSize(state.tileSize, TILE_PRESETS);
  const isSquare = Math.abs(tileW - tileH) < 1e-6;

  const currentPattern: InstallationPattern = state.herringbone
    ? "herringbone"
    : state.brickOffset
    ? "brick"
    : state.rotation === 45
    ? "diagonal"
    : "straight";

  const showChess = currentPattern !== "herringbone";

  return (
    <div className="space-y-4">
      <SizeSelector
        sizes={materialDef.sizes}
        tileSize={state.tileSize}
        onSelect={(size: TileSize) => dispatch({ type: "SET_TILE_SIZE", size })}
      />

      <div className="h-px bg-line" />

      <PatternSelector
        patterns={materialDef.patterns}
        selected={currentPattern}
        isSquare={isSquare}
        onSelect={(pattern: InstallationPattern) => dispatch({ type: "SET_INSTALLATION_PATTERN", pattern })}
      />

      {showChess && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Color pattern</p>
          <div className="flex gap-2">
            <button
              className={!state.chessMode ? activeBtn : inactiveBtn}
              onClick={() => dispatch({ type: "SET_CHESS_MODE", chessMode: false })}
            >Plain</button>
            <button
              className={state.chessMode ? activeBtn : inactiveBtn}
              onClick={() => dispatch({ type: "SET_CHESS_MODE", chessMode: true })}
            >Chess</button>
          </div>
        </div>
      )}

      <GroutControl groutMm={state.groutMm} dispatch={dispatch} />

      <div className="h-px bg-line" />

      <StatsPanel
        stats={state.stats}
        tooManyTiles={state.tooManyTiles}
        chessMode={state.chessMode && showChess}
        onExport={onExport}
        onExportPdf={onExportPdf}
        onExportJson={onExportJson}
      />
    </div>
  );
}
