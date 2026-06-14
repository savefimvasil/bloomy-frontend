"use client";

import type { FlooringMaterial } from "@/lib/plan/types";
import type { MaterialDef } from "@/lib/plan/config/types";
import { ToggleButton } from "@/components/ui/toggle-button";

interface Props {
  materials: MaterialDef[];
  selected: FlooringMaterial;
  onSelect: (m: FlooringMaterial) => void;
}

export function MaterialSelector({ materials, selected, onSelect }: Props) {
  if (materials.length <= 1) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Material</p>
      <div className="flex gap-2">
        {materials.map(m => (
          <ToggleButton
            key={m.id}
            active={selected === m.id}
            onClick={() => onSelect(m.id)}
          >
            {m.label}
          </ToggleButton>
        ))}
      </div>
    </div>
  );
}
