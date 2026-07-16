# Garden Planner — Frontend Implementation Plan

## Phase 1 — Planner package ✅ DONE

### What was built

The planner is now a workspace package (`@bloomy/bloomy-planner`) living at `packages/planner/` inside this repo. The frontend imports it as a local workspace dependency.

**Package location:** `bloomy-frontend/packages/planner/`
**Import name:** `@bloomy/bloomy-planner`
**Resolution:** npm workspace symlink → `node_modules/@bloomy/bloomy-planner`

### What moved into the package

| Was in `components/plan/`      | Now in `packages/planner/src/`       |
|--------------------------------|--------------------------------------|
| `PlannerCanvas.tsx`            | `PlannerCore.tsx` (refactored)       |
| `PlannerSidebar.tsx`           | `sidebar/PlannerSidebar.tsx`         |
| `ShapeEditor.tsx`              | `canvas/ShapeEditor.tsx`             |
| `PatioPolygon.tsx`             | `zones/PatioPolygon.tsx`             |
| `TileGrid.tsx`                 | `zones/TileGrid.tsx`                 |
| `TileGridBackground.tsx`       | `canvas/TileGridBackground.tsx`      |
| `TileTooltip.tsx`              | `canvas/TileTooltip.tsx`             |
| `StatsPanel.tsx`               | `sidebar/StatsPanel.tsx`             |
| `sidebar/IndoorSidebarContent` | merged into `sidebar/sections/SidebarContent.tsx` |
| `sidebar/OutdoorSidebarContent`| merged into `sidebar/sections/SidebarContent.tsx` |
| `sidebar/MaterialSelector`     | `sidebar/sections/MaterialSelector.tsx` |
| `sidebar/SizeSelector`         | `sidebar/sections/SizeSelector.tsx`  |
| `sidebar/PatternSelector`      | `sidebar/sections/PatternSelector.tsx` |
| `sidebar/GroutControl`         | `sidebar/sections/GroutControl.tsx`  |
| `sidebar/OptimizationButtons`  | `sidebar/sections/OptimizationButtons.tsx` |
| `lib/plan/` (all files)        | `packages/planner/src/lib/`         |

### Stays in `bloomy-frontend/components/plan/`

- `ExportModal.tsx` — knows about user accounts, handles pre-auth gate
- `PlannerEntry.tsx` — loads plan from API, passes `onSave` / `onRequestExport` / `uploadSlot`
- `UploadFloorplanButton.tsx` — app-specific auth-aware upload

### Package public API (`packages/planner/src/index.ts`)

```typescript
// Core component
export { PlannerCore } from "./PlannerCore"
export type { PlannerCoreProps, ExportKind } from "./PlannerCore"

// Config
export type { PlannerConfig, MaterialDef, SizeDef, PatternDef } from "./lib/config/types"
export { outdoorConfig } from "./lib/config/outdoorConfig"
export { indoorConfig } from "./lib/config/indoorConfig"

// Types
export type { Vertex, PlanType, PlannerState, PlannerAction, ViewTransform, ... }

// Schema
export { PlanExportSchema } from "./lib/schema"
export type { PlanExport } from "./lib/schema"

// Utilities
export { plannerReducer, createInitialState } from "./lib/plannerReducer"
export { COLORS, TILE_PRESETS, ... } from "./lib/constants"
```

### PlannerCore props

```typescript
interface PlannerCoreProps {
  planType?: PlanType                  // "garden" | "indoor"
  initialPlan?: PlanExport
  config?: PlannerConfig               // defaults to outdoorConfig / indoorConfig
  onSave?: (plan: PlanExport) => Promise<void>
  onRequestExport?: (kind: ExportKind, execute: () => void) => void
  uploadSlot?: (dispatch: Dispatch<PlannerAction>) => ReactNode
}
```

### PlannerConfig shape

```typescript
interface PlannerConfig {
  label?: string           // sidebar heading
  description?: string     // sidebar sub-heading
  materials: MaterialDef[] // available materials, each with sizes and patterns
}
```

Preset configs: `outdoorConfig` (tile only), `indoorConfig` (tile + laminate).

---

## Phase 2 — Multi-zone garden canvas (next)

### Concept

A garden plan is a **Project** — a richer entity than a tile plan. It lives under `/projects` in the nav.

### Routes

```
/projects                     ← list of projects (cabinet)
/projects/new                 ← create project wizard
/projects/[id]                ← project dashboard (thumbnail, progress, quick links)
/projects/[id]/plan           ← canvas editor (multi-zone)
/projects/[id]/materials      ← material list (Phase 3)
/projects/[id]/guide          ← build guide (Phase 4)
/projects/[id]/share          ← public read-only (Phase 5)
```

The tile planner stays at `/tile-plan` — it is a standalone lightweight tool, not a project.

### Canvas changes from tile planner

| Feature               | Tile planner (today)   | Garden project            |
|-----------------------|------------------------|---------------------------|
| Zones on canvas       | 1                      | Unlimited                 |
| Zone types            | tile-patio only        | 8+ types                  |
| Objects               | none                   | Draggable icons           |
| Zone selection        | implicit               | Click to select zone      |
| Zone label            | plan name              | Per-zone label            |
| Zone colour           | single neutral         | Per-type (legend)         |
| Sidebar               | tile controls          | Dynamic per selected zone |

