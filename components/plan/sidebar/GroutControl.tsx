"use client";

import type { PlannerAction } from "@/lib/plan/types";

interface Props {
  groutMm: number;
  dispatch: React.Dispatch<PlannerAction>;
}

export function GroutControl({ groutMm, dispatch }: Props) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Grout gap</p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => dispatch({ type: "SET_GROUT", groutMm: groutMm - 1 })}
          disabled={groutMm <= 0}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-line bg-paper text-sm text-muted transition hover:border-leaf/50 disabled:opacity-30"
        >−</button>
        <span className="flex-1 text-center text-xs font-medium text-ink">{groutMm} mm</span>
        <button
          onClick={() => dispatch({ type: "SET_GROUT", groutMm: groutMm + 1 })}
          disabled={groutMm >= 6}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-line bg-paper text-sm text-muted transition hover:border-leaf/50 disabled:opacity-30"
        >+</button>
      </div>
    </div>
  );
}
