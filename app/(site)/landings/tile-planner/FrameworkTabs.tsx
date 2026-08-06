"use client";

import { useState } from "react";
import { ToggleButton } from "@/components/ui/toggle-button";

const CB  = "#0d2414";
const CBB = "rgba(255,255,255,0.08)";
const BR  = "rgba(255,255,255,0.10)";

function kw(s: string)   { return <span style={{ color: "#ff79c6" }}>{s}</span>; }
function str(s: string)  { return <span style={{ color: "#f1fa8c" }}>{s}</span>; }
function fn_(s: string)  { return <span style={{ color: "#a8e6a3" }}>{s}</span>; }
function ty(s: string)   { return <span style={{ color: "#8be9fd" }}>{s}</span>; }
function cm(s: string)   { return <span style={{ color: "#6a9e6a" }}>{s}</span>; }
function pl(s: string)   { return <span style={{ color: "#e8f5e9" }}>{s}</span>; }

function Line({ children, n }: { children: React.ReactNode; n: number }) {
  return (
    <div className="flex gap-4 leading-6">
      <span className="w-5 shrink-0 select-none text-right text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>{n}</span>
      <span className="whitespace-pre-wrap break-words text-xs lg:whitespace-pre lg:break-normal">{children}</span>
    </div>
  );
}

