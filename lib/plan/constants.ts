import type { Vertex, TileSize } from "./types";

// L-shape rotated 90° CW: wide side (6.29m) horizontal, notch upper-left.
// Transform from portrait: (x,y) → (y, 2.70−x)
export const INITIAL_POLYGON: Vertex[] = [
  [0.00, 2.70],
  [0.00, 0.37],
  [2.98, 0.37],
  [2.98, 0.00],
  [6.29, 0.00],
  [6.29, 2.70],
];

export const INITIAL_TILE_SIZE: TileSize = { kind: "600x600" };

export const TILE_PRESETS: Record<"600x600" | "900x600", { width: number; height: number }> = {
  "600x600": { width: 0.60, height: 0.60 },
  "900x600": { width: 0.90, height: 0.60 },
};

// Hex values matching CSS variables — Konva cannot read CSS custom properties
export const COLORS = {
  leaf:   "#4da162",
  lime:   "#b7e36f",
  forest: "#1f4d2c",
  moss:   "#2f6b3d",
  line:   "rgba(31,40,29,0.10)",
  paper:  "#fbfdf7",
  muted:  "#60715c",
  ink:    "#1f281d",
};

export const INITIAL_SCALE = 110; // pixels per metre at startup
export const MAX_TILE_CANDIDATES = 2000;
