"use client";

import { useState, useMemo, useRef, useEffect, useCallback, type ReactNode } from "react";
import { ToggleButton } from "@/components/ui/toggle-button";
import type { PlannerConfig, TilePlannerResult, TileSize } from "@bloomy/tile-planner";
import { outdoorConfig, indoorConfig, TilePlannerCore } from "@bloomy/tile-planner";
import { CB, BR, CBB, kw, str, fn_, ty, cm, pl, CodeLine, C_STR, C_FN, C_TY, C_NUM, C_DIM } from "./code-ui";
import { readImageAsDataUrl } from "@/lib/imageUpload";

const PLANNER_CSS = "https://cdn.bloomy.garden/tile-planner.css";

type ThemeDef = {
  name: string;
  swatch: string;
  vars: Record<string, string>;
};

const THEMES: ThemeDef[] = [
  {
    name: "Bloomy",
    swatch: "#234a2e",
    vars: {},
  },
  {
    name: "Indigo",
    swatch: "#4338ca",
    vars: {
      "--color-forest": "#312e81",
      "--color-moss":   "#4338ca",
      "--color-leaf":   "#6366f1",
      "--color-lime":   "#a5b4fc",
      "--color-canvas": "#eef2ff",
      "--color-paper":  "#f5f3ff",
      "--color-mist":   "#e0e7ff",
      "--color-line":   "rgba(49,46,129,0.12)",
    },
  },
  {
    name: "Amber",
    swatch: "#d97706",
    vars: {
      "--color-forest": "#78350f",
      "--color-moss":   "#92400e",
      "--color-leaf":   "#d97706",
      "--color-lime":   "#fbbf24",
      "--color-canvas": "#fffbeb",
      "--color-paper":  "#fefce8",
      "--color-mist":   "#fef3c7",
      "--color-line":   "rgba(120,53,15,0.12)",
    },
  },
  {
    name: "Slate",
    swatch: "#475569",
    vars: {
      "--color-forest": "#1e293b",
      "--color-moss":   "#334155",
      "--color-leaf":   "#64748b",
      "--color-lime":   "#94a3b8",
      "--color-canvas": "#f1f5f9",
      "--color-paper":  "#f8fafc",
      "--color-mist":   "#e2e8f0",
      "--color-line":   "rgba(15,23,42,0.12)",
    },
  },
];

type TileSizeDef = { label: string; value: TileSize };

const TILE_SIZES: TileSizeDef[] = [
  { label: "600×600", value: { kind: "600x600" } },
  { label: "600×300", value: { kind: "600x300" } },
  { label: "900×600", value: { kind: "900x600" } },
  { label: "1200×600", value: { kind: "1200x600" } },
];

type ConfigOption = {
  label: string;
  planType: "garden" | "indoor";
  description: string;
};

const CONFIGS: ConfigOption[] = [
  { label: "outdoor", planType: "garden", description: "Garden / patio — preset paving sizes" },
  { label: "indoor",  planType: "indoor", description: "Room shape — tile + laminate materials" },
];

const plain = pl; // alias — snippets use 'plain', terminal uses 'pl'

function MinimalSnippet({ planType }: { planType: string }) {
  return (
    <div className="space-y-0.5">
      <CodeLine n={1}>{kw("import")} {plain("{ ")}{fn_("mountTilePlanner")}{plain(" }")} {kw("from")} {str('"@bloomy/tile-planner"')}{plain(";")}</CodeLine>
      <CodeLine n={2}>{plain("")}</CodeLine>
      <CodeLine n={3}>{fn_("mountTilePlanner")}{plain("(")}</CodeLine>
      <CodeLine n={4}>{plain("  ")}{ty("document")}{plain(".")}{fn_("getElementById")}{plain("(")}{str('"planner"')}{plain("),")}</CodeLine>
      <CodeLine n={5}>{plain("  { ")}{fn_("planType")}{plain(": ")}{str(`"${planType}"`)}{plain(" }")}</CodeLine>
      <CodeLine n={6}>{plain(");")}</CodeLine>
    </div>
  );
}

