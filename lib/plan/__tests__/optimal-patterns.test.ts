import { createInitialState } from "../plannerReducer";
import {
  findOptimalOffset,
  OPTIMIZATION_CRITERIA,
  isBetter,
  type OptimizationCriterion,
  type Candidate,
} from "../optimal-patterns";
import type { PlannerState, Vertex } from "../types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function candidate(over: Partial<Candidate> = {}): Candidate {
  return {
    offset: [0, 0],
    totalTiles: 0,
    cutPieces: 0,
    uncoveredArea: 0,
    avgCoverage: 0,
    ...over,
  };
}

// A rectangle that does not divide evenly by 600 mm so we get cuts on every
// offset — gives the optimiser something to chew on.
const SKEW_RECT: Vertex[] = [
  [0, 0],
  [3.45, 0],
  [3.45, 2.13],
  [0, 2.13],
];

function withSkewRect(over: Partial<PlannerState> = {}): PlannerState {
  return { ...createInitialState("garden"), vertices: SKEW_RECT, ...over };
}

// ---------------------------------------------------------------------------
// findOptimalOffset — per criterion
// ---------------------------------------------------------------------------

describe("findOptimalOffset", () => {
  test.each(OPTIMIZATION_CRITERIA)(
    "%s returns a best candidate at least as good as baseline",
    (criterion: OptimizationCriterion) => {
      const state = withSkewRect();
      const { best, baseline } = findOptimalOffset(state, criterion);

      expect(best).toBeTruthy();
      expect(baseline).toBeTruthy();
      // best must not be strictly worse than baseline
      expect(isBetter(baseline!, best, criterion)).toBe(false);
    },
  );

  test("minTiles result has totalTiles <= baseline totalTiles", () => {
    const state = withSkewRect();
    const { best, baseline } = findOptimalOffset(state, "minTiles");
    expect(best.totalTiles).toBeLessThanOrEqual(baseline!.totalTiles);
  });

  test("minCuts result has cutPieces <= baseline cutPieces", () => {
    const state = withSkewRect();
    const { best, baseline } = findOptimalOffset(state, "minCuts");
    expect(best.cutPieces).toBeLessThanOrEqual(baseline!.cutPieces);
  });

  test("minWhiteArea result has uncoveredArea <= baseline uncoveredArea", () => {
    const state = withSkewRect({ groutMm: 0 });
    const { best, baseline } = findOptimalOffset(state, "minWhiteArea");
    expect(best.uncoveredArea).toBeLessThanOrEqual(baseline!.uncoveredArea + 1e-9);
  });

  test("maxAvgArea result has avgCoverage >= baseline avgCoverage", () => {
    const state = withSkewRect();
    const { best, baseline } = findOptimalOffset(state, "maxAvgArea");
    expect(best.avgCoverage).toBeGreaterThanOrEqual(baseline!.avgCoverage - 1e-9);
  });

  test("works with brick offset pattern", () => {
    const state = withSkewRect({ brickOffset: true });
    const { best } = findOptimalOffset(state, "minTiles");
    expect(best.totalTiles).toBeGreaterThan(0);
  });

  test("works with diagonal pattern (square tile)", () => {
    const state = withSkewRect({ rotation: 45 });
    const { best } = findOptimalOffset(state, "minCuts");
    expect(best.totalTiles).toBeGreaterThan(0);
  });

  test("works with herringbone pattern", () => {
    const state = withSkewRect({ herringbone: true });
    const { best } = findOptimalOffset(state, "minWhiteArea");
    expect(best.totalTiles).toBeGreaterThan(0);
  });

  test("respects custom step count", () => {
    const state = withSkewRect();
    const coarse = findOptimalOffset(state, "minTiles", 3);
    const fine = findOptimalOffset(state, "minTiles", 12);
    // finer search should be at least as good
    expect(fine.best.totalTiles).toBeLessThanOrEqual(coarse.best.totalTiles);
  });

  test("uncoveredArea is bounded by polygon area", () => {
    const state = withSkewRect();
    const { best } = findOptimalOffset(state, "minWhiteArea");
    const polygonArea = 3.45 * 2.13;
    expect(best.uncoveredArea).toBeGreaterThanOrEqual(0);
    expect(best.uncoveredArea).toBeLessThan(polygonArea);
  });
});

// ---------------------------------------------------------------------------
// isBetter — pure comparison logic
// ---------------------------------------------------------------------------

describe("isBetter", () => {
  describe("minTiles", () => {
    test("prefers fewer total tiles", () => {
      expect(
        isBetter(candidate({ totalTiles: 10 }), candidate({ totalTiles: 11 }), "minTiles"),
      ).toBe(true);
      expect(
        isBetter(candidate({ totalTiles: 11 }), candidate({ totalTiles: 10 }), "minTiles"),
      ).toBe(false);
    });

    test("tiebreaks on cut pieces", () => {
      expect(
        isBetter(
          candidate({ totalTiles: 10, cutPieces: 4 }),
          candidate({ totalTiles: 10, cutPieces: 5 }),
          "minTiles",
        ),
      ).toBe(true);
    });
  });

  describe("minCuts", () => {
    test("prefers fewer cut pieces", () => {
      expect(
        isBetter(candidate({ cutPieces: 3 }), candidate({ cutPieces: 4 }), "minCuts"),
      ).toBe(true);
    });

    test("tiebreaks on total tiles", () => {
      expect(
        isBetter(
          candidate({ cutPieces: 4, totalTiles: 18 }),
          candidate({ cutPieces: 4, totalTiles: 19 }),
          "minCuts",
        ),
      ).toBe(true);
    });
  });

  describe("minWhiteArea", () => {
    test("prefers smaller uncovered area", () => {
      expect(
        isBetter(candidate({ uncoveredArea: 0.04 }), candidate({ uncoveredArea: 0.12 }), "minWhiteArea"),
      ).toBe(true);
      expect(
        isBetter(candidate({ uncoveredArea: 0.20 }), candidate({ uncoveredArea: 0.05 }), "minWhiteArea"),
      ).toBe(false);
    });

    test("tiebreaks on cuts then tiles", () => {
      expect(
        isBetter(
          candidate({ uncoveredArea: 0.05, cutPieces: 5 }),
          candidate({ uncoveredArea: 0.05, cutPieces: 6 }),
          "minWhiteArea",
        ),
      ).toBe(true);
      expect(
        isBetter(
          candidate({ uncoveredArea: 0.05, cutPieces: 5, totalTiles: 19 }),
          candidate({ uncoveredArea: 0.05, cutPieces: 5, totalTiles: 20 }),
          "minWhiteArea",
        ),
      ).toBe(true);
    });
  });

  describe("maxAvgArea", () => {
    test("prefers higher average coverage", () => {
      expect(
        isBetter(candidate({ avgCoverage: 0.92 }), candidate({ avgCoverage: 0.85 }), "maxAvgArea"),
      ).toBe(true);
      expect(
        isBetter(candidate({ avgCoverage: 0.80 }), candidate({ avgCoverage: 0.81 }), "maxAvgArea"),
      ).toBe(false);
    });

    test("tiebreaks on cuts when coverage is essentially equal", () => {
      expect(
        isBetter(
          candidate({ avgCoverage: 0.9, cutPieces: 4 }),
          candidate({ avgCoverage: 0.9, cutPieces: 5 }),
          "maxAvgArea",
        ),
      ).toBe(true);
    });
  });
});
