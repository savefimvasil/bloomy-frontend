"use client";

import type { FlooringMaterial } from "@/lib/plan/types";
import type { MaterialDef } from "@/lib/plan/config/types";

interface Props {
  materials: MaterialDef[];
  selected: FlooringMaterial;
  onSelect: (m: FlooringMaterial) => void;
}

const btnBase = "flex-1 rounded border px-3 py-1.5 text-xs font-medium transition";
const activeBtn = `${btnBase} border-leaf bg-leaf/15 text-forest`;
const inactiveBtn = `${btnBase} border-line bg-paper text-muted hover:border-leaf/50`;

export function MaterialSelector({ materials, selected, onSelect }: Props) {
  if (materials.length <= 1) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Material</p>
      <div className="flex gap-2">
        {materials.map(m => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className={selected === m.id ? activeBtn : inactiveBtn}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