function PersistSnippet({ planType }: { planType: string }) {
  return (
    <div className="space-y-0.5">
      <CodeLine n={1}>{kw("import")} {plain("{ ")}{fn_("mountTilePlanner")}{plain(" }")} {kw("from")} {str('"@bloomy/tile-planner"')}{plain(";")}</CodeLine>
      <CodeLine n={2}>{plain("")}</CodeLine>
      <CodeLine n={3}>{fn_("mountTilePlanner")}{plain("(")}</CodeLine>
      <CodeLine n={4}>{plain("  ")}{ty("document")}{plain(".")}{fn_("getElementById")}{plain("(")}{str('"planner"')}{plain("),")}</CodeLine>
      <CodeLine n={5}>{plain("  {")}</CodeLine>
      <CodeLine n={6}>{plain("    ")}{fn_("planType")}{plain(":   ")}{str(`"${planType}"`)}{plain(",")}</CodeLine>
      <CodeLine n={7}>{plain("    ")}{fn_("persistKey")}{plain(": ")}{str('"my-tile-plan"')}{cm("  // ← localStorage")}</CodeLine>
      <CodeLine n={8}>{plain("  }")}</CodeLine>
      <CodeLine n={9}>{plain(");")}</CodeLine>
    </div>
  );
}

function ThemeSnippet({ planType }: { planType: string }) {
  return (
    <div className="space-y-0.5">
      <CodeLine n={1}>{kw("import")} {plain("{ ")}{fn_("mountTilePlanner")}{plain(" }")} {kw("from")} {str('"@bloomy/tile-planner"')}{plain(";")}</CodeLine>
      <CodeLine n={2}>{plain("")}</CodeLine>
      <CodeLine n={3}>{fn_("mountTilePlanner")}{plain("(el, {")}</CodeLine>
      <CodeLine n={4}>{plain("  ")}{fn_("planType")}{plain(": ")}{str(`"${planType}"`)}{plain(",")}</CodeLine>
      <CodeLine n={5}>{plain("  ")}{fn_("theme")}{plain(": {")}</CodeLine>
      <CodeLine n={6}>{plain("    ")}{fn_("primary")}{plain(": ")}{str('"#4338ca"')}{plain(",")}{cm("  // indigo")}</CodeLine>
      <CodeLine n={7}>{plain("    ")}{fn_("highlight")}{plain(": ")}{str('"#a5b4fc"')}{plain(",")}</CodeLine>
      <CodeLine n={8}>{plain("    ")}{fn_("background")}{plain(": ")}{str('"#eef2ff"')}{plain(",")}</CodeLine>
      <CodeLine n={9}>{plain("  },")}</CodeLine>
      <CodeLine n={10}>{plain("});")}</CodeLine>
    </div>
  );
}

function SaveSnippet({ planType }: { planType: string }) {
  return (
    <div className="space-y-0.5">
      <CodeLine n={1}>{kw("import")} {plain("{ ")}{fn_("mountTilePlanner")}{plain(" }")} {kw("from")} {str('"@bloomy/tile-planner"')}{plain(";")}</CodeLine>
      <CodeLine n={2}>{plain("")}</CodeLine>
      <CodeLine n={3}>{fn_("mountTilePlanner")}{plain("(el, {")}</CodeLine>
      <CodeLine n={4}>{plain("  ")}{fn_("planType")}{plain(": ")}{str(`"${planType}"`)}{plain(",")}</CodeLine>
      <CodeLine n={5}>{plain("  ")}{fn_("onSave")}{plain(": async (plan) => {")}</CodeLine>
      <CodeLine n={6}>{plain("    ")}{kw("await")} {fn_("fetch")}{plain("(")}{str('"/api/plans"')}{plain(",")}</CodeLine>
      <CodeLine n={7}>{plain("      { method: ")}{str('"POST"')}{plain(", body: ")}{ty("JSON")}{plain(".")}{fn_("stringify")}{plain("(plan) }")}</CodeLine>
      <CodeLine n={8}>{plain("    );")}</CodeLine>
      <CodeLine n={9}>{plain("  },")}</CodeLine>
      <CodeLine n={10}>{plain("});")}</CodeLine>
    </div>
  );
}

