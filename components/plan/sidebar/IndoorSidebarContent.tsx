"use client";

import type { PlannerState, PlannerAction, FlooringMaterial, InstallationPattern, TileSize } from "@/lib/plan/types";
import { indoorConfig } from "@/lib/plan/config/indoorConfig";
import { TILE_PRESETS } from "@/lib/plan/constants";
import { resolveTileSize } from "@/lib/plan/geometry";
import { MaterialSelector } from "./MaterialSelector";
import { SizeSelector } from "./SizeSelector";
import { PatternSelector } from "./PatternSelector";
import { GroutControl } from "./GroutControl";
import { StatsPanel } from "@/components/plan/StatsPanel";
import { ToggleButton } from "@/components/ui/toggle-button";

interface Props {
  state: PlannerState;
  dispatch: React.Dispatch<PlannerAction>;
  onExport: () => void;
  onExportPdf: () => void;
  onExportJson: () => void;
}

export function IndoorSidebarContent({ state, dispatch, onExport, onExportPdf, onExportJson }: Props) {
  const materialDef = indoorConfig.materials.find(m => m.id === state.flooringMaterial)!;

  const { width: tileW, height: tileH } = resolveTileSize(state.tileSize, TILE_PRESETS);
  const isSquare = Math.abs(tileW - tileH) < 1e-6;

  const currentPattern: InstallationPattern = state.herringbone
    ? "herringbone"
    : state.brickOffset
    ? "brick"
    : state.rotation === 45
    ? "diagonal"
    : "straight";

  const showChess = materialDef.showChess && currentPattern !== "herringbone";

  return (
    <div className="space-y-4">
      <MaterialSelector
        materials={indoorConfig.materials}
        selected={state.flooringMaterial}
        onSelect={(m: FlooringMaterial) => dispatch({ type: "SET_FLOORING_MATERIAL", material: m })}
      />

      <div className="h-px bg-line" />

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
            <ToggleButton
              active={!state.chessMode}
              onClick={() => dispatch({ type: "SET_CHESS_MODE", chessMode: false })}
            >
              Plain
            </ToggleButton>
            <ToggleButton
              active={state.chessMode}
              onClick={() => dispatch({ type: "SET_CHESS_MODE", chessMode: true })}
            >
              Chess
            </ToggleButton>
          </div>
        </div>
      )}

      {materialDef.showGrout && (
        <GroutControl groutMm={state.groutMm} dispatch={dispatch} />
      )}

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
