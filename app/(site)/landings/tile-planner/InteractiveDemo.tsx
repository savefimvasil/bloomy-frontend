"use client";

import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { ToggleButton } from "@/components/ui/toggle-button";
import type { PlannerConfig } from "@bloomy/bloomy-planner";
import { outdoorConfig, indoorConfig } from "@bloomy/bloomy-planner";

const PlannerCore = dynamic(
  () => import("@bloomy/bloomy-planner").then((m) => m.PlannerCore),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        loading planner…
      </div>
    ),
  }
);

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

type ConfigOption = {
  label: string;
  planType: "garden" | "indoor";
  description: string;
};

const CONFIGS: ConfigOption[] = [
  { label: "outdoor", planType: "garden", description: "Garden / patio — preset paving sizes" },
  { label: "indoor",  planType: "indoor", description: "Room shape — tile + laminate materials" },
];

const CB  = "#0d2414";
const BR  = "rgba(255,255,255,0.10)";
const CBB = "rgba(255,255,255,0.07)";

function kw(s: string)    { return <span style={{ color: "#ff79c6" }}>{s}</span>; }
function str(s: string)   { return <span style={{ color: "#f1fa8c" }}>{s}</span>; }
function fn_(s: string)   { return <span style={{ color: "#a8e6a3" }}>{s}</span>; }
function ty(s: string)    { return <span style={{ color: "#8be9fd" }}>{s}</span>; }
function cm(s: string)    { return <span style={{ color: "#6a9e6a" }}>{s}</span>; }
function plain(s: string) { return <span style={{ color: "#e8f5e9" }}>{s}</span>; }

function CodeLine({ children, n }: { children: React.ReactNode; n: number }) {
  return (
    <div className="flex gap-4">
      <span className="w-6 shrink-0 select-none text-right text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>{n}</span>
      <span className="whitespace-pre-wrap break-words text-xs leading-6 lg:whitespace-pre lg:break-normal">{children}</span>
    </div>
  );
}

