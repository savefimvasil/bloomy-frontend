import type { FlooringMaterial, InstallationPattern, TileSizePreset } from "../types";

export interface PlannerConfig {
  /** Sidebar heading shown to the user. */
  label?: string;
  /** Sidebar sub-heading shown to the user. */
  description?: string;
  materials: MaterialDef[];
}

export interface MaterialDef {
  id: FlooringMaterial;
  label: string;
  unitLabel: string; // "tiles" | "boards"
  sizes: SizeDef[];
  defaultSize: { kind: TileSizePreset };
  patterns: PatternDef[];
  defaultPattern: InstallationPattern;
  showChess: boolean;
  showGrout: boolean;
}

export interface SizeDef {
  key: TileSizePreset;
  label: string;
  widthMm: number;
  heightMm: number;
}

export interface PatternDef {
  id: InstallationPattern;
  label: string;
  description: string;
  /** Button is disabled when tile is not square. */
  disabledWhen?: "notSquare";
}
