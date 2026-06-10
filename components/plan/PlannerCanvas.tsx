"use client";

import { useReducer, useRef, useEffect, useState } from "react";
import { plannerReducer, createInitialState } from "@/lib/plan/plannerReducer";
import { exportPdf } from "@/lib/plan/exportPdf";
import { TileGrid } from "./TileGrid";
import { TileGridBackground } from "./TileGridBackground";
import { PatioPolygon } from "./PatioPolygon";
import { TileTooltip } from "./TileTooltip";
import { ShapeEditor } from "./ShapeEditor";
import { PlannerSidebar } from "./PlannerSidebar";
import { Toast } from "@/components/ui/Toast";
import { resolveTileSize, pixelToWorld } from "@/lib/plan/geometry";
import { TILE_PRESETS } from "@/lib/plan/constants";
import type { Vertex } from "@/lib/plan/types";

const MIN_SCALE = 20;
const MAX_SCALE = 600;

type DragMode = "pan" | "patio" | "tile" | "vertex" | "edge" | "vdelete" | null;

interface DragState {
  isDragging: boolean;
  startPx: [number, number];
  startOffset: Vertex;
  mode: DragMode;
  panStart: { x: number; y: number; tx: number; ty: number } | null;
  pendingTileId: string | null;
  wasOnPatio: boolean;
  vertexIndex: number;
  pendingEdgeIdx: number;
}

const DRAG_IDLE: DragState = {
  isDragging: false,
  startPx: [0, 0],
  startOffset: [0, 0],
  mode: null,
  panStart: null,
  pendingTileId: null,
  wasOnPatio: false,
  vertexIndex: -1,
  pendingEdgeIdx: -1,
};

