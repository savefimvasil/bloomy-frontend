"use client";

import type { Vertex, PlannerAction } from "@/lib/plan/types";

interface Props {
  vertices: Vertex[];
  dispatch: React.Dispatch<PlannerAction>;
}

export function VertexTable({ vertices, dispatch }: Props) {
  function handleChange(index: number, axis: "x" | "y", raw: string) {
    const value = parseFloat(raw);
    if (!isFinite(value)) return;
    dispatch({ type: "SET_VERTEX", index, axis, value });
  }

  return (
    <div>
      <div className="mb-1 flex items-center gap-1 px-0.5">
        <span className="w-5 shrink-0" />
        <span className="flex-1 text-center text-[10px] font-medium text-muted">X</span>
        <span className="flex-1 text-center text-[10px] font-medium text-muted">Y</span>
      </div>
      <div className="rounded border border-line bg-paper">
        {vertices.map(([x, y], i) => (
          <div key={i} className="flex items-center gap-1 border-b border-line px-1.5 py-0.5 last:border-b-0">
            <span className="w-4 shrink-0 text-center text-[10px] font-semibold text-muted">{i + 1}</span>
            <input
              type="number"
              step="0.01"
              defaultValue={x.toFixed(2)}
              key={`x-${i}-${x.toFixed(2)}`}
              onBlur={(e) => handleChange(i, "x", e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleChange(i, "x", e.currentTarget.value); }}
              className="w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-xs text-ink outline-none focus:border-leaf focus:bg-paper"
              title="X (metres)"
            />
            <input
              type="number"
              step="0.01"
              defaultValue={y.toFixed(2)}
              key={`y-${i}-${y.toFixed(2)}`}
              onBlur={(e) => handleChange(i, "y", e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleChange(i, "y", e.currentTarget.value); }}
              className="w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-xs text-ink outline-none focus:border-leaf focus:bg-paper"
              title="Y (metres)"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
