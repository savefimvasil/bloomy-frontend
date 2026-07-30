"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEstimate } from "@/store/estimate";
import { ZONE_CONFIGS } from "@bloomy/bloomy-planner";
import type { MaterialItem, ZoneMaterialList, CalculationResult, ToolRentalItem } from "@bloomy/bloomy-planner";
import { apiFetch } from "@/lib/api";
import { getAuthRole } from "@/store/auth";
import { fmtGBP } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { DataTable, type TableColumn } from "@/components/ui/DataTable";
import { CollapsibleCard } from "@/components/estimate/CollapsibleCard";
import { StepNav } from "@/components/estimate/StepNav";
import { ZoneDot } from "@/components/estimate/ZoneDot";

// ─── Table column definitions ─────────────────────────────────────────────────

const materialColumns: TableColumn<MaterialItem>[] = [
  {
    header: "Material",
    render: item => <span className="text-body text-ink">{item.name}</span>,
  },
  {
    header: "Qty",
    align: "right",
    render: item => (
      <span className="font-mono text-hint text-muted">{item.qty} {item.unit}</span>
    ),
  },
  {
    header: "Cost (est.)",
    align: "right",
    render: item =>
      item.cost !== null
        ? <span className="text-body text-ink">{fmtGBP(item.cost)}</span>
        : <span className="text-muted/50">—</span>,
  },
];

const rentalColumns: TableColumn<ToolRentalItem>[] = [
  {
    header: "Tool",
    render: r => <span className="text-body text-ink">{r.name}</span>,
  },
  {
    header: "Days",
    align: "right",
    render: r => <span className="font-mono text-hint text-muted">{r.days}d</span>,
  },
  {
    header: "Rate",
    align: "right",
    render: r => <span className="font-mono text-hint text-muted">{fmtGBP(r.pricePerDay)}/day</span>,
  },
  {
    header: "Cost",
    align: "right",
    render: r => <span className="text-body text-ink">{fmtGBP(r.cost)}</span>,
  },
];

// ─── Zone card ────────────────────────────────────────────────────────────────

function ZoneCard({ group }: { group: ZoneMaterialList }) {
  const cfg = ZONE_CONFIGS[group.zoneType as keyof typeof ZONE_CONFIGS];

  return (
    <CollapsibleCard
      amount={fmtGBP(group.subtotal)}
      left={
        <>
          {cfg && <ZoneDot fill={cfg.fill} stroke={cfg.stroke} />}
          <span className="text-body font-semibold text-ink">{group.zoneLabel}</span>
          {cfg && <span className="text-hint text-muted">{cfg.label}</span>}
        </>
      }
    >
      <DataTable
        columns={materialColumns}
        rows={group.materials}
        rowKey={item => item.id + item.category}
      />
    </CollapsibleCard>
  );
}

// ─── Tool rentals card ────────────────────────────────────────────────────────

