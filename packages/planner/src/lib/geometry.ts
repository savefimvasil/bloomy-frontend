import polygonClipping from "polygon-clipping";
import type { Vertex, TileResult, TileRotation, TileSize, Stats, TileSizePreset } from "./types";
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

const SIN45 = Math.SQRT2 / 2;

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
  size: TileSize,
  presets: Record<TileSizePreset, { width: number; height: number }>
): { width: number; height: number } {
  if (size.kind === "custom") return { width: size.width, height: size.height };
  return presets[size.kind];
}

// ---------------------------------------------------------------------------
// AABB / snap / centroid helpers
// ---------------------------------------------------------------------------

export function snapDown(val: number, step: number): number {
  return Math.floor(val / step) * step;
}

export function boundingBox(pts: Vertex[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of pts) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY };
}

export function centroid(pts: [number, number][]): [number, number] {
  let cx = 0, cy = 0;
  for (const [px, py] of pts) { cx += px; cy += py; }
  return [cx / pts.length, cy / pts.length];
}

// ---------------------------------------------------------------------------
// Polygon clipping
// ---------------------------------------------------------------------------

type Ring = [number, number][];

function vertexesToRing(pts: Vertex[]): Ring {
  const ring: Ring = pts.map(([x, y]) => [x, y]);
  const last = ring[ring.length - 1];
  const first = ring[0];
  if (last[0] !== first[0] || last[1] !== first[1]) ring.push([first[0], first[1]]);
  return ring;
}

function clipTileAgainstPatio(tileRing: Ring, patioRing: Ring): Vertex[] | null {
  let result: ReturnType<typeof polygonClipping.intersection>;
  try {
    result = polygonClipping.intersection([tileRing], [patioRing]);
  } catch {
    return null;
  }
  if (!result || result.length === 0) return null;
  const outerRing = result[0]?.[0];
  if (!outerRing || outerRing.length < 3) return null;
  return outerRing.slice(0, -1) as Vertex[];
}

// ---------------------------------------------------------------------------
// Shared grid-setup helper (deduplicates straight + diagonal setup)
// ---------------------------------------------------------------------------

function computeGridSetup(
  bbox: ReturnType<typeof boundingBox>,
  cellW: number,
  cellH: number
): { startX: number; startY: number; cols: number; rows: number; tooMany: boolean } {
  const startX = snapDown(bbox.minX, cellW) - cellW;
  const startY = snapDown(bbox.minY, cellH) - cellH;
  const endX   = bbox.maxX + cellW;
  const endY   = bbox.maxY + cellH;
  const cols   = Math.ceil((endX - startX) / cellW);
  const rows   = Math.ceil((endY - startY) / cellH);
  const tooMany = cols * rows > MAX_TILE_CANDIDATES;
  return { startX, startY, cols, rows, tooMany };
}

// ---------------------------------------------------------------------------
// Main tile computation
// ---------------------------------------------------------------------------

export function computeTiles(
  vertices: Vertex[],
  offset: Vertex,
  tileW: number,
  tileH: number,
  rotation: TileRotation,
  chessMode: boolean,
  grout: number,
  brickOffset: boolean,
  herringbone: boolean
): { tiles: TileResult[]; tooMany: boolean } {
  if (vertices.length < 3 || tileW <= 0 || tileH <= 0) {
    return { tiles: [], tooMany: false };
  }

  const offsetVerts: Vertex[] = vertices.map(([x, y]) => [x + offset[0], y + offset[1]]);

  let result: { tiles: TileResult[]; tooMany: boolean };
  if (herringbone) {
    result = computeTilesHerringbone(offsetVerts, tileW, tileH, grout);
  } else if (rotation === 45) {
    result = computeTilesDiagonal(offsetVerts, tileW, tileH, grout);
  } else {
    result = computeTilesStraight(offsetVerts, tileW, tileH, grout, brickOffset);
  }
  if (!result.tooMany) {
    assignPhysicalTiles(result.tiles, tileW, tileH, chessMode);
  }
  return result;
}

