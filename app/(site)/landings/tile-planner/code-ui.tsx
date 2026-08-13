/** Shared dark-code-panel primitives for the tile-planner landing page. */

export const CB  = "#0d2414";                    // panel background
export const BR  = "rgba(255,255,255,0.10)";     // border on dark
export const CBB = "rgba(255,255,255,0.07)";     // panel header background

// ── Syntax-highlight colour values ───────────────────────────────────────────
export const C_KW  = "#ff79c6";                  // keyword — pink
export const C_STR = "#f1fa8c";                  // string — yellow
export const C_FN  = "#a8e6a3";                  // function / value — light green
export const C_TY  = "#8be9fd";                  // type / key — cyan
export const C_CM  = "#6a9e6a";                  // comment — muted green
export const C_PL  = "#e8f5e9";                  // plain — near-white green
export const C_NUM = "#bd93f9";                  // number — purple
export const C_DIM = "rgba(255,255,255,0.25)";   // dim — low-opacity white

// ── Syntax-highlight helpers ──────────────────────────────────────────────────
export const kw  = (s: string) => <span style={{ color: C_KW  }}>{s}</span>;
export const str = (s: string) => <span style={{ color: C_STR }}>{s}</span>;
export const fn_ = (s: string) => <span style={{ color: C_FN  }}>{s}</span>;
export const ty  = (s: string) => <span style={{ color: C_TY  }}>{s}</span>;
export const cm  = (s: string) => <span style={{ color: C_CM  }}>{s}</span>;
export const pl  = (s: string) => <span style={{ color: C_PL  }}>{s}</span>;

// ── CodeLine ──────────────────────────────────────────────────────────────────
export function CodeLine({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 leading-6">
      <span className="w-6 shrink-0 select-none text-right text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>{n}</span>
      <span className="whitespace-pre-wrap break-words text-xs lg:whitespace-pre lg:break-normal">{children}</span>
    </div>
  );
}

// ── Terminal panel ────────────────────────────────────────────────────────────
export function Terminal({
  title = "terminal",
  minHeight,
  children,
}: {
  title?: string;
  minHeight?: number;
  children: React.ReactNode;
}) {
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