function SimpleSnippet({ planType }: { planType: string }) {
  const cfg = planType === "indoor" ? "indoorConfig" : "outdoorConfig";
  return (
    <div className="space-y-0.5">
      <CodeLine n={1}>{kw("import")} {plain("{ ")}{fn_("mountTilePlanner")}{plain(", ")}{fn_(cfg)}{plain(" }")} {kw("from")} {str('"@bloomy/tile-planner"')}{plain(";")}</CodeLine>
      <CodeLine n={2}>{plain("")}</CodeLine>
      <CodeLine n={3}>{cm("// engineering: false — simple homeowner mode")}</CodeLine>
      <CodeLine n={4}>{cm("// hides cut colours, advanced patterns, grout,")}</CodeLine>
      <CodeLine n={5}>{cm("// stats detail, materials estimator, JSON export")}</CodeLine>
      <CodeLine n={6}>{kw("const")} {plain("config = { ...")}{fn_(cfg)}{plain(", ")}{fn_("engineering")}{plain(": ")}{kw("false")}{plain(" };")}</CodeLine>
      <CodeLine n={7}>{plain("")}</CodeLine>
      <CodeLine n={8}>{fn_("mountTilePlanner")}{plain("(el, {")}</CodeLine>
      <CodeLine n={9}>{plain("  ")}{fn_("planType")}{plain(": ")}{str(`"${planType}"`)}{plain(",")}</CodeLine>
      <CodeLine n={10}>{plain("  ")}{fn_("config")}{plain(",")}</CodeLine>
      <CodeLine n={11}>{plain("  ")}{fn_("persistKey")}{plain(": ")}{str('"my-plan"')}{plain(",")}</CodeLine>
      <CodeLine n={12}>{plain("});")}</CodeLine>
    </div>
  );
}

function CompactSnippet({ planType }: { planType: string }) {
  return (
    <div className="space-y-0.5">
      <CodeLine n={1}>{kw("import")} {plain("{ ")}{fn_("mountTilePlanner")}{plain(" }")} {kw("from")} {str('"@bloomy/tile-planner"')}{plain(";")}</CodeLine>
      <CodeLine n={2}>{plain("")}</CodeLine>
      <CodeLine n={3}>{cm("// compact=true hides the sidebar — shows a slim")}</CodeLine>
      <CodeLine n={4}>{cm("// status bar + slide-up settings panel instead")}</CodeLine>
      <CodeLine n={5}>{fn_("mountTilePlanner")}{plain("(el, {")}</CodeLine>
      <CodeLine n={6}>{plain("  ")}{fn_("planType")}{plain(": ")}{str(`"${planType}"`)}{plain(",")}</CodeLine>
      <CodeLine n={7}>{plain("  ")}{fn_("compact")}{plain(": ")}{kw("true")}{plain(",")}</CodeLine>
      <CodeLine n={8}>{plain("  ")}{fn_("persistKey")}{plain(": ")}{str('"my-plan"')}{plain(",")}</CodeLine>
      <CodeLine n={9}>{plain("});")}</CodeLine>
    </div>
  );
}

function OnResultSnippet({ planType }: { planType: string }) {
  return (
    <div className="space-y-0.5">
      <CodeLine n={1}>{kw("import")} {plain("{ ")}{fn_("mountTilePlanner")}{plain(" }")} {kw("from")} {str('"@bloomy/tile-planner"')}{plain(";")}</CodeLine>
      <CodeLine n={2}>{plain("")}</CodeLine>
      <CodeLine n={3}>{cm("// fires ~300 ms after every change")}</CodeLine>
      <CodeLine n={4}>{cm("// r is null when canvas is empty")}</CodeLine>
      <CodeLine n={5}>{fn_("mountTilePlanner")}{plain("(el, {")}</CodeLine>
      <CodeLine n={6}>{plain("  ")}{fn_("planType")}{plain(": ")}{str(`"${planType}"`)}{plain(",")}</CodeLine>
      <CodeLine n={7}>{plain("  ")}{fn_("onResult")}{plain(": (r) => {")}</CodeLine>
      <CodeLine n={8}>{plain("    ")}{kw("if")} {plain("(!r) ")}{kw("return")}{plain(";")}</CodeLine>
      <CodeLine n={9}>{plain("    ")}{cm("// add to cart, update price, etc.")}</CodeLine>
      <CodeLine n={10}>{plain("    ")}{fn_("addToCart")}{plain("(r.tiles, r.boxes, r.sku);")}</CodeLine>
      <CodeLine n={11}>{plain("  },")}</CodeLine>
      <CodeLine n={12}>{plain("});")}</CodeLine>
    </div>
  );
}

