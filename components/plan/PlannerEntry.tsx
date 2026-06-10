"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import React from "react";
import type { PlanType } from "@/lib/plan/types";

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
        <div className="flex h-full items-start justify-center bg-canvas p-8">
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
  const planType: PlanType =
    searchParams.get("type") === "indoor" ? "indoor" : "garden";

  return (
    <PlannerErrorBoundary>
      <PlannerPage planType={planType} />
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
