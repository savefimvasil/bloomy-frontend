import type { Metadata } from "next";
import Link from "next/link";
import { InteractiveDemo } from "./InteractiveDemo";
import { FrameworkTabs } from "./FrameworkTabs";
import { kw, str, fn_, ty, cm, pl, CodeLine, Terminal } from "./code-ui";

export const metadata: Metadata = {
  title: "Tile Planner — Embed anywhere",
  description: "Drop a fully-featured interactive tile planner into any web project. CDN script tag or npm package — one function call, no backend required.",
};

function Hero() {
  return (
    <section className="relative overflow-hidden bg-forest py-24">
      {/* subtle tile grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "linear-gradient(rgba(183,227,111,1) 1px, transparent 1px), linear-gradient(90deg, rgba(183,227,111,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="container relative">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-lime" />
            <span className="font-mono text-[11px] text-paper/70">cdn.bloomy.garden</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-lime/50" />
            <span className="font-mono text-[11px] text-paper/50">@bloomy/tile-planner</span>
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-display-xl text-paper">
              Tile<br />
              <span className="text-lime">Planner</span>
            </h1>
            <p className="mt-6 text-lead text-paper/60">
              A complete interactive tile planner you can embed in any web project.
              Drop in via CDN script tag with a token, or install the npm package — no backend required.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["CDN script tag", "Vanilla JS", "React", "Vue", "TypeScript", "Zero backend"].map((t) => (
                <span key={t} className="rounded-full border px-3 py-1 font-mono text-xs text-lime/80" style={{ borderColor: "rgba(183,227,111,0.25)", background: "rgba(183,227,111,0.06)" }}>
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-8 flex gap-3">
              <Link href="#demo" className="rounded-lg bg-lime px-5 py-2.5 text-sm font-semibold text-forest transition-opacity hover:opacity-90">
                Try live demo
              </Link>
              <Link href="/tile-plan" className="rounded-lg border border-paper/20 px-5 py-2.5 text-sm font-semibold text-paper/80 transition-colors hover:border-paper/40">
                Open planner →
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <Terminal title="index.html">
              <div className="space-y-0.5">
                <CodeLine n={1}>{cm("<!-- 1. Load bundle — no build step required -->")}</CodeLine>
                <CodeLine n={2}>{pl("<")}{ty("link")}{pl(" ")}{fn_("rel")}{pl("=")}{str('"stylesheet"')}{pl(" ")}{fn_("href")}{pl("=")}{str('"https://cdn.bloomy.garden/tile-planner.css"')}{pl(">")}</CodeLine>
                <CodeLine n={3}>{pl("<")}{ty("script")}{pl(" ")}{fn_("src")}{pl("=")}{str('"https://cdn.bloomy.garden/tile-planner.js"')}{pl("></")}{ty("script")}{pl(">")}</CodeLine>
                <CodeLine n={4}>{pl("")}</CodeLine>
                <CodeLine n={5}>{cm("<!-- 2. Mount with your embed token -->")}</CodeLine>
                <CodeLine n={6}>{pl("<")}{ty("script")}{pl(">")}</CodeLine>
                <CodeLine n={7}>{pl("  ")}{ty("BloomyPlanner")}{pl(".")}{fn_("mount")}{pl("(")}{str('"#planner"')}{pl(", {")}</CodeLine>
                <CodeLine n={8}>{pl("    ")}{fn_("token")}{pl(":    ")}{str('"emb_yourtoken"')}{pl(",")}</CodeLine>
                <CodeLine n={9}>{pl("    ")}{fn_("planType")}{pl(": ")}{str('"garden"')}{pl(",")}</CodeLine>
                <CodeLine n={10}>{pl("  });")}</CodeLine>
                <CodeLine n={11}>{pl("</")} {ty("script")}{pl(">")}</CodeLine>
              </div>
            </Terminal>

            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-paper/40">or with npm</p>
              <p className="font-mono text-xs text-paper/60">
                npm install @bloomy/tile-planner
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const PILLS = [
  "CDN script tag", "BloomyPlanner.mount()", "mountTilePlanner()",
  "Token auth", "handle.update()", "onResult callback", "onSave callback",
  "Herringbone", "Running bond", "Diagonal", "Chess colour",
  "PDF export", "PNG export", "JSON import / export",
  "Grout gap control", "Cut-piece FFD", "Custom tile sizes",
  "localStorage persist", "TypeScript types", "Themeable",
];

function FeatureStrip() {
  return (
    <div className="overflow-hidden border-y border-line bg-forest py-4 select-none">
      <div className="animate-marquee-ltr flex gap-8 whitespace-nowrap">
        {[...PILLS, ...PILLS, ...PILLS].map((pill, i) => (
          <span key={i} className="flex shrink-0 items-center gap-2.5 text-xs font-medium text-paper/60">
            <span className="text-lime">◆</span>
            {pill}
          </span>
        ))}
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section className="bg-canvas py-24">
      <div className="container">
        <p className="text-eyebrow text-muted">Quick start</p>
        <h2 className="mt-2 text-display-sm text-ink">Up in 3 steps</h2>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {/* Step 1 */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest font-mono text-xs font-bold text-lime">1</span>
              <span className="font-mono text-xs text-muted">add CDN links</span>
            </div>
            <Terminal title="index.html" minHeight={168}>
              <div className="space-y-0.5">
                <CodeLine n={1}>{cm("<!-- No install — works in any HTML page -->")}</CodeLine>
                <CodeLine n={2}>{pl("<")}{ty("link")}{pl(" ")}{fn_("rel")}{pl("=")}{str('"stylesheet"')}</CodeLine>
                <CodeLine n={3}>{pl("     ")}{fn_("href")}{pl("=")}{str('"https://cdn.bloomy.garden/tile-planner.css"')}{pl(">")}</CodeLine>
                <CodeLine n={4}>{pl("<")}{ty("script")}</CodeLine>
                <CodeLine n={5}>{pl("  ")}{fn_("src")}{pl("=")}{str('"https://cdn.bloomy.garden/tile-planner.js"')}</CodeLine>
                <CodeLine n={6}>{pl("></")}{ty("script")}{pl(">")}</CodeLine>
              </div>
            </Terminal>
            <p className="mt-3 text-sm text-muted">No install required. Using npm?{" "}<code className="font-mono text-xs">npm install @bloomy/tile-planner</code></p>
          </div>

          {/* Step 2 */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest font-mono text-xs font-bold text-lime">2</span>
              <span className="font-mono text-xs text-muted">add a container</span>
            </div>
            <Terminal title="index.html" minHeight={168}>
              <div className="space-y-0.5">
                <CodeLine n={1}>{cm("<!-- Any HTML — just give it a size -->")}</CodeLine>
                <CodeLine n={2}>{pl("<")}{ty("div")}{pl(" ")}{fn_("id")}{pl("=")}{str('"planner"')}</CodeLine>
                <CodeLine n={3}>{pl("     ")}{fn_("style")}{pl("=")}{str('"height: 600px;"')}</CodeLine>
                <CodeLine n={4}>{pl("></")} {ty("div")}{pl(">")}</CodeLine>
              </div>
            </Terminal>
            <p className="mt-3 text-sm text-muted">Size the container — the planner fills it automatically.</p>
          </div>

          {/* Step 3 */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest font-mono text-xs font-bold text-lime">3</span>
              <span className="font-mono text-xs text-muted">mount</span>
            </div>
            <Terminal title="index.html" minHeight={168}>
              <div className="space-y-0.5">
                <CodeLine n={1}>{pl("<")}{ty("script")}{pl(">")}</CodeLine>
                <CodeLine n={2}>{pl("  ")}{ty("BloomyPlanner")}{pl(".")}{fn_("mount")}{pl("(")}{str('"#planner"')}{pl(", {")}</CodeLine>
                <CodeLine n={3}>{pl("    ")}{fn_("token")}{pl(":    ")}{str('"emb_yourtoken"')}{pl(",")}</CodeLine>
                <CodeLine n={4}>{pl("    ")}{fn_("planType")}{pl(": ")}{str('"garden"')}{pl(",")}</CodeLine>
                <CodeLine n={5}>{pl("  });")}</CodeLine>
                <CodeLine n={6}>{pl("</")} {ty("script")}{pl(">")}</CodeLine>
              </div>
            </Terminal>
            <p className="mt-3 text-sm text-muted">Returns a handle — <code className="font-mono text-xs">handle.unmount()</code> removes it, <code className="font-mono text-xs">handle.update(opts)</code> changes config live.</p>
          </div>
        </div>

        {/* Framework examples */}
        <div className="mt-16">
          <p className="mb-6 text-sm font-semibold text-ink">Same API, any framework</p>
          <FrameworkTabs />
        </div>
      </div>
    </section>
  );
}

function IconGrid() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="5" height="5" rx="0.75" />
      <rect x="9" y="2" width="5" height="5" rx="0.75" />
      <rect x="2" y="9" width="5" height="5" rx="0.75" />
      <rect x="9" y="9" width="5" height="5" rx="0.75" />
    </svg>
  );
}

function IconScissors() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <circle cx="4.5" cy="4.5" r="2" />
      <circle cx="4.5" cy="11.5" r="2" />
      <path d="M13 3L6.5 6.5M13 13L6.5 9.5" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 2v8M5 8l3 3 3-3" />
      <path d="M2 13h12" />
    </svg>
  );
}

