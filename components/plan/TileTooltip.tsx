"use client";

import { useMemo } from "react";
import type { TileResult, ViewTransform } from "@/lib/plan/types";
import { centroid } from "@/lib/plan/geometry";
import { tileLetter, edgeLengthsMm } from "@/lib/plan/labels";

interface Props {
  tiles: TileResult[];
  selectedId: string | null;
  viewTransform: ViewTransform;
  tileW: number;
  tileH: number;
}

export function TileTooltip({ tiles, selectedId, viewTransform, tileW, tileH }: Props) {
  const { x, y, scale } = viewTransform;

  return useMemo(() => {
    if (!selectedId) return null;
    const selTile = tiles.find(t => t.id === selectedId);
    if (!selTile) return null;

    const pxPts: [number, number][] = selTile.points.map(([wx, wy]) => [wx * scale + x, wy * scale + y]);
    const [cx, cy] = centroid(pxPts);

    let lines: { text: string; bold: boolean }[];
    if (selTile.isCut) {
      const sides = edgeLengthsMm(selTile.points);
      const areaCm2 = (selTile.cutArea * 10000).toFixed(1);
      lines = [
        { text: `Tile ${tileLetter(selTile.physicalTileIdx)}, piece ${selTile.pieceIdx + 1}`, bold: true },
        { text: `Sides: ${sides.join(", ")} mm`, bold: false },
        { text: `Area: ${areaCm2} cm²`, bold: false },
      ];
    } else {
      const wMm = Math.round(tileW * 1000);
      const hMm = Math.round(tileH * 1000);
      const areaCm2 = (tileW * tileH * 10000).toFixed(1);
      lines = [
        { text: `Sides: ${wMm}, ${hMm}, ${wMm}, ${hMm} mm`, bold: true },
        { text: `Area: ${areaCm2} cm²`, bold: false },
      ];
    }

    const lh = 15;
    const pad = 8;
    const tooltipW = Math.max(140, Math.max(...lines.map(l => l.text.length)) * 6.2 + pad * 2);
    const tooltipH = lines.length * lh + pad * 2 - 2;
    const tx = cx + 14;
    const ty = cy - tooltipH - 14;

    return (
      <g style={{ pointerEvents: "none" }}>
        <rect x={tx + 2} y={ty + 2} width={tooltipW} height={tooltipH} rx={4} fill="rgba(0,0,0,0.15)" />
        <rect x={tx} y={ty} width={tooltipW} height={tooltipH} rx={4}
          fill="white" fillOpacity={0.97} stroke="#ccc" strokeWidth={1} />
        {lines.map((line, i) => (
          <text
            key={i}
            x={tx + pad}
            y={ty + pad + i * lh + 10}
            fontSize={11}
            fontWeight={line.bold ? "600" : "400"}
            fill={line.bold ? "#1a3a1a" : "#555"}
            style={{ fontFamily: "sans-serif" }}
          >
            {line.text}
          </text>
        ))}
      </g>
    );
  }, [tiles, selectedId, x, y, scale, tileW, tileH]);
}
