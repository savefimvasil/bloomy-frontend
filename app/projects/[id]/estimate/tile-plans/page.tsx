"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEstimate } from "../estimateContext";
import { ZONE_CONFIGS } from "@bloomy/bloomy-planner";
import { apiFetch } from "@/lib/api";
import type { TilePlan } from "@/types/models";

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

  // Only need to fetch the specific plans already assigned to this project
  const [assignedPlans, setAssignedPlans] = useState<Record<string, TilePlan>>({});
  const [creating, setCreating] = useState<string | null>(null);

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

      // Pre-seed the plan shape with the patio zone's vertices
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
      window.open(`/tile-plan/edit?id=${created.id}&type=garden`, "_blank");
    } finally {
      setCreating(null);
    }
  }

  async function handleNext() {
    await save();
    const next = steps[currentStepIndex + 1];
    if (next) router.push(next.href);
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <h1 className="mb-2 text-display-sm text-ink">Tile plans</h1>
      <p className="mb-8 text-body text-muted">
        Create a tile plan for each patio zone. It will be pre-filled with the correct patio shape.
      </p>

      <div className="flex flex-col gap-4">
        {patioZones.map(zone => {
          const cfg = ZONE_CONFIGS["tile-patio"];
          const assignedId = constructionData.tilePlanAssignments[zone.id];
          const assignedPlan = assignedId ? assignedPlans[assignedId] : null;

          return (
            <div key={zone.id} className="rounded-2xl border border-line bg-paper p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-3 w-3 shrink-0 rounded-sm border" style={{ background: cfg.fill, borderColor: cfg.stroke }} />
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
                  <button
                    onClick={() => updateTilePlanAssignment(zone.id, null)}
                    className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-hint text-muted hover:border-red-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => void handleCreateForZone(zone.id, zone.label)}
                  disabled={creating === zone.id}
                  className="w-full rounded-lg border border-dashed border-forest/40 bg-forest/5 py-2 text-hint font-medium text-forest hover:bg-forest/10 disabled:opacity-50"
                >
                  {creating === zone.id ? "Creating…" : "+ Create tile plan"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation */}
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
          {saving ? "Saving…" : "Save & continue →"}
        </button>
      </div>
    </div>
  );
}
