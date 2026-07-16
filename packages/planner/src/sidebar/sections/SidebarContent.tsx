"use client";

import type { PlannerState, PlannerAction, FlooringMaterial, InstallationPattern, TileSize } from "../../lib/types";
import type { PlannerConfig } from "../../lib/config/types";
import { TILE_PRESETS } from "../../lib/constants";
import { resolveTileSize } from "../../lib/geometry";
import { MaterialSelector } from "./MaterialSelector";
import { SizeSelector } from "./SizeSelector";
import { PatternSelector } from "./PatternSelector";
import { GroutControl } from "./GroutControl";
import { OptimizationButtons } from "./OptimizationButtons";
import { StatsPanel } from "../StatsPanel";
import { ToggleButton } from "@/components/ui/toggle-button";

interface Props {
  config: PlannerConfig;
  state: PlannerState;
  dispatch: React.Dispatch<PlannerAction>;
  onExport: () => void;
  onExportPdf: () => void;
  onExportJson: () => void;
}

export function SidebarContent({ config, state, dispatch, onExport, onExportPdf, onExportJson }: Props) {
  const materialDef =
    config.materials.find((m) => m.id === state.flooringMaterial) ??
    config.materials[0];

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
        materials={config.materials}
        selected={state.flooringMaterial}
        onSelect={(m: FlooringMaterial) =>
          dispatch({ type: "SET_FLOORING_MATERIAL", material: m })
        }
      />

      {config.materials.length > 1 && <div className="h-px bg-line" />}

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
        onSelect={(pattern: InstallationPattern) =>
          dispatch({ type: "SET_INSTALLATION_PATTERN", pattern })
        }
      />

      {showChess && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
            Color pattern
          </p>
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

      <OptimizationButtons state={state} dispatch={dispatch} />

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
