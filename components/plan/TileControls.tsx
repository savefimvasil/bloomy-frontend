"use client";

import { useState } from "react";
import type { TileSize, TileRotation, PlannerAction } from "@/lib/plan/types";
import { resolveTileSize } from "@/lib/plan/geometry";
import { TILE_PRESETS } from "@/lib/plan/constants";

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

  const btnBase = "flex-1 rounded border px-3 py-1.5 text-xs font-medium transition";
  const activeBtn = `${btnBase} border-leaf bg-leaf/15 text-forest`;
  const inactiveBtn = `${btnBase} border-line bg-paper text-muted hover:border-leaf/50`;
  const disabledBtn = `${btnBase} border-line bg-paper text-muted/40 cursor-not-allowed opacity-40`;

  const layoutIsBrick = brickOffset;
  const layoutIsDiag  = !brickOffset && rotation === 45;
  const layoutIsStraight = !brickOffset && rotation === 0;

  return (
    <div className="space-y-4">
      {/* Tile size */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Tile size</p>
        <div className="flex gap-2">
          <button className={activeKind === "600x600" ? activeBtn : inactiveBtn} onClick={() => setSize({ kind: "600x600" })}>
            600×600
          </button>
          <button className={activeKind === "900x600" ? activeBtn : inactiveBtn} onClick={() => setSize({ kind: "900x600" })}>
            900×600
          </button>
          <button className={activeKind === "custom" ? activeBtn : inactiveBtn} onClick={applyCustom}>
            Custom
          </button>
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
          <button
            className={layoutIsStraight ? activeBtn : inactiveBtn}
            onClick={() => {
              dispatch({ type: "SET_BRICK_OFFSET", enabled: false });
              dispatch({ type: "SET_ROTATION", rotation: 0 });
            }}
          >
            Straight
          </button>
          <button
            className={layoutIsBrick ? activeBtn : inactiveBtn}
            onClick={() => dispatch({ type: "SET_BRICK_OFFSET", enabled: true })}
          >
            Brick
          </button>
          <button
            className={!isSquare ? disabledBtn : layoutIsDiag ? activeBtn : inactiveBtn}
            disabled={!isSquare}
            title={!isSquare ? "Diagonal mode requires a square tile" : undefined}
            onClick={() => {
              if (!isSquare) return;
              dispatch({ type: "SET_BRICK_OFFSET", enabled: false });
              dispatch({ type: "SET_ROTATION", rotation: 45 });
            }}
          >
            Diagonal
          </button>
        </div>
      </div>

      {/* Pattern */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Pattern</p>
        <div className="flex gap-2">
          <button className={!chessMode ? activeBtn : inactiveBtn} onClick={() => dispatch({ type: "SET_CHESS_MODE", chessMode: false })}>
            Plain
          </button>
          <button className={chessMode ? activeBtn : inactiveBtn} onClick={() => dispatch({ type: "SET_CHESS_MODE", chessMode: true })}>
            Chess
          </button>
        </div>
      </div>

      {/* Grout */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Grout gap</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch({ type: "SET_GROUT", groutMm: groutMm - 1 })}
            disabled={groutMm <= 0}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-line bg-paper text-sm text-muted transition hover:border-leaf/50 disabled:opacity-30"
          >
            −
          </button>
          <span className="flex-1 text-center text-xs font-medium text-ink">
            {groutMm} mm
          </span>
          <button
            onClick={() => dispatch({ type: "SET_GROUT", groutMm: groutMm + 1 })}
            disabled={groutMm >= 6}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-line bg-paper text-sm text-muted transition hover:border-leaf/50 disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
