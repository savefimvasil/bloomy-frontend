import type { PlanExport } from "./schema";

export type Vertex = [number, number]; // [x, y] in metres, world space

export type PlanType = "garden" | "indoor";

export type FlooringMaterial = "tile" | "laminate";

export type InstallationPattern = "straight" | "brick" | "diagonal" | "herringbone";

export type TileSizePreset =
  | "300x300"
  | "600x300"
  | "600x600"
  | "900x600"
  | "1200x600"
  | "1285x192"
  | "1380x193"
  | "900x150"
  | "2050x205";

export type TileSize =
  | { kind: TileSizePreset }
  | { kind: "custom"; width: number; height: number };

export type TileRotation = 0 | 45;

export type TileResult = {
  id: string;
  points: Vertex[];      // clipped polygon vertices in world-metres
  isCut: boolean;
  cutArea: number;       // m² of the clipped piece
  physicalTileIdx: number; // which physical tile this piece came from (−1 = uncut)
  pieceIdx: number;       // position within the physical tile's piece list (−1 = uncut)
  gridCol: number;
  gridRow: number;
};

export type Stats = {
  areaSqM: number;
  fullTiles: number;
  cutPieces: number;        // number of cut pieces on the layout
  physicalCutTiles: number; // physical tiles needed for cuts after reuse
  totalTiles: number;       // fullTiles + physicalCutTiles
  savedTiles: number;       // cut pieces that reuse offcuts (cutPieces − physicalCutTiles)
  plus10: number;
  plus15: number;
  // chess-mode breakdown (all zero when chess mode off)
  fullBlack: number;
  fullWhite: number;
  physCutBlack: number;
  physCutWhite: number;
  hasSmallPieces: boolean; // any cut edge < 30 mm
};

export type ViewTransform = {
  x: number;
  y: number;
  scale: number; // pixels per metre
};

export type PlannerState = {
  vertices: Vertex[];
  tileSize: TileSize;
  rotation: TileRotation;
  patioOffset: Vertex;
  viewTransform: ViewTransform;
  tiles: TileResult[];
  stats: Stats;
  tooManyTiles: boolean;
  chessMode: boolean;
  groutMm: number;      // 0–6 mm grout gap between tiles
  brickOffset: boolean; // staggered row offset (running bond)
  herringbone: boolean; // herringbone / parquet zigzag pattern
  planType: PlanType;
  flooringMaterial: FlooringMaterial;
};

export type PlannerAction =
  | { type: "SET_VERTEX"; index: number; axis: "x" | "y"; value: number }
  | { type: "MOVE_VERTEX"; index: number; vertex: Vertex }
  | { type: "INSERT_VERTEX"; afterIndex: number; vertex: Vertex }
  | { type: "REMOVE_VERTEX"; index: number }
  | { type: "SET_TILE_SIZE"; size: TileSize }
  | { type: "SET_ROTATION"; rotation: TileRotation }
  | { type: "SET_PATIO_OFFSET"; offset: Vertex }
  | { type: "SET_VIEW_TRANSFORM"; transform: ViewTransform }
  | { type: "SET_CHESS_MODE"; chessMode: boolean }
  | { type: "SET_GROUT"; groutMm: number }
  | { type: "SET_BRICK_OFFSET"; enabled: boolean }
  | { type: "SET_HERRINGBONE"; enabled: boolean }
  | { type: "SET_INSTALLATION_PATTERN"; pattern: InstallationPattern }
  | { type: "SET_FLOORING_MATERIAL"; material: FlooringMaterial }
  | { type: "SNAP_SHAPE_TO_GRID" }
  | { type: "SET_PLAN_TYPE"; planType: PlanType }
  | { type: "LOAD_PLAN"; plan: PlanExport };
