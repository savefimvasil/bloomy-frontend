"use client";

import { useEffect, useRef, useState } from "react";
import { pixelToWorld, worldToPixel, polygonArea, centroid, edgeLength, worldPointInPolygon, nearestPointOnSegment, applyZoom, polygonsOverlap, boundingBox } from "../lib/geometry";
import { GridBackground } from "../canvas/GridBackground";
import { useCanvasSize } from "../lib/hooks";
import type {
  GardenZone, GardenObject, GardenBoundary, GardenPlan,
  Vertex, ViewTransform, ZoneType, ObjectType,
} from "./types";
import { ZONE_CONFIGS, OBJECT_CONFIGS } from "./zone-configs";
import { GardenSidebar } from "./GardenSidebar";
import { ObjectIcon } from "./ObjectIcon";

const MIN_SCALE = 15;
const MAX_SCALE = 600;

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function inBoundary(wx: number, wy: number, b: GardenBoundary): boolean {
  return worldPointInPolygon(wx, wy, b.vertices.map(([vx, vy]) => [vx + b.offset[0], vy + b.offset[1]] as Vertex));
}

function clampToBoundary(wx: number, wy: number, b: GardenBoundary): [number, number] {
  const { vertices, offset } = b;
  let bestDist = Infinity;
  let best: [number, number] = [wx, wy];
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    const pt = nearestPointOnSegment(wx, wy, vertices[i][0] + offset[0], vertices[i][1] + offset[1], vertices[j][0] + offset[0], vertices[j][1] + offset[1]);
    const d = (pt[0] - wx) ** 2 + (pt[1] - wy) ** 2;
    if (d < bestDist) { bestDist = d; best = pt; }
  }
  return best;
}

function hitTestZones(px: number, py: number, zones: GardenZone[], vt: ViewTransform): GardenZone | null {
  const [wx, wy] = pixelToWorld(px, py, vt);
  for (let i = zones.length - 1; i >= 0; i--) {
    const z = zones[i];
    if (worldPointInPolygon(wx, wy, z.vertices.map(([vx, vy]) => [vx + z.offset[0], vy + z.offset[1]] as Vertex))) return z;
  }
  return null;
}

function hitTestObject(px: number, py: number, obj: GardenObject, vt: ViewTransform): boolean {
  const [cx, cy] = worldToPixel(obj.position, vt);
  if (obj.size) {
    const hw = (obj.size[0] * vt.scale) / 2;
    const hh = (obj.size[1] * vt.scale) / 2;
    return px >= cx - hw && px <= cx + hw && py >= cy - hh && py <= cy + hh;
  }
  return Math.sqrt((px - cx) ** 2 + (py - cy) ** 2) < 18;
}

function verticesPath(vertices: Vertex[], offset: Vertex, vt: ViewTransform): string {
  return vertices.map(([vx, vy], i) => {
    const [px, py] = worldToPixel([vx + offset[0], vy + offset[1]], vt);
    return `${i === 0 ? "M" : "L"}${px},${py}`;
  }).join(" ") + " Z";
}

type DragMode = "pan" | "zone" | "zone-vertex" | "zone-resize" | "boundary-vertex" | "object" | null;

interface DragState {
  isDragging: boolean;
  mode: DragMode;
  startPx: [number, number];
  panStart: { x: number; y: number; tx: number; ty: number } | null;
  zoneId: string | null;
  startOffset: Vertex;
  vertexIndex: number;
  vertexDragOffset: Vertex;
  objectId: string | null;
  objectStart: Vertex;
  resizeCornerIdx: number;
  resizeAnchor: Vertex;
  resizeOrigAbsVerts: Vertex[];
  resizeOrigOffset: Vertex;
}

const DRAG_IDLE: DragState = {
  isDragging: false, mode: null, startPx: [0, 0], panStart: null,
  zoneId: null, startOffset: [0, 0],
  vertexIndex: -1, vertexDragOffset: [0, 0],
  objectId: null, objectStart: [0, 0],
  resizeCornerIdx: -1, resizeAnchor: [0, 0], resizeOrigAbsVerts: [], resizeOrigOffset: [0, 0],
};

const RESIZE_CURSORS = ["nw-resize", "ne-resize", "se-resize", "sw-resize"] as const;
const RESIZE_ANCHOR_IDX = [2, 3, 0, 1];

export interface GardenPlannerCoreProps {
  plan: GardenPlan;
  onSave?: (plan: GardenPlan) => Promise<void>;
  onGenerateImage?: (plan: GardenPlan) => Promise<{ images: string[] }>;
  projectName?: string;
  onBack?: () => void;
}

