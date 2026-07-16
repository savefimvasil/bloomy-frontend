// Re-exported from shared lib so garden code can import from one place
import type { Vertex, ViewTransform } from "../lib/types";
export type { Vertex, ViewTransform };

export type ZoneType =
  | "tile-patio"
  | "lawn"
  | "flower-bed"
  | "deck"
  | "gravel-path"
  | "raised-bed"
  | "concrete-slab"
  | "pergola-base";

export type ObjectType =
  | "tree"
  | "shrub"
  | "bench"
  | "pergola"
  | "shed"
  | "pond"
  | "compost"
  | "bbq"
  | "water-feature";

export interface GardenZone {
  id: string;
  type: ZoneType;
  label: string;
  vertices: Vertex[];
  offset: Vertex;
}

export interface GardenObject {
  id: string;
  type: ObjectType;
  label: string;
  position: Vertex;
  size?: [number, number]; // [width, depth] in metres
}

export interface GardenBoundary {
  vertices: Vertex[];
  offset: Vertex;
}

export interface GardenPlan {
  version: 2;
  plannerType: "garden-plan";
  exportedAt: string;
  gardenBoundary?: GardenBoundary;
  zones: GardenZone[];
  objects: GardenObject[];
  view: { scale: number; x: number; y: number };
}

