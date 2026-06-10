import polygonClipping from "polygon-clipping";
import type { Vertex, TileResult, TileRotation } from "./types";
import { MAX_TILE_CANDIDATES } from "./constants";

// ---------------------------------------------------------------------------
// Basic polygon math
// ---------------------------------------------------------------------------

export function polygonArea(pts: Vertex[]): number {
  let sum = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % n];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
}

function ringArea(ring: [number, number][]): number {
  return polygonArea(ring as Vertex[]);
}

// ---------------------------------------------------------------------------
// Coordinate rotation helpers (around world origin)
// ---------------------------------------------------------------------------

const SIN45 = Math.SQRT2 / 2; // sin(45°) = cos(45°) = 1/√2

export function rotateMinus45(v: Vertex): Vertex {
  return [(v[0] + v[1]) * SIN45, (v[1] - v[0]) * SIN45];
}

export function rotatePlus45(v: Vertex): Vertex {
  return [(v[0] - v[1]) * SIN45, (v[0] + v[1]) * SIN45];
}

// ---------------------------------------------------------------------------
// Tile size resolution
// ---------------------------------------------------------------------------

export function resolveTileSize(
  size: import("./types").TileSize,
  presets: Record<"600x600" | "900x600", { width: number; height: number }>
): { width: number; height: number } {
  if (size.kind === "custom") return { width: size.width, height: size.height };
  return presets[size.kind];
}

// ---------------------------------------------------------------------------
// AABB
// ---------------------------------------------------------------------------

function boundingBox(pts: Vertex[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of pts) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY };
}

// Snap a world coordinate down to the nearest tile-grid boundary
function snapDown(val: number, step: number): number {
  return Math.floor(val / step) * step;
}

// ---------------------------------------------------------------------------
// Polygon clipping wrapper
// ---------------------------------------------------------------------------

type Ring = [number, number][];

function vertexesToRing(pts: Vertex[]): Ring {
  const ring: Ring = pts.map(([x, y]) => [x, y]);
  // Ensure the ring is closed
  const last = ring[ring.length - 1];
  const first = ring[0];
  if (last[0] !== first[0] || last[1] !== first[1]) ring.push([first[0], first[1]]);
  return ring;
}

function clipTileAgainstPatio(
  tileRing: Ring,
  patioRing: Ring
): Vertex[] | null {
  let result: ReturnType<typeof polygonClipping.intersection>;
  try {
    result = polygonClipping.intersection([tileRing], [patioRing]);
  } catch {
    return null;
  }
  if (!result || result.length === 0) return null;
  const outerRing = result[0]?.[0];
  if (!outerRing || outerRing.length < 3) return null;
  // Drop the closing duplicate vertex that polygon-clipping returns
  const pts = outerRing.slice(0, -1) as Vertex[];
  return pts;
}

// Slivers smaller than this fraction of a full tile are discarded (< ~108 cm² for 600×600)
const MIN_CUT_FRACTION = 0.03;

// ---------------------------------------------------------------------------
// Main tile computation
// ---------------------------------------------------------------------------

export function computeTiles(
  vertices: Vertex[],
  offset: Vertex,
  tileW: number,
  tileH: number,
  rotation: TileRotation,
  chessMode: boolean = false
): { tiles: TileResult[]; tooMany: boolean } {
  if (vertices.length < 3 || tileW <= 0 || tileH <= 0) {
    return { tiles: [], tooMany: false };
  }

  const offsetVerts: Vertex[] = vertices.map(([x, y]) => [x + offset[0], y + offset[1]]);

  let result: { tiles: TileResult[]; tooMany: boolean };
  if (rotation === 45) {
    result = computeTilesDiagonal(offsetVerts, tileW, tileH);
  } else {
    result = computeTilesStraight(offsetVerts, tileW, tileH);
  }
  if (!result.tooMany) {
    assignPhysicalTiles(result.tiles, tileW, tileH, chessMode);
  }
  return result;
}