function ToolRentalsCard({ rentals, total }: { rentals: ToolRentalItem[]; total: number }) {
  if (rentals.length === 0) return null;
  return (
    <CollapsibleCard
      amount={fmtGBP(total)}
      left={<span className="text-body font-semibold text-ink">Tool rentals</span>}
    >
      <DataTable
        columns={rentalColumns}
        rows={rentals}
        rowKey={r => r.id}
      />
    </CollapsibleCard>
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
  const [vatOn, setVatOn] = useState(false);
  const [pricesUpdatedAt, setPricesUpdatedAt] = useState<string | null>(null);

  const isHomeowner = getAuthRole() === "homeowner";

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiFetch(`/garden-projects/${id}/calculate`, { method: "POST" })
        .then(res => { if (!res.ok) throw new Error(); return res.json() as Promise<CalculationResult>; }),
      apiFetch("/pricing/last-update")
        .then(res => res.ok ? res.json() as Promise<{ updatedAt: string | null }> : { updatedAt: null }),
    ])
      .then(([data, priceInfo]) => {
        if (!cancelled) {
          setResult(data);
          setPricesUpdatedAt(priceInfo.updatedAt);
          setError(null);
        }
      })
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
        <Spinner label="Calculating materials…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16 text-center">
        <p className="mb-4 text-body text-danger">{error}</p>
        <Button variant="ghost" size="sm" onClick={recalculate} className="text-forest underline underline-offset-4">
          Try again
        </Button>
      </div>
    );
  }

  if (!result || result.byZone.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16 text-center">
        <p className="text-body text-muted">
          No zones have construction parameters yet.{" "}
          <Button variant="ghost" size="sm" onClick={() => router.push(steps[0]?.href ?? "")} className="text-forest underline underline-offset-4">
            Go back and set them up.
          </Button>
        </p>
      </div>
    );
  }

  const totalZones = result.byZone.length;
  const totalLines = result.byZone.reduce((s, z) => s + z.materials.length, 0);
  const vatMultiplier = vatOn ? 1.2 : 1;
  const isStale = pricesUpdatedAt !== null &&
    result.computedAt !== undefined &&
    new Date(pricesUpdatedAt) > new Date(result.computedAt);

  function handleBack() {
    const prev = steps[currentStepIndex - 1];
    if (prev) router.push(prev.href);
  }

  async function handleDone() {
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
          <p className="text-display-sm font-bold text-forest">{fmtGBP(result.grandTotal * vatMultiplier)}</p>
          <p className="text-hint text-muted/60">{vatOn ? "incl. 20% VAT · " : ""}excl. labour & delivery</p>
        </div>
      </div>

      {/* Stale prices warning */}
      {isStale && (
        <div className="mb-4 rounded-xl border border-amber-400/50 bg-amber-50/80 px-4 py-3 flex items-center gap-2">
          <span className="text-amber-600">⚠</span>
          <p className="text-hint text-amber-900/80">
            Prices were updated since this estimate was calculated.{" "}
            <button onClick={recalculate} className="font-medium underline underline-offset-2 hover:text-amber-900">
              Recalculate
            </button>{" "}
            to use the latest rates.
          </p>
        </div>
      )}

      {/* Notice */}
      <div className="mb-6 rounded-xl border border-amber-300/60 bg-amber-50/70 px-4 py-3">
        <p className="text-hint text-amber-900/80">
          Prices are indicative estimates based on typical UK market rates. Always get quotes from local suppliers.
        </p>
      </div>

      {/* Zone & rental cards */}
      <div className="flex flex-col gap-4">
        {result.byZone.map(group => <ZoneCard key={group.zoneId} group={group} />)}
        {(result.toolRentals?.length ?? 0) > 0 && (
          <ToolRentalsCard rentals={result.toolRentals} total={result.toolRentalTotal ?? 0} />
        )}
      </div>

      {/* Grand total */}
      <div className="mt-6 rounded-2xl border border-forest/20 bg-forest/5 px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-body font-semibold text-ink">Grand total</span>
          <span className="text-display-sm font-bold text-forest">{fmtGBP(result.grandTotal * vatMultiplier)}</span>
        </div>
        {vatOn && (
          <p className="mt-1 text-hint text-muted/70">Includes 20% VAT ({fmtGBP(result.grandTotal)} + {fmtGBP(result.grandTotal * 0.2)})</p>
        )}
        <div className="mt-3 flex items-center gap-2 border-t border-forest/10 pt-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={vatOn}
              onChange={(e) => setVatOn(e.target.checked)}
              className="h-4 w-4 rounded border-line accent-forest"
            />
            <span className="text-hint text-muted">Show with 20% VAT</span>
          </label>
        </div>
      </div>

      {/* Request contractor quotes */}
      {isHomeowner && (
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-forest/20 bg-forest/3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-body font-semibold text-ink">Want a contractor to do this?</p>
            <p className="text-hint text-muted">
              Post to local contractors or pick one directly from the directory.
            </p>
          </div>
          <Button
            href={`/cabinet/quote-requests/new?projectId=${id}`}
            className="shrink-0"
          >
            Find a contractor →
          </Button>
        </div>
      )}

      {/* Navigation */}
      <StepNav
        onBack={handleBack}
        backLabel="Back"
        rightSlot={
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={recalculate} disabled={loading}>
              Recalculate
            </Button>
            <Button onClick={() => void handleDone()} disabled={saving}>
              {saving ? "Saving…" : "Done →"}
            </Button>
          </div>
        }
      />
    </div>
  );
}
