"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEstimate } from "@/store/estimate";
import { ZONE_CONFIGS } from "@bloomy/bloomy-planner";
import { apiFetch } from "@/lib/api";
import type { TilePlan } from "@/types/models";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ZoneDot } from "@/components/estimate/ZoneDot";
import { StepNav } from "@/components/estimate/StepNav";

function centroidAndRelative(vertices: [number, number][]) {
  const cx = vertices.reduce((s, v) => s + v[0], 0) / vertices.length;
  const cy = vertices.reduce((s, v) => s + v[1], 0) / vertices.length;
  return {
    offset: [cx, cy] as [number, number],
    vertices: vertices.map(v => [v[0] - cx, v[1] - cy] as [number, number]),
  };
}

export default function TilePlansStepPage() {
  const router = useRouter();
  const { plan, constructionData, steps, currentStepIndex, updateTilePlanAssignment, save, saving } = useEstimate();

  const [assignedPlans, setAssignedPlans] = useState<Record<string, TilePlan>>({});
  const [creating, setCreating] = useState<string | null>(null);

  // Picker state: which zoneId is selecting an existing plan
  const [pickerZoneId, setPickerZoneId] = useState<string | null>(null);
  const [pickerPlans, setPickerPlans] = useState<TilePlan[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);

  const patioZones = plan.zones.filter(z => z.type === "tile-patio");
  const assignedIds = Object.values(constructionData.tilePlanAssignments).filter(Boolean);

  useEffect(() => {
    if (assignedIds.length === 0) return;
    void Promise.all(
      assignedIds.map(id =>
        apiFetch(`/tile-plans/${id}`)
          .then(r => r.json() as Promise<TilePlan>)
          .catch(() => null),
      ),
    ).then(results => {
      const map: Record<string, TilePlan> = {};
      for (const p of results) {
        if (p) map[p.id] = p;
      }
      setAssignedPlans(map);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedIds.join(",")]);

  async function handleCreateForZone(zoneId: string, zoneLabel: string) {
    setCreating(zoneId);
    try {
      const res = await apiFetch("/tile-plans", {
        method: "POST",
        body: { planType: "garden", name: `${zoneLabel} — tile plan` },
      });
      const created = (await res.json()) as TilePlan;

      const zone = plan.zones.find(z => z.id === zoneId);
      if (zone && zone.vertices.length >= 3) {
        const { offset, vertices } = centroidAndRelative(zone.vertices as [number, number][]);
        await apiFetch(`/tile-plans/${created.id}`, {
          method: "PUT",
          body: {
            planData: {
              version: 1,
              planType: "garden",
              exportedAt: new Date().toISOString(),
              shape: { vertices, offset },
              tiles: {
                size: { kind: "600x600" },
                rotation: 0,
                chessMode: false,
                groutMm: 3,
                brickOffset: false,
                herringbone: false,
                flooringMaterial: "tile",
              },
            },
          },
        });
      }

      updateTilePlanAssignment(zoneId, created.id);
      setAssignedPlans(prev => ({ ...prev, [created.id]: created }));
      await save();
      window.open(`/tile-plan/edit?id=${created.id}&type=garden`, "_blank");
    } finally {
      setCreating(null);
    }
  }

  async function handleOpenPicker(zoneId: string) {
    setPickerZoneId(zoneId);
    setPickerLoading(true);
    try {
      const res = await apiFetch("/tile-plans");
      const plans = (await res.json()) as TilePlan[];
      setPickerPlans(plans ?? []);
    } finally {
      setPickerLoading(false);
    }
  }

  async function handleSelectExisting(zoneId: string, plan: TilePlan) {
    updateTilePlanAssignment(zoneId, plan.id);
    setAssignedPlans(prev => ({ ...prev, [plan.id]: plan }));
    setPickerZoneId(null);
    await save();
  }

  async function handleNext() {
    await save();
    const next = steps[currentStepIndex + 1];
    if (next) router.push(next.href);
  }

  function handleBack() {
    const prev = steps[currentStepIndex - 1];
    if (prev) router.push(prev.href);
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <h1 className="mb-2 text-display-sm text-ink">Tile plans</h1>
      <p className="mb-8 text-body text-muted">
        Create or select a tile plan for each patio zone. It will be pre-filled with the correct patio shape.
      </p>

      <div className="flex flex-col gap-4">
        {patioZones.map(zone => {
          const cfg = ZONE_CONFIGS["tile-patio"];
          const assignedId = constructionData.tilePlanAssignments[zone.id];
          const assignedPlan = assignedId ? assignedPlans[assignedId] : null;
          const isPicking = pickerZoneId === zone.id;

          return (
            <div key={zone.id} className="rounded-2xl border border-line bg-paper p-5">
              <div className="mb-4 flex items-center gap-2">
                <ZoneDot fill={cfg.fill} stroke={cfg.stroke} />
                <span className="text-body font-medium text-ink">{zone.label}</span>
              </div>

              {assignedPlan ? (
                <div className="flex items-center gap-2">
                  <span className="flex-1 truncate text-body text-ink">{assignedPlan.name ?? "Untitled plan"}</span>
                  <a
                    href={`/tile-plan/edit?id=${assignedPlan.id}&type=garden`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-hint text-muted hover:border-forest hover:text-ink"
                  >
                    Open ↗
                  </a>
                  <Button variant="danger" size="sm" onClick={() => {
                    updateTilePlanAssignment(zone.id, null);
                    void save();
                  }}>
                    Remove
                  </Button>
                </div>
              ) : isPicking ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-hint text-muted">Select an existing plan</span>
                    <button
                      onClick={() => setPickerZoneId(null)}
                      className="text-hint text-muted hover:text-ink"
                    >
                      ✕
                    </button>
                  </div>
                  {pickerLoading ? (
                    <div className="flex justify-center py-4"><Spinner /></div>
                  ) : pickerPlans.length === 0 ? (
                    <p className="text-hint text-muted py-2">No saved tile plans found.</p>
                  ) : (
                    <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                      {pickerPlans.map(p => (
                        <button
                          key={p.id}
                          onClick={() => void handleSelectExisting(zone.id, p)}
                          className="flex items-center justify-between rounded-lg border border-line bg-canvas px-3 py-2 text-left hover:border-forest/60 hover:bg-forest/5"
                        >
                          <span className="text-hint text-ink">{p.name ?? "Untitled plan"}</span>
                          <span className="text-hint text-muted">Select</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="border-t border-line pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => { setPickerZoneId(null); void handleCreateForZone(zone.id, zone.label); }}
                      disabled={creating === zone.id}
                      className="w-full border-dashed border-forest/40 bg-forest/5 text-forest hover:bg-forest/10"
                    >
                      {creating === zone.id ? "Creating…" : "+ Create new tile plan"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => void handleCreateForZone(zone.id, zone.label)}
                    disabled={creating === zone.id}
                    className="flex-1 border-dashed border-forest/40 bg-forest/5 text-forest hover:bg-forest/10"
                  >
                    {creating === zone.id ? "Creating…" : "+ Create tile plan"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => void handleOpenPicker(zone.id)}
                    className="shrink-0 text-muted"
                  >
                    Select existing
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <StepNav
        onBack={handleBack}
        onNext={handleNext}
        nextDisabled={saving}
        nextLoading={saving}
      />
    </div>
  );
}