function computeTilesStraight(
  patioVerts: Vertex[],
  tileW: number,
  tileH: number,
  grout: number,
  brickOffset: boolean
): { tiles: TileResult[]; tooMany: boolean } {
  const cellW = tileW + grout;
  const cellH = tileH + grout;
  const tileArea = tileW * tileH;

  const bbox = boundingBox(patioVerts);
  const patioRing = vertexesToRing(patioVerts);
  const { startX, startY, cols, rows, tooMany } = computeGridSetup(bbox, cellW, cellH);
  if (tooMany) return { tiles: [], tooMany: true };

  const tiles: TileResult[] = [];

  for (let ci = 0; ci < cols; ci++) {
    for (let ri = 0; ri < rows; ri++) {
      const rowShift = brickOffset && ri % 2 === 1 ? cellW / 2 : 0;
      const x0 = startX + ci * cellW + rowShift;
      const y0 = startY + ri * cellH;
      const x1 = x0 + tileW;
      const y1 = y0 + tileH;

      const tileRing: Ring = [[x0,y0],[x1,y0],[x1,y1],[x0,y1],[x0,y0]];
      const clipped = clipTileAgainstPatio(tileRing, patioRing);
      if (!clipped) continue;

      const clippedArea = ringArea(clipped);
      if (clippedArea <= 0) continue;

      const isCut = Math.abs(clippedArea - tileArea) > 1e-4;
      tiles.push({
        id: `s_${ci}_${ri}`,
        points: isCut ? clipped : [[x0,y0],[x1,y0],[x1,y1],[x0,y1]],
        isCut,
        cutArea: clippedArea,
        physicalTileIdx: -1,
        pieceIdx: -1,
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
  tileH: number,
  grout: number
): { tiles: TileResult[]; tooMany: boolean } {
  const cellW = tileW + grout;
  const cellH = tileH + grout;
  const tileArea = tileW * tileH;

  const rotatedVerts: Vertex[] = patioVerts.map(rotateMinus45);
  const bbox = boundingBox(rotatedVerts);
  const rotatedPatioRing = vertexesToRing(rotatedVerts);
  const { startX, startY, cols, rows, tooMany } = computeGridSetup(bbox, cellW, cellH);
  if (tooMany) return { tiles: [], tooMany: true };

  const tiles: TileResult[] = [];

  for (let ci = 0; ci < cols; ci++) {
    for (let ri = 0; ri < rows; ri++) {
      const x0 = startX + ci * cellW;
      const y0 = startY + ri * cellH;
      const x1 = x0 + tileW;
      const y1 = y0 + tileH;

      const tileRing: Ring = [[x0,y0],[x1,y0],[x1,y1],[x0,y1],[x0,y0]];
      const clipped = clipTileAgainstPatio(tileRing, rotatedPatioRing);
      if (!clipped) continue;

      const clippedArea = ringArea(clipped);
      if (clippedArea <= 0) continue;

      const isCut = Math.abs(clippedArea - tileArea) > 1e-4;
      const worldPoints: Vertex[] = isCut
        ? clipped.map(rotatePlus45)
        : ([[x0,y0],[x1,y0],[x1,y1],[x0,y1]] as Vertex[]).map(rotatePlus45);

      tiles.push({ id: `d_${ci}_${ri}`, points: worldPoints, isCut, cutArea: clippedArea, physicalTileIdx: -1, pieceIdx: -1, gridCol: ci, gridRow: ri });
    }
  }

  return { tiles, tooMany: false };
}

// ---------------------------------------------------------------------------
// Herringbone / parquet zigzag
//
// Each repeating "arrow" unit contains two planks:
//   Plank A (horizontal, W×H): (baseX, baseY) → (baseX+W, baseY+H)
//   Plank B (vertical,   H×W): (baseX+cellW, baseY) → (baseX+cellW+H, baseY+W)
//
// Column period = cellW + cellH  (one full arrow width)
// Row step x    = cellH          (each row shifts right by short side + grout)
// Row step y    = cellW          (each row shifts down  by long  side + grout)
//
// This ensures exactly one grout gap between every adjacent plank face.
// ---------------------------------------------------------------------------

function computeTilesHerringbone(
  patioVerts: Vertex[],
  tileW: number,
  tileH: number,
  grout: number
): { tiles: TileResult[]; tooMany: boolean } {
  // W = long dimension, H = short dimension
  const W = Math.max(tileW, tileH);
  const H = Math.min(tileW, tileH);
  const g = grout;
  const cellW = W + g;
  const cellH = H + g;
  const colPeriod = cellW + cellH; // width of one H+V arrow unit (with grout between)
  const rowStepX  = cellH;         // x-shift between rows
  const rowStepY  = cellW;         // y-shift between rows
  const tileArea  = W * H;

  const bbox      = boundingBox(patioVerts);
  const patioRing = vertexesToRing(patioVerts);

  const rowMin = Math.floor(bbox.minY / rowStepY) - 1;
  const rowMax = Math.ceil((bbox.maxY + rowStepY) / rowStepY) + 1;

  const tiles: TileResult[] = [];
  let candidateCount = 0;

  for (let row = rowMin; row <= rowMax; row++) {
    const baseY  = row * rowStepY;
    const xShift = row * rowStepX;

    const colMin = Math.floor((bbox.minX - xShift) / colPeriod) - 1;
    const colMax = Math.ceil((bbox.maxX - xShift) / colPeriod) + 1;

    for (let col = colMin; col <= colMax; col++) {
      if (++candidateCount > MAX_TILE_CANDIDATES) return { tiles: [], tooMany: true };

      const baseX = col * colPeriod + xShift;

      // Plank A — horizontal (W×H)
      {
        const ax0 = baseX, ay0 = baseY;
        const ax1 = baseX + W, ay1 = baseY + H;
        const ring: Ring = [[ax0,ay0],[ax1,ay0],[ax1,ay1],[ax0,ay1],[ax0,ay0]];
        const clipped = clipTileAgainstPatio(ring, patioRing);
        if (clipped) {
          const area = ringArea(clipped);
          if (area > 0) {
            const isCut = Math.abs(area - tileArea) > 1e-4;
            tiles.push({
              id: `h_${col}_${row}_a`,
              points: isCut ? clipped : [[ax0,ay0],[ax1,ay0],[ax1,ay1],[ax0,ay1]],
              isCut, cutArea: area,
              physicalTileIdx: -1, pieceIdx: -1,
              gridCol: col * 2, gridRow: row,
            });
          }
        }
      }

      // Plank B — vertical (H×W, rotated 90°)
      {
        const bx0 = baseX + cellW, by0 = baseY;
        const bx1 = baseX + cellW + H, by1 = baseY + W;
        const ring: Ring = [[bx0,by0],[bx1,by0],[bx1,by1],[bx0,by1],[bx0,by0]];
        const clipped = clipTileAgainstPatio(ring, patioRing);
        if (clipped) {
          const area = ringArea(clipped);
          if (area > 0) {
            const isCut = Math.abs(area - tileArea) > 1e-4;
            tiles.push({
              id: `h_${col}_${row}_b`,
              points: isCut ? clipped : [[bx0,by0],[bx1,by0],[bx1,by1],[bx0,by1]],
              isCut, cutArea: area,
              physicalTileIdx: -1, pieceIdx: -1,
              gridCol: col * 2 + 1, gridRow: row,
            });
          }
        }
      }
    }
  }

  return { tiles, tooMany: false };
}

// ---------------------------------------------------------------------------
// Cut-piece reuse (First Fit Decreasing)
// ---------------------------------------------------------------------------

function runFFD(pieces: TileResult[], tileArea: number): void {
  const sorted = [...pieces].sort((a, b) => b.cutArea - a.cutArea);
  const remaining: number[] = [];
  const counts: number[] = [];
  for (const piece of sorted) {
    let placed = false;
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i] >= piece.cutArea - 1e-6) {
        piece.physicalTileIdx = i;
        piece.pieceIdx = counts[i]++;
        remaining[i] -= piece.cutArea;
        placed = true;
        break;
      }
    }
    if (!placed) {
      piece.physicalTileIdx = remaining.length;
      piece.pieceIdx = 0;
      counts.push(1);
      remaining.push(tileArea - piece.cutArea);
    }
  }
}

function assignPhysicalTiles(tiles: TileResult[], tileW: number, tileH: number, chessMode: boolean): void {
  const tileArea = tileW * tileH;
  const cutTiles = tiles.filter((t) => t.isCut);

  if (chessMode) {
    const even = cutTiles.filter(t => (t.gridCol + t.gridRow) % 2 === 0);
    const odd  = cutTiles.filter(t => (t.gridCol + t.gridRow) % 2 === 1);
    runFFD(even, tileArea);
    runFFD(odd, tileArea);
    const offset = even.reduce((max, t) => Math.max(max, t.physicalTileIdx), -1) + 1;
    for (const t of odd) t.physicalTileIdx += offset;
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
): Stats {
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

  let hasSmallPieces = false;
  outer: for (const tile of tiles) {
    if (!tile.isCut) continue;
    for (let i = 0; i < tile.points.length; i++) {
      const a = tile.points[i];
      const b = tile.points[(i + 1) % tile.points.length];
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      if (Math.sqrt(dx * dx + dy * dy) < 0.03) { hasSmallPieces = true; break outer; }
    }
  }

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
    hasSmallPieces,
  };
}

// ---------------------------------------------------------------------------
// Pixel ↔ world conversion
// ---------------------------------------------------------------------------

export function worldToPixel(pt: Vertex, vt: { x: number; y: number; scale: number }): [number, number] {
  return [pt[0] * vt.scale + vt.x, pt[1] * vt.scale + vt.y];
}

export function pixelToWorld(px: number, py: number, vt: { x: number; y: number; scale: number }): Vertex {
  return [(px - vt.x) / vt.scale, (py - vt.y) / vt.scale];
}

// ---------------------------------------------------------------------------
// Edge label helpers
// ---------------------------------------------------------------------------

export type EdgeLabel = {
  midPx: [number, number];
  length: number;
  angleDeg: number;
  offsetPx: [number, number];
};

export function computeEdgeLabels(
  verts: Vertex[],
  vt: { x: number; y: number; scale: number },
  offsetM: number = 0.45
): EdgeLabel[] {
  const n = verts.length;
  const labels: EdgeLabel[] = [];
  const cent = centroid(verts);

  for (let i = 0; i < n; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % n];

    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1e-6) continue;

    const midWorld: Vertex = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const [midPxX, midPxY] = worldToPixel(midWorld, vt);

    const outX = midWorld[0] - cent[0];
    const outY = midWorld[1] - cent[1];
    const outLen = Math.sqrt(outX * outX + outY * outY);
    const normX = outLen > 1e-9 ? outX / outLen : 0;
    const normY = outLen > 1e-9 ? outY / outLen : 0;

    let angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angleDeg > 90) angleDeg -= 180;
    if (angleDeg < -90) angleDeg += 180;

    labels.push({
      midPx: [midPxX, midPxY],
      length: len,
      angleDeg,
      offsetPx: [normX * offsetM * vt.scale, normY * offsetM * vt.scale],
    });
  }

  return labels;
}

