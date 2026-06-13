"use client";

import type { InstallationPattern } from "@/lib/plan/types";
import type { PatternDef } from "@/lib/plan/config/types";

interface Props {
  patterns: PatternDef[];
  selected: InstallationPattern;
  isSquare: boolean;
  onSelect: (pattern: InstallationPattern) => void;
}

const btnBase = "flex-1 min-w-[4.5rem] rounded border px-2.5 py-1.5 text-xs font-medium transition";
const activeBtn = `${btnBase} border-leaf bg-leaf/15 text-forest`;
const inactiveBtn = `${btnBase} border-line bg-paper text-muted hover:border-leaf/50`;
const disabledBtn = `${btnBase} border-line bg-paper text-muted/40 cursor-not-allowed opacity-40`;

export function PatternSelector({ patterns, selected, isSquare, onSelect }: Props) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Installation</p>
      <div className="flex flex-wrap gap-1.5">
        {patterns.map(p => {
          const isDisabled = p.disabledWhen === "notSquare" && !isSquare;
          return (
            <button
              key={p.id}
              disabled={isDisabled}
              title={isDisabled ? "Requires square tile" : p.description}
              onClick={() => onSelect(p.id)}
              className={isDisabled ? disabledBtn : selected === p.id ? activeBtn : inactiveBtn}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
