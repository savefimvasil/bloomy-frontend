"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import React from "react";
import type { PlanType } from "@bloomy/bloomy-planner";
import type { PlanExport, ExportKind } from "@bloomy/bloomy-planner";
import { PlanExportSchema } from "@bloomy/bloomy-planner";
import { apiFetch } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { ExportModal } from "./ExportModal";
import { UploadFloorplanButton } from "./UploadFloorplanButton";

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

const PlannerCore = dynamic(
  () => import("@bloomy/bloomy-planner").then((m) => m.PlannerCore),
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
  const [loading, setLoading] = useState(() =>
    !!projectId && (typeof window === "undefined" || !!getAuthToken())
  );
  const [exportModal, setExportModal] = useState<ExportKind | null>(null);
  const pendingExport = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!projectId) return;
    if (!getAuthToken()) return;

    async function loadPlan() {
      try {
        const res = await apiFetch(`/tile-plans/${projectId}`);
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

  async function handleSave(plan: PlanExport) {
    if (!projectId || !getAuthToken()) return;
    await apiFetch(`/tile-plans/${projectId}`, {
      method: "PUT",
      body: { planData: plan },
    });
  }

  function handleRequestExport(kind: ExportKind, execute: () => void) {
    if (getAuthToken()) {
      execute();
    } else {
      pendingExport.current = execute;
      setExportModal(kind);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-canvas text-muted">
        Loading plan…
      </div>
    );
  }

  return (
    <PlannerErrorBoundary>
      <PlannerCore
        planType={planType}
        initialPlan={initialPlan}
        onSave={projectId ? handleSave : undefined}
        onRequestExport={handleRequestExport}
        uploadSlot={(dispatch) => <UploadFloorplanButton dispatch={dispatch} />}
      />
      <ExportModal
        kind={exportModal}
        onDownload={() => {
          pendingExport.current?.();
          pendingExport.current = null;
          setExportModal(null);
        }}
        onClose={() => {
          pendingExport.current = null;
          setExportModal(null);
        }}
      />
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
