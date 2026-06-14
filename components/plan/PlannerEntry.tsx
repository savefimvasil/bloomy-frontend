"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import React from "react";
import type { PlanType } from "@/lib/plan/types";
import type { PlanExport } from "@/lib/plan/schema";
import { PlanExportSchema } from "@/lib/plan/schema";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

class PlannerErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: string | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(err: unknown): { error: string } {
    return { error: String(err) };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-[calc(100vh-68px)] items-start justify-center bg-canvas p-8">
          <div className="max-w-2xl rounded border border-danger/30 bg-paper p-6 text-sm">
            <p className="mb-2 font-semibold text-danger">Planner failed to load</p>
            <pre className="whitespace-pre-wrap text-xs text-muted">{this.state.error}</pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const PlannerPage = dynamic(
  () => import("./PlannerCanvas").then((m) => m.PlannerPage),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-canvas text-muted">
        Loading planner…
      </div>
    ),
  }
);

function PlannerEntryInner() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id") ?? undefined;
  const typeParam = searchParams.get("type");

  const [planType, setPlanType] = useState<PlanType>(
    typeParam === "indoor" ? "indoor" : "garden"
  );
  const [initialPlan, setInitialPlan] = useState<PlanExport | undefined>(undefined);
  const [loading, setLoading] = useState(!!projectId);

  useEffect(() => {
    if (!projectId) return;

    async function loadPlan() {
      const token = localStorage.getItem("bloomy_access_token");
      if (!token) { setLoading(false); return; }
      try {
        const res = await fetch(`${apiBaseUrl}/tile-plans/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          planType?: string | null;
          planData?: unknown;
        };
        if (data.planType === "indoor") setPlanType("indoor");
        else setPlanType("garden");

        if (data.planData) {
          const parsed = PlanExportSchema.safeParse(data.planData);
          if (parsed.success) setInitialPlan(parsed.data);
        }
      } finally {
        setLoading(false);
      }
    }

    void loadPlan();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-canvas text-muted">
        Loading plan…
      </div>
    );
  }

  return (
    <PlannerErrorBoundary>
      <PlannerPage planType={planType} projectId={projectId} initialPlan={initialPlan} />
    </PlannerErrorBoundary>
  );
}

export function PlannerEntry() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center bg-canvas text-muted">
          Loading planner…
        </div>
      }
    >
      <PlannerEntryInner />
    </Suspense>
  );
}
