"use client";

import { useMemo } from "react";
import type { TileResult, ViewTransform } from "@/lib/plan/types";
import { centroid } from "@/lib/plan/geometry";
import { pieceLabel } from "@/lib/plan/labels";
import { COLORS } from "@/lib/plan/constants";

const PALETTE = [
  "#e05c3a", "#3a7bd5", "#e0b83a", "#9b3ac8",
  "#3ab87a", "#e03a8a", "#3ab8d5", "#8ab83a",
  "#c8733a", "#3a4fc8", "#c83a5c", "#3ac8a8",
];

function physicalTileColor(idx: number): string {
  return PALETTE[idx % PALETTE.length];
}

interface Props {
  tiles: TileResult[];
  viewTransform: ViewTransform;
  chessMode: boolean;
  selectedId: string | null;
}

export function TileGrid({ tiles, viewTransform, chessMode, selectedId }: Props) {
  const { x, y, scale } = viewTransform;

  const rendered = useMemo(() => {
    function groupKey(tile: TileResult): string | null {
      if (!tile.isCut) return null;
      return String(tile.physicalTileIdx); // globally unique after assignPhysicalTiles
    }

    const selTile = selectedId ? (tiles.find(t => t.id === selectedId) ?? null) : null;
    const selGroupKey = selTile ? groupKey(selTile) : null;
    const hasSelection = selectedId !== null;

    const shapes: React.ReactElement[] = [];
    const chessTints: React.ReactElement[] = [];
    const highlights: React.ReactElement[] = [];
    const labels: React.ReactElement[] = [];

    for (const tile of tiles) {
      const pts = tile.points;
      const isSelected = tile.id === selectedId;
      const inGroup = selGroupKey !== null && groupKey(tile) === selGroupKey;
      const isDimmed = hasSelection && !inGroup;

      const fill = tile.isCut ? physicalTileColor(tile.physicalTileIdx) : COLORS.leaf;
      const baseOpacity = tile.isCut ? 0.82 : 0.55;
      const opacity = isDimmed ? baseOpacity * 0.28 : baseOpacity;
      const label = tile.isCut ? pieceLabel(tile.physicalTileIdx, tile.pieceIdx) : null;
      // id used by PlannerCanvas elementsFromPoint hit-test
      const shapeId = `t_${tile.id}`;

      if (!tile.isCut && pts.length === 4) {
        const x0 = pts[0][0] * scale + x;
        const y0 = pts[0][1] * scale + y;
        const x1 = pts[2][0] * scale + x;
        const y1 = pts[2][1] * scale + y;
        const w = x1 - x0;
        const h = y1 - y0;
        if (w > 0 && h > 0) {
          shapes.push(
            <rect
              key={tile.id}
              id={shapeId}
              x={x0} y={y0} width={w} height={h}
              fill={fill} fillOpacity={opacity}
              stroke={COLORS.forest} strokeWidth={0.8}
              style={{ cursor: "pointer" }}
            />
          );
          if (chessMode) {
            const isBlack = (tile.gridCol + tile.gridRow) % 2 === 1;
            chessTints.push(
              <rect
                key={`ct_${tile.id}`}
                x={x0} y={y0} width={w} height={h}
                fill={isBlack ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.45)"}
                style={{ pointerEvents: "none" }}
              />
            );
          }
          if (inGroup) {
            highlights.push(
              <rect
                key={`hl_${tile.id}`}
                x={x0} y={y0} width={w} height={h}
                fill="none"
                stroke={isSelected ? "#ff6b00" : "#ffb700"}
                strokeWidth={isSelected ? 2.5 : 2}
                style={{ pointerEvents: "none" }}
              />
            );
          }
          continue;
        }
      }

      const pxPts: [number, number][] = pts.map(([wx, wy]) => [wx * scale + x, wy * scale + y]);
      const pointsStr = pxPts.map(([px, py]) => `${px},${py}`).join(" ");

      shapes.push(
        <polygon
          key={tile.id}
          id={shapeId}
          points={pointsStr}
          fill={fill} fillOpacity={opacity}
          stroke={COLORS.forest} strokeWidth={0.8}
          style={{ cursor: "pointer" }}
        />
      );

      if (chessMode) {
        const isBlack = (tile.gridCol + tile.gridRow) % 2 === 1;
        chessTints.push(
          <polygon
            key={`ct_${tile.id}`}
            points={pointsStr}
            fill={isBlack ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.45)"}
            style={{ pointerEvents: "none" }}
          />
        );
      }

      if (inGroup) {
        highlights.push(
          <polygon
            key={`hl_${tile.id}`}
            points={pointsStr}
            fill="none"
            stroke={isSelected ? "#ff6b00" : "#ffb700"}
            strokeWidth={isSelected ? 2.5 : 2}
            style={{ pointerEvents: "none" }}
          />
        );
      }

      if (label) {
        const [cx, cy] = centroid(pxPts);
        const pxArea = pxPts.reduce((acc, _, i) => {
          const [x1, y1] = pxPts[i];
          const [x2, y2] = pxPts[(i + 1) % pxPts.length];
          return acc + x1 * y2 - x2 * y1;
        }, 0);
        if (Math.abs(pxArea) / 2 > 200) {
          labels.push(
            <text
              key={`lbl_${tile.id}`}
              x={cx} y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={Math.min(14, Math.max(9, scale * 0.12))}
              fontWeight="700"
              fill="#fff"
              stroke="#0005"
              strokeWidth={2.5}
              paintOrder="stroke"
              style={{ userSelect: "none", pointerEvents: "none", fontFamily: "sans-serif" }}
            >
              {label}
            </text>
          );
        }
      }
    }

    return { shapes, chessTints, highlights, labels };
  }, [tiles, x, y, scale, chessMode, selectedId]);

  const { shapes, chessTints, highlights, labels } = rendered;

  return (
    <g>
      {shapes}
      {chessTints}
      {highlights}
      {labels}
    </g>
  );
}
