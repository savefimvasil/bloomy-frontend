export type Vertex = [number, number]; // [x, y] in metres, world space

export type TileSize =
  | { kind: "600x600" }
  | { kind: "900x600" }
  | { kind: "custom"; width: number; height: number }; // metres

export type TileRotation = 0 | 45;

export type TileResult = {
  id: string;
  points: Vertex[];      // clipped polygon vertices in world-metres
  isCut: boolean;
  cutArea: number;       // m² of the clipped piece
  physicalTileIdx: number; // which physical tile this piece came from (−1 = full tile)
  gridCol: number;       // column index in tile grid (used for chess pattern)
  gridRow: number;       // row index in tile grid
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
};

export type PlannerAction =
  | { type: "SET_VERTEX"; index: number; axis: "x" | "y"; value: number }
  | { type: "SET_TILE_SIZE"; size: TileSize }
  | { type: "SET_ROTATION"; rotation: TileRotation }
  | { type: "SET_PATIO_OFFSET"; offset: Vertex }
  | { type: "SET_VIEW_TRANSFORM"; transform: ViewTransform }
  | { type: "SET_CHESS_MODE"; chessMode: boolean };
