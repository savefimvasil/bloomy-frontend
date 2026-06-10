"use client";

import dynamic from "next/dynamic";
import React from "react";

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
        <div className="flex items-start justify-center bg-canvas p-8" style={{ height: "calc(100vh - 60px)" }}>
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
      <div
        className="flex items-center justify-center bg-canvas text-muted"
        style={{ height: "calc(100vh - 60px)" }}
      >
        Loading planner…
      </div>
    ),
  }
);

export function PlannerEntry() {
  return (
    <PlannerErrorBoundary>
      <PlannerPage />
    </PlannerErrorBoundary>
  );
}