function IconCallback() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 2L2 8h4.5L4 14l8-9H7l2-3z" />
    </svg>
  );
}

function IconPattern() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="0.75" />
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="0.75" />
      <rect x="5.25" y="9" width="5.5" height="5.5" rx="0.75" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 2c-1.8 0-3 2.7-3 6s1.2 6 3 6 3-2.7 3-6-1.2-6-3-6z" />
      <path d="M2 8h12" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: <IconGrid />,
    tag: "Material calc",
    title: "Precise tile count — always",
    body: "Full tiles and cut pieces calculated on every canvas change. Order exactly what you need with configurable waste buffer (+10% or +15%).",
  },
  {
    icon: <IconScissors />,
    tag: "FFD algorithm",
    title: "Cut-piece reuse",
    body: "Offcuts are binned and reused via First Fit Decreasing. Tiles cut for one edge are automatically reused elsewhere — fewer tiles purchased.",
  },
  {
    icon: <IconDownload />,
    tag: "Export",
    title: "PDF · PNG · JSON",
    body: "Client-side PDF via jsPDF, PNG via canvas, and a structured JSON format you can import, re-open, or store in your own database.",
  },
  {
    icon: <IconCallback />,
    tag: "Callbacks",
    title: "onSave · onResult",
    body: "onSave persists the plan wherever you like — your API, Supabase, localStorage. onResult fires ~300 ms after every change with tile count, boxes, and SKU.",
  },
  {
    icon: <IconPattern />,
    tag: "Patterns",
    title: "5 installation patterns",
    body: "Straight, running bond, diagonal, chess colour mode, and herringbone (rotatable at 0 / 45 / 90 / 135°). Tile-size guards enforce valid combinations.",
  },
  {
    icon: <IconGlobe />,
    tag: "CDN embed",
    title: "No build step required",
    body: "Drop in via script tag with a CDN token — no npm, no bundler. Or install the npm package for full TypeScript types, tree-shaking, and the React component API.",
  },
];

