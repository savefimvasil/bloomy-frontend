import type { ZoneType, ObjectType } from "./types";

export interface ZoneConfig {
  label: string;
  fill: string;
  stroke: string;
  description: string;
}

export const ZONE_CONFIGS: Record<ZoneType, ZoneConfig> = {
  "tile-patio": {
    label: "Tile Patio",
    fill: "rgba(232, 227, 219, 0.75)",
    stroke: "#9c9587",
    description: "Hard standing with tiles",
  },
  "lawn": {
    label: "Lawn",
    fill: "rgba(193, 224, 157, 0.75)",
    stroke: "#4aaa2d",
    description: "Grass lawn area",
  },
  "flower-bed": {
    label: "Flower Bed",
    fill: "rgba(240, 196, 219, 0.75)",
    stroke: "#c06090",
    description: "Planting area for flowers and perennials",
  },
  "deck": {
    label: "Deck",
    fill: "rgba(212, 180, 131, 0.75)",
    stroke: "#8b6914",
    description: "Timber or composite decking",
  },
  "gravel-path": {
    label: "Gravel Path",
    fill: "rgba(216, 211, 204, 0.75)",
    stroke: "#8c8880",
    description: "Gravel or stone path",
  },
  "raised-bed": {
    label: "Raised Bed",
    fill: "rgba(196, 164, 108, 0.75)",
    stroke: "#7a5c20",
    description: "Raised planters with timber borders",
  },
  "concrete-slab": {
    label: "Concrete Slab",
    fill: "rgba(200, 200, 200, 0.75)",
    stroke: "#808080",
    description: "Poured concrete surface",
  },
  "pergola-base": {
    label: "Pergola Base",
    fill: "rgba(219, 196, 160, 0.75)",
    stroke: "#9b7420",
    description: "Footprint for pergola structure",
  },
};

export interface ObjectConfig {
  label: string;
  category: string;
  defaultSize?: [number, number]; // [width, depth] in metres — presence means size is configurable
}

export const OBJECT_CONFIGS: Record<ObjectType, ObjectConfig> = {
  "tree":          { label: "Tree",          category: "Plants"                              },
  "shrub":         { label: "Shrub",         category: "Plants"                              },
  "bench":         { label: "Bench",         category: "Furniture",  defaultSize: [1.5, 0.5] },
  "pergola":       { label: "Pergola",       category: "Structures", defaultSize: [3.0, 3.0] },
  "shed":          { label: "Shed",          category: "Structures", defaultSize: [2.0, 3.0] },
  "pond":          { label: "Pond",          category: "Water",      defaultSize: [2.0, 1.5] },
  "compost":       { label: "Compost Bin",   category: "Utility"                             },
  "bbq":           { label: "BBQ",           category: "Furniture"                           },
  "water-feature": { label: "Water Feature", category: "Water"                               },
};

export const ZONE_TYPES = Object.entries(ZONE_CONFIGS).map(([id, cfg]) => ({
  id: id as ZoneType,
  ...cfg,
}));

export const OBJECT_TYPES = Object.entries(OBJECT_CONFIGS).map(([id, cfg]) => ({
  id: id as ObjectType,
  ...cfg,
}));
