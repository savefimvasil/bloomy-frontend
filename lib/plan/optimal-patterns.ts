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
  | "minTiles"       // fewest total physical tiles needed
  | "minCuts"        // fewest cut pieces
  | "minWhiteArea"   // smallest uncovered ("white-zone") area left by sliver drops
  | "maxAvgArea";    // largest average tile coverage

export const OPTIMIZATION_LABELS: Record<OptimizationCriterion, string> = {
  minTiles: "Min tiles",
  minCuts: "Min cuts",
  minWhiteArea: "Fewest gaps",
  maxAvgArea: "Biggest avg piece",
};

export const OPTIMIZATION_DESCRIPTIONS: Record<OptimizationCriterion, string> = {
  minTiles: "Fewest total tiles to buy",
  minCuts: "Fewest cut pieces — fastest install",
  minWhiteArea: "Minimise the white zones left behind by sliver drops under 30 mm",
  maxAvgArea: "Biggest average tile area — least waste",
};

export const OPTIMIZATION_CRITERIA: OptimizationCriterion[] = [
  "minTiles",
  "minCuts",
  "minWhiteArea",
  "maxAvgArea",
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
// One candidate evaluation
// ---------------------------------------------------------------------------

export type Candidate = {
  offset: Vertex;
  totalTiles: number;
  cutPieces: number;
  uncoveredArea: number;   // m² — slivers dropped because they fail the 30 mm edge rule
  avgCoverage: number;     // mean cutArea / tileArea across all tiles (0..1)
};

function evaluate(state: PlannerState, dx: number, dy: number): Candidate | null {
  const { width: tileW, height: tileH } = resolveTileSize(state.tileSize, TILE_PRESETS);
  const grout = state.groutMm / 1000;
  const offset: Vertex = [state.patioOffset[0] + dx, state.patioOffset[1] + dy];

  const { tiles, tooMany } = computeTiles(
    state.vertices, offset, tileW, tileH, state.rotation,
    state.chessMode, grout, state.brickOffset, state.herringbone,
  );
  if (tooMany || tiles.length === 0) return null;

  const stats = computeStats(tiles, state.vertices, offset, state.chessMode);
  const tileArea = tileW * tileH;

  return {
    offset,
    totalTiles: stats.totalTiles,
    cutPieces: stats.cutPieces,
    uncoveredArea: stats.uncoveredArea,
    avgCoverage: tiles.reduce((s, t) => s + t.cutArea, 0) / tiles.length / tileArea,
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
    case "minWhiteArea":
      if (Math.abs(a.uncoveredArea - b.uncoveredArea) > 1e-9) return a.uncoveredArea < b.uncoveredArea;
      if (a.cutPieces !== b.cutPieces) return a.cutPieces < b.cutPieces;
      return a.totalTiles < b.totalTiles;
    case "maxAvgArea":
      if (Math.abs(a.avgCoverage - b.avgCoverage) > 1e-6) return a.avgCoverage > b.avgCoverage;
      return a.cutPieces < b.cutPieces;
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
 * Returns the new patio offset to dispatch, plus the winning candidate and the
 * baseline (current-offset) candidate so callers can show before/after numbers.
 */
export function findOptimalOffset(
  state: PlannerState,
  criterion: OptimizationCriterion,
  steps: number = SEARCH_STEPS,
): OptimizationResult {
  const { periodX, periodY } = getSearchPeriod(state);

  const baseline = evaluate(state, 0, 0);
  let best: Candidate | null = baseline;

  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < steps; j++) {
      if (i === 0 && j === 0) continue; // already evaluated
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
    return {
      offset: state.patioOffset,
      best: baseline ?? {
        offset: state.patioOffset, totalTiles: 0, cutPieces: 0, uncoveredArea: 0, avgCoverage: 0,
      },
      baseline,
    };
  }
  return { offset: best.offset, best, baseline };
}
