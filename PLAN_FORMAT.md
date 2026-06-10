# Bloomy Plan JSON Format

Plans exported from the Bloomy tile planner are plain JSON files (`.json`).  
They can be re-imported on the **Import plan** page (`/plan/import`).

---

## Top-level structure

```jsonc
{
  "version": 1,               // integer — bump when the format changes incompatibly
  "planType": "garden",       // "garden" | "indoor"
  "exportedAt": "2026-06-10T14:32:00.000Z",  // ISO-8601 UTC timestamp
  "name": "My patio",        // optional human-readable label
  "shape": { ... },
  "tiles": { ... },
  "view": { ... }             // optional — saved viewport
}
```

| Field        | Type     | Required | Description |
|--------------|----------|----------|-------------|
| `version`    | `1`      | yes      | Format version. Only `1` is accepted. |
| `planType`   | string   | yes      | `"garden"` (outdoor patio/terrace) or `"indoor"` (bathroom/kitchen/room). |
| `exportedAt` | string   | yes      | ISO-8601 timestamp of the export. |
| `name`       | string   | no       | Display name for the plans menu. |
| `shape`      | object   | yes      | Polygon geometry. |
| `tiles`      | object   | yes      | Tile & layout settings. |
| `view`       | object   | no       | Viewport state — zoom and pan position. |

---

## `shape`

The patio or room polygon, expressed in **metres**.

```jsonc
"shape": {
  "vertices": [
    [0, 0],
    [5, 0],
    [5, 4],
    [0, 4]
  ],
  "offset": [1.2, 0.8]
}
```

| Field      | Type               | Description |
|------------|--------------------|-------------|
| `vertices` | `[number, number][]` | Polygon corners in metres (counter-clockwise). Minimum 3 points. |
| `offset`   | `[number, number]`  | Translation of the polygon on the infinite canvas, in metres. |

---

## `tiles`

Controls which tile product is used and how it is laid.

```jsonc
"tiles": {
  "size": { "kind": "600x600" },
  "rotation": 0,
  "chessMode": false,
  "groutMm": 3,
  "brickOffset": false
}
```

### `size` — discriminated union

| `kind`      | Extra fields | Description |
|-------------|--------------|-------------|
| `"600x600"` | —            | 600 × 600 mm square tile |
| `"900x600"` | —            | 900 × 600 mm rectangular tile |
| `"custom"`  | `width`, `height` (positive numbers, in mm) | Any size |

### Other tile fields

| Field        | Type    | Values | Description |
|--------------|---------|--------|-------------|
| `rotation`   | number  | `0` or `45` | `0` = straight grid; `45` = 45° diagonal (square tiles only). |
| `chessMode`  | boolean | —      | Alternating dark / light tile colours. |
| `groutMm`    | number  | `0`–`6` | Grout gap width in millimetres. |
| `brickOffset`| boolean | —      | Running-bond / brick offset — odd rows shift by half a tile width. |

---

## `view` (optional)

Restores the exact zoom and pan position that was active when the plan was exported.

```jsonc
"view": {
  "scale": 120,
  "x": 240,
  "y": 180
}
```

| Field   | Type   | Description |
|---------|--------|-------------|
| `scale` | number (> 0) | Pixels per metre. |
| `x`     | number | Horizontal pan offset in pixels. |
| `y`     | number | Vertical pan offset in pixels. |

---

## Validation

The schema is defined with **Zod** in [`lib/plan/schema.ts`](lib/plan/schema.ts):

```typescript
import { PlanExportSchema } from "@/lib/plan/schema";

const result = PlanExportSchema.safeParse(rawJson);
if (!result.success) {
  console.error(result.error.issues);
} else {
  const plan = result.data; // typed as PlanExport
}
```

The `PlanExport` TypeScript type is inferred directly from the schema:

```typescript
import type { PlanExport } from "@/lib/plan/schema";
```

---

## Minimal valid example

```json
{
  "version": 1,
  "planType": "garden",
  "exportedAt": "2026-06-10T12:00:00.000Z",
  "shape": {
    "vertices": [[0,0],[4,0],[4,3],[0,3]],
    "offset": [0, 0]
  },
  "tiles": {
    "size": { "kind": "600x600" },
    "rotation": 0,
    "chessMode": false,
    "groutMm": 3,
    "brickOffset": false
  }
}
```
