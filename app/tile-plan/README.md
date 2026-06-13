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

## `/plan/import` — JSON import

Accepts a `.json` file exported from the planner. Writes it to `localStorage` under
`bloomy_plan_import`, then redirects to `/plan/edit`. The editor reads and clears this
key on mount.

## `/plan/promo` — Marketing page

Static landing page showcasing the tile planner. No auth needed.
