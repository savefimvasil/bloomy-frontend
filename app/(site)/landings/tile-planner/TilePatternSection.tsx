"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { readImageAsDataUrl } from "@/lib/imageUpload";
import { kw, str, fn_, ty, cm, pl, CodeLine, Terminal } from "./code-ui";

const GROUT_COLOR = "#c8bdb0";
const GROUT_PX    = 3;
const TILE_PX     = 58; // tile face width/height in preview SVG
const CELL_PX     = TILE_PX + GROUT_PX;

// Room polygon vertices in preview pixels (L-shape: 5 × 4 tiles)
const OFFSET_X = 18;
const OFFSET_Y = 18;
const W = 5 * CELL_PX;
const H = 4 * CELL_PX;
const NOTCH = 2 * CELL_PX; // top-right notch cut-out
const ROOM_PTS: [number, number][] = [
  [0,        0       ],
  [W,        0       ],
  [W,        NOTCH   ],
  [W - NOTCH, NOTCH   ],
  [W - NOTCH, H       ],
  [0,        H       ],
].map(([x, y]) => [x + OFFSET_X, y + OFFSET_Y]);

const SVG_W = W + OFFSET_X * 2;
const SVG_H = H + OFFSET_Y * 2;
const ROOM_POINTS_STR = ROOM_PTS.map(([x, y]) => `${x},${y}`).join(" ");

