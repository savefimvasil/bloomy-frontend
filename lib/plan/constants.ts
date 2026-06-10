import type { Vertex, TileSizePreset } from "./types";

// L-shape rotated 90° CW: wide side (6.29m) horizontal, notch upper-left.
export const INITIAL_POLYGON: Vertex[] = [
  [0.00, 2.70],
  [0.00, 0.37],
  [2.98, 0.37],
  [2.98, 0.00],
  [6.29, 0.00],
  [6.29, 2.70],
];

export const INITIAL_TILE_SIZE = { kind: "600x600" as const };

export const TILE_PRESETS: Record<TileSizePreset, { width: number; height: number }> = {
  // Tiles
  "300x300":  { width: 0.300, height: 0.300 },
  "600x300":  { width: 0.600, height: 0.300 },
  "600x600":  { width: 0.600, height: 0.600 },
  "900x600":  { width: 0.900, height: 0.600 },
  "1200x600": { width: 1.200, height: 0.600 },
  // Laminate planks
  "1285x192": { width: 1.285, height: 0.192 },
  "1380x193": { width: 1.380, height: 0.193 },
  "900x150":  { width: 0.900, height: 0.150 },
  "2050x205": { width: 2.050, height: 0.205 },
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
