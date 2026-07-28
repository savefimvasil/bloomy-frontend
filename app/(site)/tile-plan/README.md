# /plan routes

## `/plan` — Plan selection page

Auth-aware entry point for the tile planner.

- **Not logged in**: shows a single "Garden / Outdoor" card. Indoor is hidden until it ships publicly.
- **Logged in**: shows "Edit existing plan" / "Create new plan" choice.
  - "Edit existing" fetches `GET /api/tile-plans` and shows a list inline.
  - "Create new" calls `POST /api/tile-plans` then navigates to `/plan/edit?id=<id>&type=garden`.

## `/plan/edit` — Planner editor

Loaded via `PlannerEntry` (handles Suspense + error boundary) which dynamically imports
`PlannerCanvas` (SSR disabled — uses browser APIs).

Query params:
- `?type=garden|indoor` — plan type (used when no saved plan is loaded)
- `?id=<tilePlanId>` — if set, fetches the saved plan from `GET /api/tile-plans/:id`
  and loads it via `LOAD_PLAN` dispatch. Auto-save runs on every state change (2s debounce).

### Auto-fit (sidebar `OptimizationButtons`)

The right sidebar offers four one-click optimisations. Each runs a brute-force
search (`lib/plan/optimal-patterns.ts`) over offsets within one tile period and
dispatches `SET_PATIO_OFFSET` with the winner:

| Criterion          | Optimises for                                              |
|--------------------|------------------------------------------------------------|
| Min tiles          | Lowest `totalTiles = fullTiles + physicalCutTiles`         |
| Min cuts           | Fewest cut pieces                                          |
| No slivers         | Fewest cut pieces with any edge `< 30 mm` (the canvas warning threshold). Use this when the "cut pieces under 30 mm" toast keeps firing — it nudges the pattern so the awkward thin strips line up against existing grout joints instead. |
| Biggest avg piece  | Highest mean `cutArea / tileArea` — least visible waste    |

The search reuses `computeTiles` + `computeStats`, so any pattern (straight,
brick, diagonal, herringbone) is supported automatically. Default grid is 10×10
candidates — the period is computed per pattern (brick doubles the Y period,
herringbone uses W+H column period).

### Tests

`npm test` runs the Jest suite in `lib/plan/__tests__/`. The
`optimal-patterns.test.ts` file covers:
- Each criterion returns a result at least as good as the baseline (current
  offset) on a deliberately ill-fitting rectangle.
- Each criterion's specific metric (`totalTiles`, `cutPieces`, `slivers`,
  `avgCoverage`) improves or stays equal vs. baseline.
- The search works across straight, brick, diagonal and herringbone patterns.
- `isBetter` ordering and tiebreak rules for every criterion.

## `/plan/import` — JSON import

Accepts a `.json` file exported from the planner. Writes it to `localStorage` under
`bloomy_plan_import`, then redirects to `/plan/edit`. The editor reads and clears this
key on mount.

## `/plan/promo` — Marketing page

Static landing page showcasing the tile planner. No auth needed.
