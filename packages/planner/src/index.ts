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