function PatternSnippet({ planType }: { planType: string }) {
  return (
    <div className="space-y-0.5">
      <CodeLine n={1}>{kw("import")} {plain("{ ")}{fn_("mountTilePlanner")}{plain(" }")} {kw("from")} {str('"@bloomy/tile-planner"')}{plain(";")}</CodeLine>
      <CodeLine n={2}>{plain("")}</CodeLine>
      <CodeLine n={3}>{cm("// read the file as a data URL, then mount")}</CodeLine>
      <CodeLine n={4}>{kw("const")} {fn_("reader")} {plain("= new ")} {ty("FileReader")}{plain("();")}</CodeLine>
      <CodeLine n={5}>{fn_("reader")}{plain(".")}{fn_("onload")} {plain("= e => {")}</CodeLine>
      <CodeLine n={6}>{plain("  ")}{fn_("mountTilePlanner")}{plain("(el, {")}</CodeLine>
      <CodeLine n={7}>{plain("    ")}{fn_("planType")}{plain(": ")}{str(`"${planType}"`)}{plain(",")}</CodeLine>
      <CodeLine n={8}>{plain("    ")}{fn_("tilePattern")}{plain(": e.")}{fn_("target")}{plain(".")}{fn_("result")}{plain(",")}{cm(" // data URL")}</CodeLine>
      <CodeLine n={9}>{plain("  });")}</CodeLine>
      <CodeLine n={10}>{plain("};")}</CodeLine>
      <CodeLine n={11}>{fn_("reader")}{plain(".")}{fn_("readAsDataURL")}{plain("(file);")}</CodeLine>
      <CodeLine n={12}>{plain("")}</CodeLine>
    </div>
  );
}

function LockedSizeSnippet({ planType, sizeKind }: { planType: string; sizeKind: string }) {
  return (
    <div className="space-y-0.5">
      <CodeLine n={1}>{kw("import")} {plain("{ ")}{fn_("mountTilePlanner")}{plain(" }")} {kw("from")} {str('"@bloomy/tile-planner"')}{plain(";")}</CodeLine>
      <CodeLine n={2}>{plain("")}</CodeLine>
      <CodeLine n={3}>{cm("// Lock tile size — hides the size picker in sidebar.")}</CodeLine>
      <CodeLine n={4}>{cm("// Client sells one tile format: the user just draws")}</CodeLine>
      <CodeLine n={5}>{cm("// their room and gets an exact tile count.")}</CodeLine>
      <CodeLine n={6}>{fn_("mountTilePlanner")}{plain("(el, {")}</CodeLine>
      <CodeLine n={7}>{plain("  ")}{fn_("planType")}{plain(": ")}{str(`"${planType}"`)}{plain(",")}</CodeLine>
      <CodeLine n={8}>{plain("  ")}{fn_("size")}{plain(":    { kind: ")}{str(`"${sizeKind}"`)}{plain(" },")}</CodeLine>
      <CodeLine n={9}>{plain("  ")}{fn_("persistKey")}{plain(": ")}{str('"my-plan"')}{plain(",")}</CodeLine>
      <CodeLine n={10}>{plain("});")}</CodeLine>
    </div>
  );
}

// ── Live terminal ────────────────────────────────────────────────────────────

function num(n: number | undefined) {
  if (n === undefined) return <span style={{ color: C_NUM }}>undefined</span>;
  return <span style={{ color: C_NUM }}>{n}</span>;
}
function str2(s: string) { return <span style={{ color: C_STR }}>&quot;{s}&quot;</span>; }
function key(s: string)  { return <span style={{ color: C_TY }}>{s}</span>; }
function dim(s: string)  { return <span style={{ color: C_DIM }}>{s}</span>; }
function grn(s: string)  { return <span style={{ color: C_FN }}>{s}</span>; }

function TileSizeValue({ ts }: { ts: TilePlannerResult["tileSize"] }) {
  if (ts.kind === "custom") {
    return (
      <>
        {dim("{ ")}{key("kind")}{dim(": ")}{str2("custom")}{dim(", ")}
        {key("width")}{dim(": ")}{num(ts.width)}{dim(", ")}
        {key("height")}{dim(": ")}{num(ts.height)}{dim(" }")}
      </>
    );
  }
  return <>{dim("{ ")}{key("kind")}{dim(": ")}{str2(ts.kind)}{dim(" }")}</>;
}

