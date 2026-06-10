"use client";

import { useMemo } from "react";
import type { ViewTransform } from "@/lib/plan/types";
import { rotateMinus45, rotatePlus45, boundingBox, snapDown } from "@/lib/plan/geometry";
import { COLORS } from "@/lib/plan/constants";

interface Props {
  viewTransform: ViewTransform;
  width: number;
  height: number;
  tileW: number;
  tileH: number;
  rotation: 0 | 45;
}

export function TileGridBackground({ viewTransform, width, height, tileW, tileH, rotation }: Props) {
  const { x, y, scale } = viewTransform;

  const elements = useMemo(() => {
    if (rotation === 0) {
      const worldLeft   = -x / scale;
      const worldTop    = -y / scale;
      const worldRight  = (width  - x) / scale;
      const worldBottom = (height - y) / scale;

      const startX = snapDown(worldLeft,  tileW);
      const startY = snapDown(worldTop,   tileH);
      const cols = Math.ceil((worldRight  - startX) / tileW);
      const rows = Math.ceil((worldBottom - startY) / tileH);

      if (cols * rows > 4000) return [];

      const items: React.ReactElement[] = [];
      for (let ci = 0; ci < cols; ci++) {
        for (let ri = 0; ri < rows; ri++) {
          const px = (startX + ci * tileW) * scale + x;
          const py = (startY + ri * tileH) * scale + y;
          items.push(
            <rect
              key={`${ci}_${ri}`}
              x={px} y={py} width={tileW * scale} height={tileH * scale}
              fill="none" stroke={COLORS.line} strokeWidth={0.8}
            />
          );
        }
      }
      return items;
    }

    // Diagonal mode — work in the rotated tile frame, then project diamonds back to screen
    const vpCorners: [number, number][] = [
      [-x / scale,           -y / scale          ],
      [(width - x) / scale,  -y / scale          ],
      [(width - x) / scale,  (height - y) / scale],
      [-x / scale,           (height - y) / scale],
    ];
    const rotated = vpCorners.map(([cx, cy]) => rotateMinus45([cx, cy]));
    const { minX: minRX, maxX: maxRX, minY: minRY, maxY: maxRY } = boundingBox(rotated);

    const startRX = snapDown(minRX, tileW) - tileW;
    const startRY = snapDown(minRY, tileH) - tileH;
    const cols = Math.ceil((maxRX + tileW - startRX) / tileW);
    const rows = Math.ceil((maxRY + tileH - startRY) / tileH);

    if (cols * rows > 4000) return [];

    const items: React.ReactElement[] = [];
    for (let ci = 0; ci < cols; ci++) {
      for (let ri = 0; ri < rows; ri++) {
        const rx0 = startRX + ci * tileW;
        const ry0 = startRY + ri * tileH;
        const rx1 = rx0 + tileW;
        const ry1 = ry0 + tileH;

        const pts = [
          rotatePlus45([rx0, ry0]),
          rotatePlus45([rx1, ry0]),
          rotatePlus45([rx1, ry1]),
          rotatePlus45([rx0, ry1]),
        ];
        const pointsStr = pts.map(([wx, wy]) => `${wx * scale + x},${wy * scale + y}`).join(" ");

        items.push(
          <polygon
            key={`${ci}_${ri}`}
            points={pointsStr}
            fill="none" stroke={COLORS.line} strokeWidth={0.8}
          />
        );
      }
    }
    return items;
  }, [x, y, scale, width, height, tileW, tileH, rotation]);

  return <g>{elements}</g>;
}