function TilePreviewSVG({ imageUrl }: { imageUrl: string }) {
  return (
    <svg
      width={SVG_W}
      height={SVG_H}
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="w-full"
      style={{ maxWidth: SVG_W }}
    >
      <defs>
        {/* grout + tile image pattern */}
        <pattern
          id="lp-tile-pat"
          patternUnits="userSpaceOnUse"
          x={OFFSET_X}
          y={OFFSET_Y}
          width={CELL_PX}
          height={CELL_PX}
        >
          <rect width={CELL_PX} height={CELL_PX} fill={GROUT_COLOR} />
          <image
            href={imageUrl}
            x={0}
            y={0}
            width={TILE_PX}
            height={TILE_PX}
            preserveAspectRatio="xMidYMid slice"
          />
        </pattern>
        {/* room clip */}
        <clipPath id="lp-room-clip">
          <polygon points={ROOM_POINTS_STR} />
        </clipPath>
      </defs>

      {/* tile fill */}
      <polygon
        points={ROOM_POINTS_STR}
        fill="url(#lp-tile-pat)"
        clipPath="url(#lp-room-clip)"
      />
      {/* room outline */}
      <polygon
        points={ROOM_POINTS_STR}
        fill="none"
        stroke="var(--color-forest)"
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlaceholderSVG() {
  return (
    <svg
      width={SVG_W}
      height={SVG_H}
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="w-full opacity-50"
      style={{ maxWidth: SVG_W }}
    >
      <defs>
        <pattern
          id="lp-placeholder-pat"
          patternUnits="userSpaceOnUse"
          x={OFFSET_X}
          y={OFFSET_Y}
          width={CELL_PX}
          height={CELL_PX}
        >
          <rect width={CELL_PX} height={CELL_PX} fill={GROUT_COLOR} />
          <rect width={TILE_PX} height={TILE_PX} fill="var(--color-leaf)" opacity={0.55} />
        </pattern>
        <clipPath id="lp-ph-clip">
          <polygon points={ROOM_POINTS_STR} />
        </clipPath>
      </defs>
      <polygon points={ROOM_POINTS_STR} fill="url(#lp-placeholder-pat)" clipPath="url(#lp-ph-clip)" />
      <polygon points={ROOM_POINTS_STR} fill="none" stroke="var(--color-forest)" strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}

function PatternSnippet() {
  return (
    <div className="space-y-0.5">
      <CodeLine n={1}>{kw("const")} {fn_("file")} {pl("=")} {ty("input")}{pl(".")}{fn_("files")}{pl("[0];")}</CodeLine>
      <CodeLine n={2}>{kw("const")} {fn_("reader")} {pl("= new")} {ty("FileReader")}{pl("();")}</CodeLine>
      <CodeLine n={3}>{fn_("reader")}{pl(".")}{fn_("onload")} {pl("= (")}{fn_("e")}{pl(") => {")}</CodeLine>
      <CodeLine n={4}>{pl("  ")}{fn_("mountTilePlanner")}{pl("(el, {")}</CodeLine>
      <CodeLine n={5}>{pl("    ")}{fn_("planType")}{pl(": ")}{str('"garden"')}{pl(",")}</CodeLine>
      <CodeLine n={6}>{pl("    ")}{fn_("tilePattern")}{pl(": ")}{fn_("e")}{pl(".")}{fn_("target")}{pl(".")}{fn_("result")}{pl(",")}</CodeLine>
      <CodeLine n={7}>{pl("  });")}</CodeLine>
      <CodeLine n={8}>{pl("};")}</CodeLine>
      <CodeLine n={9}>{fn_("reader")}{pl(".")}{fn_("readAsDataURL")}{pl("(")}{fn_("file")}{pl(");")}</CodeLine>
      <CodeLine n={10}>{pl("")}</CodeLine>
      <CodeLine n={11}>{cm("// update live without remount:")}</CodeLine>
      <CodeLine n={12}>{fn_("handle")}{pl(".")}{fn_("update")}{pl("({ ")}{fn_("tilePattern")}{pl(": ")}{fn_("newDataUrl")}{pl(" });")}</CodeLine>
    </div>
  );
}

function TypesSnippet() {
  return (
    <div className="space-y-0.5">
      <CodeLine n={1}>{kw("interface")} {ty("MountOptions")} {pl("{")}</CodeLine>
      <CodeLine n={2}>{pl("  ")}{fn_("planType")}{pl(": ")}{str('"garden" | "indoor"')}{pl(";")}</CodeLine>
      <CodeLine n={3}>{pl("  ")}{fn_("tilePattern")}{pl("?: ")}{ty("string")}{pl(";")}{pl("   ")}{cm("// data URL or <img src>")}</CodeLine>
      <CodeLine n={4}>{pl("  ")}{fn_("theme")}{pl("?: {")}</CodeLine>
      <CodeLine n={5}>{pl("    ")}{fn_("primary")}{pl("?: ")}{ty("string")}{pl(";")}</CodeLine>
      <CodeLine n={6}>{pl("    ")}{fn_("highlight")}{pl("?: ")}{ty("string")}{pl(";")}</CodeLine>
      <CodeLine n={7}>{pl("    ")}{fn_("tileFill")}{pl("?: ")}{ty("string")}{pl(";")}{pl("   ")}{cm("// fallback colour")}</CodeLine>
      <CodeLine n={8}>{pl("    ")}{fn_("tileStroke")}{pl("?: ")}{ty("string")}{pl(";")}{pl("  ")}{cm("// grout line colour")}</CodeLine>
      <CodeLine n={9}>{pl("  };")}</CodeLine>
      <CodeLine n={10}>{pl("  ")}{fn_("persistKey")}{pl("?: ")}{ty("string")}{pl(";")}</CodeLine>
      <CodeLine n={11}>{pl("  ")}{fn_("onSave")}{pl("?: (plan: ")}{ty("PlanExport")}{pl(") => ")}{ty("Promise<void>")}{pl(";")}</CodeLine>
      <CodeLine n={12}>{pl("}")}</CodeLine>
    </div>
  );
}

export function TilePatternSection() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((file: File) => {
    readImageAsDataUrl(file, setImageUrl);
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  }

  return (
    <section className="border-t border-line bg-paper py-20">
      <div className="container">
        <p className="text-eyebrow text-muted">Tile pattern simulation</p>
        <h2 className="mt-2 text-display-sm text-ink">Your tile, your layout</h2>
        <p className="mt-3 max-w-2xl text-lead text-muted">
          Pass a <code className="rounded bg-mist px-1 font-mono text-sm text-ink">tilePattern</code> URL
          and the planner fills every tile — including cut pieces — with your image.
          Upload a photo of your tile below to see it in action.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-start">
          {/* Left: upload + preview */}
          <div className="flex flex-col gap-4">
            {/* Upload zone */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload tile image"
              className="relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-colors"
              style={{
                borderColor: dragging ? "var(--color-leaf)" : "var(--color-line)",
                background: dragging ? "rgba(77,161,98,0.05)" : "transparent",
              }}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center gap-2 px-6 py-5 text-center">
                {imageUrl ? (
                  <div className="flex items-center gap-4">
                    {/* thumbnail */}
                    <Image
                      src={imageUrl}
                      alt="Uploaded tile"
                      width={64}
                      height={64}
                      unoptimized
                      className="h-16 w-16 rounded-lg object-cover shadow-sm"
                    />
                    <div className="text-left">
                      <p className="text-sm font-medium text-ink">Tile image loaded</p>
                      <p className="mt-0.5 text-xs text-muted">Click to replace</p>
                    </div>
                    <button
                      className="ml-auto rounded-md px-3 py-1 text-xs text-muted hover:bg-mist hover:text-ink"
                      onClick={(e) => { e.stopPropagation(); setImageUrl(null); }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mist">
                      <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">Drop your tile image here</p>
                      <p className="mt-0.5 text-xs text-muted">or click to browse · PNG, JPG, WEBP</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* SVG preview */}
            <div className="overflow-hidden rounded-xl border border-line bg-canvas">
              <div className="border-b border-line px-4 py-2">
                <span className="font-mono text-[11px] text-muted">
                  {imageUrl ? "layout preview" : "placeholder — upload to simulate"}
                </span>
              </div>
              <div className="p-4">
                {imageUrl
                  ? <TilePreviewSVG imageUrl={imageUrl} />
                  : <PlaceholderSVG />
                }
              </div>
            </div>

            <p className="text-xs text-muted">
              Preview shows a 5 × 4 tile L-shaped room at 600 × 600 mm. The real planner
              clips cuts pixel-perfectly and supports all pattern modes.
            </p>
          </div>

          {/* Right: code + types */}
          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-3 font-mono text-xs text-muted">Reading a file and mounting with a pattern</p>
              <Terminal title="app.js">
                <PatternSnippet />
              </Terminal>
            </div>
            <div>
              <p className="mb-3 font-mono text-xs text-muted">Full option type</p>
              <Terminal title="types.d.ts">
                <TypesSnippet />
              </Terminal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
