# Garden Planner — Frontend Implementation Plan

## Goal

Extract the planner into a standalone npm-ready workspace package (`@bloomy/planner`), then build the garden planner as its second consumer. The planner can be published and sold separately when ready. The tile planner must keep working identically throughout.

---

## Package architecture

The planner lives at `packages/planner/` in the monorepo root — not inside `bloomy-frontend`. The frontend imports it as a workspace dependency. This draws a clean public API boundary now, with zero extra repo overhead, and makes the path to publishing on npm trivial.

```
bloomy/
  packages/
    planner/                       ← @bloomy/planner
      src/
        canvas/                    ← PlannerCanvas, viewport, pointer events
        zones/                     ← ZoneLayer, per-type renderers
        objects/                   ← ObjectLayer, draggable icons
        sidebar/                   ← PlannerSidebar (config-driven)
        config.ts                  ← PlannerConfig type
        types.ts                   ← Zone, GardenObject, Layer, etc.
        calculations.ts            ← CalculationResult type; calculator registry
        index.ts                   ← public exports
      configs/
        tile-planner.config.ts     ← TilePlannerConfig (wraps existing behaviour)
        garden-planner.config.ts   ← GardenPlannerConfig (Phase 2)
      package.json                 ← name: "@bloomy/planner", peerDeps: react, next
      tsconfig.json
  bloomy-frontend/                 ← imports @bloomy/planner via workspace:*
  bloomy-backend/
  bloomy-ai-planner/
  package.json                     ← root workspaces: ["packages/*", "bloomy-frontend", ...]
```

### What moves out of bloomy-frontend

Existing components that belong in the package:

| Current path (bloomy-frontend)         | New path (packages/planner)         |
|----------------------------------------|-------------------------------------|
| `components/plan/PlannerCanvas.tsx`    | `src/canvas/PlannerCanvas.tsx`      |
| `components/plan/PlannerSidebar.tsx`   | `src/sidebar/PlannerSidebar.tsx`    |
| `components/plan/ShapeEditor.tsx`      | `src/canvas/ShapeEditor.tsx`        |
| `components/plan/PatioPolygon.tsx`     | `src/zones/PatioPolygon.tsx`        |
| `components/plan/TileGrid.tsx`         | `src/zones/TileGrid.tsx`            |
| `components/plan/TileControls.tsx`     | `src/sidebar/TileControls.tsx`      |
| `components/plan/StatsPanel.tsx`       | `src/sidebar/StatsPanel.tsx`        |
| `components/plan/TileTooltip.tsx`      | `src/canvas/TileTooltip.tsx`        |
| `components/plan/TileGridBackground.tsx` | `src/canvas/TileGridBackground.tsx` |
| `components/plan/sidebar/`             | `src/sidebar/sections/`             |

Stays in bloomy-frontend (app-specific):
- `ExportModal.tsx` (knows about user accounts, save-to-account flow)
- `PlannerEntry.tsx` (new-vs-existing plan screen)
- `UploadFloorplanButton.tsx` (file upload, app-specific auth)

### Package public API

```typescript
// packages/planner/src/index.ts

// Root component — the only thing most consumers need
export { PlannerCore } from "./PlannerCore"

// Config types
export type { PlannerConfig, ZoneTypeConfig, ObjectTypeConfig } from "./config"
export type { Zone, GardenObject, MaterialItem } from "./types"

// Pre-built configs (consumers can import and extend)
export { TilePlannerConfig } from "../configs/tile-planner.config"
export { GardenPlannerConfig } from "../configs/garden-planner.config"

// Calculator registry (consumers can register custom zone calculators)
export { registerCalculator, getCalculator } from "./calculations"
```

### Config shape

```typescript
// packages/planner/src/config.ts

export interface PlannerConfig {
  plannerType: string                 // "tile-plan" | "garden-plan" | custom
  zones: ZoneTypeConfig[]
  objects: ObjectTypeConfig[]
  sidebar: SidebarSectionConfig[]
  calculations: CalculationConfig
  export: ExportConfig
}

export interface ZoneTypeConfig {
  type: string                        // "tile-patio" | "flower-bed" | "lawn" | ...
  label: string
  color: string                       // fill on canvas, e.g. "#b7e36f"
  icon: string                        // lucide icon name
  calculator: string                  // key into calculation registry
  defaultProperties: Record<string, unknown>
  propertyControls: PropertyControl[]
}

export interface ObjectTypeConfig {
  type: string
  label: string
  category: string
  icon: string
  footprint: { w: number; h: number } // metres
}
```

### Tile planner config (backwards-compatible)

