"use client";

import { useEffect, useRef, useState } from "react";
import { pixelToWorld, worldToPixel } from "@bloomy/bloomy-planner";
import type { Vertex, ViewTransform } from "./types";

// ─── Geometry helpers ─────────────────────────────────────────────────────────

export function boundaryArea(vertices: Vertex[]): number {
  let sum = 0;
  const n = vertices.length;
  for (let i = 0; i < n; i++) {
    const [x1, y1] = vertices[i];
    const [x2, y2] = vertices[(i + 1) % n];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
}

function edgeLength(ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
}

function polyCentroid(vertices: Vertex[]): Vertex {
  const n = vertices.length;
  let cx = 0, cy = 0;
  for (const [x, y] of vertices) { cx += x; cy += y; }
  return [cx / n, cy / n];
}

function computeFitView(verts: Vertex[], cw: number, ch: number): ViewTransform {
  if (verts.length === 0 || cw === 0 || ch === 0) return { x: 80, y: 60, scale: 50 };
  const xs = verts.map(v => v[0]);
  const ys = verts.map(v => v[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const vw = Math.max(maxX - minX, 0.1);
  const vh = Math.max(maxY - minY, 0.1);
  const PAD = 90;
  const scale = Math.min((cw - PAD * 2) / vw, (ch - PAD * 2) / vh, 120);
  return {
    scale,
    x: (cw - vw * scale) / 2 - minX * scale,
    y: (ch - vh * scale) / 2 - minY * scale,
  };
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
  const [view, setView] = useState<ViewTransform>({ x: 80, y: 60, scale: 50 });
  const [drag, setDrag] = useState<DragState>(DRAG_IDLE);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef(view);
  const activePointers = useRef<Map<number, [number, number]>>(new Map());
  const pinchRef = useRef<{ dist: number; cx: number; cy: number; origScale: number; origX: number; origY: number } | null>(null);
  const didAutoFit = useRef(false);
  const initVerts = useRef(vertices);

  useEffect(() => { viewRef.current = view; }, [view]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setCanvasSize({ width, height });
      if (!didAutoFit.current && width > 0 && height > 0) {
        didAutoFit.current = true;
        const fit = computeFitView(initVerts.current, width, height);
        setView(fit);
        viewRef.current = fit;
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ─── Zoom ────────────────────────────────────────────────────────────────────

  function zoomBy(factor: number, cx?: number, cy?: number) {
    const { scale, x, y } = viewRef.current;
    const ccx = cx ?? canvasSize.width / 2;
    const ccy = cy ?? canvasSize.height / 2;
    const newScale = Math.min(600, Math.max(15, scale * factor));
    const next = { scale: newScale, x: ccx - ((ccx - x) / scale) * newScale, y: ccy - ((ccy - y) / scale) * newScale };
    setView(next);
    viewRef.current = next;
  }

  function handleWheel(e: React.WheelEvent<SVGSVGElement>) {
    e.preventDefault();
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - rect.left, e.clientY - rect.top);
  }

  // ─── Pointer ─────────────────────────────────────────────────────────────────

  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    activePointers.current.set(e.pointerId, [e.clientX, e.clientY]);

    if (activePointers.current.size === 2) {
      const pts = Array.from(activePointers.current.values());
      const dx = pts[1][0] - pts[0][0], dy = pts[1][1] - pts[0][1];
      pinchRef.current = {
        dist: Math.sqrt(dx * dx + dy * dy),
        cx: (pts[0][0] + pts[1][0]) / 2, cy: (pts[0][1] + pts[1][1]) / 2,
        origScale: viewRef.current.scale, origX: viewRef.current.x, origY: viewRef.current.y,
      };
      setDrag(DRAG_IDLE);
      return;
    }

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
    activePointers.current.set(e.pointerId, [e.clientX, e.clientY]);

    if (pinchRef.current && activePointers.current.size >= 2) {
      const pts = Array.from(activePointers.current.values());
      const dx = pts[1][0] - pts[0][0], dy = pts[1][1] - pts[0][1];
      const newDist = Math.sqrt(dx * dx + dy * dy);
      const factor = newDist / pinchRef.current.dist;
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = pinchRef.current.cx - rect.left, cy = pinchRef.current.cy - rect.top;
      const { origScale, origX, origY } = pinchRef.current;
      const newScale = Math.min(600, Math.max(15, origScale * factor));
      const next = { scale: newScale, x: cx - ((cx - origX) / origScale) * newScale, y: cy - ((cy - origY) / origScale) * newScale };
      setView(next); viewRef.current = next;
      return;
    }

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

  function handlePointerUp(e: React.PointerEvent<SVGSVGElement>) {
    activePointers.current.delete(e.pointerId);
    if (activePointers.current.size < 2) pinchRef.current = null;
    setDrag(DRAG_IDLE);
  }

  function removeVertex(index: number) {
    if (vertices.length <= 3) return;
    onChange(vertices.filter((_, i) => i !== index));
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  const n = vertices.length;
  const area = boundaryArea(vertices);
  const cen = n >= 3 ? polyCentroid(vertices) : ([0, 0] as Vertex);
  const [cenPx, cenPy] = worldToPixel(cen, view);

  const boundaryPts = vertices.map(([vx, vy]) => {
    const [px, py] = worldToPixel([vx, vy], view);
    return `${px},${py}`;
  }).join(" ");

  const outsidePath = canvasSize.width > 0
    ? `M0,0 H${canvasSize.width} V${canvasSize.height} H0 Z M${boundaryPts}`
    : "";

  const cursor = drag.mode === "pan" ? "grabbing" : drag.mode === "vertex" ? "move" : "default";

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-canvas">
      <svg
        ref={svgRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ display: "block", cursor }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => { activePointers.current.clear(); pinchRef.current = null; setDrag(DRAG_IDLE); }}
        onPointerCancel={() => { activePointers.current.clear(); pinchRef.current = null; setDrag(DRAG_IDLE); }}
        onWheel={handleWheel}
      >
        <GridBackground view={view} width={canvasSize.width} height={canvasSize.height} />

        {/* Garden fill */}
        {n >= 3 && <polygon points={boundaryPts} fill="rgba(193,224,157,0.2)" />}

        {/* Outside overlay */}
        {outsidePath && (
          <path d={outsidePath} fillRule="evenodd" fill="rgba(34,32,27,0.07)" style={{ pointerEvents: "none" }} />
        )}

        {/* Boundary outline */}
        {n >= 3 && (
          <polygon
            points={boundaryPts}
            fill="none"
            stroke="#234a2e"
            strokeWidth={2.5}
            strokeDasharray="9 4"
            strokeLinejoin="round"
          />
        )}

        {/* Edge length labels */}
        {vertices.map((v, i) => {
          const next = vertices[(i + 1) % n];
          const len = edgeLength(v[0], v[1], next[0], next[1]);
          if (len < 0.1) return null;
          const [mpx, mpy] = worldToPixel([(v[0] + next[0]) / 2, (v[1] + next[1]) / 2], view);
          const angle = Math.atan2(next[1] - v[1], next[0] - v[0]) * 180 / Math.PI;
          const textAngle = (angle > 90 || angle < -90) ? angle + 180 : angle;
          return (
            <text key={i}
              x={mpx} y={mpy - 12}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={11} fontFamily="system-ui,sans-serif"
              fill="#234a2e" fontWeight="600"
              transform={`rotate(${textAngle},${mpx},${mpy - 12})`}
              style={{ pointerEvents: "none", userSelect: "none" }}
            >
              {len.toFixed(1)}m
            </text>
          );
        })}

        {/* Area in centroid */}
        {n >= 3 && (
          <text
            x={cenPx} y={cenPy}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={16} fontFamily="system-ui,sans-serif"
            fill="#234a2e" fontWeight="700" opacity={0.35}
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            {area.toFixed(0)} m²
          </text>
        )}

        {/* Edge midpoint handles (add vertex) */}
        {vertices.map((v, i) => {
          const next = vertices[(i + 1) % n];
          const [mpx, mpy] = worldToPixel([(v[0] + next[0]) / 2, (v[1] + next[1]) / 2], view);
          return (
            <rect key={i}
              x={mpx - 6} y={mpy - 6} width={12} height={12}
              fill="white" stroke="#234a2e" strokeWidth={1.5} rx={3}
              style={{ cursor: "pointer" }}
            />
          );
        })}

        {/* Vertex handles */}
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

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1">
        <button onClick={() => zoomBy(1.3)}
          className="flex h-8 w-8 items-center justify-center rounded border border-line bg-paper font-mono text-ink shadow-sm hover:bg-mist active:scale-95">+</button>
        <button onClick={() => zoomBy(1 / 1.3)}
          className="flex h-8 w-8 items-center justify-center rounded border border-line bg-paper font-mono text-ink shadow-sm hover:bg-mist active:scale-95">−</button>
      </div>
    </div>
  );
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

function GridBackground({ view, width, height }: { view: ViewTransform; width: number; height: number }) {
  const { x, y, scale } = view;
  const minor = scale * 0.5;
  const major = scale;
  return (
    <g>
      <defs>
        <pattern id="be-minor" width={minor} height={minor} patternUnits="userSpaceOnUse" x={x % minor} y={y % minor}>
          <path d={`M ${minor} 0 L 0 0 0 ${minor}`} fill="none" stroke="#d8d3cc" strokeWidth="0.5" />
        </pattern>
        <pattern id="be-major" width={major} height={major} patternUnits="userSpaceOnUse" x={x % major} y={y % major}>
          <rect width={major} height={major} fill="url(#be-minor)" />
          <path d={`M ${major} 0 L 0 0 0 ${major}`} fill="none" stroke="#c8c3bb" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={width} height={height} fill="#f4f2ec" />
      <rect width={width} height={height} fill="url(#be-major)" />
    </g>
  );
}
