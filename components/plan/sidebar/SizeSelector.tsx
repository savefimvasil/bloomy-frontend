"use client";

import { useState } from "react";
import type { TileSize } from "@/lib/plan/types";
import type { SizeDef } from "@/lib/plan/config/types";

interface Props {
  sizes: SizeDef[];
  tileSize: TileSize;
  onSelect: (size: TileSize) => void;
}

const btnBase = "rounded border px-2.5 py-1.5 text-xs font-medium transition";
const activeBtn = `${btnBase} border-leaf bg-leaf/15 text-forest`;
const inactiveBtn = `${btnBase} border-line bg-paper text-muted hover:border-leaf/50`;

export function SizeSelector({ sizes, tileSize, onSelect }: Props) {
  const [customW, setCustomW] = useState("600");
  const [customH, setCustomH] = useState("600");

  function applyCustom() {
    const w = parseFloat(customW) / 1000;
    const h = parseFloat(customH) / 1000;
    if (isFinite(w) && isFinite(h) && w > 0 && h > 0) {
      onSelect({ kind: "custom", width: w, height: h });
    }
  }

  const activeKind = tileSize.kind;

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Size</p>
      <div className="flex flex-wrap gap-1.5">
        {sizes.map(s => (
          <button
            key={s.key}
            onClick={() => onSelect({ kind: s.key })}
            className={activeKind === s.key ? activeBtn : inactiveBtn}
          >
            {s.label}
          </button>
        ))}
        <button
          onClick={applyCustom}
          className={activeKind === "custom" ? activeBtn : inactiveBtn}
        >
          Custom
        </button>
      </div>
      {activeKind === "custom" && (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number" min="50" max="3000" step="10"
            value={customW}
            onChange={e => setCustomW(e.target.value)}
            onBlur={applyCustom}
            onKeyDown={e => e.key === "Enter" && applyCustom()}
            className="w-full rounded border border-line bg-paper px-2 py-1 text-xs text-ink outline-none focus:border-leaf"
            placeholder="W mm"
          />
          <span className="text-xs text-muted">×</span>
          <input
            type="number" min="50" max="3000" step="10"
            value={customH}
            onChange={e => setCustomH(e.target.value)}
            onBlur={applyCustom}
            onKeyDown={e => e.key === "Enter" && applyCustom()}
            className="w-full rounded border border-line bg-paper px-2 py-1 text-xs text-ink outline-none focus:border-leaf"
            placeholder="H mm"
          />
          <span className="text-xs text-muted">mm</span>
        </div>
      )}
    </div>
  );
}
