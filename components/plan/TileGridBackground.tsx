"use client";

import { useMemo } from "react";
import type { ViewTransform } from "@/lib/plan/types";
import { COLORS } from "@/lib/plan/constants";

interface Props {
  viewTransform: ViewTransform;
  width: number;
  height: number;
  tileW: number; // metres
  tileH: number; // metres
}

export function TileGridBackground({ viewTransform, width, height, tileW, tileH }: Props) {
  const { x, y, scale } = viewTransform;

  const rects = useMemo(() => {
    const worldLeft   = -x / scale;
    const worldTop    = -y / scale;
    const worldRight  = (width  - x) / scale;
    const worldBottom = (height - y) / scale;

    const startX = Math.floor(worldLeft  / tileW) * tileW;
    const startY = Math.floor(worldTop   / tileH) * tileH;
    const endX   = Math.ceil(worldRight  / tileW) * tileW;
    const endY   = Math.ceil(worldBottom / tileH) * tileH;

    const cols = Math.round((endX - startX) / tileW);
    const rows = Math.round((endY - startY) / tileH);

    // Guard against extreme zoom-out
    if (cols * rows > 4000) return [];

    const items: React.ReactElement[] = [];
    for (let ci = 0; ci < cols; ci++) {
      for (let ri = 0; ri < rows; ri++) {
        const wx = startX + ci * tileW;
        const wy = startY + ri * tileH;
        const px = wx * scale + x;
        const py = wy * scale + y;
        const pw = tileW * scale;
        const ph = tileH * scale;
        items.push(
          <rect
            key={`${ci}_${ri}`}
            x={px} y={py} width={pw} height={ph}
            fill="none"
            stroke={COLORS.line}
            strokeWidth={0.8}
          />
        );
      }
    }
    return items;
  }, [x, y, scale, width, height, tileW, tileH]);

  return <g>{rects}</g>;
}
