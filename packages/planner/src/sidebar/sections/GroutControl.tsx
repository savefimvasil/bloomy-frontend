"use client";

import type { PlannerAction } from "../../lib/types";
import { Slider } from "@/components/ui/slider";

interface Props {
  groutMm: number;
  dispatch: React.Dispatch<PlannerAction>;
}

export function GroutControl({ groutMm, dispatch }: Props) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">Grout gap</p>
        <span className="text-xs font-medium text-ink tabular-nums">{groutMm} mm</span>
      </div>
      <Slider
        min={0}
        max={6}
        step={1}
        value={groutMm}
        onChange={(e) =>
          dispatch({ type: "SET_GROUT", groutMm: parseInt(e.target.value, 10) })
        }
        aria-label="Grout gap"
      />
    </div>
  );
}
