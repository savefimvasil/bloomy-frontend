"use client";

import type { Vertex, ViewTransform } from "@/lib/plan/types";
import { COLORS } from "@/lib/plan/constants";

interface Props {
  vertices: Vertex[];
  patioOffset: Vertex;
  viewTransform: ViewTransform;
}

function toPx(wx: number, wy: number, vt: ViewTransform): [number, number] {
  return [wx * vt.scale + vt.x, wy * vt.scale + vt.y];
}

export function ShapeEditor({ vertices, patioOffset, viewTransform }: Props) {
  const n = vertices.length;
  const [ox, oy] = patioOffset;

  return (
    <g style={{ pointerEvents: "none" }}>
      {/* Edge midpoint insertion handles — id="em_{i}" for PlannerCanvas hit-test */}
      {vertices.map((v, i) => {
        const next = vertices[(i + 1) % n];
        const [px, py] = toPx((v[0] + next[0]) / 2 + ox, (v[1] + next[1]) / 2 + oy, viewTransform);
        return (
          <g key={`em_${i}`} style={{ pointerEvents: "all" }}>
            <circle
              id={`em_${i}`}
              cx={px} cy={py} r={6}
              fill="white" fillOpacity={0.85}
              stroke={COLORS.forest} strokeWidth={1.5} strokeDasharray="3,2"
              style={{ cursor: "crosshair" }}
            />
            <text
              x={px} y={py + 0.5}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={10} fontWeight="700" fill={COLORS.forest}
              style={{ pointerEvents: "none", userSelect: "none" }}
            >+</text>
          </g>
        );
      })}

      {/* Vertex handles — id="vh_{i}" for drag, id="vd_{i}" for delete */}
      {vertices.map((v, i) => {
        const [px, py] = toPx(v[0] + ox, v[1] + oy, viewTransform);
        return (
          <g key={`vh_${i}`} style={{ pointerEvents: "all" }}>
            <circle
              id={`vh_${i}`}
              cx={px} cy={py} r={8}
              fill="white"
              stroke={COLORS.forest} strokeWidth={2.5}
              style={{ cursor: "move" }}
            />
            {n > 3 && (
              <>
                <circle
                  id={`vd_${i}`}
                  cx={px + 9} cy={py - 9} r={6}
                  fill="#dc2626"
                  style={{ cursor: "pointer" }}
                />
                <text
                  x={px + 9} y={py - 9}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={9} fontWeight="700" fill="white"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >×</text>
              </>
            )}
          </g>
        );
      })}
    </g>
  );
}