function computeTilesStraight(
  patioVerts: Vertex[],
  tileW: number,
  tileH: number
): { tiles: TileResult[]; tooMany: boolean } {
  const bbox = boundingBox(patioVerts);
  const patioRing = vertexesToRing(patioVerts);
  const tileArea = tileW * tileH;

  const startX = snapDown(bbox.minX, tileW) - tileW;
  const startY = snapDown(bbox.minY, tileH) - tileH;
  const endX = bbox.maxX + tileW;
  const endY = bbox.maxY + tileH;

  const cols = Math.ceil((endX - startX) / tileW);
  const rows = Math.ceil((endY - startY) / tileH);
  const candidateCount = cols * rows;

  if (candidateCount > MAX_TILE_CANDIDATES) {
    return { tiles: [], tooMany: true };
  }

  const tiles: TileResult[] = [];

  for (let ci = 0; ci < cols; ci++) {
    for (let ri = 0; ri < rows; ri++) {
      const x0 = startX + ci * tileW;
      const y0 = startY + ri * tileH;
      const x1 = x0 + tileW;
      const y1 = y0 + tileH;

      const tileRing: Ring = [[x0,y0],[x1,y0],[x1,y1],[x0,y1],[x0,y0]];
      const clipped = clipTileAgainstPatio(tileRing, patioRing);
      if (!clipped) continue;

      const clippedArea = ringArea(clipped);
      if (clippedArea < tileArea * MIN_CUT_FRACTION) continue;

      const isCut = Math.abs(clippedArea - tileArea) > 1e-4;
      tiles.push({
        id: `s_${ci}_${ri}`,
        points: isCut ? clipped : [[x0,y0],[x1,y0],[x1,y1],[x0,y1]],
        isCut,
        cutArea: clippedArea,
        physicalTileIdx: -1,
        gridCol: ci,
        gridRow: ri,
      });
    }
  }

  return { tiles, tooMany: false };
}

function computeTilesDiagonal(
  patioVerts: Vertex[],
  tileW: number,
  tileH: number
): { tiles: TileResult[]; tooMany: boolean } {
  // Rotate patio by -45° into a "tile frame" where we can apply a straight grid
  const rotatedVerts: Vertex[] = patioVerts.map(rotateMinus45);
  const bbox = boundingBox(rotatedVerts);
  const rotatedPatioRing = vertexesToRing(rotatedVerts);
  const tileArea = tileW * tileH;

  const startX = snapDown(bbox.minX, tileW) - tileW;
  const startY = snapDown(bbox.minY, tileH) - tileH;
  const endX = bbox.maxX + tileW;
  const endY = bbox.maxY + tileH;

  const cols = Math.ceil((endX - startX) / tileW);
  const rows = Math.ceil((endY - startY) / tileH);
  const candidateCount = cols * rows;

  if (candidateCount > MAX_TILE_CANDIDATES) {
    return { tiles: [], tooMany: true };
  }

  const tiles: TileResult[] = [];

  for (let ci = 0; ci < cols; ci++) {
    for (let ri = 0; ri < rows; ri++) {
      const x0 = startX + ci * tileW;
      const y0 = startY + ri * tileH;
      const x1 = x0 + tileW;
      const y1 = y0 + tileH;

      const tileRing: Ring = [[x0,y0],[x1,y0],[x1,y1],[x0,y1],[x0,y0]];
      const clipped = clipTileAgainstPatio(tileRing, rotatedPatioRing);
      if (!clipped) continue;

      const clippedArea = ringArea(clipped);
      if (clippedArea < tileArea * MIN_CUT_FRACTION) continue;

      const isCut = Math.abs(clippedArea - tileArea) > 1e-4;

      // Rotate full tile corners OR clipped polygon back to world space (+45°)
      const worldPoints: Vertex[] = isCut
        ? clipped.map(rotatePlus45)
        : [[x0,y0],[x1,y0],[x1,y1],[x0,y1]].map(([px, py]) =>
            rotatePlus45([px, py])
          );

      tiles.push({ id: `d_${ci}_${ri}`, points: worldPoints, isCut, cutArea: clippedArea, physicalTileIdx: -1, gridCol: ci, gridRow: ri });
    }
  }

  return { tiles, tooMany: false };
}

// ---------------------------------------------------------------------------
// Cut-piece reuse — First Fit Decreasing bin-packing (area-based)
// ---------------------------------------------------------------------------

function runFFD(pieces: TileResult[], tileArea: number): void {
  const sorted = [...pieces].sort((a, b) => b.cutArea - a.cutArea);
  const remaining: number[] = [];
  for (const piece of sorted) {
    let placed = false;
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i] >= piece.cutArea - 1e-6) {
        piece.physicalTileIdx = i;
        remaining[i] -= piece.cutArea;
        placed = true;
        break;
      }
    }
    if (!placed) {
      piece.physicalTileIdx = remaining.length;
      remaining.push(tileArea - piece.cutArea);
    }
  }
}