function Terminal({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl" style={{ background: CB, border: `1px solid ${BR}` }}>
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${BR}`, background: CBB }}>
        <span className="h-2 w-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        <span className="h-2 w-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        <span className="h-2 w-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        <span className="ml-3 font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{title}</span>
      </div>
      <div className="overflow-auto p-5 font-mono" style={{ minHeight: 220 }}>
        {children}
      </div>
    </div>
  );
}

const TABS = ["JS", "jQuery", "React", "Vue"] as const;
type Tab = typeof TABS[number];

const SNIPPETS: Record<Tab, { file: string; code: React.ReactNode }> = {
  JS: {
    file: "app.js",
    code: (
      <div className="space-y-0.5">
        <Line n={1}>{cm("// Works with any JS framework or plain HTML")}</Line>
        <Line n={2}>{kw("import")} {pl("{ ")}{fn_("mountTilePlanner")}{pl(" }")} {kw("from")} {str('"@bloomy/bloomy-planner"')}{pl(";")}</Line>
        <Line n={3}>{pl("")}</Line>
        <Line n={4}>{kw("const")} {pl("el =")} {ty("document")}{pl(".")}{fn_("getElementById")}{pl("(")}{str('"planner"')}{pl(");")}</Line>
        <Line n={5}>{pl("")}</Line>
        <Line n={6}>{kw("const")} {pl("unmount =")} {fn_("mountTilePlanner")}{pl("(el, {")}</Line>
        <Line n={7}>{pl("  ")}{fn_("planType")}{pl(": ")}{str('"garden"')}{pl(",")}</Line>
        <Line n={8}>{pl("  ")}{fn_("persistKey")}{pl(": ")}{str('"my-plan"')}{pl(",")}</Line>
        <Line n={9}>{pl("  ")}{fn_("onSave")}{pl(": async (plan) => {")}</Line>
        <Line n={10}>{pl("    ")}{kw("await")} {fn_("fetch")}{pl("(")}{str('"/api/plans"')}{pl(", { method: ")}{str('"POST"')}{pl(", body: ")}{ty("JSON")}{pl(".")}{fn_("stringify")}{pl("(plan) });")}</Line>
        <Line n={11}>{pl("  },")}</Line>
        <Line n={12}>{pl("});")}</Line>
        <Line n={13}>{pl("")}</Line>
        <Line n={14}>{cm("// Call unmount() to remove the planner")}</Line>
      </div>
    ),
  },
  jQuery: {
    file: "app.js",
    code: (
      <div className="space-y-0.5">
        <Line n={1}>{cm("// Pass the raw DOM element — jQuery's [0] unwraps it")}</Line>
        <Line n={2}>{kw("import")} {pl("{ ")}{fn_("mountTilePlanner")}{pl(" }")} {kw("from")} {str('"@bloomy/bloomy-planner"')}{pl(";")}</Line>
        <Line n={3}>{pl("")}</Line>
        <Line n={4}>{fn_("$")}{pl("(")}{str('"#planner"')}{pl(").")}{fn_("ready")}{pl("(function () {")}</Line>
        <Line n={5}>{pl("  ")}{kw("const")} {pl("unmount =")} {fn_("mountTilePlanner")}{pl("(")}</Line>
        <Line n={6}>{pl("    ")}{fn_("$")}{pl("(")}{str('"#planner"')}{pl(")[0],")}</Line>
        <Line n={7}>{pl("    ")}{pl("{ ")}{fn_("planType")}{pl(": ")}{str('"garden"')}{pl(",")}{pl(" ")}{fn_("persistKey")}{pl(": ")}{str('"my-plan"')}{pl(" }")}</Line>
        <Line n={8}>{pl("  );")}</Line>
        <Line n={9}>{pl("});")}</Line>
      </div>
    ),
  },
  React: {
    file: "Planner.tsx",
    code: (
      <div className="space-y-0.5">
        <Line n={1}>{cm("// Works in React, Next.js, Remix, etc.")}</Line>
        <Line n={2}>{kw("import")} {pl("{ ")}{fn_("useRef")}{pl(", ")}{fn_("useEffect")}{pl(" }")} {kw("from")} {str('"react"')}{pl(";")}</Line>
        <Line n={3}>{kw("import")} {pl("{ ")}{fn_("mountTilePlanner")}{pl(" }")} {kw("from")} {str('"@bloomy/bloomy-planner"')}{pl(";")}</Line>
        <Line n={4}>{pl("")}</Line>
        <Line n={5}>{kw("export default function")} {fn_("Planner")}{pl("() {")}</Line>
        <Line n={6}>{pl("  ")}{kw("const")} {pl("ref =")} {fn_("useRef")}{pl("(null);")}</Line>
        <Line n={7}>{pl("  ")}{fn_("useEffect")}{pl("(")}</Line>
        <Line n={8}>{pl("    () => ")}{fn_("mountTilePlanner")}{pl("(ref.current, {")}</Line>
        <Line n={9}>{pl("      ")}{fn_("planType")}{pl(": ")}{str('"garden"')}{pl(",")}</Line>
        <Line n={10}>{pl("      ")}{fn_("persistKey")}{pl(": ")}{str('"my-plan"')}{pl(",")}</Line>
        <Line n={11}>{pl("    }), []")}</Line>
        <Line n={12}>{pl("  );")}</Line>
        <Line n={13}>{pl("  ")}{kw("return")} {pl("<")}{ty("div")} {fn_("ref")}{pl("={ref} style={{ height: ")}{str('"600px"')}{pl(" }} />;")}</Line>
        <Line n={14}>{pl("}")}</Line>
      </div>
    ),
  },
  Vue: {
    file: "Planner.vue",
    code: (
      <div className="space-y-0.5">
        <Line n={1}>{pl("<")}{ty("template")}{pl(">")}</Line>
        <Line n={2}>{pl("  <")}{ty("div")}{pl(" ")}{fn_("ref")}{pl("=")}{str('"container"')}{pl(" ")}{fn_("style")}{pl("=")}{str('"height:600px"')}{pl(" />")}</Line>
        <Line n={3}>{pl("</")} {ty("template")}{pl(">")}</Line>
        <Line n={4}>{pl("")}</Line>
        <Line n={5}>{pl("<")}{ty("script setup")}{pl(">")}</Line>
        <Line n={6}>{kw("import")} {pl("{ ")}{fn_("mountTilePlanner")}{pl(" }")} {kw("from")} {str('"@bloomy/bloomy-planner"')}{pl(";")}</Line>
        <Line n={7}>{kw("import")} {pl("{ ")}{fn_("ref")}{pl(", ")}{fn_("onMounted")}{pl(", ")}{fn_("onUnmounted")}{pl(" }")} {kw("from")} {str('"vue"')}{pl(";")}</Line>
        <Line n={8}>{pl("")}</Line>
        <Line n={9}>{kw("const")} {pl("container =")} {fn_("ref")}{pl("(null);")}</Line>
        <Line n={10}>{kw("let")} {pl("unmount;")}</Line>
        <Line n={11}>{fn_("onMounted")}{pl("(()  => unmount =")} {fn_("mountTilePlanner")}{pl("(container.value, {")}</Line>
        <Line n={12}>{pl("  ")}{fn_("planType")}{pl(": ")}{str('"garden"')}{pl(",")}{pl(" ")}{fn_("persistKey")}{pl(": ")}{str('"my-plan"')}{pl(" }));")}</Line>
        <Line n={13}>{fn_("onUnmounted")}{pl("(() => unmount?.());")}</Line>
        <Line n={14}>{pl("</")} {ty("script")}{pl(">")}</Line>
      </div>
    ),
  },
};

export function FrameworkTabs() {
  const [tab, setTab] = useState<Tab>("JS");
  const snippet = SNIPPETS[tab];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted">Framework:</span>
        <div className="flex gap-1.5">
          {TABS.map((t) => (
            <ToggleButton key={t} active={tab === t} onClick={() => setTab(t)} className="px-3 py-1 text-xs">
              {t}
            </ToggleButton>
          ))}
        </div>
      </div>
      <Terminal title={snippet.file}>{snippet.code}</Terminal>
    </div>
  );
}
