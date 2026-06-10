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
    () => computeEdgeLabels(offsetVerts, viewTransform, 0.20),
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
        const tx = mx + ox;
        const ty = my + oy;
        return (
          <text
            key={i}
            x={tx}
            y={ty}
            transform={`rotate(${lbl.angleDeg}, ${tx}, ${ty})`}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={14}
            fontWeight="600"
            fill={COLORS.ink}
            stroke="white"
            strokeWidth={3}
            paintOrder="stroke"
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