### Extending PlannerConfig for zones

```typescript
interface PlannerConfig {
  label?: string
  description?: string
  materials: MaterialDef[]          // existing (tile planner)
  zones?: ZoneTypeConfig[]          // new: multi-zone support
  objects?: ObjectTypeConfig[]      // new: placeable objects
}

interface ZoneTypeConfig {
  type: string                      // "tile-patio" | "lawn" | "deck" | ...
  label: string
  color: string                     // fill on canvas
  icon: string
  calculator: string                // key into calculation registry
  propertyControls: PropertyControl[]
}
```

### Garden plan JSON (version 2)

```jsonc
{
  "version": 2,
  "plannerType": "garden-plan",
  "exportedAt": "...",
  "name": "Back garden redesign",
  "gardenBoundary": {
    "vertices": [[0,0],[12,0],[12,8],[0,8]],
    "offset": [0, 0]
  },
  "zones": [
    {
      "id": "zone-1",
      "type": "tile-patio",
      "label": "Main patio",
      "shape": { "vertices": [...], "offset": [...] },
      "properties": { "tileSize": { "kind": "600x600" }, "groutMm": 3, "pattern": "straight" }
    },
    {
      "id": "zone-2",
      "type": "lawn",
      "label": "Back lawn",
      "shape": { "vertices": [...], "offset": [...] },
      "properties": { "coverage": "turf", "grade": "premium" }
    }
  ],
  "objects": [
    { "id": "obj-1", "type": "tree-standard", "label": "Apple tree", "position": [4.5, 3.2], "rotation": 0 }
  ],
  "view": { "scale": 80, "x": 0, "y": 0 }
}
```

### Tasks

- [ ] `ZoneTypeConfig` and `ObjectTypeConfig` added to `PlannerConfig`
- [ ] `GardenPlannerConfig` preset with all 8 zone types
- [ ] Extend Zod schema to version 2 (`zones[]`, `objects[]`, `gardenBoundary`)
- [ ] `ZoneLayer` — replaces `PatioPolygon` for multi-zone rendering
- [ ] `ObjectLayer` — SVG icons, draggable, click to select
- [ ] Zone type picker panel in sidebar
- [ ] Click-to-select zone → sidebar shows that zone's property controls
- [ ] Zone legend overlay (colour key)
- [ ] Routes: `/projects`, `/projects/new`, `/projects/[id]`, `/projects/[id]/plan`
- [ ] Project dashboard page (thumbnail, progress widgets)

---

## Phase 3 — Material list

- [ ] `MaterialPanel` component — collapsible, grouped by trade category
- [ ] API call `POST /api/projects/:id/materials` → `MaterialList`
- [ ] Stale indicator when plan is modified after last calculation
- [ ] Waste factor displayed per item
- [ ] Export list as PDF / copy as plain text
- [ ] Route `/projects/[id]/materials`

---

## Phase 4 — Build guide

- [ ] Route `/projects/[id]/guide`
- [ ] `BuildGuide` component — vertical stepper
- [ ] Step card: title, description, materials subset, time estimate, tips
- [ ] "Regenerate" button → calls AI service
- [ ] Step completion checkboxes (saved per user)
- [ ] Print/PDF export of full guide with embedded plan image

---

## Phase 5 — Client sharing

- [ ] Route `/projects/[id]/share` — public read-only plan + material list
- [ ] Comment thread for client feedback
- [ ] Project dashboard progress widget (% zones drawn, guide steps complete)

---

## File structure after Phase 2

```
bloomy-frontend/
  packages/
    planner/                        ← @bloomy/bloomy-planner (workspace package)
      src/
        canvas/
        zones/
          ZoneLayer.tsx             ← new: multi-zone renderer
          PatioPolygon.tsx
          TileGrid.tsx
        objects/
          ObjectLayer.tsx           ← new
        sidebar/
          PlannerSidebar.tsx
          StatsPanel.tsx
          sections/
            SidebarContent.tsx
            MaterialSelector.tsx
            SizeSelector.tsx
            PatternSelector.tsx
            GroutControl.tsx
            OptimizationButtons.tsx
        lib/
          config/
            types.ts               ← PlannerConfig (+ ZoneTypeConfig Phase 2)
            outdoorConfig.ts
            indoorConfig.ts
            gardenConfig.ts        ← new (Phase 2)
        PlannerCore.tsx
        index.ts

  components/
    plan/
      ExportModal.tsx
      PlannerEntry.tsx
      UploadFloorplanButton.tsx
      MaterialPanel.tsx             ← new (Phase 3)

  app/
    tile-plan/
      edit/                         ← unchanged
      import/
    projects/
      page.tsx                      ← new: project list (Phase 2)
      new/
        page.tsx                    ← new: create project (Phase 2)
      [id]/
        page.tsx                    ← new: project dashboard (Phase 2)
        plan/
          page.tsx                  ← new: canvas editor (Phase 2)
        materials/
          page.tsx                  ← new (Phase 3)
        guide/
          page.tsx                  ← new (Phase 4)
        share/
          page.tsx                  ← new (Phase 5)
```
