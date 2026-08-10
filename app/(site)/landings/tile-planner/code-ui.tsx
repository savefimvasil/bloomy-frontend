/** Shared dark-code-panel primitives for the tile-planner landing page. */

export const CB  = "#0d2414";                    // panel background
export const BR  = "rgba(255,255,255,0.10)";     // border on dark
export const CBB = "rgba(255,255,255,0.07)";     // panel header background

// ── Syntax-highlight helpers ──────────────────────────────────────────────────
export const kw  = (s: string) => <span style={{ color: "#ff79c6" }}>{s}</span>;
export const str = (s: string) => <span style={{ color: "#f1fa8c" }}>{s}</span>;
export const fn_ = (s: string) => <span style={{ color: "#a8e6a3" }}>{s}</span>;
export const ty  = (s: string) => <span style={{ color: "#8be9fd" }}>{s}</span>;
export const cm  = (s: string) => <span style={{ color: "#6a9e6a" }}>{s}</span>;
export const pl  = (s: string) => <span style={{ color: "#e8f5e9" }}>{s}</span>;

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
