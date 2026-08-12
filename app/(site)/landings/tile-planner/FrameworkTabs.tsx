"use client";

import { useState } from "react";
import { ToggleButton } from "@/components/ui/toggle-button";
import { kw, str, fn_, ty, cm, pl, CodeLine, Terminal } from "./code-ui";

const TABS = ["CDN", "JS", "React", "Vue"] as const;
type Tab = typeof TABS[number];

const SNIPPETS: Record<Tab, { file: string; code: React.ReactNode }> = {
  CDN: {
    file: "index.html",
    code: (
      <div className="space-y-0.5">
        <CodeLine n={1}>{cm("<!-- 1. Load styles + bundle — no build step -->")}</CodeLine>
        <CodeLine n={2}>{pl("<")}{ty("link")}{pl(" ")}{fn_("rel")}{pl("=")}{str('"stylesheet"')}</CodeLine>
        <CodeLine n={3}>{pl("     ")}{fn_("href")}{pl("=")}{str('"https://cdn.bloomy.garden/tile-planner.css"')}{pl(">")}</CodeLine>
        <CodeLine n={4}>{pl("<")}{ty("script")}{pl(" ")}{fn_("src")}{pl("=")}{str('"https://cdn.bloomy.garden/tile-planner.js"')}{pl("></")}{ty("script")}{pl(">")}</CodeLine>
        <CodeLine n={5}>{pl("")}</CodeLine>
        <CodeLine n={6}>{cm("<!-- 2. Container — size it however you like -->")}</CodeLine>
        <CodeLine n={7}>{pl("<")}{ty("div")}{pl(" ")}{fn_("id")}{pl("=")}{str('"planner"')}{pl(" ")}{fn_("style")}{pl("=")}{str('"height:600px"')}{pl("></")}{ty("div")}{pl(">")}</CodeLine>
        <CodeLine n={8}>{pl("")}</CodeLine>
        <CodeLine n={9}>{cm("<!-- 3. Mount -->")}</CodeLine>
        <CodeLine n={10}>{pl("<")}{ty("script")}{pl(">")}</CodeLine>
        <CodeLine n={11}>{pl("  ")}{ty("BloomyPlanner")}{pl(".")}{fn_("mount")}{pl("(")}{str('"#planner"')}{pl(", {")}</CodeLine>
        <CodeLine n={12}>{pl("    ")}{fn_("token")}{pl(":    ")}{str('"emb_yourtoken"')}{pl(",")}</CodeLine>
        <CodeLine n={13}>{pl("    ")}{fn_("planType")}{pl(": ")}{str('"garden"')}{pl(",")}</CodeLine>
        <CodeLine n={14}>{pl("    ")}{fn_("onResult")}{pl(": function(r) {")}</CodeLine>
        <CodeLine n={15}>{pl("      ")}{kw("if")} {pl("(r) console.")}{fn_("log")}{pl("(r.tiles, r.boxes);")}</CodeLine>
        <CodeLine n={16}>{pl("    },")}</CodeLine>
        <CodeLine n={17}>{pl("  });")}</CodeLine>
        <CodeLine n={18}>{pl("</")} {ty("script")}{pl(">")}</CodeLine>
      </div>
    ),
  },
  JS: {
    file: "app.js",
    code: (
      <div className="space-y-0.5">
        <CodeLine n={1}>{cm("// Works with any framework or plain HTML")}</CodeLine>
        <CodeLine n={2}>{kw("import")} {pl("{ ")}{fn_("mountTilePlanner")}{pl(" }")} {kw("from")} {str('"@bloomy/tile-planner"')}{pl(";")}</CodeLine>
        <CodeLine n={3}>{pl("")}</CodeLine>
        <CodeLine n={4}>{kw("const")} {pl("el =")} {ty("document")}{pl(".")}{fn_("getElementById")}{pl("(")}{str('"planner"')}{pl(");")}</CodeLine>
        <CodeLine n={5}>{pl("")}</CodeLine>
        <CodeLine n={6}>{kw("const")} {pl("{ unmount, update } =")} {fn_("mountTilePlanner")}{pl("(el, {")}</CodeLine>
        <CodeLine n={7}>{pl("  ")}{fn_("planType")}{pl(": ")}{str('"garden"')}{pl(",")}</CodeLine>
        <CodeLine n={8}>{pl("  ")}{fn_("persistKey")}{pl(": ")}{str('"my-plan"')}{pl(",")}</CodeLine>
        <CodeLine n={9}>{pl("  ")}{fn_("onSave")}{pl(": async (plan) => {")}</CodeLine>
        <CodeLine n={10}>{pl("    ")}{kw("await")} {fn_("fetch")}{pl("(")}{str('"/api/plans"')}{pl(", { method: ")}{str('"POST"')}{pl(",")}</CodeLine>
        <CodeLine n={11}>{pl("      body: ")}{ty("JSON")}{pl(".")}{fn_("stringify")}{pl("(plan) });")}</CodeLine>
        <CodeLine n={12}>{pl("  },")}</CodeLine>
        <CodeLine n={13}>{pl("});")}</CodeLine>
        <CodeLine n={14}>{pl("")}</CodeLine>
        <CodeLine n={15}>{cm("// unmount() cleans up; update(partial) changes config live")}</CodeLine>
      </div>
    ),
  },
  React: {
    file: "Planner.tsx",
    code: (
      <div className="space-y-0.5">
        <CodeLine n={1}>{cm("// Works in React, Next.js, Remix, etc.")}</CodeLine>
        <CodeLine n={2}>{kw("import")} {pl("{ ")}{fn_("useRef")}{pl(", ")}{fn_("useEffect")}{pl(" }")} {kw("from")} {str('"react"')}{pl(";")}</CodeLine>
        <CodeLine n={3}>{kw("import")} {pl("{ ")}{fn_("mountTilePlanner")}{pl(" }")} {kw("from")} {str('"@bloomy/tile-planner"')}{pl(";")}</CodeLine>
        <CodeLine n={4}>{pl("")}</CodeLine>
        <CodeLine n={5}>{kw("export default function")} {fn_("Planner")}{pl("() {")}</CodeLine>
        <CodeLine n={6}>{pl("  ")}{kw("const")} {pl("ref =")} {fn_("useRef")}{pl("(null);")}</CodeLine>
        <CodeLine n={7}>{pl("  ")}{fn_("useEffect")}{pl("(() => {")}</CodeLine>
        <CodeLine n={8}>{pl("    ")}{kw("const")} {pl("{ unmount } =")} {fn_("mountTilePlanner")}{pl("(ref.current!, {")}</CodeLine>
        <CodeLine n={9}>{pl("      ")}{fn_("planType")}{pl(": ")}{str('"garden"')}{pl(",")}</CodeLine>
        <CodeLine n={10}>{pl("      ")}{fn_("persistKey")}{pl(": ")}{str('"my-plan"')}{pl(",")}</CodeLine>
        <CodeLine n={11}>{pl("    });")}</CodeLine>
        <CodeLine n={12}>{pl("    ")}{kw("return")} {pl("unmount;")}{cm("  // cleanup")}</CodeLine>
        <CodeLine n={13}>{pl("  }, []);")}</CodeLine>
        <CodeLine n={14}>{pl("  ")}{kw("return")} {pl("<")}{ty("div")} {fn_("ref")}{pl("={ref} style={{ height: ")}{str('"600px"')}{pl(" }} />;")}</CodeLine>
        <CodeLine n={15}>{pl("}")}</CodeLine>
      </div>
    ),
  },
  Vue: {
    file: "Planner.vue",
    code: (
      <div className="space-y-0.5">
        <CodeLine n={1}>{pl("<")}{ty("template")}{pl(">")}</CodeLine>
        <CodeLine n={2}>{pl("  <")}{ty("div")}{pl(" ")}{fn_("ref")}{pl("=")}{str('"container"')}{pl(" ")}{fn_("style")}{pl("=")}{str('"height:600px"')}{pl(" />")}</CodeLine>
        <CodeLine n={3}>{pl("</")} {ty("template")}{pl(">")}</CodeLine>
        <CodeLine n={4}>{pl("")}</CodeLine>
        <CodeLine n={5}>{pl("<")}{ty("script setup")}{pl(">")}</CodeLine>
        <CodeLine n={6}>{kw("import")} {pl("{ ")}{fn_("mountTilePlanner")}{pl(" }")} {kw("from")} {str('"@bloomy/tile-planner"')}{pl(";")}</CodeLine>
        <CodeLine n={7}>{kw("import")} {pl("{ ")}{fn_("ref")}{pl(", ")}{fn_("onMounted")}{pl(", ")}{fn_("onUnmounted")}{pl(" }")} {kw("from")} {str('"vue"')}{pl(";")}</CodeLine>
        <CodeLine n={8}>{pl("")}</CodeLine>
        <CodeLine n={9}>{kw("const")} {pl("container =")} {fn_("ref")}{pl("(null);")}</CodeLine>
        <CodeLine n={10}>{kw("let")} {pl("handle;")}</CodeLine>
        <CodeLine n={11}>{fn_("onMounted")}{pl("(()  => handle =")} {fn_("mountTilePlanner")}{pl("(container.value, {")}</CodeLine>
        <CodeLine n={12}>{pl("  ")}{fn_("planType")}{pl(": ")}{str('"garden"')}{pl(",")}{pl(" ")}{fn_("persistKey")}{pl(": ")}{str('"my-plan"')}{pl(" }));")}</CodeLine>
        <CodeLine n={13}>{fn_("onUnmounted")}{pl("(() => handle?.unmount());")}</CodeLine>
        <CodeLine n={14}>{pl("</")} {ty("script")}{pl(">")}</CodeLine>
      </div>
    ),
  },
};

export function FrameworkTabs() {
  const [tab, setTab] = useState<Tab>("CDN");
  const snippet = SNIPPETS[tab];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted">Integration:</span>
        <div className="flex gap-1.5">
          {TABS.map((t) => (
            <ToggleButton key={t} active={tab === t} onClick={() => setTab(t)} className="px-3 py-1 text-xs">
              {t}
            </ToggleButton>
          ))}
        </div>
      </div>
      <Terminal title={snippet.file} minHeight={220}>{snippet.code}</Terminal>
    </div>
  );
}
