"use client";

import { useState } from "react";
import type { TileSize, TileRotation, PlannerAction } from "@/lib/plan/types";
import { resolveTileSize } from "@/lib/plan/geometry";
import { TILE_PRESETS } from "@/lib/plan/constants";
import { ToggleButton } from "@/components/ui/toggle-button";
import { Slider } from "@/components/ui/slider";

interface Props {
  tileSize: TileSize;
  rotation: TileRotation;
  chessMode: boolean;
  groutMm: number;
  brickOffset: boolean;
  dispatch: React.Dispatch<PlannerAction>;
}

export function TileControls({ tileSize, rotation, chessMode, groutMm, brickOffset, dispatch }: Props) {
  const [customW, setCustomW] = useState("600");
  const [customH, setCustomH] = useState("600");

  function setSize(size: TileSize) {
    dispatch({ type: "SET_TILE_SIZE", size });
  }

  function applyCustom() {
    const w = parseFloat(customW) / 1000;
    const h = parseFloat(customH) / 1000;
    if (isFinite(w) && isFinite(h) && w > 0 && h > 0) {
      setSize({ kind: "custom", width: w, height: h });
    }
  }

  const activeKind = tileSize.kind;
  const { width: tileW, height: tileH } = resolveTileSize(tileSize, TILE_PRESETS);
  const isSquare = Math.abs(tileW - tileH) < 1e-6;

  const layoutIsBrick = brickOffset;
  const layoutIsDiag  = !brickOffset && rotation === 45;
  const layoutIsStraight = !brickOffset && rotation === 0;

  return (
    <div className="space-y-4">
      {/* Tile size */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Tile size</p>
        <div className="flex gap-2">
          <ToggleButton active={activeKind === "600x600"} onClick={() => setSize({ kind: "600x600" })}>
            600×600
          </ToggleButton>
          <ToggleButton active={activeKind === "900x600"} onClick={() => setSize({ kind: "900x600" })}>
            900×600
          </ToggleButton>
          <ToggleButton active={activeKind === "custom"} onClick={applyCustom}>
            Custom
          </ToggleButton>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number" min="50" max="3000" step="10"
            value={customW}
            onChange={(e) => setCustomW(e.target.value)}
            onBlur={() => activeKind === "custom" && applyCustom()}
            onKeyDown={(e) => e.key === "Enter" && applyCustom()}
            className="w-full rounded border border-line bg-paper px-2 py-1 text-xs text-ink outline-none focus:border-leaf"
            placeholder="W mm"
          />
          <span className="text-xs text-muted">×</span>
          <input
            type="number" min="50" max="3000" step="10"
            value={customH}
            onChange={(e) => setCustomH(e.target.value)}
            onBlur={() => activeKind === "custom" && applyCustom()}
            onKeyDown={(e) => e.key === "Enter" && applyCustom()}
            className="w-full rounded border border-line bg-paper px-2 py-1 text-xs text-ink outline-none focus:border-leaf"
            placeholder="H mm"
          />
          <span className="text-xs text-muted">mm</span>
        </div>
      </div>

      {/* Layout */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Layout</p>
        <div className="flex gap-2">
          <ToggleButton
            active={layoutIsStraight}
            onClick={() => {
              dispatch({ type: "SET_BRICK_OFFSET", enabled: false });
              dispatch({ type: "SET_ROTATION", rotation: 0 });
            }}
          >
            Straight
          </ToggleButton>
          <ToggleButton
            active={layoutIsBrick}
            onClick={() => dispatch({ type: "SET_BRICK_OFFSET", enabled: true })}
          >
            Brick
          </ToggleButton>
          <ToggleButton
            active={layoutIsDiag}
            disabled={!isSquare}
            title={!isSquare ? "Diagonal mode requires a square tile" : undefined}
            onClick={() => {
              if (!isSquare) return;
              dispatch({ type: "SET_BRICK_OFFSET", enabled: false });
              dispatch({ type: "SET_ROTATION", rotation: 45 });
            }}
          >
            Diagonal
          </ToggleButton>
        </div>
      </div>

      {/* Pattern */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Pattern</p>
        <div className="flex gap-2">
          <ToggleButton active={!chessMode} onClick={() => dispatch({ type: "SET_CHESS_MODE", chessMode: false })}>
            Plain
          </ToggleButton>
          <ToggleButton active={chessMode} onClick={() => dispatch({ type: "SET_CHESS_MODE", chessMode: true })}>
            Chess
          </ToggleButton>
        </div>
      </div>

      {/* Grout */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Grout gap</p>
          <span className="text-xs font-medium text-ink tabular-nums">{groutMm} mm</span>
        </div>
        <Slider
          min={0}
          max={6}
          step={1}
          value={groutMm}
          onChange={(e) =>
            dispatch({ type: "SET_GROUT", groutMm: parseInt(e.target.value, 10) })
          }
          aria-label="Grout gap"
        />
      </div>
    </div>
  );
}
