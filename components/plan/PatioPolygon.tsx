"use client";

import { useMemo } from "react";
import type { Vertex, ViewTransform } from "@/lib/plan/types";
import { worldToPixel, computeEdgeLabels } from "@/lib/plan/geometry";
import { COLORS } from "@/lib/plan/constants";

interface Props {
  vertices: Vertex[];
  patioOffset: Vertex;
  viewTransform: ViewTransform;
}

export function PatioPolygon({ vertices, patioOffset, viewTransform }: Props) {
  const offsetVerts: Vertex[] = useMemo(
    () => vertices.map(([vx, vy]) => [vx + patioOffset[0], vy + patioOffset[1]]),
    [vertices, patioOffset]
  );

  const pointsStr = useMemo(
    () =>
      offsetVerts
        .map((v) => worldToPixel(v, viewTransform).join(","))
        .join(" "),
    [offsetVerts, viewTransform]
  );

  const labels = useMemo(
    () => computeEdgeLabels(offsetVerts, viewTransform, 0.28),
    [offsetVerts, viewTransform]
  );

  return (
    <g>
      <polygon
        points={pointsStr}
        fill={`${COLORS.moss}22`}
        stroke={COLORS.forest}
        strokeWidth={2}
      />
      {labels.map((lbl, i) => {
        const [mx, my] = lbl.midPx;
        const [ox, oy] = lbl.offsetPx;
        return (
          <text
            key={i}
            x={mx + ox}
            y={my + oy}
            transform={`rotate(${lbl.angleDeg}, ${mx + ox}, ${my + oy})`}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fill={COLORS.ink}
            fontFamily="Instrument Sans, sans-serif"
            style={{ userSelect: "none", pointerEvents: "none" }}
          >
            {lbl.length.toFixed(2)} m
          </text>
        );
      })}
    </g>
  );
}