```typescript
// packages/planner/configs/tile-planner.config.ts
export const TilePlannerConfig: PlannerConfig = {
  plannerType: "tile-plan",
  zones: [{ type: "tile-patio", label: "Tile area", color: "#e5edd9", ... }],
  objects: [],
  sidebar: [ /* existing TileControls sections */ ],
  calculations: { singleZone: true, calculator: "tile" },
  export: { formats: ["pdf", "png", "json"] },
}
```

The tile planner page: `import { PlannerCore, TilePlannerConfig } from "@bloomy/planner"` — identical behaviour.

### Styling approach

The package uses Tailwind CSS classes and the Bloomy design token names (`forest`, `canvas`, `leaf`, etc.). The consuming app provides the Tailwind config — the package does not bundle CSS. This means:
- `bloomy-frontend` works out of the box (already has the tokens)
- Future licensees get a `tailwind.config.ts` snippet to add to their project

### Phase 1 tasks

- [ ] Add root `package.json` with `workspaces: ["packages/*", "bloomy-frontend", "bloomy-backend", "bloomy-ai-planner"]`
- [ ] Create `packages/planner/package.json` (`name: "@bloomy/planner"`, `peerDependencies: react, next`)
- [ ] Create `packages/planner/tsconfig.json` extending from root
- [ ] Move existing planner components to `packages/planner/src/` (table above)
- [ ] Update all import paths in `bloomy-frontend` that referenced moved files
- [ ] Add `@bloomy/planner: "workspace:*"` to `bloomy-frontend/package.json`
- [ ] Define `PlannerConfig` types in `packages/planner/src/config.ts`
- [ ] Create `TilePlannerConfig` wrapping existing behaviour
- [ ] Wrap components in `PlannerCore` accepting the config prop
- [ ] Route `/tile-plan/edit` uses `<PlannerCore config={TilePlannerConfig} />`
- [ ] All tile planner tests pass unchanged
- [ ] No visible difference to the user

---

## Phase 2 — Multi-zone garden canvas

### New routes

```
/garden-plan               -- entry: new vs existing garden plans
/garden-plan/edit          -- multi-zone canvas editor
/cabinet/garden-plans      -- list of saved garden plans
```

### Canvas behaviour changes from tile planner

| Feature               | Tile planner (today)   | Garden planner             |
|-----------------------|------------------------|----------------------------|
| Zones on canvas       | 1                      | Unlimited                  |
| Zone types            | tile-patio only        | 8+ types (see main README) |
| Objects               | none                   | Draggable icons            |
| Zone selection        | implicit (whole plan)  | Click to select zone       |
| Zone label            | plan name              | Per-zone label             |
| Zone colour           | single neutral         | Per type (legend)          |
| Sidebar               | tile controls          | Zone-type controls (dynamic) |

### Zone interaction model

- **Draw mode**: user picks zone type from sidebar, then draws a polygon (same tool as today)
- **Select mode**: click a zone to select it; sidebar shows that zone's property controls
- **Object mode**: user picks an object from the object library, clicks to place on canvas
- Zones can overlap (e.g. pergola outline over a patio); z-order controlled by user
- Each zone has a name editable inline on the canvas label

### Garden plan JSON format extension

```jsonc
{
  "version": 2,
  "plannerType": "garden-plan",
  "exportedAt": "...",
  "name": "Back garden redesign",
  "gardenBoundary": {             // optional outer boundary polygon
    "vertices": [[0,0],[12,0],[12,8],[0,8]],
    "offset": [0, 0]
  },
  "zones": [
    {
      "id": "zone-1",
      "type": "tile-patio",
      "label": "Main patio",
      "shape": { "vertices": [...], "offset": [...] },
      "properties": {
        "tileSize": { "kind": "600x600" },
        "groutMm": 3,
        "pattern": "straight"
      }
    },
    {
      "id": "zone-2",
      "type": "lawn",
      "label": "Back lawn",
      "shape": { "vertices": [...], "offset": [...] },
      "properties": {
        "coverage": "turf",
        "grade": "premium"
      }
    }
  ],
  "objects": [
    {
      "id": "obj-1",
      "type": "tree-standard",
      "label": "Apple tree",
      "position": [4.5, 3.2],
      "rotation": 0
    }
  ],
  "view": { "scale": 80, "x": 0, "y": 0 }
}
```

### Tasks

