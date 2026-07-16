"use client";

import { useEffect, useRef, useState } from "react";
import { pixelToWorld, worldToPixel, polygonArea, centroid, edgeLength, computeFitView } from "../lib/geometry";
import { GridBackground } from "../canvas/GridBackground";
import { useCanvasSize } from "../lib/hooks";
import type { Vertex } from "./types";

export function boundaryArea(vertices: Vertex[]): number {
  return polygonArea(vertices);
}

// ─── Drag state ────────────────────────────────────────────────────────────────

type DragMode = "pan" | "vertex" | null;

interface DragState {
  isDragging: boolean;
  mode: DragMode;
  startPx: [number, number];
  panStart: { x: number; y: number; tx: number; ty: number } | null;
  vertexIndex: number;
  vertexDragOffset: Vertex;
}

const DRAG_IDLE: DragState = {
  isDragging: false, mode: null, startPx: [0, 0],
  panStart: null, vertexIndex: -1, vertexDragOffset: [0, 0],
};

// ─── Component ────────────────────────────────────────────────────────────────

export interface BoundaryEditorProps {
  vertices: Vertex[];
  onChange: (vertices: Vertex[]) => void;
}

export function BoundaryEditor({ vertices, onChange }: BoundaryEditorProps) {
  const [view, setView] = useState({ x: 80, y: 60, scale: 50 });
  const [drag, setDrag] = useState<DragState>(DRAG_IDLE);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef(view);
  const didAutoFit = useRef(false);
  const initVerts = useRef(vertices);

  useEffect(() => { viewRef.current = view; }, [view]);

  const canvasSize = useCanvasSize(containerRef as React.RefObject<HTMLElement | null>);

  useEffect(() => {
    const { width, height } = canvasSize;
    if (!didAutoFit.current && width > 0 && height > 0) {
      didAutoFit.current = true;
      const fit = computeFitView(initVerts.current, width, height);
      setView(fit);
      viewRef.current = fit;
    }
  }, [canvasSize]);

  // ─── Pointer ─────────────────────────────────────────────────────────────────

  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (e.button !== 0 && e.button !== 1) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    const vt = viewRef.current;
    const VHIT = 18;

    // Vertex hit
    for (let i = 0; i < vertices.length; i++) {
      const [vpx, vpy] = worldToPixel(vertices[i], vt);
      if (Math.sqrt((px - vpx) ** 2 + (py - vpy) ** 2) < VHIT) {
        svg.setPointerCapture(e.pointerId);
        const grabWorld = pixelToWorld(px, py, vt);
        setDrag({
          ...DRAG_IDLE, isDragging: true, mode: "vertex",
          startPx: [px, py], vertexIndex: i,
          vertexDragOffset: [vertices[i][0] - grabWorld[0], vertices[i][1] - grabWorld[1]],
        });
        return;
      }
    }

    // Edge midpoint hit → add vertex
    const n = vertices.length;
    for (let i = 0; i < n; i++) {
      const [ax, ay] = vertices[i];
      const [bx, by] = vertices[(i + 1) % n];
      const [mpx, mpy] = worldToPixel([(ax + bx) / 2, (ay + by) / 2], vt);
      if (Math.sqrt((px - mpx) ** 2 + (py - mpy) ** 2) < 14) {
        onChange([
          ...vertices.slice(0, i + 1),
          [(ax + bx) / 2, (ay + by) / 2] as Vertex,
          ...vertices.slice(i + 1),
        ]);
        return;
      }
    }

    // Pan
    svg.setPointerCapture(e.pointerId);
    setDrag({
      ...DRAG_IDLE, isDragging: true, mode: "pan", startPx: [px, py],
      panStart: { x: e.clientX, y: e.clientY, tx: vt.x, ty: vt.y },
    });
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!drag.isDragging) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    const vt = viewRef.current;

    if (drag.mode === "pan" && drag.panStart) {
      const next = { ...vt, x: drag.panStart.tx + e.clientX - drag.panStart.x, y: drag.panStart.ty + e.clientY - drag.panStart.y };
      setView(next); viewRef.current = next;
    } else if (drag.mode === "vertex") {
      const world = pixelToWorld(px, py, vt);
      const SNAP = 0.05;
      const wx = Math.round((world[0] + drag.vertexDragOffset[0]) / SNAP) * SNAP;
      const wy = Math.round((world[1] + drag.vertexDragOffset[1]) / SNAP) * SNAP;
      onChange(vertices.map((v, i) => i === drag.vertexIndex ? [wx, wy] as Vertex : v));
    }
  }

  function handlePointerUp() {
    setDrag(DRAG_IDLE);
  }

  function removeVertex(index: number) {
    if (vertices.length <= 3) return;
    onChange(vertices.filter((_, i) => i !== index));
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  const { width, height } = canvasSize;
  const n = vertices.length;
  const area = boundaryArea(vertices);
  const cen = n >= 3 ? centroid(vertices) : ([0, 0] as Vertex);
  const [cenPx, cenPy] = worldToPixel(cen, view);

  const boundaryPts = vertices.map(v => {
    const [px, py] = worldToPixel(v, view);
    return `${px},${py}`;
  }).join(" ");

  const outsidePath = width > 0
    ? `M0,0 H${width} V${height} H0 Z M${boundaryPts}`
    : "";

  const cursor = drag.mode === "pan" ? "grabbing" : drag.mode === "vertex" ? "move" : "default";

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-canvas">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: "block", cursor }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => setDrag(DRAG_IDLE)}
        onPointerCancel={() => setDrag(DRAG_IDLE)}
      >
        <GridBackground view={view} width={width} height={height} id="be" />

        {n >= 3 && <polygon points={boundaryPts} fill="rgba(193,224,157,0.2)" />}

        {outsidePath && (
          <path d={outsidePath} fillRule="evenodd" fill="rgba(34,32,27,0.07)" style={{ pointerEvents: "none" }} />
        )}

        {n >= 3 && (
          <polygon points={boundaryPts} fill="none" stroke="#234a2e" strokeWidth={2.5} strokeDasharray="9 4" strokeLinejoin="round" />
        )}

        {vertices.map((v, i) => {
          const next = vertices[(i + 1) % n];
          const len = edgeLength(v[0], v[1], next[0], next[1]);
          if (len < 0.1) return null;
          const [mpx, mpy] = worldToPixel([(v[0] + next[0]) / 2, (v[1] + next[1]) / 2], view);
          const angle = Math.atan2(next[1] - v[1], next[0] - v[0]) * 180 / Math.PI;
          const textAngle = (angle > 90 || angle < -90) ? angle + 180 : angle;
          return (
            <text key={i} x={mpx} y={mpy - 12} textAnchor="middle" dominantBaseline="middle"
              fontSize={11} fontFamily="system-ui,sans-serif" fill="#234a2e" fontWeight="600"
              transform={`rotate(${textAngle},${mpx},${mpy - 12})`}
              style={{ pointerEvents: "none", userSelect: "none" }}
            >
              {len.toFixed(1)}m
            </text>
          );
        })}

        {n >= 3 && (
          <text x={cenPx} y={cenPy} textAnchor="middle" dominantBaseline="middle"
            fontSize={16} fontFamily="system-ui,sans-serif" fill="#234a2e" fontWeight="700" opacity={0.35}
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            {area.toFixed(0)} m²
          </text>
        )}

        {vertices.map((v, i) => {
          const next = vertices[(i + 1) % n];
          const [mpx, mpy] = worldToPixel([(v[0] + next[0]) / 2, (v[1] + next[1]) / 2], view);
          return <rect key={i} x={mpx - 6} y={mpy - 6} width={12} height={12} fill="white" stroke="#234a2e" strokeWidth={1.5} rx={3} style={{ cursor: "pointer" }} />;
        })}

        {vertices.map(([vx, vy], i) => {
          const [vpx, vpy] = worldToPixel([vx, vy], view);
          return (
            <g key={i}>
              <circle cx={vpx} cy={vpy} r={9} fill="white" stroke="#234a2e" strokeWidth={2.5} style={{ cursor: "move" }} />
              {n > 3 && (
                <g transform={`translate(${vpx + 10},${vpy - 10})`} style={{ cursor: "pointer" }}
                  onClick={ev => { ev.stopPropagation(); removeVertex(i); }}>
                  <circle r={6} fill="#a14537" />
                  <text textAnchor="middle" dominantBaseline="middle" fontSize={8} fill="white" fontWeight="bold">x</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
