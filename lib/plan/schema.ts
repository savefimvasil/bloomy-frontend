import { z } from "zod";

// ---------------------------------------------------------------------------
// Primitive schemas
// ---------------------------------------------------------------------------

export const VertexSchema = z.tuple([z.number(), z.number()]);

export const TileSizeSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("600x600") }),
  z.object({ kind: z.literal("900x600") }),
  z.object({
    kind: z.literal("custom"),
    width: z.number().positive(),
    height: z.number().positive(),
  }),
]);

// ---------------------------------------------------------------------------
// Top-level plan export schema  (version 1)
// ---------------------------------------------------------------------------

export const PlanExportSchema = z.object({
  /** Bump when the format changes in a breaking way. */
  version: z.literal(1),

  /** "garden" = outdoor patio/terrace, "indoor" = bathroom/kitchen/room. */
  planType: z.enum(["garden", "indoor"]),

  /** ISO-8601 timestamp of when the file was exported. */
  exportedAt: z.string(),

  /** Optional human-readable name for the plans menu. */
  name: z.string().optional(),

  /** The patio / room polygon. */
  shape: z.object({
    /** Polygon vertices in metres, counter-clockwise.
     *  At least 3 points required. */
    vertices: z.array(VertexSchema).min(3),
    /** Translation of the polygon on the infinite canvas, in metres. */
    offset: VertexSchema,
  }),

  /** Tile & layout settings. */
  tiles: z.object({
    size: TileSizeSchema,
    /** 0 = straight grid, 45 = 45° diagonal (square tiles only). */
    rotation: z.union([z.literal(0), z.literal(45)]),
    chessMode: z.boolean(),
    /** Grout gap in millimetres (0–6). */
    groutMm: z.number().min(0).max(6),
    /** Running-bond (brick) offset — alternating rows shift by half a tile width. */
    brickOffset: z.boolean(),
  }),

  /** Saved viewport — lets the app restore the same zoom/pan on import. Optional. */
  view: z
    .object({
      scale: z.number().positive(),
      x: z.number(),
      y: z.number(),
    })
    .optional(),
});

export type PlanExport = z.infer<typeof PlanExportSchema>;
