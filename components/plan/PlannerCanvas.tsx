"use client";

import { useReducer, useRef, useEffect, useState } from "react";
import { plannerReducer, createInitialState } from "@/lib/plan/plannerReducer";
import { exportPdf } from "@/lib/plan/exportPdf";
import { TileGrid } from "./TileGrid";
import { TileGridBackground } from "./TileGridBackground";
import { PatioPolygon } from "./PatioPolygon";
import { TileTooltip } from "./TileTooltip";
import { PlannerSidebar } from "./PlannerSidebar";
import { resolveTileSize } from "@/lib/plan/geometry";
import { TILE_PRESETS } from "@/lib/plan/constants";
import type { ViewTransform, Vertex } from "@/lib/plan/types";

const HEADER_HEIGHT = 60;
const SIDEBAR_WIDTH = 320;
const MIN_SCALE = 20;
const MAX_SCALE = 600;

interface DragState {
  isDragging: boolean;
  startPx: [number, number];
  startOffset: Vertex;
  mode: "pan" | "patio" | "tile" | null;
  panStart: { x: number; y: number; tx: number; ty: number } | null;
  pendingTileId: string | null;
  wasOnPatio: boolean; // in "tile" mode: whether the click was also over the patio polygon
}

const DRAG_IDLE: DragState = {
  isDragging: false,
  startPx: [0, 0],
  startOffset: [0, 0],
  mode: null,
  panStart: null,
  pendingTileId: null,
  wasOnPatio: false,
};

