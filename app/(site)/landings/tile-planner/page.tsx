import type { Metadata } from "next";
import Link from "next/link";
import { InteractiveDemo } from "./InteractiveDemo";
import { FrameworkTabs } from "./FrameworkTabs";

export const metadata: Metadata = {
  title: "Tile Planner — Embed anywhere",
  description: "Drop a fully-featured interactive tile planner into any web project. Vanilla JS, React, Vue, jQuery — no backend required.",
};

const CB  = "#0d2414";   // code block background
const CBB = "rgba(255,255,255,0.07)"; // code block header
const BR  = "rgba(255,255,255,0.10)"; // border on dark

function Terminal({ title = "terminal", minHeight, children }: { title?: string; minHeight?: number; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl" style={{ background: CB, border: `1px solid ${BR}` }}>
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${BR}`, background: CBB }}>
        <span className="h-2 w-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        <span className="h-2 w-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        <span className="h-2 w-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        <span className="ml-3 font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{title}</span>
      </div>
      <div className="overflow-x-auto p-5 font-mono text-sm" style={{ color: "#e8f5e9", minHeight }}>
        {children}
      </div>
    </div>
  );
}

function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span style={{ color: "#a8e6a3" }}>$</span>
      <span style={{ color: "#e8f5e9" }}>{children}</span>
    </div>
  );
}

function kw(s: string)  { return <span style={{ color: "#ff79c6" }}>{s}</span>; }
function str(s: string) { return <span style={{ color: "#f1fa8c" }}>{s}</span>; }
function fn_(s: string) { return <span style={{ color: "#a8e6a3" }}>{s}</span>; }
function ty(s: string)  { return <span style={{ color: "#8be9fd" }}>{s}</span>; }
function cm(s: string)  { return <span style={{ color: "#6a9e6a" }}>{s}</span>; }
function pl(s: string)  { return <span style={{ color: "#e8f5e9" }}>{s}</span>; }

function CodeLine({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 leading-6">
      <span className="w-5 shrink-0 select-none text-right text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>{n}</span>
      <span className="whitespace-pre text-xs">{children}</span>
    </div>
  );
}

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
        <div className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <span className="h-1.5 w-1.5 rounded-full bg-lime" />
          <span className="font-mono text-[11px] text-paper/70">@bloomy/bloomy-planner</span>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-display-xl text-paper">
              Tile<br />
              <span className="text-lime">Planner</span>
            </h1>
            <p className="mt-6 text-lead text-paper/60">
              A complete interactive tile planner you can embed in any web project.
              Vanilla JS, React, Vue, jQuery — one function call, no backend required.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Vanilla JS", "React", "Vue", "jQuery", "TypeScript", "Zero backend"].map((t) => (
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
            <Terminal title="bash">
              <Prompt>npm install @bloomy/bloomy-planner</Prompt>
              <div className="mt-4 space-y-0.5">
                <CodeLine n={1}>{kw("import")} {pl("{ ")}{fn_("mountTilePlanner")}{pl(" }")} {kw("from")} {str('"@bloomy/bloomy-planner"')}{pl(";")}</CodeLine>
                <CodeLine n={2}>{pl("")}</CodeLine>
                <CodeLine n={3}>{fn_("mountTilePlanner")}{pl("(")}</CodeLine>
                <CodeLine n={4}>{pl("  ")}{ty("document")}{pl(".")}{fn_("getElementById")}{pl("(")}{str('"planner"')}{pl("),")}</CodeLine>
                <CodeLine n={5}>{pl("  { ")}{fn_("planType")}{pl(": ")}{str('"garden"')}{pl(",")}{pl(" ")}{fn_("persistKey")}{pl(": ")}{str('"my-plan"')}{pl(" }")}</CodeLine>
                <CodeLine n={6}>{pl(");")}</CodeLine>
              </div>
            </Terminal>

            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-paper/40">or with React</p>
              <p className="font-mono text-xs text-paper/70">
                {`<PlannerCore planType="garden" persistKey="my-plan" />`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const PILLS = [
  "mountTilePlanner()", "5 install patterns", "Herringbone",
  "Running bond", "Diagonal", "Chess colour", "PDF export",
  "PNG export", "JSON import / export", "Grout gap control",
  "Cut-piece FFD", "Custom tile sizes", "localStorage persist",
  "TypeScript types", "onSave callback", "Themeable",
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
              <span className="font-mono text-xs text-muted">install</span>
            </div>
            <Terminal title="bash" minHeight={168}>
              <Prompt>npm install @bloomy/bloomy-planner</Prompt>
            </Terminal>
            <p className="mt-3 text-sm text-muted">Single package — no peer deps beyond React itself (used internally).</p>
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
            <Terminal title="app.js" minHeight={168}>
              <div className="space-y-0.5">
                <CodeLine n={1}>{kw("import")} {pl("{ ")}{fn_("mountTilePlanner")}{pl(" }")} {kw("from")}</CodeLine>
                <CodeLine n={2}>{pl("  ")}{str('"@bloomy/bloomy-planner"')}{pl(";")}</CodeLine>
                <CodeLine n={3}>{pl("")}</CodeLine>
                <CodeLine n={4}>{fn_("mountTilePlanner")}{pl("(")}</CodeLine>
                <CodeLine n={5}>{pl("  ")}{ty("document")}{pl(".")}{fn_("getElementById")}{pl("(")}{str('"planner"')}{pl("),")}</CodeLine>
                <CodeLine n={6}>{pl("  { ")}{fn_("planType")}{pl(": ")}{str('"garden"')}{pl(" }")}</CodeLine>
                <CodeLine n={7}>{pl(");")}</CodeLine>
              </div>
            </Terminal>
            <p className="mt-3 text-sm text-muted">Returns an unmount function — call it to clean up.</p>
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

const FEATURES = [
  {
    icon: "⊞",
    tag: "Material calc",
    title: "Precise tile count — always",
    body: "Full tiles and cut pieces calculated on every canvas change. Order exactly what you need with configurable waste buffer (+10% or +15%).",
  },
  {
    icon: "✂",
    tag: "FFD algorithm",
    title: "Cut-piece reuse",
    body: "Offcuts are binned and reused via First Fit Decreasing. Tiles cut for one edge are automatically reused elsewhere — fewer tiles purchased.",
  },
  {
    icon: "↗",
    tag: "Export",
    title: "PDF · PNG · JSON",
    body: "Client-side PDF via jsPDF, PNG via canvas, and a structured JSON format you can import, re-open, or store in your own database.",
  },
  {
    icon: "⟡",
    tag: "Headless saves",
    title: "Bring your own backend",
    body: "Pass an onSave callback and persist however you like — your API, Supabase, localStorage. No lock-in, no opinions.",
  },
  {
    icon: "⊙",
    tag: "Patterns",
    title: "5 installation patterns",
    body: "Straight, running bond, diagonal, chess colour mode, and herringbone (rotatable at 0 / 45 / 90 / 135°). Tile-size guards enforce valid combinations.",
  },
  {
    icon: "∅",
    tag: "TypeScript",
    title: "Fully typed surface",
    body: "PlannerConfig, PlanExport, MountOptions — all exported. Parse saved plans with the included Zod schema.",
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
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest/8 font-mono text-base text-forest">
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
  { name: "planType",    type: '"garden" | "indoor"',          default: '"garden"',   desc: "Starting shape and default tile preset." },
  { name: "persistKey",  type: "string",                       default: "—",          desc: "localStorage key for automatic plan persistence." },
  { name: "onSave",      type: "(plan: PlanExport) => Promise<void>", default: "—",  desc: "Called on Save. Return a promise to show a loading state." },
  { name: "initialPlan", type: "PlanExport",                   default: "—",          desc: "Pre-load a saved plan on mount." },
  { name: "theme",       type: "PlannerTheme",                 default: "—",          desc: "CSS custom-property overrides for colours and font." },
];

function ApiReference() {
  return (
    <section className="bg-forest py-24">
      <div className="container">
        <p className="text-eyebrow text-lime/60">API reference</p>
        <h2 className="mt-2 text-display-sm text-paper">mountTilePlanner options</h2>
        <p className="mt-3 max-w-xl text-lead text-paper/60">
          All options are optional — the planner works with zero config.
          The same options are accepted by{" "}
          <code className="rounded bg-paper/10 px-1.5 font-mono text-xs text-lime">&lt;PlannerCore /&gt;</code>{" "}
          as props.
        </p>

        <div className="mt-10 overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
          <div className="min-w-[580px]">
            <div
              className="grid grid-cols-[180px_220px_1fr] gap-4 px-5 py-3 font-mono text-[10px] uppercase tracking-widest"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}
            >
              <span>option</span>
              <span>type</span>
              <span>description</span>
            </div>
            {MOUNT_OPTS.map((p, i) => (
              <div
                key={p.name}
                className="grid grid-cols-[180px_220px_1fr] gap-4 px-5 py-4 text-xs"
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

        {/* PlanExport type + theming */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
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
        <div className="mt-10 inline-flex items-center gap-3 rounded-lg border border-line bg-paper px-5 py-3 font-mono text-sm text-muted">
          <span className="text-leaf">$</span>
          npm install @bloomy/bloomy-planner
        </div>
      </div>
    </section>
  );
}

export default function TilePlannerLandingPage() {
  return (
    <>
      <Hero />
      <FeatureStrip />
      <HowItWorks />
      <Advantages />
      <div id="demo">
        <InteractiveDemo />
      </div>
      <ApiReference />
      <Cta />
    </>
  );
}