export function PlannerPage() {
  const [state, dispatch] = useReducer(plannerReducer, undefined, createInitialState);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const viewTransformRef = useRef(state.viewTransform);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [drag, setDrag] = useState<DragState>(DRAG_IDLE);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [editingShape, setEditingShape] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Keep viewTransform in ref for non-React wheel handler
  useEffect(() => {
    viewTransformRef.current = state.viewTransform;
  }, [state.viewTransform]);

  // Canvas size via ResizeObserver — automatically responds to sidebar collapse
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setCanvasSize({ width, height });
    });
    ro.observe(el);
    setCanvasSize({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // Scroll-to-zoom — non-passive so we can preventDefault
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      const rect = svg!.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const { scale, x, y } = viewTransformRef.current;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * factor));
      dispatch({
        type: "SET_VIEW_TRANSFORM",
        transform: {
          scale: newScale,
          x: px - ((px - x) / scale) * newScale,
          y: py - ((py - y) / scale) * newScale,
        },
      });
    }
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  // Escape exits shape editing
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && editingShape) setEditingShape(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editingShape]);

  function zoomBy(factor: number) {
    const { scale, x, y } = state.viewTransform;
    const cx = canvasSize.width / 2;
    const cy = canvasSize.height / 2;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * factor));
    dispatch({
      type: "SET_VIEW_TRANSFORM",
      transform: {
        scale: newScale,
        x: cx - ((cx - x) / scale) * newScale,
        y: cy - ((cy - y) / scale) * newScale,
      },
    });
  }

  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (e.button !== 0 && e.button !== 1) return;
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const allEls = document.elementsFromPoint(e.clientX, e.clientY);
    const target = e.target as SVGElement;
    const onPatio = target.closest("[data-patio]") !== null;

    if (editingShape && e.button === 0) {
      const deleteEl = allEls.find(el => el.id?.startsWith("vd_"));
      if (deleteEl) {
        svg.setPointerCapture(e.pointerId);
        setDrag({ ...DRAG_IDLE, isDragging: true, startPx: [px, py], mode: "vdelete", vertexIndex: parseInt(deleteEl.id.slice(3)) });
        return;
      }
      const handleEl = allEls.find(el => el.id?.startsWith("vh_"));
      if (handleEl) {
        svg.setPointerCapture(e.pointerId);
        setDrag({ ...DRAG_IDLE, isDragging: true, startPx: [px, py], mode: "vertex", vertexIndex: parseInt(handleEl.id.slice(3)) });
        return;
      }
      const edgeEl = allEls.find(el => el.id?.startsWith("em_"));
      if (edgeEl) {
        svg.setPointerCapture(e.pointerId);
        setDrag({ ...DRAG_IDLE, isDragging: true, startPx: [px, py], mode: "edge", pendingEdgeIdx: parseInt(edgeEl.id.slice(3)) });
        return;
      }
    }

    if (!editingShape) {
      const tileEl = allEls.find(el => el.id?.startsWith("t_"));
      const tileId = tileEl ? tileEl.id.slice(2) : null;
      if (tileId && e.button === 0) {
        setDrag({ ...DRAG_IDLE, isDragging: true, startPx: [px, py], startOffset: [...state.patioOffset] as Vertex, mode: "tile", pendingTileId: tileId, wasOnPatio: onPatio });
        return;
      }
    }

    if (onPatio && e.button === 0) {
      svg.setPointerCapture(e.pointerId);
      setDrag({ ...DRAG_IDLE, isDragging: true, startPx: [px, py], startOffset: [...state.patioOffset] as Vertex, mode: "patio" });
    } else {
      svg.setPointerCapture(e.pointerId);
      setDrag({
        ...DRAG_IDLE,
        isDragging: true,
        startPx: [px, py],
        startOffset: state.patioOffset,
        mode: "pan",
        panStart: { x: e.clientX, y: e.clientY, tx: state.viewTransform.x, ty: state.viewTransform.y },
      });
    }
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!drag.isDragging) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    if (drag.mode === "vertex") {
      const worldPt = pixelToWorld(px, py, state.viewTransform);
      const SNAP = 0.01; // 1 cm grid snap
      const snappedX = Math.round((worldPt[0] - state.patioOffset[0]) / SNAP) * SNAP;
      const snappedY = Math.round((worldPt[1] - state.patioOffset[1]) / SNAP) * SNAP;
      dispatch({ type: "MOVE_VERTEX", index: drag.vertexIndex, vertex: [snappedX, snappedY] });
      return;
    }

    if (drag.mode === "edge" || drag.mode === "vdelete") {
      const ddx = px - drag.startPx[0];
      const ddy = py - drag.startPx[1];
      if (ddx * ddx + ddy * ddy > 25) {
        setDrag({ ...drag, mode: "pan", panStart: { x: e.clientX, y: e.clientY, tx: state.viewTransform.x, ty: state.viewTransform.y }, pendingEdgeIdx: -1, vertexIndex: -1 });
      }
      return;
    }

    if (drag.mode === "tile") {
      const ddx = px - drag.startPx[0];
      const ddy = py - drag.startPx[1];
      if (ddx * ddx + ddy * ddy > 25) {
        if (drag.wasOnPatio) {
          setDrag({ ...drag, mode: "patio", pendingTileId: null });
        } else {
          setDrag({ ...drag, mode: "pan", panStart: { x: e.clientX, y: e.clientY, tx: state.viewTransform.x, ty: state.viewTransform.y }, pendingTileId: null });
        }
      }
      return;
    }

    if (drag.mode === "pan" && drag.panStart) {
      dispatch({ type: "SET_VIEW_TRANSFORM", transform: { ...state.viewTransform, x: drag.panStart.tx + e.clientX - drag.panStart.x, y: drag.panStart.ty + e.clientY - drag.panStart.y } });
    } else if (drag.mode === "patio") {
      const dx = (px - drag.startPx[0]) / state.viewTransform.scale;
      const dy = (py - drag.startPx[1]) / state.viewTransform.scale;
      dispatch({ type: "SET_PATIO_OFFSET", offset: [drag.startOffset[0] + dx, drag.startOffset[1] + dy] });
    }
  }

  function handlePointerUp(e: React.PointerEvent<SVGSVGElement>) {
    if (drag.mode === "tile" && drag.pendingTileId) {
      const tid = drag.pendingTileId;
      setSelectedTileId(prev => (prev === tid ? null : tid));
    }
    if (drag.mode === "vdelete" && drag.vertexIndex >= 0) {
      dispatch({ type: "REMOVE_VERTEX", index: drag.vertexIndex });
    }
    if (drag.mode === "edge" && drag.pendingEdgeIdx >= 0) {
      const svg = svgRef.current;
      if (svg) {
        const rect = svg.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        const ddx = px - drag.startPx[0];
        const ddy = py - drag.startPx[1];
        if (ddx * ddx + ddy * ddy < 25) {
          const eIdx = drag.pendingEdgeIdx;
          const n = state.vertices.length;
          const v0 = state.vertices[eIdx];
          const v1 = state.vertices[(eIdx + 1) % n];
          dispatch({ type: "INSERT_VERTEX", afterIndex: eIdx, vertex: [(v0[0] + v1[0]) / 2, (v0[1] + v1[1]) / 2] });
        }
      }
    }
    setDrag(DRAG_IDLE);
  }

  function handleDragCancel() { setDrag(DRAG_IDLE); }

  function handleExportPdf() { exportPdf(state); }

  function handleExport() {
    const svg = svgRef.current;
    if (!svg) return;
    const svgStr = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width  = canvasSize.width  * 2;
      canvas.height = canvasSize.height * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "patio-plan.png";
      a.click();
    };
    img.src = url;
  }

  const { width: tileW, height: tileH } = resolveTileSize(state.tileSize, TILE_PRESETS);
  const groutM = state.groutMm / 1000;

  const cursor = editingShape
    ? drag.mode === "pan" ? "grabbing" : drag.mode === "vertex" ? "move" : "default"
    : drag.isDragging
      ? drag.mode === "pan" ? "grabbing" : drag.mode === "tile" ? "pointer" : "move"
      : "grab";

  // Single toast — suppress small-pieces warning in shape edit mode (shape is still changing)
  const toast = state.tooManyTiles
    ? { type: "error" as const, message: "Too many tiles — zoom in or use a larger tile size." }
    : !editingShape && state.stats.hasSmallPieces
    ? { type: "warning" as const, message: "Some cut pieces are under 30 mm — difficult to cut accurately." }
    : null;

  return (
    <div className="flex h-full">
      <div ref={canvasContainerRef} className="relative flex-1 overflow-hidden bg-paper">
        <svg
          ref={svgRef}
          width={canvasSize.width}
          height={canvasSize.height}
          style={{ display: "block", cursor }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handleDragCancel}
          onPointerCancel={handleDragCancel}
        >
          <g style={{ opacity: editingShape ? 0.1 : 1, transition: "opacity 0.15s ease" }}>
            <TileGridBackground
              viewTransform={state.viewTransform}
              width={canvasSize.width}
              height={canvasSize.height}
              tileW={tileW + groutM}
              tileH={tileH + groutM}
              rotation={state.rotation}
            />
            <TileGrid
              tiles={state.tiles}
              viewTransform={state.viewTransform}
              chessMode={state.chessMode}
              selectedId={selectedTileId}
            />
          </g>
          <g data-patio="true">
            <PatioPolygon
              vertices={state.vertices}
              patioOffset={state.patioOffset}
              viewTransform={state.viewTransform}
            />
          </g>
          {editingShape && (
            <ShapeEditor
              vertices={state.vertices}
              patioOffset={state.patioOffset}
              viewTransform={state.viewTransform}
            />
          )}
          <TileTooltip
            tiles={state.tiles}
            selectedId={selectedTileId}
            viewTransform={state.viewTransform}
            tileW={tileW}
            tileH={tileH}
          />
        </svg>

        {/* Shape edit banner — top-center so it doesn't collide with toast */}
        {editingShape && (
          <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded border border-amber-400/60 bg-amber-50/90 px-3 py-1.5 text-xs font-medium text-amber-800 shadow-sm">
            Shape edit mode — drag vertices · click + to add · × to remove · Esc to finish
          </div>
        )}

        {/* Toast — top-left, single message, highest priority first */}
        {toast && (
          <div className="pointer-events-none absolute left-3 top-3">
            <Toast type={toast.type} message={toast.message} />
          </div>
        )}

        {/* Zoom buttons */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1">
          <button
            onClick={() => zoomBy(1.3)}
            className="flex h-8 w-8 items-center justify-center rounded border border-line bg-canvas text-lg font-medium text-ink shadow-sm transition hover:bg-paper"
            title="Zoom in"
          >+</button>
          <button
            onClick={() => zoomBy(1 / 1.3)}
            className="flex h-8 w-8 items-center justify-center rounded border border-line bg-canvas text-lg font-medium text-ink shadow-sm transition hover:bg-paper"
            title="Zoom out"
          >−</button>
        </div>
      </div>

      <PlannerSidebar
        state={state}
        tooManyTiles={state.tooManyTiles}
        dispatch={dispatch}
        editingShape={editingShape}
        onToggleEditShape={() => { setEditingShape(v => !v); setSelectedTileId(null); }}
        onExport={handleExport}
        onExportPdf={handleExportPdf}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(v => !v)}
      />
    </div>
  );
}