function MinimalSnippet({ planType }: { planType: string }) {
  return (
    <div className="space-y-0.5">
      <CodeLine n={1}>{kw("import")} {plain("{ ")}{fn_("mountTilePlanner")}{plain(" }")} {kw("from")} {str('"@bloomy/bloomy-planner"')}{plain(";")}</CodeLine>
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
      <CodeLine n={1}>{kw("import")} {plain("{ ")}{fn_("mountTilePlanner")}{plain(" }")} {kw("from")} {str('"@bloomy/bloomy-planner"')}{plain(";")}</CodeLine>
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
      <CodeLine n={1}>{kw("import")} {plain("{ ")}{fn_("mountTilePlanner")}{plain(" }")} {kw("from")} {str('"@bloomy/bloomy-planner"')}{plain(";")}</CodeLine>
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
      <CodeLine n={1}>{kw("import")} {plain("{ ")}{fn_("mountTilePlanner")}{plain(" }")} {kw("from")} {str('"@bloomy/bloomy-planner"')}{plain(";")}</CodeLine>
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
      <CodeLine n={1}>{kw("import")} {plain("{ ")}{fn_("mountTilePlanner")}{plain(", ")}{fn_(cfg)}{plain(" }")} {kw("from")} {str('"@bloomy/bloomy-planner"')}{plain(";")}</CodeLine>
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
      <CodeLine n={1}>{kw("import")} {plain("{ ")}{fn_("mountTilePlanner")}{plain(" }")} {kw("from")} {str('"@bloomy/bloomy-planner"')}{plain(";")}</CodeLine>
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

export function InteractiveDemo() {
  const [cfgIdx, setCfgIdx]           = useState(0);
  const [snippetKey, setSnippetKey]   = useState<"minimal" | "persist" | "theme" | "compact" | "onSave" | "simple">("minimal");
  const [themeIdx, setThemeIdx]       = useState(0);
  const [isCompact, setIsCompact]     = useState(false);
  const [engineering, setEngineering] = useState(true);

  const cfg   = CONFIGS[cfgIdx];
  const theme = THEMES[themeIdx];

  // Build a config that applies the engineering flag on top of the base config
  const baseConfig: PlannerConfig = cfg.planType === "indoor" ? indoorConfig : outdoorConfig;
  const resolvedConfig = useMemo<PlannerConfig>(
    () => ({ ...baseConfig, engineering }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cfg.planType, engineering]
  );

  const snippetMap = {
    minimal: <MinimalSnippet planType={cfg.planType} />,
    persist: <PersistSnippet planType={cfg.planType} />,
    theme:   <ThemeSnippet   planType={cfg.planType} />,
    compact: <CompactSnippet planType={cfg.planType} />,
    onSave:  <SaveSnippet    planType={cfg.planType} />,
    simple:  <SimpleSnippet  planType={cfg.planType} />,
  };

  function switchSize(compact: boolean) {
    setIsCompact(compact);
    if (compact && snippetKey !== "simple") setSnippetKey("compact");
    else if (!compact && snippetKey === "compact") setSnippetKey("minimal");
  }

  function switchEngineering(eng: boolean) {
    setEngineering(eng);
    if (!eng) setSnippetKey("simple");
    else if (snippetKey === "simple") setSnippetKey("minimal");
  }

  return (
    <section className="bg-canvas py-20">
      <div className="mx-auto w-full px-6 md:px-10" style={{ maxWidth: 1400 }}>
        <p className="text-eyebrow text-muted">Live demo</p>
        <h2 className="mt-2 text-display-sm text-ink">See it in action</h2>
        <p className="mt-3 max-w-xl text-lead text-muted">
          Switch plan type, colour theme, or usage pattern — the planner and code update together.
        </p>

        {/* ── Unified controls toolbar ── */}
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border border-line bg-paper px-5 py-3">

          {/* Plan type */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-muted">Type</span>
            <div className="flex gap-1">
              {CONFIGS.map((c, i) => (
                <ToggleButton key={c.label} active={cfgIdx === i} onClick={() => setCfgIdx(i)}>
                  {c.label}
                </ToggleButton>
              ))}
            </div>
          </div>

          <span className="h-4 w-px shrink-0 bg-line" />

          {/* Colour theme */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-muted">Theme</span>
            <div className="flex items-center gap-0.5">
              {THEMES.map((t, i) => (
                <button
                  key={t.name}
                  onClick={() => setThemeIdx(i)}
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
          </div>

          <span className="h-4 w-px shrink-0 bg-line" />

          {/* Size */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-muted">Size</span>
            <div className="flex gap-1">
              <ToggleButton active={!isCompact} onClick={() => switchSize(false)}>Standard</ToggleButton>
              <ToggleButton active={isCompact}  onClick={() => switchSize(true)}>Compact</ToggleButton>
            </div>
          </div>

          <span className="h-4 w-px shrink-0 bg-line" />

          {/* Mode */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-muted">Mode</span>
            <div className="flex gap-1">
              <ToggleButton active={engineering}  onClick={() => switchEngineering(true)}>Engineering</ToggleButton>
              <ToggleButton active={!engineering} onClick={() => switchEngineering(false)}>Simple</ToggleButton>
            </div>
          </div>
        </div>

        {/* ── Planner + Code side-by-side (stacked on mobile) ── */}
        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-start">

          {/* Planner */}
          {isCompact ? (
            <div className="flex flex-col gap-2">
              <div
                className="overflow-hidden rounded-xl border border-line shadow-md lg:w-[440px]"
                style={{ height: 400, ...theme.vars } as React.CSSProperties}
              >
                <PlannerCore
                  key={`${cfg.planType}-compact`}
                  planType={cfg.planType}
                  config={resolvedConfig}
                  persistKey={`landing-demo-${cfg.planType}`}
                  compact
                />
              </div>
              <p className="text-xs text-muted">
                <span className="font-mono text-[11px]">440 × 400 px</span>
                {" "}— sidebar or widget embed
              </p>
            </div>
          ) : (
            <div
              className="min-w-0 flex-1 overflow-hidden rounded-xl border border-line h-[440px] lg:h-[680px]"
              style={{ ...theme.vars } as React.CSSProperties}
            >
              <PlannerCore
                key={`${cfg.planType}-standard`}
                planType={cfg.planType}
                config={resolvedConfig}
                persistKey={`landing-demo-${cfg.planType}`}
              />
            </div>
          )}

          {/* Code block */}
          <div
            className={isCompact
              ? "flex flex-col overflow-hidden rounded-xl h-[300px] lg:flex-1 lg:min-w-0 lg:h-[400px]"
              : "flex flex-col overflow-hidden rounded-xl h-[300px] lg:w-[420px] lg:flex-shrink-0 lg:h-[680px]"}
            style={{ background: CB } as React.CSSProperties}
          >
            <div className="flex shrink-0 items-center gap-3 border-b px-4 py-3" style={{ borderColor: BR, background: CBB }}>
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
                <span className="h-2 w-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
                <span className="h-2 w-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
              </div>
              <span className="ml-1 font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>app.js</span>
              <div className="ml-auto flex flex-wrap gap-1">
                {(["minimal", "persist", "theme", "compact", "onSave", "simple"] as const).map((k) => (
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

        </div>

      </div>
    </section>
  );
}
