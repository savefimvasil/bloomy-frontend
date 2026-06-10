"use client";

import type { ViewTransform } from "@/lib/plan/types";
import { COLORS } from "@/lib/plan/constants";

interface Props {
  viewTransform: ViewTransform;
  width: number;
  height: number;
}

export function GridBackground({ viewTransform, width, height }: Props) {
  const { x, y, scale } = viewTransform;

  const lines: React.ReactElement[] = [];

  const worldLeft   = -x / scale;
  const worldTop    = -y / scale;
  const worldRight  = (width  - x) / scale;
  const worldBottom = (height - y) / scale;

  const startX = Math.floor(worldLeft  / 0.5) * 0.5;
  const startY = Math.floor(worldTop   / 0.5) * 0.5;
  const endX   = Math.ceil(worldRight  / 0.5) * 0.5;
  const endY   = Math.ceil(worldBottom / 0.5) * 0.5;

  for (let wx = startX; wx <= endX; wx = +(wx + 0.5).toFixed(2)) {
    const px = wx * scale + x;
    const isMajor = Math.abs(Math.round(wx) - wx) < 1e-9;
    lines.push(
      <line
        key={`v_${wx}`}
        x1={px} y1={0} x2={px} y2={height}
        stroke={isMajor ? COLORS.muted : COLORS.line}
        strokeWidth={isMajor ? 0.75 : 0.4}
      />
    );
  }

  for (let wy = startY; wy <= endY; wy = +(wy + 0.5).toFixed(2)) {
    const py = wy * scale + y;
    const isMajor = Math.abs(Math.round(wy) - wy) < 1e-9;
    lines.push(
      <line
        key={`h_${wy}`}
        x1={0} y1={py} x2={width} y2={py}
        stroke={isMajor ? COLORS.muted : COLORS.line}
        strokeWidth={isMajor ? 0.75 : 0.4}
      />
    );
  }

  return <g>{lines}</g>;
}