- [ ] Define `GardenPlannerConfig` with all 8 zone types (see main README)
- [ ] Extend plan schema (Zod) to version 2 with `zones[]` and `objects[]`
- [ ] `ZoneLayer` — renders coloured polygons per zone type
- [ ] `ObjectLayer` — renders SVG icons at placed positions, drag to reposition
- [ ] Zone type picker panel in sidebar
- [ ] Object library panel (category tabs, search)
- [ ] Click-to-select zone → sidebar switches to that zone's property controls
- [ ] Zone legend overlay on canvas (colour key)
- [ ] Route `/garden-plan/edit` and `/cabinet/garden-plans`
- [ ] Garden plan list page (mirrors tile plan list, different card colour)

---

## Phase 3 — Material list panel

### UI

A collapsible panel below the sidebar (or as a separate tab on the right):

```
Material List
─────────────────────────────────────
Groundworks & bases
  Concrete (C25)             2.4 m³
  Hardcore MOT Type 1        4.8 t

Hard landscaping
  Porcelain tile 600×600     148 tiles  (+10% waste → 163)
  Tile adhesive              4 bags (20 kg)
  Grout (mid grey)           2 bags (5 kg)
  Decking boards (140mm)     86 lin m

Soft landscaping
  Turf                       28 m²
  Topsoil                    1.2 m³
  Bark mulch                 0.8 m³

Total zones: 4   Last calculated: just now
─────────────────────────────────────
[ Export list as PDF ]   [ Copy to clipboard ]
```

### Calculation flow

1. On plan save or on "Calculate" button press, frontend sends the full plan JSON to `POST /api/garden-plans/:id/materials`
2. Backend calculates per zone, returns aggregated `MaterialList` object
3. Frontend caches result; shows stale indicator if plan changes after last calculation

### Tasks

- [ ] `MaterialPanel` component (collapsible, tab in sidebar on desktop)
- [ ] API client call `calculateMaterials(planId)` → `MaterialList`
- [ ] Stale indicator when plan is modified after last calculation
- [ ] Group results by trade category
- [ ] Waste factor shown explicitly per item
- [ ] "Export list as PDF" (extend existing PDF export service)
- [ ] "Copy to clipboard" (plain text, structured for pasting into spreadsheet)

---

## Phase 4 — Build guide

### UI

A full-page view accessible from the plan editor ("View Build Guide"):

```
/garden-plan/:id/guide
```

Displays numbered steps, each with:
- Step title and description
- Materials needed at this step (subset of material list)
- Time estimate (from AI)
- Dependencies ("complete before starting this step")
- Tips / warnings for DIY users

### Tasks

- [ ] Route `/garden-plan/:id/guide`
- [ ] `BuildGuide` component — vertical stepper layout
- [ ] Step card: title, description, materials, tips, time
- [ ] "Regenerate guide" button → calls AI service
- [ ] Print/PDF export of full guide with embedded plan image
- [ ] Step completion checkboxes (saved per user, not to plan)

---

## Phase 5 — Projects integration

### What changes

- A `Project` in the cabinet can contain one garden plan
- Project page shows: plan thumbnail, material list summary, build guide progress
- Client share link includes plan view + material list (read-only)

### Tasks

- [ ] Link garden plan to Project entity
- [ ] Project dashboard widget: plan progress (% zones drawn, guide steps done)
- [ ] Share link: `/share/:token` renders read-only plan + list
- [ ] Client feedback: comment thread on shared view

---

## File structure after Phase 2

```
packages/planner/                      ← @bloomy/planner (separate package)
  src/
    canvas/
      PlannerCanvas.tsx
      ShapeEditor.tsx
      TileGridBackground.tsx
      TileTooltip.tsx
    zones/
      ZoneLayer.tsx                    ← new: generalised PatioPolygon
      PatioPolygon.tsx
      TileGrid.tsx
    objects/
      ObjectLayer.tsx                  ← new
    sidebar/
      PlannerSidebar.tsx
      TileControls.tsx
      StatsPanel.tsx
      sections/
        ...
    PlannerCore.tsx                    ← new root component
    config.ts
    types.ts
    calculations.ts
    index.ts
  configs/
    tile-planner.config.ts
    garden-planner.config.ts
  package.json                         ← name: "@bloomy/planner"

bloomy-frontend/
  components/
    plan/
      ExportModal.tsx                  ← stays here (app-specific)
      PlannerEntry.tsx                 ← stays here
      UploadFloorplanButton.tsx        ← stays here
      MaterialPanel.tsx                ← new (Phase 3)

  app/
    tile-plan/
      edit/                            ← unchanged, passes TilePlannerConfig
    garden-plan/
      page.tsx                         ← new: entry (new vs existing)
      edit/
        page.tsx                       ← new: canvas editor
      [id]/
        guide/
          page.tsx                     ← new: build guide (Phase 4)
    cabinet/
      garden-plans/
        page.tsx                       ← new: list (Phase 2)
```