function Advantages() {
  return (
    <section className="bg-paper py-24">
      <div className="container">
        <p className="text-eyebrow text-muted">Why use it</p>
        <h2 className="mt-2 text-display-sm text-ink">Built for integration</h2>

        <div className="mt-12 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-paper p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest/8 text-forest">
                  {f.icon}
                </span>
                <span className="rounded bg-mist px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted">
                  {f.tag}
                </span>
              </div>
              <p className="font-semibold text-ink">{f.title}</p>
              <p className="mt-1.5 text-sm leading-6 text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const MOUNT_OPTS = [
  { name: "token",                type: "string",                                default: "—",        desc: "Embed token issued from your Bloomy account. Required for CDN (BloomyPlanner.mount) embeds; not needed when using the npm package directly." },
  { name: "planType",             type: '"garden" | "indoor"',                  default: '"garden"', desc: "Starting shape and default tile preset." },
  { name: "size",                 type: "TileSize",                              default: "—",        desc: 'Lock a tile size and hide the size picker. E.g. { kind: "600x600" }. Pass your product\'s format — users just draw the room.' },
  { name: "persistKey",          type: "string",                               default: "—",        desc: "localStorage key for automatic plan persistence." },
  { name: "onSave",              type: "(plan: PlanExport) => Promise<void>",  default: "—",        desc: "Called on Save. Return a promise to show a loading state." },
  { name: "onResult",            type: "(r: TilePlannerResult | null) => void", default: "—",       desc: "Fires ~300 ms after every change with tile count, boxes, area. Use to update cart or price." },
  { name: "initialPlan",         type: "PlanExport",                            default: "—",        desc: "Pre-load a saved plan on mount." },
  { name: "theme",               type: "PlannerTheme",                          default: "—",        desc: "CSS custom-property overrides for colours and font." },
  { name: "config.showReset",    type: "boolean",                               default: "false",    desc: 'Show "New plan" reset button. Off by default — enable in internal tools.' },
  { name: "config.showShare",    type: "boolean",                               default: "false",    desc: 'Show "Copy share link" button. Off by default.' },
  { name: "config.showExports",  type: "boolean",                               default: "false",    desc: "Show PDF / PNG / JSON export buttons. Off by default." },
  { name: "config.showMaterialEstimator", type: "boolean",                      default: "false",    desc: "Show the material cost estimator panel. Off by default." },
  { name: "compact",             type: "boolean",                               default: "false",    desc: "Hide sidebar; show a slim bottom bar + slide-up panel instead. Auto-enabled on mobile." },
];

function ApiReference() {
  return (
    <section className="bg-forest py-24">
      <div className="container">
        <p className="text-eyebrow text-lime/60">API reference</p>
        <h2 className="mt-2 text-display-sm text-paper">API options</h2>
        <p className="mt-3 max-w-xl text-lead text-paper/60">
          All options are optional — the planner works with zero config.
          The same options are accepted by{" "}
          <code className="rounded bg-paper/10 px-1.5 font-mono text-xs text-lime">&lt;PlannerCore /&gt;</code>{" "}
          as props.
        </p>

        <div className="mt-10 overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
          <div className="min-w-[700px]">
            <div
              className="grid grid-cols-[220px_200px_1fr] gap-4 px-5 py-3 font-mono text-[10px] uppercase tracking-widest"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}
            >
              <span>option</span>
              <span>type</span>
              <span>description</span>
            </div>
            {MOUNT_OPTS.map((p, i) => (
              <div
                key={p.name}
                className="grid grid-cols-[220px_200px_1fr] gap-4 px-5 py-4 text-xs"
                style={{
                  borderTop: i > 0 ? "1px solid rgba(255,255,255,0.07)" : undefined,
                  background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.03)",
                }}
              >
                <span className="font-mono font-bold text-lime">{p.name}</span>
                <span className="font-mono text-paper/70">{p.type}</span>
                <div>
                  <span className="mr-2 rounded px-1.5 py-0.5 font-mono text-[10px] text-paper/40" style={{ background: "rgba(255,255,255,0.06)" }}>
                    default: {p.default}
                  </span>
                  <span className="text-paper/60">{p.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Return value — handle */}
        <div className="mt-8">
          <p className="mb-3 font-mono text-xs text-paper/40">Both mount functions return a handle</p>
          <Terminal title="types.d.ts">
            <div className="space-y-0.5">
              <CodeLine n={1}>{kw("interface")} {ty("TilePlannerHandle")} {pl("{")}</CodeLine>
              <CodeLine n={2}>{pl("  ")}{fn_("unmount")}{pl(": () => ")}{ty("void")}{pl(";")}{cm("                              // remove from DOM")}</CodeLine>
              <CodeLine n={3}>{pl("  ")}{fn_("update")}{pl("(partial: ")}{ty("Partial<MountOptions>")}{pl("): ")}{ty("void")}{pl(";")}{cm("  // live-update config, no remount")}</CodeLine>
              <CodeLine n={4}>{pl("}")}</CodeLine>
            </div>
          </Terminal>
        </div>

        {/* PlanExport type + theming */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-3 font-mono text-xs text-paper/40">PlanExport — the object passed to onSave</p>
            <Terminal title="types.d.ts">
              <div className="space-y-0.5">
                <CodeLine n={1}>{kw("interface")} {ty("PlanExport")} {pl("{")}</CodeLine>
                <CodeLine n={2}>{pl("  ")}{fn_("version")}{pl(": ")}{ty("number")}{pl(";")}</CodeLine>
                <CodeLine n={3}>{pl("  ")}{fn_("planType")}{pl(": ")}{str('"garden" | "indoor"')}{pl(";")}</CodeLine>
                <CodeLine n={4}>{pl("  ")}{fn_("exportedAt")}{pl(": ")}{ty("string")}{pl(";")} {cm("// ISO 8601")}</CodeLine>
                <CodeLine n={5}>{pl("  ")}{fn_("shape")}{pl(": { vertices: ")}{ty("Vertex[]")}{pl("; offset: ")}{ty("Vertex")}{pl(" };")}</CodeLine>
                <CodeLine n={6}>{pl("  ")}{fn_("tiles")}{pl(": {")}</CodeLine>
                <CodeLine n={7}>{pl("    ")}{fn_("size")}{pl(": ")}{ty("TileSize")}{pl(";")}</CodeLine>
                <CodeLine n={8}>{pl("    ")}{fn_("herringbone")}{pl(": ")}{ty("boolean")}{pl(";")}</CodeLine>
                <CodeLine n={9}>{pl("    ")}{fn_("herringboneRotation")}{pl(": ")}{ty("0 | 45 | 90 | 135")}{pl(";")}</CodeLine>
                <CodeLine n={10}>{pl("    ")}{fn_("groutMm")}{pl(": ")}{ty("number")}{pl(";")}</CodeLine>
                <CodeLine n={11}>{pl("  };")}</CodeLine>
                <CodeLine n={12}>{pl("}")}</CodeLine>
              </div>
            </Terminal>
          </div>

          <div>
            <p className="mb-3 font-mono text-xs text-paper/40">Theming — override any colour token</p>
            <Terminal title="app.js">
              <div className="space-y-0.5">
                <CodeLine n={1}>{fn_("mountTilePlanner")}{pl("(el, {")}</CodeLine>
                <CodeLine n={2}>{pl("  ")}{fn_("planType")}{pl(": ")}{str('"garden"')}{pl(",")}</CodeLine>
                <CodeLine n={3}>{pl("  ")}{fn_("theme")}{pl(": {")}</CodeLine>
                <CodeLine n={4}>{pl("    ")}{fn_("primary")}{pl(":  ")}{str('"#6366f1"')}{pl(",")}{cm("  // indigo")}</CodeLine>
                <CodeLine n={5}>{pl("    ")}{fn_("highlight")}{pl(": ")}{str('"#f59e0b"')}{pl(",")}{cm("  // amber")}</CodeLine>
                <CodeLine n={6}>{pl("    ")}{fn_("fontFamily")}{pl(": ")}{str('"Inter, sans-serif"')}{pl(",")}</CodeLine>
                <CodeLine n={7}>{pl("  },")}</CodeLine>
                <CodeLine n={8}>{pl("});")}</CodeLine>
              </div>
            </Terminal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="bg-canvas py-24 text-center">
      <div className="container max-w-2xl">
        <p className="text-eyebrow text-muted">Get started</p>
        <h2 className="mt-3 text-display-sm text-ink">Ready to embed?</h2>
        <p className="mt-4 text-lead text-muted">
          One function call away. Works without a build step via CDN, or install the npm package and integrate with your stack.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/tile-plan" className="rounded-lg bg-forest px-6 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90">
            Open planner →
          </Link>
          <Link href="#demo" className="rounded-lg border border-line px-6 py-3 text-sm font-semibold text-muted transition-colors hover:border-forest/30 hover:text-ink">
            Back to demo
          </Link>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <div className="inline-flex items-center gap-3 rounded-lg border border-line bg-paper px-5 py-3 font-mono text-sm text-muted">
            <span className="text-leaf text-xs">CDN</span>
            cdn.bloomy.garden
          </div>
          <div className="inline-flex items-center gap-3 rounded-lg border border-line bg-paper px-5 py-3 font-mono text-sm text-muted">
            <span className="text-leaf">$</span>
            npm install @bloomy/tile-planner
          </div>
        </div>
      </div>
    </section>
  );
}

export default function TilePlannerLandingPage() {
  return (
    <div className="overflow-x-hidden">
      <Hero />
      <FeatureStrip />
      <HowItWorks />
      <Advantages />
      <div id="demo">
        <InteractiveDemo />
      </div>
      <ApiReference />
      <Cta />
    </div>
  );
}
