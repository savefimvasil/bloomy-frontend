import type { PlannerState, Vertex } from "./types";
import { computeTiles, computeStats, resolveTileSize } from "./geometry";
import { TILE_PRESETS } from "./constants";

// ---------------------------------------------------------------------------
// Optimal-position search
//
// The tile pattern is periodic. For a given pattern (straight / brick /
// diagonal / herringbone) with cell sizes (cellW, cellH) and grout g, the
// layout repeats every (periodX, periodY). So to find the offset that gives
// the best layout we brute-force a grid of candidates within one period and
// pick the winner.
// ---------------------------------------------------------------------------

export type OptimizationCriterion =
  | "minTiles"    // fewest total physical tiles needed
  | "minCuts"     // fewest cut pieces
  | "minSlivers"; // fewest tiny cut pieces (< 10 % tile area) — hardest to handle

export const OPTIMIZATION_LABELS: Record<OptimizationCriterion, string> = {
  minTiles: "Min tiles",
  minCuts: "Min cuts",
  minSlivers: "No tiny pieces",
};

export const OPTIMIZATION_DESCRIPTIONS: Record<OptimizationCriterion, string> = {
  minTiles: "Fewest total tiles to buy",
  minCuts: "Fewest cut pieces — fastest install",
  minSlivers: "Avoid tiny sliver cuts under 10 % tile size — easier to handle on site",
};

export const OPTIMIZATION_CRITERIA: OptimizationCriterion[] = [
  "minTiles",
  "minCuts",
  "minSlivers",
];

const SEARCH_STEPS = 10; // 10×10 = 100 candidates by default

// ---------------------------------------------------------------------------
// Search period (one pattern repeat) for each layout mode
// ---------------------------------------------------------------------------

function getSearchPeriod(state: PlannerState): { periodX: number; periodY: number } {
  const { width, height } = resolveTileSize(state.tileSize, TILE_PRESETS);
  const g = state.groutMm / 1000;
  const cellW = width + g;
  const cellH = height + g;

  if (state.herringbone) {
    const W = Math.max(width, height);
    const H = Math.min(width, height);
    return { periodX: (W + g) + (H + g), periodY: W + g };
  }
  if (state.brickOffset) {
    return { periodX: cellW, periodY: 2 * cellH };
  }
  return { periodX: cellW, periodY: cellH };
}

// ---------------------------------------------------------------------------
// One candidate evaluation — takes an absolute offset, not relative to current
// ---------------------------------------------------------------------------

export type Candidate = {
  offset: Vertex;
  totalTiles: number;
  cutPieces: number;
  sliverCount: number;  // cut pieces whose area < 10 % of tile area
};

function evaluate(state: PlannerState, absX: number, absY: number): Candidate | null {
  const { width: tileW, height: tileH } = resolveTileSize(state.tileSize, TILE_PRESETS);
  const grout = state.groutMm / 1000;
  const tileArea = tileW * tileH;
  const offset: Vertex = [absX, absY];

  const { tiles, tooMany } = computeTiles(
    state.vertices, offset, tileW, tileH, state.rotation,
    state.chessMode, grout, state.brickOffset, state.herringbone,
  );
  if (tooMany || tiles.length === 0) return null;

  const stats = computeStats(tiles, state.vertices, offset, state.chessMode);
  const sliverThreshold = tileArea * 0.10;

  return {
    offset,
    totalTiles: stats.totalTiles,
    cutPieces: stats.cutPieces,
    sliverCount: tiles.filter(t => t.isCut && t.cutArea < sliverThreshold).length,
  };
}

// ---------------------------------------------------------------------------
// Candidate comparison per criterion
// ---------------------------------------------------------------------------

export function isBetter(a: Candidate, b: Candidate, criterion: OptimizationCriterion): boolean {
  switch (criterion) {
    case "minTiles":
      if (a.totalTiles !== b.totalTiles) return a.totalTiles < b.totalTiles;
      return a.cutPieces < b.cutPieces;
    case "minCuts":
      if (a.cutPieces !== b.cutPieces) return a.cutPieces < b.cutPieces;
      return a.totalTiles < b.totalTiles;
    case "minSlivers":
      if (a.sliverCount !== b.sliverCount) return a.sliverCount < b.sliverCount;
      return a.totalTiles < b.totalTiles;
  }
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export type OptimizationResult = {
  offset: Vertex;
  best: Candidate;
  baseline: Candidate | null;
};

/**
 * Brute-force search for the patio offset that optimises the given criterion.
 *
 * Always searches one full period from [0, 0] so the result is deterministic
 * regardless of how many times the button is clicked or what the current
 * offset is. Baseline = current offset, for before/after comparison.
 */
export function findOptimalOffset(
  state: PlannerState,
  criterion: OptimizationCriterion,
  steps: number = SEARCH_STEPS,
): OptimizationResult {
  const { periodX, periodY } = getSearchPeriod(state);

  // Baseline: evaluate the current offset as-is so we can show the delta.
  const baseline = evaluate(state, state.patioOffset[0], state.patioOffset[1]);
  let best: Candidate | null = null;

  // Search one full period starting from the natural grid origin.
  // This is deterministic — clicking the same button repeatedly always gives
  // the same result.
  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < steps; j++) {
      const dx = (i / steps) * periodX;
      const dy = (j / steps) * periodY;
      const candidate = evaluate(state, dx, dy);
      if (!candidate) continue;
      if (best === null || isBetter(candidate, best, criterion)) {
        best = candidate;
      }
    }
  }

  if (!best) {
    const fallback = baseline ?? {
      offset: state.patioOffset, totalTiles: 0, cutPieces: 0, avgCoverage: 0, sliverCount: 0,
    };
    return { offset: state.patioOffset, best: fallback, baseline };
  }
  return { offset: best.offset, best, baseline };
}