function LiveTerminal({ result }: { result: TilePlannerResult | null | undefined }) {
  const [flash, setFlash] = useState(false);
  const prev = useRef(result);

  useEffect(() => {
    if (result !== prev.current) {
      prev.current = result;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 500);
      return () => clearTimeout(t);
    }
  }, [result]);

  const isEmpty = result === undefined;
  const isNull  = result === null;

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        background: CB,
        border: `1px solid ${flash ? "rgba(168,230,163,0.4)" : BR}`,
        boxShadow: flash ? "0 0 0 2px rgba(168,230,163,0.12)" : undefined,
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${BR}`, background: CBB }}>
        <span className="h-2 w-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        <span className="h-2 w-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        <span className="h-2 w-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        <span className="ml-3 font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>console</span>
        <div className="ml-auto flex items-center gap-2">
          {!isEmpty && (
            <span
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: flash ? "#a8e6a3" : "rgba(255,255,255,0.25)", transition: "color 0.2s" }}
            >
              {flash ? "● live" : "○ idle"}
            </span>
          )}
          {isEmpty && (
            <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>
              waiting…
            </span>
          )}
        </div>
      </div>

      <div className="p-5 font-mono text-xs leading-6" style={{ color: "#e8f5e9" }}>
        {isEmpty && (
          <span style={{ color: "rgba(255,255,255,0.25)" }}>
            {grn("// ")}interact with the planner above — onResult fires here
          </span>
        )}

        {isNull && (
          <div>
            {grn("onResult")}{dim("(")}<span style={{ color: "#ff79c6" }}>null</span>{dim(");")}{" "}
            <span style={{ color: "rgba(255,255,255,0.3)" }}>{dim("// canvas empty")}</span>
          </div>
        )}

        {result && !isNull && (
          <div className="space-y-0">
            <div>{grn("onResult")}{dim("({")}</div>
            <div className="pl-6">
              <div>{key("tiles")}{dim(":       ")}{num(result.tiles)}{dim(",")}</div>
              {result.boxes !== undefined && (
                <div>{key("boxes")}{dim(":       ")}{num(result.boxes)}{dim(",")}</div>
              )}
              <div>{key("areaSqM")}{dim(":     ")}{num(Math.round(result.areaSqM * 100) / 100)}{dim(",")}</div>
              <div>
                {key("wasteFactor")}{dim(":  ")}{num(result.wasteFactor)}{dim(",")}{" "}
                <span style={{ color: "rgba(255,255,255,0.3)" }}>{dim(`// +${Math.round(result.wasteFactor * 100)}%`)}</span>
              </div>
              <div>
                {key("tileSize")}{dim(":    ")}<TileSizeValue ts={result.tileSize} />{dim(",")}
              </div>
              <div>{key("material")}{dim(":    ")}{str2(result.material)}{dim(",")}</div>
              {result.sku !== undefined && (
                <div>{key("sku")}{dim(":         ")}{str2(result.sku)}{dim(",")}</div>
              )}
            </div>
            <div>{dim("});")}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Toolbar primitives ────────────────────────────────────────────────────────

function ToolbarDivider() {
  return <span className="h-4 w-px shrink-0 bg-line" />;
}

function ToolbarGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs text-muted">{label}</span>
      {children}
    </div>
  );
}

