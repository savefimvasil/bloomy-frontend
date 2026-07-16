// Main component
export { PlannerCore } from "./PlannerCore";
export type { PlannerCoreProps, ExportKind } from "./PlannerCore";

// Types
export type {
  Vertex,
  PlanType,
  FlooringMaterial,
  InstallationPattern,
  TileSizePreset,
  TileSize,
  TileRotation,
  TileResult,
  Stats,
  ViewTransform,
  PlannerState,
  PlannerAction,
} from "./lib/types";

// Schema
export { PlanExportSchema } from "./lib/schema";
export type { PlanExport } from "./lib/schema";

// Geometry utilities
export {
  polygonArea,
  resolveTileSize,
  pixelToWorld,
  worldToPixel,
  centroid,
} from "./lib/geometry";

// Constants
export { TILE_PRESETS, COLORS, INITIAL_POLYGON, INITIAL_TILE_SIZE, INITIAL_SCALE } from "./lib/constants";

// Reducer
export { plannerReducer, createInitialState } from "./lib/plannerReducer";

// Export utilities
export { exportPdf } from "./lib/exportPdf";

// Config types
export type { PlannerConfig, MaterialDef, SizeDef, PatternDef } from "./lib/config/types";
export { outdoorConfig } from "./lib/config/outdoorConfig";
export { indoorConfig } from "./lib/config/indoorConfig";

// Labels
export { tileLetter, pieceLabel, edgeLengthsMm } from "./lib/labels";

// ─── Garden planner ──────────────────────────────────────────────────────────

// Core component
export { GardenPlannerCore } from "./garden/GardenPlannerCore";
export type { GardenPlannerCoreProps } from "./garden/GardenPlannerCore";

// Boundary editor (used on the new-project page)
export { BoundaryEditor, boundaryArea } from "./garden/BoundaryEditor";
export type { BoundaryEditorProps } from "./garden/BoundaryEditor";

// Types
export type {
  GardenPlan,
  GardenZone,
  GardenObject,
  GardenBoundary,
  ZoneType,
  ObjectType,
} from "./garden/types";

// Configuration (zone colours, object defaults — override to customise)
export { ZONE_CONFIGS, ZONE_TYPES, OBJECT_CONFIGS, OBJECT_TYPES } from "./garden/zone-configs";
export type { ZoneConfig, ObjectConfig } from "./garden/zone-configs";