// ---------------------------------------------------------------------------
// Shared canvas utilities
// ---------------------------------------------------------------------------

export function edgeLength(ax: number, ay: number, bx: number, by: number): number {
  return Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
}

/** Ray-casting point-in-polygon test. Vertices must be in absolute world coords. */
export function worldPointInPolygon(wx: number, wy: number, verts: Vertex[]): boolean {
  let inside = false;
  for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
    const [xi, yi] = verts[i];
    const [xj, yj] = verts[j];
    if ((yi > wy) !== (yj > wy) && wx < ((xj - xi) * (wy - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function segmentsIntersect(
  ax1: number, ay1: number, ax2: number, ay2: number,
  bx1: number, by1: number, bx2: number, by2: number,
): boolean {
  const d1x = ax2 - ax1, d1y = ay2 - ay1;
  const d2x = bx2 - bx1, d2y = by2 - by1;
  const cross = d1x * d2y - d1y * d2x;
  if (Math.abs(cross) < 1e-10) return false;
  const t = ((bx1 - ax1) * d2y - (by1 - ay1) * d2x) / cross;
  const u = ((bx1 - ax1) * d1y - (by1 - ay1) * d1x) / cross;
  return t > 0 && t < 1 && u > 0 && u < 1;
}

/** True if two absolute-coordinate polygons overlap (share any area). */
export function polygonsOverlap(polyA: Vertex[], polyB: Vertex[]): boolean {
  const nA = polyA.length, nB = polyB.length;
  for (const [vx, vy] of polyA) if (worldPointInPolygon(vx, vy, polyB)) return true;
  for (const [vx, vy] of polyB) if (worldPointInPolygon(vx, vy, polyA)) return true;
  for (let i = 0; i < nA; i++) {
    const [ax1, ay1] = polyA[i];
    const [ax2, ay2] = polyA[(i + 1) % nA];
    for (let j = 0; j < nB; j++) {
      if (segmentsIntersect(ax1, ay1, ax2, ay2, polyB[j][0], polyB[j][1], polyB[(j + 1) % nB][0], polyB[(j + 1) % nB][1])) return true;
    }
  }
  return false;
}

/** Nearest point on segment AB to point P. */
export function nearestPointOnSegment(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number,
): [number, number] {
  const dx = bx - ax, dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return [ax, ay];
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return [ax + t * dx, ay + t * dy];
}

/** Apply a zoom factor around canvas point (cx, cy), clamped to [min, max]. */
export function applyZoom(
  vt: { x: number; y: number; scale: number },
  factor: number,
  cx: number,
  cy: number,
  min: number,
  max: number,
): { x: number; y: number; scale: number } {
  const newScale = Math.min(max, Math.max(min, vt.scale * factor));
  return {
    scale: newScale,
    x: cx - ((cx - vt.x) / vt.scale) * newScale,
    y: cy - ((cy - vt.y) / vt.scale) * newScale,
  };
}

/** Compute a ViewTransform that fits a polygon into the canvas with padding. */
export function computeFitView(
  verts: Vertex[],
  canvasWidth: number,
  canvasHeight: number,
  padding = 90,
  maxScale = 120,
): { x: number; y: number; scale: number } {
  if (verts.length === 0 || canvasWidth === 0 || canvasHeight === 0) return { x: 80, y: 60, scale: 50 };
  const xs = verts.map(v => v[0]);
  const ys = verts.map(v => v[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const vw = Math.max(maxX - minX, 0.1);
  const vh = Math.max(maxY - minY, 0.1);
  const scale = Math.min((canvasWidth - padding * 2) / vw, (canvasHeight - padding * 2) / vh, maxScale);
  return {
    scale,
    x: (canvasWidth - vw * scale) / 2 - minX * scale,
    y: (canvasHeight - vh * scale) / 2 - minY * scale,
  };
}
