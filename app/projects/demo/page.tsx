"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GardenPlannerCore } from "@bloomy/bloomy-planner";
import type { GardenPlan, Vertex } from "@bloomy/bloomy-planner";

const EMPTY_PLAN: GardenPlan = {
  version: 2,
  plannerType: "garden-plan",
  exportedAt: "",
  zones: [],
  objects: [],
  view: { scale: 60, x: 80, y: 60 },
};

export default function DemoPlannerPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<GardenPlan | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("bloomy_draft_plan");
      if (raw) {
        const { vertices, name } = JSON.parse(raw) as { vertices: Vertex[]; name: string };
        setPlan({
          ...EMPTY_PLAN,
          exportedAt: new Date().toISOString(),
          gardenBoundary: { vertices, offset: [0, 0] },
        });
        // keep a user-visible name if the planner ever shows it
        void name;
      } else {
        setPlan(EMPTY_PLAN);
      }
    } catch {
      setPlan(EMPTY_PLAN);
    }
  }, []);

  if (!plan) return null;

  return (
    <div className="flex h-full flex-col">

      {/* Demo banner */}
      <div className="flex shrink-0 items-center justify-between border-b border-amber-200 bg-amber-50 px-4 py-2.5">
        <p className="text-hint text-amber-900/80">
          Demo mode — your plan is not saved. Register for free to keep your work.
        </p>
        <Link
          href="/register"
          className="shrink-0 rounded-lg bg-forest px-4 py-1.5 text-hint font-medium text-paper transition hover:bg-moss"
        >
          Save my plan →
        </Link>
      </div>

      {/* Full planner — no onSave so nothing is persisted */}
      <div className="min-h-0 flex-1">
        <GardenPlannerCore
          plan={plan}
          projectName="My garden"
          onBack={() => router.push("/projects/new")}
        />
      </div>
    </div>
  );
}
