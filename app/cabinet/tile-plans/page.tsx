"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/ui/page-heading";
import { apiFetch } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { relativeTime } from "@/lib/dateUtils";
import type { TilePlan } from "@/types/models";

// ─── Tile thumbnail SVG ──────────────────────────────────────────────────────

function TileThumbnail() {
  const tileW = 28, tileH = 18, gap = 3;
  const cols = 3, rows = 4;
  const cells = [];
  for (let r = 0; r < rows; r++) {
    const xOffset = r % 2 === 0 ? 0 : (tileW + gap) / 2;
    for (let c = 0; c < cols; c++) {
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={4 + c * (tileW + gap) + xOffset}
          y={4 + r * (tileH + gap)}
          width={tileW}
          height={tileH}
          rx={2}
          fill="#e8e3db"
          stroke="#d0c9bf"
          strokeWidth={1}
        />
      );
    }
  }
  return (
    <svg viewBox="0 0 96 96" className="h-full w-full" aria-hidden>
      <rect width="96" height="96" fill="#f0ede8" rx="8" />
      {cells}
    </svg>
  );
}

// ─── Type badge ──────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: string }) {
  const isGarden = type === "garden";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-block h-2 w-2 rotate-45 ${isGarden ? "bg-leaf" : "bg-sage"}`}
      />
      <span className="text-eyebrow text-muted">
        {type}
      </span>
    </span>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center gap-12 py-10 md:flex-row md:items-center md:gap-16">
      {/* Illustration */}
      <div className="w-full max-w-[320px] shrink-0">
        <div className="overflow-hidden rounded-2xl border border-line bg-canvas shadow-soft">
          <svg viewBox="0 0 300 280" className="w-full" aria-hidden>
            {/* Grid */}
            <defs>
              <pattern id="es-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#d8d3cc" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="300" height="280" fill="#f0ede8" />
            <rect width="300" height="280" fill="url(#es-grid)" />

            {/* Polygon fill */}
            <polygon
              points="150,55 230,115 210,215 90,215 70,115"
              fill="rgba(31,77,44,0.07)"
            />
            {/* Polygon dashed stroke */}
            <polygon
              points="150,55 230,115 210,215 90,215 70,115"
              fill="none"
              stroke="#1f4d2c"
              strokeWidth="2.5"
              strokeDasharray="9 5"
              strokeLinejoin="round"
            />

            {/* Open vertices */}
            {([
              [150, 55],
              [230, 115],
              [210, 215],
            ] as [number, number][]).map(([cx, cy]) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={7} fill="white" stroke="#1f4d2c" strokeWidth="2" />
            ))}

            {/* Lime-filled vertex */}
            <circle cx={90} cy={215} r={8} fill="#b7e36f" stroke="#4da162" strokeWidth="2" />

            {/* Another open vertex */}
            <circle cx={70} cy={115} r={7} fill="white" stroke="#1f4d2c" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Text + actions */}
      <div className="flex flex-col gap-5">
        <p className="text-eyebrow text-muted">Tile Plans</p>
        <h2 className="text-display-xl text-ink">
          NO PLANS<br />YET.
        </h2>
        <p className="max-w-sm text-body text-muted">
          Draw your first shape — any floor or patio outline — and Bloomy counts the tiles before you order.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={onCreate} className="px-7 py-3.5">
            Draw your first shape
          </Button>
          <Button href="/tile-plan/import" variant="secondary" className="px-7 py-3.5">
            Import a plan
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Plan row ────────────────────────────────────────────────────────────────

function PlanRow({ plan, onDelete }: { plan: TilePlan; onDelete: (id: string) => void }) {
  return (
    <div className="group relative flex items-center gap-5 py-6">
      {/* Thumbnail */}
      <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg">
        <TileThumbnail />
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-body font-semibold text-ink">
            {plan.name ?? "Untitled plan"}
          </span>
          <TypeBadge type={plan.planType} />
        </div>
        <p className="text-hint text-muted">
          {plan.planType === "garden" ? "Garden" : "Indoor"} plan
        </p>
      </div>

      {/* Date — hidden on hover */}
      <p className="shrink-0 text-hint text-muted transition-opacity group-hover:opacity-0">
        {relativeTime(plan.updatedAt, "Edited")}
      </p>

      {/* Actions — shown on hover */}
      <div className="absolute right-0 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          href={`/tile-plan/edit?id=${plan.id}&type=${plan.planType}`}
          variant="secondary"
          size="sm"
        >
          Open
        </Button>
        <Button
          onClick={() => onDelete(plan.id)}
          variant="danger"
          size="sm"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TilePlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<TilePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useRequireAuth();

  useEffect(() => {
    if (!getAuthToken()) return;
    void apiFetch("/tile-plans")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load plans");
        return res.json() as Promise<TilePlan[]>;
      })
      .then((data) => setPlans(data))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Unknown error"))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!getAuthToken()) return;
    setCreating(true);
    try {
      const res = await apiFetch("/tile-plans", {
        method: "POST",
        body: { planType: "garden", name: "Garden plan" },
      });
      const plan = (await res.json()) as TilePlan;
      router.push(`/tile-plan/edit?id=${plan.id}&type=garden`);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!getAuthToken()) return;
    await apiFetch(`/tile-plans/${id}`, { method: "DELETE" });
    setPlans((prev) => prev.filter((p) => p.id !== id));
  }

  if (loading) return <p className="text-body text-muted">Loading...</p>;

  if (error) {
    return <p className="text-body text-danger">{error}</p>;
  }

  if (plans.length === 0) {
    return <EmptyState onCreate={handleCreate} />;
  }

  return (
    <div>
      {/* Header */}
      <PageHeading
        title={<>TILE PLANS</>}
        count={plans.length}
        unit={["plan", "plans"]}
        action={
          <Button variant="secondary" size="sm" onClick={handleCreate} disabled={creating}>
            + {creating ? "Creating..." : "New plan"}
          </Button>
        }
      />

      <div className="border-t border-line" />

      {/* List */}
      <div className="divide-y divide-line">
        {plans.map((plan) => (
          <PlanRow key={plan.id} plan={plan} onDelete={handleDelete} />
        ))}
      </div>

    </div>
  );
}
