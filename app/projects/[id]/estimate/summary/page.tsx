"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEstimate } from "../estimateContext";
import { ZONE_CONFIGS } from "@bloomy/bloomy-planner";
import type { MaterialItem, ZoneMaterialList, CalculationResult, ToolRentalItem } from "@bloomy/bloomy-planner";
import { apiFetch } from "@/lib/api";

// ─── Currency formatting ──────────────────────────────────────────────────────

const GBP = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2 });
const fmt = (n: number) => GBP.format(n);

// ─── Material row ─────────────────────────────────────────────────────────────

function MaterialRow({ item }: { item: MaterialItem }) {
  return (
    <tr className="border-t border-line/50">
      <td className="py-2 pr-4 text-body text-ink">{item.name}</td>
      <td className="py-2 pr-4 text-right font-mono text-hint text-muted">
        {item.qty} {item.unit}
      </td>
      <td className="py-2 text-right text-body text-ink">
        {item.cost !== null ? fmt(item.cost) : <span className="text-muted/50">—</span>}
      </td>
    </tr>
  );
}

// ─── Tool rentals card ────────────────────────────────────────────────────────

function ToolRentalsCard({ rentals, total }: { rentals: ToolRentalItem[]; total: number }) {
  const [open, setOpen] = useState(true);
  if (rentals.length === 0) return null;
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-body font-semibold text-ink">Tool rentals</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-body font-semibold text-ink">{fmt(total)}</span>
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round"
            className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path d="M2 5l5 5 5-5" />
          </svg>
        </div>
      </button>
      {open && (
        <div className="border-t border-line px-5 pb-4 pt-2">
          <table className="w-full">
            <thead>
              <tr>
                <th className="pb-1 text-left text-hint font-semibold uppercase tracking-widest text-muted">Tool</th>
                <th className="pb-1 pr-4 text-right text-hint font-semibold uppercase tracking-widest text-muted">Days</th>
                <th className="pb-1 pr-4 text-right text-hint font-semibold uppercase tracking-widest text-muted">Rate</th>
                <th className="pb-1 text-right text-hint font-semibold uppercase tracking-widest text-muted">Cost</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map(r => (
                <tr key={r.id} className="border-t border-line/50">
                  <td className="py-2 pr-4 text-body text-ink">{r.name}</td>
                  <td className="py-2 pr-4 text-right font-mono text-hint text-muted">{r.days}d</td>
                  <td className="py-2 pr-4 text-right font-mono text-hint text-muted">{fmt(r.pricePerDay)}/day</td>
                  <td className="py-2 text-right text-body text-ink">{fmt(r.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Zone card ────────────────────────────────────────────────────────────────

function ZoneCard({ group }: { group: ZoneMaterialList }) {
  const [open, setOpen] = useState(true);
  const cfg = ZONE_CONFIGS[group.zoneType as keyof typeof ZONE_CONFIGS];

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2.5">
          {cfg && <span className="h-3 w-3 shrink-0 rounded-sm border" style={{ background: cfg.fill, borderColor: cfg.stroke }} />}
          <span className="text-body font-semibold text-ink">{group.zoneLabel}</span>
          {cfg && <span className="text-hint text-muted">{cfg.label}</span>}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-body font-semibold text-ink">{fmt(group.subtotal)}</span>
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round"
            className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path d="M2 5l5 5 5-5" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-line px-5 pb-4 pt-2">
          <table className="w-full">
            <thead>
              <tr>
                <th className="pb-1 text-left text-hint font-semibold uppercase tracking-widest text-muted">Material</th>
                <th className="pb-1 pr-4 text-right text-hint font-semibold uppercase tracking-widest text-muted">Qty</th>
                <th className="pb-1 text-right text-hint font-semibold uppercase tracking-widest text-muted">Cost (est.)</th>
              </tr>
            </thead>
            <tbody>
              {group.materials.map(item => <MaterialRow key={item.id + item.category} item={item} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SummaryPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { steps, currentStepIndex } = useEstimate();

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/garden-projects/${id}/calculate`, { method: "POST" })
      .then(res => { if (!res.ok) throw new Error(); return res.json() as Promise<CalculationResult>; })
      .then(data => { if (!cancelled) { setResult(data); setError(null); } })
      .catch(() => { if (!cancelled) setError("Failed to calculate. Please try again."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, refreshKey]);

  function recalculate() {
    setLoading(true);
    setError(null);
    setRefreshKey(k => k + 1);
  }

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-forest" />
        <p className="text-body text-muted">Calculating materials…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16 text-center">
        <p className="mb-4 text-body text-danger">{error}</p>
        <button onClick={recalculate} className="text-forest underline text-hint">
          Try again
        </button>
      </div>
    );
  }

  if (!result || result.byZone.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16 text-center">
        <p className="text-body text-muted">
          No zones have construction parameters yet.{" "}
          <button onClick={() => router.push(steps[0]?.href ?? "")} className="text-forest underline">
            Go back and set them up.
          </button>
        </p>
      </div>
    );
  }

  const totalZones = result.byZone.length;
  const totalLines = result.byZone.reduce((s, z) => s + z.materials.length, 0);

  async function handleSaveAndDone() {
    setSaving(true);
    try {
      router.push("/cabinet/estimates");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-display-sm text-ink">Materials summary</h1>
          <p className="mt-1 text-body text-muted">
            {totalZones} zone{totalZones !== 1 ? "s" : ""} · {totalLines} material{totalLines !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="text-hint text-muted">Estimated total</p>
          <p className="text-display-sm font-bold text-forest">{fmt(result.grandTotal)}</p>
          <p className="text-hint text-muted/60">excl. labour & delivery</p>
        </div>
      </div>

      {/* Notice */}
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3">
        <p className="text-hint text-amber-900/80">
          Prices are indicative estimates based on typical UK market rates. Always get quotes from local suppliers.
        </p>
      </div>

      {/* Zone cards */}
      <div className="flex flex-col gap-4">
        {result.byZone.map(group => <ZoneCard key={group.zoneId} group={group} />)}
        {result.toolRentals?.length > 0 && (
          <ToolRentalsCard rentals={result.toolRentals} total={result.toolRentalTotal ?? 0} />
        )}
      </div>

      {/* Grand total row */}
      <div className="mt-6 flex items-center justify-between rounded-2xl border border-forest/20 bg-forest/5 px-5 py-4">
        <span className="text-body font-semibold text-ink">Grand total</span>
        <span className="text-display-sm font-bold text-forest">{fmt(result.grandTotal)}</span>
      </div>

      {/* CTA placeholder */}
      <div className="mt-6 rounded-2xl border border-dashed border-line p-5 text-center">
        <p className="text-body font-medium text-ink">Looking for a contractor?</p>
        <p className="mt-1 text-hint text-muted">Contractor directory coming soon.</p>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => { const p = steps[currentStepIndex - 1]; if (p) router.push(p.href); }}
          className="flex items-center gap-1 text-hint text-muted hover:text-ink"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 10L3 6l5-4"/></svg>
          Back
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={recalculate}
            disabled={loading}
            className="rounded-xl border border-line px-5 py-3 text-sm font-medium text-ink transition hover:border-forest/40 disabled:opacity-50"
          >
            Recalculate
          </button>
          <button
            onClick={() => void handleSaveAndDone()}
            disabled={saving}
            className="rounded-xl bg-forest px-7 py-3 text-sm font-medium text-paper transition hover:bg-moss disabled:opacity-50"
          >
            {saving ? "Saving…" : "Done →"}
          </button>
        </div>
      </div>
    </div>
  );
}
