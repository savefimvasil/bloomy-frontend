"use client";

import type { InstallationPattern } from "../../lib/types";
import type { PatternDef } from "../../lib/config/types";
import { ToggleButton } from "@/components/ui/toggle-button";

interface Props {
  patterns: PatternDef[];
  selected: InstallationPattern;
  isSquare: boolean;
  onSelect: (pattern: InstallationPattern) => void;
}

export function PatternSelector({ patterns, selected, isSquare, onSelect }: Props) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Installation</p>
      <div className="flex flex-wrap gap-1.5">
        {patterns.map(p => {
          const isDisabled = p.disabledWhen === "notSquare" && !isSquare;
          return (
            <ToggleButton
              key={p.id}
              active={selected === p.id}
              disabled={isDisabled}
              title={isDisabled ? "Requires square tile" : p.description}
              onClick={() => onSelect(p.id)}
              className="min-w-[4.5rem]"
            >
              {p.label}
            </ToggleButton>
          );
        })}
      </div>
    </div>
  );
}