export function InteractiveDemo() {
  const [cfgIdx, setCfgIdx]           = useState(0);
  const [snippetKey, setSnippetKey]   = useState<"minimal" | "persist" | "theme" | "compact" | "onSave" | "simple" | "onResult" | "size" | "pattern">("size");
  const [themeIdx, setThemeIdx]       = useState(0);
  const [tileSizeIdx, setTileSizeIdx] = useState(0); // 600×600 default
  const [isCompact, setIsCompact]     = useState(false);
  const [engineering, setEngineering] = useState(false);
  const [liveResult, setLiveResult]   = useState<TilePlannerResult | null | undefined>(undefined);
  const [tilePattern, setTilePattern] = useState<string | undefined>(undefined);
  const fileInputRef                  = useRef<HTMLInputElement>(null);

  // Load planner CSS once (normally PlannerWidget does this via CDN script; here we load it directly)
  useEffect(() => {
    if (document.querySelector(`link[href="${PLANNER_CSS}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = PLANNER_CSS;
    document.head.appendChild(link);
  }, []);

  const handlePatternUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readImageAsDataUrl(file, (dataUrl) => {
      setTilePattern(dataUrl);
      setSnippetKey("pattern");
    });
    e.target.value = "";
  }, []);

  const cfg       = CONFIGS[cfgIdx];
  const theme     = THEMES[themeIdx];
  const tileSize  = TILE_SIZES[tileSizeIdx];

  const baseConfig: PlannerConfig = cfg.planType === "indoor" ? indoorConfig : outdoorConfig;

  // lockedSize is passed via config so the CDN version also picks it up.
  // showReset / showShare / showExports / showMaterialEstimator stay off — landing shows
  // the client-facing widget, not the full internal tool.
  const resolvedConfig = useMemo<PlannerConfig>(
    () => ({
      ...baseConfig,
      engineering,
      lockedSize: tileSize.value,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cfg.planType, engineering, tileSizeIdx]
  );

  const selectedSizeKind = tileSize.value.kind;

  const snippetMap = {
    minimal:  <MinimalSnippet  planType={cfg.planType} />,
    persist:  <PersistSnippet  planType={cfg.planType} />,
    theme:    <ThemeSnippet    planType={cfg.planType} />,
    compact:  <CompactSnippet  planType={cfg.planType} />,
    onSave:   <SaveSnippet     planType={cfg.planType} />,
    simple:   <SimpleSnippet   planType={cfg.planType} />,
    onResult: <OnResultSnippet planType={cfg.planType} />,
    size:     <LockedSizeSnippet planType={cfg.planType} sizeKind={selectedSizeKind} />,
    pattern:  <PatternSnippet   planType={cfg.planType} />,
  };

  function switchCfg(idx: number) {
    setCfgIdx(idx);
    setLiveResult(undefined);
    setTilePattern(undefined);
  }

  function switchLayout(compact: boolean) {
    setIsCompact(compact);
    if (compact && snippetKey !== "simple" && snippetKey !== "size") setSnippetKey("compact");
    else if (!compact && snippetKey === "compact") setSnippetKey("minimal");
  }

  function switchEngineering(eng: boolean) {
    setEngineering(eng);
    if (!eng) setSnippetKey("simple");
    else if (snippetKey === "simple") setSnippetKey("minimal");
  }

  function switchTileSize(idx: number) {
    setTileSizeIdx(idx);
    setSnippetKey("size");
  }

  return (
    <section className="bg-canvas py-20">
      <div className="mx-auto w-full px-6 md:px-10" style={{ maxWidth: 1400 }}>
        <p className="text-eyebrow text-muted">Live demo</p>
        <h2 className="mt-2 text-display-sm text-ink">See it in action</h2>
        <p className="mt-3 max-w-xl text-lead text-muted">
          Switch plan type, colour theme, or tile size — the planner and code update together.
        </p>

        {/* ── Controls toolbar ── */}
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border border-line bg-paper px-5 py-3">

          <ToolbarGroup label="Type">
            <div className="flex gap-1">
              {CONFIGS.map((c, i) => (
                <ToggleButton key={c.label} active={cfgIdx === i} onClick={() => switchCfg(i)}>
                  {c.label}
                </ToggleButton>
              ))}
            </div>
          </ToolbarGroup>

          <ToolbarDivider />

          <ToolbarGroup label="Theme">
            <div className="flex items-center gap-0.5">
              {THEMES.map((t, i) => (
                <button
                  key={t.name}
                  onClick={() => setThemeIdx(i)}
                  aria-label={t.name}
                  aria-pressed={themeIdx === i}
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                  style={{
                    background: themeIdx === i ? "var(--color-mist)" : "transparent",
                    color: themeIdx === i ? "var(--color-ink)" : "var(--color-muted)",
                    outline: themeIdx === i ? "1.5px solid var(--color-line)" : "none",
                  }}
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: t.swatch }} />
                  {t.name}
                </button>
              ))}
            </div>
          </ToolbarGroup>

          <ToolbarDivider />

          <ToolbarGroup label="Tile size">
            <div className="flex gap-1">
              {TILE_SIZES.map((s, i) => (
                <ToggleButton key={s.label} active={tileSizeIdx === i} onClick={() => switchTileSize(i)}>
                  {s.label}
                </ToggleButton>
              ))}
            </div>
          </ToolbarGroup>

          <ToolbarDivider />

          <ToolbarGroup label="Layout">
            <div className="flex gap-1">
              <ToggleButton active={!isCompact} onClick={() => switchLayout(false)}>Standard</ToggleButton>
              <ToggleButton active={isCompact}  onClick={() => switchLayout(true)}>Compact</ToggleButton>
            </div>
          </ToolbarGroup>

          <ToolbarDivider />

          <ToolbarGroup label="Mode">
            <div className="flex gap-1">
              <ToggleButton active={engineering}  onClick={() => switchEngineering(true)}>Engineering</ToggleButton>
              <ToggleButton active={!engineering} onClick={() => switchEngineering(false)}>Client</ToggleButton>
            </div>
          </ToolbarGroup>

          <ToolbarDivider />

          <ToolbarGroup label="Tile image">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              aria-label="Upload tile image"
              className="sr-only"
              onChange={handlePatternUpload}
            />
            {tilePattern ? (
              <div className="flex items-center gap-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tilePattern}
                  alt="tile pattern preview"
                  className="h-6 w-6 rounded object-cover ring-1 ring-line"
                />
                <button
                  onClick={() => setTilePattern(undefined)}
                  aria-label="Remove tile image"
                  className="rounded px-0.5 h-6 w-6 py-0.5 font-mono text-[10px] text-muted hover:bg-mist hover:text-ink"
                >
                  ×
                </button>
              </div>
            ) : (
              <ToggleButton active={false} onClick={() => fileInputRef.current?.click()}>
                Upload
              </ToggleButton>
            )}
          </ToolbarGroup>
        </div>

        {/* ── Planner (left) + Code + Terminal (right) side-by-side ── */}
        <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-start">

          {/* Left: Planner */}
          <div className={isCompact
            ? "flex shrink-0 flex-col gap-2 md:w-[440px]"
            : "min-w-0 flex-1"
          }>
            <div
              className="overflow-hidden rounded-xl border border-line"
              style={{
                height: isCompact ? 400 : 620,
                ...theme.vars,
              } as React.CSSProperties}
            >
              <TilePlannerCore
                key={cfg.planType}
                planType={cfg.planType}
                config={resolvedConfig}
                compact={isCompact}
                persistKey={`landing-demo-${cfg.planType}`}
                onResult={setLiveResult}
                tilePattern={tilePattern}
              />
            </div>
            {isCompact && (
              <p className="text-xs text-muted">
                <span className="font-mono text-[11px]">440 × 400 px</span>
                {" "}— sidebar or widget embed
              </p>
            )}
          </div>

          {/* Right: Code block + Terminal */}
          <div className={`flex min-w-0 flex-col gap-4 ${isCompact ? "flex-1" : "md:w-[440px] md:shrink-0"}`}>

            {/* Code panel */}
            <div
              className="flex flex-col overflow-hidden rounded-xl"
              style={{
                background: CB,
                border: `1px solid ${BR}`,
                height: isCompact ? 300 : 380,
              } as React.CSSProperties}
            >
              <div className="flex shrink-0 items-center gap-3 border-b px-4 py-3" style={{ borderColor: BR, background: CBB }}>
                <div className="flex gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
                  <span className="h-2 w-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
                  <span className="h-2 w-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
                </div>
                <span className="ml-1 font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>app.js</span>
                <div className="ml-2 flex min-w-0 gap-1 overflow-x-auto">
                  {(["minimal", "persist", "theme", "compact", "onSave", "simple", "onResult", "size", "pattern"] as const).map((k) => (
                    <button
                      key={k}
                      onClick={() => setSnippetKey(k)}
                      className="rounded px-2 py-0.5 font-mono text-[10px] transition-colors"
                      style={{
                        background: snippetKey === k ? "rgba(168,230,163,0.15)" : "transparent",
                        color: snippetKey === k ? "#a8e6a3" : "rgba(255,255,255,0.35)",
                        outline: snippetKey === k ? "1px solid rgba(168,230,163,0.25)" : "none",
                      }}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-auto p-5 font-mono">
                {snippetMap[snippetKey]}
              </div>
            </div>

            {/* Live terminal */}
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="font-mono text-xs text-muted">onResult callback</span>
                <span className="h-px flex-1 bg-line" />
                <span className="font-mono text-[10px] text-muted/60">updates ~300 ms after every change</span>
              </div>
              <LiveTerminal result={liveResult} />
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
