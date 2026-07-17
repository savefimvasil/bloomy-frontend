"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEstimate } from "../estimateContext";
import { ZONE_CONFIGS, defaultExistingStructure } from "@bloomy/bloomy-planner";
import type { ExistingStructure, CalculationResult } from "@bloomy/bloomy-planner";
import { apiFetch } from "@/lib/api";

export default function ExistingStructuresPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { plan, constructionData, steps, currentStepIndex, updateExistingStructure, save, saving } = useEstimate();

  // Baseline from backend — gross requirements with no existing deduction
  const [baseline, setBaseline] = useState<CalculationResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/garden-projects/${id}/calculate/preview`, { method: "POST" })
      .then(res => res.ok ? res.json() : null)
      .then((data: CalculationResult | null) => { if (!cancelled) setBaseline(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [id]);

  function getStructure(zoneId: string): ExistingStructure {
    const s = constructionData.existingStructures[zoneId];
    if (!s) return defaultExistingStructure(zoneId);
    return { ...s, quantities: s.quantities ?? {} };
  }

  function toggleHasExisting(zoneId: string, value: boolean) {
    updateExistingStructure({
      ...getStructure(zoneId),
      hasExisting: value,
      quantities: value ? getStructure(zoneId).quantities : {},
    });
  }

  function updateQty(zoneId: string, materialId: string, qty: number) {
    const current = getStructure(zoneId);
    const quantities = { ...current.quantities };
    if (qty > 0) quantities[materialId] = qty;
    else delete quantities[materialId];
    updateExistingStructure({ ...current, quantities });
  }

  async function handleNext() {
    await save();
    const next = steps[currentStepIndex + 1];
    if (next) router.push(next.href);
  }

  if (plan.zones.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 py-10">
        <p className="text-body text-muted">No zones found in your garden plan.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <h1 className="mb-2 text-display-sm text-ink">Existing materials</h1>
      <p className="mb-8 text-body text-muted">
        Tell us what you already have on site. We&apos;ll deduct those quantities from your shopping list.
      </p>

      <div className="flex flex-col gap-5">
        {plan.zones.map(zone => {
          const cfg = ZONE_CONFIGS[zone.type];
          const structure = getStructure(zone.id);
          const zoneMaterials = baseline?.byZone.find(z => z.zoneId === zone.id)?.materials ?? [];

          return (
            <div key={zone.id} className="rounded-2xl border border-line bg-paper p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-3 w-3 shrink-0 rounded-sm border" style={{ background: cfg.fill, borderColor: cfg.stroke }} />
                <span className="text-body font-medium text-ink">{zone.label}</span>
                <span className="ml-1 text-hint text-muted">{cfg.label}</span>
              </div>

              <div className="mb-4 flex gap-2">
                {([false, true] as const).map(v => (
                  <button
                    key={String(v)}
                    onClick={() => toggleHasExisting(zone.id, v)}
                    className={`flex-1 rounded-lg border px-3 py-1.5 text-hint font-medium transition ${
                      structure.hasExisting === v
                        ? "border-forest bg-forest/10 text-forest"
                        : "border-line bg-canvas text-muted hover:border-muted"
                    }`}
                  >
                    {v ? "I have materials on site" : "Nothing on site"}
                  </button>
                ))}
              </div>

              {structure.hasExisting && (
                baseline === null ? (
                  <div className="flex items-center gap-2 py-2 text-hint text-muted">
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border border-line border-t-forest" />
                    Loading material list…
                  </div>
                ) : zoneMaterials.length === 0 ? (
                  <p className="text-hint text-muted">No materials calculated for this zone. Set construction parameters first.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    <p className="text-hint font-semibold text-muted">How much do you already have?</p>
                    {zoneMaterials.map(mat => (
                      <div key={mat.id} className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <span className="text-body text-ink">{mat.name}</span>
                          <span className="ml-1.5 text-hint text-muted">
                            ({mat.neededQty} {mat.unit} needed)
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <span className="text-hint text-muted">I have:</span>
                          <input
                            type="number"
                            min={0}
                            step={mat.unit === "bag" || mat.unit === "unit" || mat.unit === "lm" ? 1 : 0.1}
                            value={structure.quantities[mat.id] ?? 0}
                            onChange={e => updateQty(zone.id, mat.id, Number(e.target.value))}
                            className="w-20 rounded-lg border border-line bg-canvas px-2 py-1 text-right text-body text-ink focus:border-forest/40 focus:outline-none"
                          />
                          <span className="w-7 text-hint text-muted">{mat.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => { const p = steps[currentStepIndex - 1]; if (p) router.push(p.href); }}
          className="flex items-center gap-1 text-hint text-muted hover:text-ink"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 10L3 6l5-4"/></svg>
          Previous
        </button>

        <button
          onClick={() => void handleNext()}
          disabled={saving}
          className="rounded-xl bg-forest px-7 py-3 text-sm font-medium text-paper transition hover:bg-moss disabled:opacity-50"
        >
          {saving ? "Saving…" : "View material summary →"}
        </button>
      </div>
    </div>
  );
}
