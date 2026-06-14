"use client";

import { useState } from "react";
import type { PlannerState, PlannerAction } from "@/lib/plan/types";
import {
  findOptimalOffset,
  OPTIMIZATION_CRITERIA,
  OPTIMIZATION_LABELS,
  OPTIMIZATION_DESCRIPTIONS,
  type OptimizationCriterion,
} from "@/lib/plan/optimal-patterns";
import { Button } from "@/components/ui/button";

interface Props {
  state: PlannerState;
  dispatch: React.Dispatch<PlannerAction>;
}

export function OptimizationButtons({ state, dispatch }: Props) {
  const [running, setRunning] = useState<OptimizationCriterion | null>(null);

  async function handleOptimize(criterion: OptimizationCriterion) {
    setRunning(criterion);
    // Yield to React so the disabled / running state paints before the
    // (CPU-bound) brute-force search blocks the main thread.
    await new Promise((r) => setTimeout(r, 0));
    const { offset } = findOptimalOffset(state, criterion);
    dispatch({ type: "SET_PATIO_OFFSET", offset });
    setRunning(null);
  }

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
        Auto-fit
      </p>
      <div className="grid grid-cols-2 gap-2">
        {OPTIMIZATION_CRITERIA.map((c) => (
          <Button
            key={c}
            variant="secondary"
            size="sm"
            onClick={() => handleOptimize(c)}
            disabled={running !== null || state.tooManyTiles}
            title={OPTIMIZATION_DESCRIPTIONS[c]}
            className="border-leaf bg-leaf/10 text-forest hover:bg-leaf/20"
          >
            {running === c ? "..." : OPTIMIZATION_LABELS[c]}
          </Button>
        ))}
      </div>
    </div>
  );
}