function assignPhysicalTiles(tiles: TileResult[], tileW: number, tileH: number, chessMode: boolean): void {
  const tileArea = tileW * tileH;
  const cutTiles = tiles.filter((t) => t.isCut);

  if (chessMode) {
    // In chess mode, offcuts from a dark-position tile can only reuse with another dark tile
    runFFD(cutTiles.filter(t => (t.gridCol + t.gridRow) % 2 === 0), tileArea);
    runFFD(cutTiles.filter(t => (t.gridCol + t.gridRow) % 2 === 1), tileArea);
  } else {
    runFFD(cutTiles, tileArea);
  }
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export function computeStats(
  tiles: TileResult[],
  patioVerts: Vertex[],
  offset: Vertex,
  chessMode: boolean = false
): import("./types").Stats {
  const offsetVerts: Vertex[] = patioVerts.map(([x, y]) => [x + offset[0], y + offset[1]]);
  const areaSqM = polygonArea(offsetVerts);
  const fullTiles = tiles.filter((t) => !t.isCut).length;
  const cutPieces = tiles.filter((t) => t.isCut).length;

  let physicalCutTiles: number;
  let fullBlack = 0, fullWhite = 0, physCutBlack = 0, physCutWhite = 0;

  if (chessMode) {
    for (const t of tiles) {
      if (!t.isCut) {
        if ((t.gridCol + t.gridRow) % 2 === 1) fullBlack++; else fullWhite++;
      }
    }
    // In chess mode each color group has its own FFD index space, so count them separately
    physCutBlack = new Set(
      tiles.filter(t => t.isCut && t.physicalTileIdx >= 0 && (t.gridCol + t.gridRow) % 2 === 1).map(t => t.physicalTileIdx)
    ).size;
    physCutWhite = new Set(
      tiles.filter(t => t.isCut && t.physicalTileIdx >= 0 && (t.gridCol + t.gridRow) % 2 === 0).map(t => t.physicalTileIdx)
    ).size;
    physicalCutTiles = physCutBlack + physCutWhite;
  } else {
    physicalCutTiles = new Set(
      tiles.filter((t) => t.isCut && t.physicalTileIdx >= 0).map((t) => t.physicalTileIdx)
    ).size;
  }

  const savedTiles = cutPieces - physicalCutTiles;
  const totalTiles = fullTiles + physicalCutTiles;
  return {
    areaSqM,
    fullTiles,
    cutPieces,
    physicalCutTiles,
    savedTiles,
    totalTiles,
    plus10: Math.ceil(totalTiles * 1.1),
    plus15: Math.ceil(totalTiles * 1.15),
    fullBlack,
    fullWhite,
    physCutBlack,
    physCutWhite,
  };
}

// ---------------------------------------------------------------------------
// Pixel ↔ world conversion helpers (used by canvas components)
// ---------------------------------------------------------------------------

export function worldToPixel(pt: Vertex, vt: { x: number; y: number; scale: number }): [number, number] {
  return [pt[0] * vt.scale + vt.x, pt[1] * vt.scale + vt.y];
}

export function pixelToWorld(px: number, py: number, vt: { x: number; y: number; scale: number }): Vertex {
  return [(px - vt.x) / vt.scale, (py - vt.y) / vt.scale];
}

// ---------------------------------------------------------------------------
// Dimension label helpers
// ---------------------------------------------------------------------------

export type EdgeLabel = {
  midPx: [number, number];
  length: number;    // metres
  angleDeg: number;  // for Konva Text rotation
  offsetPx: [number, number]; // perpendicular offset outward from edge midpoint
};

export function computeEdgeLabels(
  verts: Vertex[],
  vt: { x: number; y: number; scale: number },
  offsetM: number = 0.3  // metres outward
): EdgeLabel[] {
  const n = verts.length;
  const labels: EdgeLabel[] = [];

  for (let i = 0; i < n; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % n];

    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1e-6) continue;

    const midWorld: Vertex = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const [midPxX, midPxY] = worldToPixel(midWorld, vt);

    // Perpendicular direction (left-normal of the edge, then scaled to offsetM)
    const nx = -dy / len;
    const ny =  dx / len;
    const offsetPxX = nx * offsetM * vt.scale;
    const offsetPxY = ny * offsetM * vt.scale;

    const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);

    labels.push({
      midPx: [midPxX, midPxY],
      length: len,
      angleDeg,
      offsetPx: [offsetPxX, offsetPxY],
    });
  }

  return labels;
}
