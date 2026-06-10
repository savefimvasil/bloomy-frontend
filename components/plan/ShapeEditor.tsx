"use client";

import { useMemo } from "react";
import type { Vertex, ViewTransform } from "@/lib/plan/types";
import { COLORS } from "@/lib/plan/constants";
import { centroid } from "@/lib/plan/geometry";

interface Props {
  vertices: Vertex[];
  patioOffset: Vertex;
  viewTransform: ViewTransform;
}

function toPx(wx: number, wy: number, vt: ViewTransform): [number, number] {
  return [wx * vt.scale + vt.x, wy * vt.scale + vt.y];
}

function vertexAngleDeg(prev: Vertex, curr: Vertex, next: Vertex): number {
  const ux = prev[0] - curr[0], uy = prev[1] - curr[1];
  const vx = next[0] - curr[0], vy = next[1] - curr[1];
  const uLen = Math.sqrt(ux * ux + uy * uy);
  const vLen = Math.sqrt(vx * vx + vy * vy);
  if (uLen < 1e-9 || vLen < 1e-9) return 0;
  const cosA = Math.max(-1, Math.min(1, (ux * vx + uy * vy) / (uLen * vLen)));
  return Math.acos(cosA) * (180 / Math.PI);
}

export function ShapeEditor({ vertices, patioOffset, viewTransform }: Props) {
  const n = vertices.length;
  const [ox, oy] = patioOffset;

  const offsetVerts: Vertex[] = useMemo(
    () => vertices.map(([vx, vy]): Vertex => [vx + ox, vy + oy]),
    [vertices, ox, oy]
  );

  const [cpx, cpy] = useMemo(() => {
    const [cx, cy] = centroid(offsetVerts);
    return toPx(cx, cy, viewTransform);
  }, [offsetVerts, viewTransform]);

  return (
    <g style={{ pointerEvents: "none" }}>
      {/* Edge midpoint insertion handles — id="em_{i}" */}
      {vertices.map((v, i) => {
        const next = vertices[(i + 1) % n];
        const [px, py] = toPx(
          (v[0] + next[0]) / 2 + ox,
          (v[1] + next[1]) / 2 + oy,
          viewTransform
        );
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

      {/* Vertex handles with angle labels */}
      {vertices.map((v, i) => {
        const [px, py] = toPx(v[0] + ox, v[1] + oy, viewTransform);

        const prev = vertices[(i - 1 + n) % n];
        const next = vertices[(i + 1) % n];
        const angle = vertexAngleDeg(prev, v, next);
        const angleRounded = Math.round(angle * 10) / 10; // one decimal place

        const isRight    = Math.abs(angle - 90) < 0.15; // exact 90.0
        const isNearRight = !isRight && Math.abs(angle - 90) < 8;
        const labelColor = isRight ? COLORS.leaf : isNearRight ? "#d97706" : COLORS.ink;

        // Offset label toward polygon centroid
        const dx = cpx - px;
        const dy = cpy - py;
        const d  = Math.sqrt(dx * dx + dy * dy);
        const dist = 26;
        const lx = d > 1 ? px + (dx / d) * dist : px;
        const ly = d > 1 ? py + (dy / d) * dist : py;

        return (
          <g key={`vh_${i}`}>
            {/* Angle label — behind the handle */}
            <text
              x={lx} y={ly}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={11} fontWeight="700"
              fill={labelColor}
              stroke="white" strokeWidth={3} paintOrder="stroke"
              style={{ pointerEvents: "none", userSelect: "none" }}
            >
              {angleRounded.toFixed(1)}°
            </text>

            {/* Drag handle */}
            <circle
              id={`vh_${i}`}
              cx={px} cy={py} r={8}
              fill="white"
              stroke={isRight ? COLORS.leaf : COLORS.forest}
              strokeWidth={2.5}
              style={{ cursor: "move", pointerEvents: "all" }}
            />

            {/* Delete button */}
            {n > 3 && (
              <>
                <circle
                  id={`vd_${i}`}
                  cx={px + 9} cy={py - 9} r={6}
                  fill="#dc2626"
                  style={{ cursor: "pointer", pointerEvents: "all" }}
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