export function PlannerPage() {
  const [state, dispatch] = useReducer(plannerReducer, undefined, createInitialState);
  const svgRef = useRef<SVGSVGElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [drag, setDrag] = useState<DragState>(DRAG_IDLE);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);

  useEffect(() => {
    function updateSize() {
      setCanvasSize({
        width:  window.innerWidth  - SIDEBAR_WIDTH,
        height: window.innerHeight - HEADER_HEIGHT,
      });
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // ---- Zoom (buttons only) ----
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

  // ---- Pan / patio drag / tile click ----
  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (e.button !== 0 && e.button !== 1) return;
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    svg.setPointerCapture(e.pointerId);

    // Use elementsFromPoint so tiles are found even when behind the patio polygon
    const allEls = document.elementsFromPoint(e.clientX, e.clientY);
    const tileEl = allEls.find(el => el.id?.startsWith("t_"));
    const tileId = tileEl ? tileEl.id.slice(2) : null; // strip "t_" prefix

    // e.target is the topmost element — use it for patio detection
    const target = e.target as SVGElement;
    const onPatio = target.closest("[data-patio]") !== null;

    if (tileId && e.button === 0) {
      // Enter tile mode. Remember whether we're also over the patio so that
      // if the pointer moves we can fall back to patio-drag instead of pan.
      setDrag({
        isDragging: true,
        startPx: [px, py],
        startOffset: [...state.patioOffset] as Vertex,
        mode: "tile",
        panStart: null,
        pendingTileId: tileId,
        wasOnPatio: onPatio,
      });
      return;
    }

    if (onPatio && e.button === 0) {
      setDrag({
        isDragging: true,
        startPx: [px, py],
        startOffset: [...state.patioOffset] as Vertex,
        mode: "patio",
        panStart: null,
        pendingTileId: null,
        wasOnPatio: false,
      });
    } else {
      setDrag({
        isDragging: true,
        startPx: [px, py],
        startOffset: state.patioOffset,
        mode: "pan",
        panStart: {
          x: e.clientX,
          y: e.clientY,
          tx: state.viewTransform.x,
          ty: state.viewTransform.y,
        },
        pendingTileId: null,
        wasOnPatio: false,
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

    if (drag.mode === "tile") {
      const ddx = px - drag.startPx[0];
      const ddy = py - drag.startPx[1];
      if (ddx * ddx + ddy * ddy > 25) {
        // Moved more than 5 px — convert to patio drag if we were on the
        // patio polygon, otherwise pan.
        if (drag.wasOnPatio) {
          setDrag({ ...drag, mode: "patio", pendingTileId: null });
        } else {
          setDrag({
            ...drag,
            mode: "pan",
            panStart: {
              x: e.clientX,
              y: e.clientY,
              tx: state.viewTransform.x,
              ty: state.viewTransform.y,
            },
            pendingTileId: null,
          });
        }
      }
      return;
    }

    if (drag.mode === "pan" && drag.panStart) {
      const dx = e.clientX - drag.panStart.x;
      const dy = e.clientY - drag.panStart.y;
      dispatch({
        type: "SET_VIEW_TRANSFORM",
        transform: {
          ...state.viewTransform,
          x: drag.panStart.tx + dx,
          y: drag.panStart.ty + dy,
        },
      });
    } else if (drag.mode === "patio") {
      const dx = (px - drag.startPx[0]) / state.viewTransform.scale;
      const dy = (py - drag.startPx[1]) / state.viewTransform.scale;
      dispatch({
        type: "SET_PATIO_OFFSET",
        offset: [drag.startOffset[0] + dx, drag.startOffset[1] + dy],
      });
    }
  }

  function handlePointerUp() {
    if (drag.mode === "tile" && drag.pendingTileId) {
      const tid = drag.pendingTileId;
      setSelectedTileId(prev => (prev === tid ? null : tid));
    }
    setDrag(DRAG_IDLE);
  }

  // ---- Export PDF ----
  function handleExportPdf() {
    exportPdf(state);
  }

  // ---- Export PNG ----
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

  const cursor = drag.isDragging
    ? drag.mode === "pan" ? "grabbing"
    : drag.mode === "tile" ? "pointer"
    : "move"
    : "grab";

  return (
    <div className="flex" style={{ height: `${canvasSize.height}px` }}>
      {/* SVG canvas */}
      <div className="relative flex-1 overflow-hidden bg-paper">
        <svg
          ref={svgRef}
          width={canvasSize.width}
          height={canvasSize.height}
          style={{ display: "block", cursor }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Full tile grid covering the whole canvas */}
          <TileGridBackground
            viewTransform={state.viewTransform}
            width={canvasSize.width}
            height={canvasSize.height}
            tileW={tileW}
            tileH={tileH}
            rotation={state.rotation}
          />
          {/* Patio tile fills (clipped to polygon) */}
          <TileGrid
            tiles={state.tiles}
            viewTransform={state.viewTransform}
            chessMode={state.chessMode}
            selectedId={selectedTileId}
          />
          {/* Patio polygon + labels */}
          <g data-patio="true">
            <PatioPolygon
              vertices={state.vertices}
              patioOffset={state.patioOffset}
              viewTransform={state.viewTransform}
            />
          </g>
          {/* Tooltip — rendered last so it's always above all other SVG elements */}
          <TileTooltip
            tiles={state.tiles}
            selectedId={selectedTileId}
            viewTransform={state.viewTransform}
            tileW={tileW}
            tileH={tileH}
          />
        </svg>

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1">
          <button
            onClick={() => zoomBy(1.3)}
            className="flex h-8 w-8 items-center justify-center rounded border border-line bg-canvas text-lg font-medium text-ink shadow-sm transition hover:bg-paper"
            title="Zoom in"
          >
            +
          </button>
          <button
            onClick={() => zoomBy(1 / 1.3)}
            className="flex h-8 w-8 items-center justify-center rounded border border-line bg-canvas text-lg font-medium text-ink shadow-sm transition hover:bg-paper"
            title="Zoom out"
          >
            −
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <PlannerSidebar
        state={state}
        tooManyTiles={state.tooManyTiles}
        dispatch={dispatch}
        onExport={handleExport}
        onExportPdf={handleExportPdf}
      />
    </div>
  );
}