export function GardenPlannerCore({ plan, onSave, onGenerateImage, projectName, onBack }: GardenPlannerCoreProps) {
  const [boundary, setBoundary] = useState<GardenBoundary | undefined>(plan.gardenBoundary);
  const [zones, setZones] = useState<GardenZone[]>(plan.zones);
  const [objects, setObjects] = useState<GardenObject[]>(plan.objects);
  const [view, setView] = useState<ViewTransform>({ x: plan.view.x, y: plan.view.y, scale: plan.view.scale });
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [editingZoneVertices, setEditingZoneVertices] = useState(false);
  const [editingBoundary, setEditingBoundary] = useState(false);
  const [drag, setDrag] = useState<DragState>(DRAG_IDLE);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [imageModal, setImageModal] = useState<{ state: "loading" | "done" | "error"; images: string[] } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef(view);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedFlashRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activePointers = useRef<Map<number, [number, number]>>(new Map());
  const pinchRef = useRef<{ dist: number; cx: number; cy: number; origScale: number; origX: number; origY: number } | null>(null);
  const isFirstRender = useRef(true);
  const historyRef = useRef<Array<{ zones: GardenZone[]; objects: GardenObject[]; boundary: GardenBoundary | undefined }>>([]);

  useEffect(() => { viewRef.current = view; }, [view]);

  const canvasSize = useCanvasSize(containerRef as React.RefObject<HTMLElement | null>);

  // Debounced auto-save
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (!onSave) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const updated: GardenPlan = {
        ...plan, gardenBoundary: boundary, zones, objects, view,
        exportedAt: new Date().toISOString(),
      };
      setSaveStatus("saving");
      try {
        await onSave(updated);
        setSaveStatus("saved");
        if (savedFlashRef.current) clearTimeout(savedFlashRef.current);
        savedFlashRef.current = setTimeout(() => setSaveStatus("idle"), 2500);
      } catch {
        setSaveStatus("idle");
      }
    }, 2000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boundary, zones, objects, view]);

  function pushHistory() {
    const h = historyRef.current;
    h.push({ zones, objects, boundary });
    if (h.length > 50) h.shift();
  }

  function undo() {
    const h = historyRef.current;
    if (h.length === 0) return;
    const snapshot = h.pop()!;
    setZones(snapshot.zones);
    setObjects(snapshot.objects);
    setBoundary(snapshot.boundary);
    setSelectedZoneId(null);
    setSelectedObjectId(null);
    setEditingZoneVertices(false);
    setEditingBoundary(false);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setEditingZoneVertices(false); setEditingBoundary(false); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === "z") { e.preventDefault(); undo(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zones, objects, boundary]);

  // ─── Image generation ─────────────────────────────────────────────────────

  async function handleGenerateImage() {
    if (!onGenerateImage) return;
    setImageModal({ state: "loading", images: [] });
    const currentPlan: GardenPlan = {
      ...plan, gardenBoundary: boundary, zones, objects, view,
      exportedAt: new Date().toISOString(),
    };
    try {
      const result = await onGenerateImage(currentPlan);
      setImageModal({ state: "done", images: result.images });
    } catch {
      setImageModal({ state: "error", images: [] });
    }
  }

  // ─── Zoom ─────────────────────────────────────────────────────────────────

  function zoomBy(factor: number, cx?: number, cy?: number) {
    const ccx = cx ?? canvasSize.width / 2;
    const ccy = cy ?? canvasSize.height / 2;
    const next = applyZoom(viewRef.current, factor, ccx, ccy, MIN_SCALE, MAX_SCALE);
    setView(next);
    viewRef.current = next;
  }

  // ─── Pointer ──────────────────────────────────────────────────────────────

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
    const VHIT = 14;

    // Resize corner handles (selected zone, not in vertex/boundary edit)
    if (selectedZoneId && !editingZoneVertices && !editingBoundary) {
      const zone = zones.find(z => z.id === selectedZoneId);
      if (zone) {
        const absVerts = zone.vertices.map(([vx, vy]) => [vx + zone.offset[0], vy + zone.offset[1]] as Vertex);
        const bb = boundingBox(absVerts);
        const corners: Vertex[] = [
          [bb.minX, bb.minY], [bb.maxX, bb.minY],
          [bb.maxX, bb.maxY], [bb.minX, bb.maxY],
        ];
        for (let ci = 0; ci < 4; ci++) {
          const [cpx, cpy] = worldToPixel(corners[ci], vt);
          if (Math.sqrt((px - cpx) ** 2 + (py - cpy) ** 2) < 10) {
            pushHistory();
            svg.setPointerCapture(e.pointerId);
            setDrag({
              ...DRAG_IDLE, isDragging: true, mode: "zone-resize",
              startPx: [px, py], zoneId: selectedZoneId,
              resizeCornerIdx: ci,
              resizeAnchor: corners[RESIZE_ANCHOR_IDX[ci]],
              resizeOrigAbsVerts: absVerts,
              resizeOrigOffset: [...zone.offset] as Vertex,
            });
            return;
          }
        }
      }
    }

    // Boundary vertex edit
    if (editingBoundary && boundary) {
      const { vertices, offset } = boundary;
      const n = vertices.length;
      for (let i = 0; i < n; i++) {
        const [vx, vy] = vertices[i];
        const [vpx, vpy] = worldToPixel([vx + offset[0], vy + offset[1]], vt);
        if (Math.sqrt((px - vpx) ** 2 + (py - vpy) ** 2) < VHIT) {
          pushHistory();
          svg.setPointerCapture(e.pointerId);
          const grabWorld = pixelToWorld(px, py, vt);
          setDrag({
            ...DRAG_IDLE, isDragging: true, mode: "boundary-vertex",
            startPx: [px, py], vertexIndex: i,
            vertexDragOffset: [vx + offset[0] - grabWorld[0], vy + offset[1] - grabWorld[1]],
          });
          return;
        }
      }
      // Edge midpoint → add boundary vertex
      for (let i = 0; i < n; i++) {
        const [ax, ay] = vertices[i];
        const [bx, by] = vertices[(i + 1) % n];
        const [mpx, mpy] = worldToPixel([(ax + bx) / 2 + offset[0], (ay + by) / 2 + offset[1]], vt);
        if (Math.sqrt((px - mpx) ** 2 + (py - mpy) ** 2) < 12) {
          setBoundary(b => b ? {
            ...b,
            vertices: [
              ...b.vertices.slice(0, i + 1),
              [(ax + bx) / 2, (ay + by) / 2] as Vertex,
              ...b.vertices.slice(i + 1),
            ],
          } : b);
          return;
        }
      }
    }

    // Object hit — tested before zones so objects always take priority
    for (const obj of objects) {
      if (hitTestObject(px, py, obj, vt)) {
        pushHistory();
        svg.setPointerCapture(e.pointerId);
        setSelectedObjectId(obj.id);
        setSelectedZoneId(null);
        setEditingZoneVertices(false);
        setEditingBoundary(false);
        setDrag({ ...DRAG_IDLE, isDragging: true, mode: "object", startPx: [px, py], objectId: obj.id, objectStart: [...obj.position] as Vertex });
        return;
      }
    }

    // Zone vertex edit
    if (editingZoneVertices && selectedZoneId) {
      const zone = zones.find(z => z.id === selectedZoneId);
      if (zone) {
        const [offX, offY] = zone.offset;
        const n = zone.vertices.length;
        for (let i = 0; i < n; i++) {
          const [vx, vy] = zone.vertices[i];
          const [vpx, vpy] = worldToPixel([vx + offX, vy + offY], vt);
          if (Math.sqrt((px - vpx) ** 2 + (py - vpy) ** 2) < VHIT) {
            pushHistory();
            svg.setPointerCapture(e.pointerId);
            const grabWorld = pixelToWorld(px, py, vt);
            setDrag({
              ...DRAG_IDLE, isDragging: true, mode: "zone-vertex",
              startPx: [px, py], zoneId: selectedZoneId, vertexIndex: i,
              vertexDragOffset: [vx + offX - grabWorld[0], vy + offY - grabWorld[1]],
            });
            return;
          }
        }
        // Edge midpoint → add zone vertex
        for (let i = 0; i < n; i++) {
          const [ax, ay] = zone.vertices[i];
          const [bx, by] = zone.vertices[(i + 1) % n];
          const [mpx, mpy] = worldToPixel([(ax + bx) / 2 + offX, (ay + by) / 2 + offY], vt);
          if (Math.sqrt((px - mpx) ** 2 + (py - mpy) ** 2) < 12) {
            setZones(prev => prev.map(z => z.id === selectedZoneId ? {
              ...z,
              vertices: [
                ...z.vertices.slice(0, i + 1),
                [(ax + bx) / 2, (ay + by) / 2] as Vertex,
                ...z.vertices.slice(i + 1),
              ],
            } : z));
            return;
          }
        }
      }
    }

    // Zone hit
    const hitZone = hitTestZones(px, py, zones, vt);
    if (hitZone) {
      pushHistory();
      svg.setPointerCapture(e.pointerId);
      if (selectedZoneId !== hitZone.id) setEditingZoneVertices(false);
      setSelectedZoneId(hitZone.id);
      setSelectedObjectId(null);
      setEditingBoundary(false);
      setDrag({
        ...DRAG_IDLE, isDragging: true, mode: "zone",
        startPx: [px, py], zoneId: hitZone.id, startOffset: [...hitZone.offset] as Vertex,
      });
      return;
    }

    // Pan (click on empty canvas)
    setSelectedZoneId(null);
    setSelectedObjectId(null);
    setEditingZoneVertices(false);
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
      const next = applyZoom({ scale: origScale, x: origX, y: origY }, factor, cx, cy, MIN_SCALE, MAX_SCALE);
      setView(next); viewRef.current = next;
      return;
    }

    if (!drag.isDragging) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    const vt = viewRef.current;
    const SNAP = 0.05;

    if (drag.mode === "pan" && drag.panStart) {
      const next = { ...vt, x: drag.panStart.tx + e.clientX - drag.panStart.x, y: drag.panStart.ty + e.clientY - drag.panStart.y };
      setView(next); viewRef.current = next;
    } else if (drag.mode === "boundary-vertex" && boundary) {
      const world = pixelToWorld(px, py, vt);
      const wx = Math.round((world[0] + drag.vertexDragOffset[0]) / SNAP) * SNAP;
      const wy = Math.round((world[1] + drag.vertexDragOffset[1]) / SNAP) * SNAP;
      setBoundary(b => b ? {
        ...b,
        vertices: b.vertices.map((v, i) =>
          i === drag.vertexIndex ? [wx - b.offset[0], wy - b.offset[1]] as Vertex : v),
      } : b);
    } else if (drag.mode === "zone-vertex" && drag.zoneId) {
      const world = pixelToWorld(px, py, vt);
      let wx = Math.round((world[0] + drag.vertexDragOffset[0]) / SNAP) * SNAP;
      let wy = Math.round((world[1] + drag.vertexDragOffset[1]) / SNAP) * SNAP;
      if (boundary && !inBoundary(wx, wy, boundary)) {
        [wx, wy] = clampToBoundary(wx, wy, boundary);
      }
      setZones(prev => prev.map(z => z.id === drag.zoneId ? {
        ...z,
        vertices: z.vertices.map((v, i) =>
          i === drag.vertexIndex ? [wx - z.offset[0], wy - z.offset[1]] as Vertex : v),
      } : z));
    } else if (drag.mode === "zone" && drag.zoneId) {
      const dx = (px - drag.startPx[0]) / vt.scale;
      const dy = (py - drag.startPx[1]) / vt.scale;
      const targetOffset: Vertex = [drag.startOffset[0] + dx, drag.startOffset[1] + dy];

      const zone = zones.find(z => z.id === drag.zoneId);
      if (!zone) return;
      const otherZones = zones.filter(z => z.id !== drag.zoneId);

      const isBlocked = (off: Vertex): boolean => {
        const abs = zone.vertices.map(([vx, vy]) => [vx + off[0], vy + off[1]] as Vertex);
        if (boundary && !zone.vertices.every(([vx, vy]) => inBoundary(vx + off[0], vy + off[1], boundary))) return true;
        return otherZones.some(other =>
          polygonsOverlap(abs, other.vertices.map(([vx, vy]) => [vx + other.offset[0], vy + other.offset[1]] as Vertex))
        );
      };

      let resolvedOffset = targetOffset;
      if (isBlocked(targetOffset)) {
        // Binary search from drag start (valid) to target to snap against the perimeter
        let lo = 0, hi = 1, bestT = 0;
        for (let iter = 0; iter < 8; iter++) {
          const mid = (lo + hi) / 2;
          const testOff: Vertex = [
            drag.startOffset[0] + (targetOffset[0] - drag.startOffset[0]) * mid,
            drag.startOffset[1] + (targetOffset[1] - drag.startOffset[1]) * mid,
          ];
          if (isBlocked(testOff)) { hi = mid; } else { bestT = mid; lo = mid; }
        }
        resolvedOffset = [
          drag.startOffset[0] + (targetOffset[0] - drag.startOffset[0]) * bestT,
          drag.startOffset[1] + (targetOffset[1] - drag.startOffset[1]) * bestT,
        ];
      }
      setZones(prev => prev.map(z => z.id === drag.zoneId ? { ...z, offset: resolvedOffset } : z));
    } else if (drag.mode === "zone-resize" && drag.zoneId) {
      const [wx, wy] = pixelToWorld(px, py, vt);
      const anchor = drag.resizeAnchor;
      const orig = drag.resizeOrigAbsVerts;
      const bb = boundingBox(orig);
      const corners: Vertex[] = [
        [bb.minX, bb.minY], [bb.maxX, bb.minY],
        [bb.maxX, bb.maxY], [bb.minX, bb.maxY],
      ];
      const origCorner = corners[drag.resizeCornerIdx];
      const dxO = origCorner[0] - anchor[0], dyO = origCorner[1] - anchor[1];
      if (Math.abs(dxO) < 0.01 || Math.abs(dyO) < 0.01) return;
      const sx = (wx - anchor[0]) / dxO;
      const sy = (wy - anchor[1]) / dyO;
      if (sx <= 0.05 || sy <= 0.05) return;
      const off = drag.resizeOrigOffset;
      const newVerts = orig.map(([vx, vy]) => [
        anchor[0] + (vx - anchor[0]) * sx - off[0],
        anchor[1] + (vy - anchor[1]) * sy - off[1],
      ] as Vertex);
      setZones(prev => prev.map(z => z.id === drag.zoneId ? { ...z, vertices: newVerts } : z));
    } else if (drag.mode === "object" && drag.objectId) {
      const dx = (px - drag.startPx[0]) / vt.scale;
      const dy = (py - drag.startPx[1]) / vt.scale;
      let [nx, ny]: [number, number] = [
        Math.round((drag.objectStart[0] + dx) / 0.1) * 0.1,
        Math.round((drag.objectStart[1] + dy) / 0.1) * 0.1,
      ];
      if (boundary && !inBoundary(nx, ny, boundary)) {
        [nx, ny] = clampToBoundary(nx, ny, boundary);
      }
      setObjects(prev => prev.map(o => o.id === drag.objectId ? { ...o, position: [nx, ny] as Vertex } : o));
    }
  }

  function handlePointerUp(e: React.PointerEvent<SVGSVGElement>) {
    activePointers.current.delete(e.pointerId);
    if (activePointers.current.size < 2) pinchRef.current = null;
    setDrag(DRAG_IDLE);
  }

  function handleDragCancel() { activePointers.current.clear(); pinchRef.current = null; setDrag(DRAG_IDLE); }

  // ─── Zone mutations ────────────────────────────────────────────────────────

  function addZone(type: ZoneType) {
    const cfg = ZONE_CONFIGS[type];
    const count = zones.filter(z => z.type === type).length;
    const label = count > 0 ? `${cfg.label} ${count + 1}` : cfg.label;

    const defaultVerts: Vertex[] = [[0, 0], [3, 0], [3, 3], [0, 3]];

    let baseCx = 0, baseCy = 0;
    if (boundary) {
      const cen = centroid(boundary.vertices.map(([vx, vy]) => [vx + boundary.offset[0], vy + boundary.offset[1]] as Vertex));
      baseCx = cen[0] - 1.5;
      baseCy = cen[1] - 1.5;
    } else {
      const worldCenter = pixelToWorld(canvasSize.width / 2, canvasSize.height / 2, viewRef.current);
      baseCx = worldCenter[0] - 1.5;
      baseCy = worldCenter[1] - 1.5;
    }

    // Find a non-overlapping placement; try base position then spiral outwards
    const step = 3.5;
    const candidates: Vertex[] = [
      [baseCx, baseCy],
      [baseCx + step, baseCy], [baseCx - step, baseCy],
      [baseCx, baseCy + step], [baseCx, baseCy - step],
      [baseCx + step, baseCy + step], [baseCx - step, baseCy + step],
      [baseCx + step, baseCy - step], [baseCx - step, baseCy - step],
    ];

    let chosenOffset: Vertex = [baseCx, baseCy];
    for (const [cx, cy] of candidates) {
      const absVerts = defaultVerts.map(([vx, vy]) => [vx + cx, vy + cy] as Vertex);
      const overlaps = zones.some(z =>
        polygonsOverlap(absVerts, z.vertices.map(([vx, vy]) => [vx + z.offset[0], vy + z.offset[1]] as Vertex))
      );
      if (!overlaps) { chosenOffset = [cx, cy]; break; }
    }

    const newZone: GardenZone = {
      id: generateId(), type, label,
      vertices: defaultVerts,
      offset: chosenOffset,
    };
    setZones(prev => [...prev, newZone]);
    setSelectedZoneId(newZone.id);
    setSelectedObjectId(null);
    setEditingZoneVertices(false);
  }

  function deleteZone(id: string) {
    pushHistory();
    setZones(prev => prev.filter(z => z.id !== id));
    if (selectedZoneId === id) { setSelectedZoneId(null); setEditingZoneVertices(false); }
  }

  function updateZoneLabel(id: string, label: string) {
    setZones(prev => prev.map(z => z.id === id ? { ...z, label } : z));
  }

  function updateZoneType(id: string, type: ZoneType) {
    pushHistory();
    setZones(prev => prev.map(z => z.id === id ? { ...z, type } : z));
  }

  function removeZoneVertex(zoneId: string, vertexIndex: number) {
    setZones(prev => prev.map(z => {
      if (z.id !== zoneId || z.vertices.length <= 3) return z;
      return { ...z, vertices: z.vertices.filter((_, i) => i !== vertexIndex) };
    }));
  }

  // ─── Object mutations ──────────────────────────────────────────────────────

  function addObject(type: ObjectType, size?: [number, number]) {
    const vt = viewRef.current;
    let pos: Vertex;
    if (boundary) {
      pos = centroid(boundary.vertices.map(([vx, vy]) => [vx + boundary.offset[0], vy + boundary.offset[1]] as Vertex));
    } else {
      pos = pixelToWorld(canvasSize.width / 2, canvasSize.height / 2, vt) as Vertex;
    }
    const newObj: GardenObject = { id: generateId(), type, label: OBJECT_CONFIGS[type].label, position: pos, size };
    setObjects(prev => [...prev, newObj]);
    setSelectedObjectId(newObj.id);
    setSelectedZoneId(null);
  }

  function deleteObject(id: string) {
    pushHistory();
    setObjects(prev => prev.filter(o => o.id !== id));
    if (selectedObjectId === id) setSelectedObjectId(null);
  }

  function updateObjectSize(id: string, size: [number, number]) {
    setObjects(prev => prev.map(o => o.id === id ? { ...o, size } : o));
  }

  function updateObjectLabel(id: string, label: string) {
    setObjects(prev => prev.map(o => o.id === id ? { ...o, label } : o));
  }

  // ─── Boundary vertex removal ───────────────────────────────────────────────

  function removeBoundaryVertex(index: number) {
    setBoundary(b => {
      if (!b || b.vertices.length <= 3) return b;
      return { ...b, vertices: b.vertices.filter((_, i) => i !== index) };
    });
  }

  // ─── Derived ──────────────────────────────────────────────────────────────

  const selectedZone = zones.find(z => z.id === selectedZoneId) ?? null;
  const selectedObject = objects.find(o => o.id === selectedObjectId) ?? null;

  const cursor = drag.mode === "pan" ? "grabbing"
    : drag.mode === "zone-vertex" || drag.mode === "boundary-vertex" || drag.mode === "zone" || drag.mode === "object" ? "move"
    : "default";

  const outsideOverlayPath = boundary
    ? `M0,0 H${canvasSize.width} V${canvasSize.height} H0 Z ${verticesPath(boundary.vertices, boundary.offset, view)}`
    : null;

  const editingLabel = editingBoundary
    ? "Boundary edit — drag vertices · click edge to add · × to remove · Esc to finish"
    : editingZoneVertices
    ? "Vertex edit — drag points · click edge to add · × to remove · Esc to finish"
    : null;

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div ref={containerRef} className="relative flex-1 overflow-hidden bg-canvas">
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
          <GridBackground view={view} width={canvasSize.width} height={canvasSize.height} id="gp" />

          {/* Garden boundary fill */}
          {boundary && (
            <polygon
              points={boundary.vertices.map(([vx, vy]) => {
                const [px, py] = worldToPixel([vx + boundary.offset[0], vy + boundary.offset[1]], view);
                return `${px},${py}`;
              }).join(" ")}
              fill="rgba(193,224,157,0.12)"
            />
          )}

          {/* Zones */}
          {zones.map(zone => {
            const cfg = ZONE_CONFIGS[zone.type];
            const isSelected = zone.id === selectedZoneId;
            const pts = zone.vertices.map(([vx, vy]) => {
              const [px, py] = worldToPixel([vx + zone.offset[0], vy + zone.offset[1]], view);
              return `${px},${py}`;
            }).join(" ");
            const cen = centroid(zone.vertices.map(([vx, vy]) => [vx + zone.offset[0], vy + zone.offset[1]] as Vertex));
            const [cenPx, cenPy] = worldToPixel(cen, view);
            const area = polygonArea(zone.vertices);

            return (
              <g key={zone.id}>
                <polygon
                  points={pts}
                  fill={cfg.fill}
                  stroke={cfg.stroke}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  strokeDasharray={isSelected ? "8 4" : undefined}
                />
                <text
                  x={cenPx} y={cenPy - 6}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={12} fontFamily="system-ui,sans-serif"
                  fill={cfg.stroke} fontWeight="600"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {zone.label}
                </text>
                <text
                  x={cenPx} y={cenPy + 10}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={10} fontFamily="system-ui,sans-serif"
                  fill={cfg.stroke} opacity={0.8}
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {area.toFixed(1)} m²
                </text>

                {/* Edge lengths (selected) */}
                {isSelected && zone.vertices.map((v, i) => {
                  const n = zone.vertices.length;
                  const next = zone.vertices[(i + 1) % n];
                  const ax = v[0] + zone.offset[0], ay = v[1] + zone.offset[1];
                  const bx = next[0] + zone.offset[0], by = next[1] + zone.offset[1];
                  const len = edgeLength(ax, ay, bx, by);
                  if (len < 0.1) return null;
                  const [mpx, mpy] = worldToPixel([(ax + bx) / 2, (ay + by) / 2], view);
                  const angle = Math.atan2(by - ay, bx - ax) * 180 / Math.PI;
                  const textAngle = (angle > 90 || angle < -90) ? angle + 180 : angle;
                  return (
                    <text key={i}
                      x={mpx} y={mpy - 9}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize={10} fontFamily="system-ui,sans-serif"
                      fill="#5a9466" fontWeight="600"
                      transform={`rotate(${textAngle},${mpx},${mpy - 9})`}
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      {len.toFixed(2)}m
                    </text>
                  );
                })}

                {/* Vertex handles (zone edit mode) */}
                {isSelected && editingZoneVertices && zone.vertices.map(([vx, vy], i) => {
                  const [vpx, vpy] = worldToPixel([vx + zone.offset[0], vy + zone.offset[1]], view);
                  return (
                    <g key={i}>
                      <circle cx={vpx} cy={vpy} r={7} fill="white" stroke={cfg.stroke} strokeWidth={2} style={{ cursor: "move" }} />
                      {zone.vertices.length > 3 && (
                        <g transform={`translate(${vpx + 8},${vpy - 8})`} style={{ cursor: "pointer" }}
                          onClick={ev => { ev.stopPropagation(); removeZoneVertex(zone.id, i); }}>
                          <circle r={5} fill="#a14537" />
                          <text textAnchor="middle" dominantBaseline="middle" fontSize={8} fill="white" fontWeight="bold">x</text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Edge midpoint handles */}
                {isSelected && editingZoneVertices && zone.vertices.map((v, i) => {
                  const n = zone.vertices.length;
                  const next = zone.vertices[(i + 1) % n];
                  const [mpx, mpy] = worldToPixel(
                    [(v[0] + next[0]) / 2 + zone.offset[0], (v[1] + next[1]) / 2 + zone.offset[1]],
                    view,
                  );
                  return (
                    <rect key={i}
                      x={mpx - 5} y={mpy - 5} width={10} height={10}
                      fill="white" stroke={cfg.stroke} strokeWidth={1.5} rx={2} style={{ cursor: "pointer" }}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Objects */}
          {objects.map(obj => {
            const [px, py] = worldToPixel(obj.position, view);
            return (
              <g key={obj.id} style={{ cursor: "move" }}>
                <ObjectIcon type={obj.type} cx={px} cy={py} selected={obj.id === selectedObjectId} scale={view.scale} size={obj.size} />
                <text
                  x={px} y={py + 20}
                  textAnchor="middle" fontSize={10}
                  fontFamily="system-ui,sans-serif" fill="#6d6a60"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {obj.label}
                </text>
              </g>
            );
          })}

          {/* Outside-boundary overlay — rendered on top of zones/objects */}
          {outsideOverlayPath && (
            <path
              d={outsideOverlayPath}
              fillRule="evenodd"
              fill="rgba(34,32,27,0.09)"
              style={{ pointerEvents: "none" }}
            />
          )}

          {/* Garden boundary outline */}
          {boundary && (
            <polygon
              points={boundary.vertices.map(([vx, vy]) => {
                const [px, py] = worldToPixel([vx + boundary.offset[0], vy + boundary.offset[1]], view);
                return `${px},${py}`;
              }).join(" ")}
              fill="none"
              stroke="#234a2e"
              strokeWidth={editingBoundary ? 2.5 : 2}
              strokeDasharray={editingBoundary ? "10 4" : "7 4"}
              style={{ pointerEvents: "none" }}
            />
          )}

          {/* Boundary dimension labels (always visible) */}
          {boundary && boundary.vertices.map((v, i) => {
            const n = boundary.vertices.length;
            const next = boundary.vertices[(i + 1) % n];
            const ax = v[0] + boundary.offset[0], ay = v[1] + boundary.offset[1];
            const bx = next[0] + boundary.offset[0], by = next[1] + boundary.offset[1];
            const len = edgeLength(ax, ay, bx, by);
            if (len < 0.1) return null;
            const [mpx, mpy] = worldToPixel([(ax + bx) / 2, (ay + by) / 2], view);
            const angle = Math.atan2(by - ay, bx - ax) * 180 / Math.PI;
            const textAngle = (angle > 90 || angle < -90) ? angle + 180 : angle;
            return (
              <text key={i}
                x={mpx} y={mpy + 12}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={10} fontFamily="system-ui,sans-serif"
                fill="#234a2e" fontWeight="600" opacity={0.8}
                transform={`rotate(${textAngle},${mpx},${mpy + 12})`}
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {len.toFixed(1)}m
              </text>
            );
          })}

          {/* Boundary vertex handles (edit mode) */}
          {boundary && editingBoundary && boundary.vertices.map(([vx, vy], i) => {
            const [vpx, vpy] = worldToPixel([vx + boundary.offset[0], vy + boundary.offset[1]], view);
            return (
              <g key={i}>
                <circle cx={vpx} cy={vpy} r={7} fill="white" stroke="#234a2e" strokeWidth={2} style={{ cursor: "move" }} />
                {boundary.vertices.length > 3 && (
                  <g transform={`translate(${vpx + 8},${vpy - 8})`} style={{ cursor: "pointer" }}
                    onClick={ev => { ev.stopPropagation(); removeBoundaryVertex(i); }}>
                    <circle r={5} fill="#a14537" />
                    <text textAnchor="middle" dominantBaseline="middle" fontSize={8} fill="white" fontWeight="bold">x</text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Boundary edge midpoint handles */}
          {boundary && editingBoundary && boundary.vertices.map((v, i) => {
            const n = boundary.vertices.length;
            const next = boundary.vertices[(i + 1) % n];
            const [mpx, mpy] = worldToPixel(
              [(v[0] + next[0]) / 2 + boundary.offset[0], (v[1] + next[1]) / 2 + boundary.offset[1]],
              view,
            );
            return (
              <rect key={i}
                x={mpx - 5} y={mpy - 5} width={10} height={10}
                fill="white" stroke="#234a2e" strokeWidth={1.5} rx={2} style={{ cursor: "pointer" }}
              />
            );
          })}
        </svg>

        {/* Floating zone action bar */}
        {selectedZone && !editingLabel && (
          <div className="pointer-events-auto absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-px rounded-full border border-line bg-paper/95 shadow-md backdrop-blur-sm">
            <span className="max-w-[140px] truncate px-3 py-1.5 text-hint font-medium text-ink">{selectedZone.label}</span>
            <div className="h-4 w-px bg-line" />
            <button
              onClick={() => setEditingZoneVertices(v => !v)}
              className={`rounded-full px-3 py-1.5 text-hint transition ${editingZoneVertices ? "bg-amber-50 font-medium text-amber-800" : "text-muted hover:bg-mist hover:text-ink"}`}
            >
              {editingZoneVertices ? "Done editing" : "Edit shape"}
            </button>
            <div className="h-4 w-px bg-line" />
            <button
              onClick={() => deleteZone(selectedZone.id)}
              className="rounded-full px-3 py-1.5 text-hint font-medium text-danger transition hover:bg-danger/8"
            >
              Delete
            </button>
          </div>
        )}

        {/* Floating object action bar */}
        {selectedObject && !editingLabel && !selectedZone && (
          <div className="pointer-events-auto absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-px rounded-full border border-line bg-paper/95 shadow-md backdrop-blur-sm">
            <span className="max-w-[140px] truncate px-3 py-1.5 text-hint font-medium text-ink">{selectedObject.label}</span>
            <div className="h-4 w-px bg-line" />
            <button
              onClick={() => deleteObject(selectedObject.id)}
              className="rounded-full px-3 py-1.5 text-hint font-medium text-danger transition hover:bg-danger/8"
            >
              Remove
            </button>
          </div>
        )}

        {editingLabel && (
          <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded border border-amber-400/60 bg-amber-50/90 px-3 py-1.5 text-xs font-medium text-amber-800 shadow-sm whitespace-nowrap">
            {editingLabel}
          </div>
        )}

        {onSave && saveStatus !== "idle" && (
          <div className={`pointer-events-none absolute right-3 top-3 rounded-full border px-3 py-1 text-xs font-medium shadow-sm backdrop-blur-sm transition-all ${
            saveStatus === "saved"
              ? "border-leaf/40 bg-forest/10 text-forest"
              : "border-line bg-canvas/90 text-muted"
          }`}>
            {saveStatus === "saving" ? "Saving…" : "✓ Saved"}
          </div>
        )}

        {/* Zone legend overlay — bottom-left */}
        {zones.length > 0 && (
          <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl border border-line bg-paper/90 px-3 py-2.5 shadow-sm backdrop-blur-sm">
            <div className="flex flex-col gap-1.5">
              {Array.from(new Set(zones.map(z => z.type))).map(type => {
                const cfg = ZONE_CONFIGS[type];
                return (
                  <div key={type} className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 shrink-0 rounded-sm border"
                      style={{ background: cfg.fill, borderColor: cfg.stroke }}
                    />
                    <span className="text-xs text-muted">{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mobile sidebar toggle */}
        <button
          className="absolute bottom-4 right-14 flex h-8 w-8 items-center justify-center rounded border border-line bg-paper shadow-sm hover:bg-mist md:hidden"
          onClick={() => setSidebarOpen(v => !v)}
          title="Toggle panel"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <rect x="1" y="1" width="12" height="12" rx="2" />
            <line x1="9" y1="1" x2="9" y2="13" />
          </svg>
        </button>

        <div className="absolute bottom-4 right-4 flex flex-col gap-1">
          <button onClick={() => zoomBy(1.3)}
            className="flex h-8 w-8 items-center justify-center rounded border border-line bg-paper font-mono text-ink shadow-sm hover:bg-mist active:scale-95" title="Zoom in">
            +
          </button>
          <button onClick={() => zoomBy(1 / 1.3)}
            className="flex h-8 w-8 items-center justify-center rounded border border-line bg-paper font-mono text-ink shadow-sm hover:bg-mist active:scale-95" title="Zoom out">
            −
          </button>
        </div>
      </div>

      {/* Bounding box resize handles for selected zone */}
      {selectedZone && !editingZoneVertices && !editingBoundary && (() => {
        const absVerts = selectedZone.vertices.map(([vx, vy]) => [vx + selectedZone.offset[0], vy + selectedZone.offset[1]] as Vertex);
        const bb = boundingBox(absVerts);
        const corners: Vertex[] = [
          [bb.minX, bb.minY], [bb.maxX, bb.minY],
          [bb.maxX, bb.maxY], [bb.minX, bb.maxY],
        ];
        return (
          <svg style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }} width={canvasSize.width} height={canvasSize.height}>
            {corners.map((corner, ci) => {
              const [cpx, cpy] = worldToPixel(corner, view);
              return (
                <rect key={ci} x={cpx - 5} y={cpy - 5} width={10} height={10}
                  fill="white" stroke="#234a2e" strokeWidth={1.5} rx={1}
                  style={{ pointerEvents: "auto", cursor: RESIZE_CURSORS[ci] }}
                />
              );
            })}
          </svg>
        );
      })()}

      <GardenSidebar
        boundary={boundary}
        zones={zones}
        objects={objects}
        selectedZone={selectedZone}
        selectedObject={selectedObject}
        editingZoneVertices={editingZoneVertices}
        editingBoundary={editingBoundary}
        projectName={projectName}
        onBack={onBack}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        onSelectZone={id => { setSelectedZoneId(id); setSelectedObjectId(null); }}
        onSelectObject={id => { setSelectedObjectId(id); setSelectedZoneId(null); }}
        onAddZone={addZone}
        onDeleteZone={deleteZone}
        onUpdateZoneLabel={updateZoneLabel}
        onUpdateZoneType={updateZoneType}
        onToggleEditZoneVertices={() => setEditingZoneVertices(v => !v)}
        onToggleEditBoundary={() => { setEditingBoundary(v => !v); setEditingZoneVertices(false); setSelectedZoneId(null); }}
        onAddObject={(type, size) => addObject(type, size)}
        onDeleteObject={deleteObject}
        onUpdateObjectLabel={updateObjectLabel}
        onUpdateObjectSize={updateObjectSize}
        onGenerateImage={onGenerateImage ? handleGenerateImage : undefined}
      />

      {imageModal && (
        <GardenImageModal
          state={imageModal.state}
          images={imageModal.images}
          onClose={() => setImageModal(null)}
        />
      )}
    </div>
  );
}

// ─── Image modal ──────────────────────────────────────────────────────────────

function GardenImageModal({
  state, images, onClose,
}: {
  state: "loading" | "done" | "error";
  images: string[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl rounded-2xl border border-line bg-paper p-6 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between pr-8">
          <p className="text-body font-semibold text-ink">AI garden visualisation</p>
        </div>

        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-muted transition hover:bg-mist hover:text-ink"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M2 2l10 10M12 2L2 12" />
          </svg>
        </button>

        {state === "loading" && (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-line border-t-forest" />
            <p className="text-body text-muted">Generating image, this may take a moment&hellip;</p>
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-col items-center py-12">
            <p className="text-body text-danger">Failed to generate image. Please try again.</p>
          </div>
        )}

        {state === "done" && images.length > 0 && (
          <div className="flex gap-3">
            {images.map((src, i) => {
              const labels = ["Top view", "Front perspective", "Isometric view"];
              return (
                <div key={i} className="flex flex-1 flex-col gap-1.5 overflow-hidden">
                  <p className="text-hint text-muted">{labels[i] ?? `View ${i + 1}`}</p>
                  <div className="overflow-hidden rounded-xl border border-line bg-canvas">
                    <img
                      src={src}
                      alt={labels[i] ?? `Garden view ${i + 1}`}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
