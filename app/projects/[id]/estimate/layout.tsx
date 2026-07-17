"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { EstimateProvider, useEstimate } from "./estimateContext";

function EstimateLayoutInner({ children }: { children: React.ReactNode }) {
  const { id } = useParams() as { id: string };
  const { steps, currentStepIndex, project, saving } = useEstimate();

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-line bg-paper px-5 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${id}/plan`}
            className="flex items-center gap-1 text-hint text-muted hover:text-ink"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M8 10L3 6l5-4" />
            </svg>
            Back to plan
          </Link>
          <span className="text-hint text-line">|</span>
          <span className="text-hint font-medium text-ink">{project.name ?? "Garden project"}</span>
        </div>
        <div className="flex items-center gap-3">
          {saving && <span className="animate-pulse text-hint text-muted">Saving…</span>}
          <span className="text-hint text-muted">{currentStepIndex + 1} / {steps.length}</span>
        </div>
      </header>

      {/* Stepper tabs */}
      <nav className="flex shrink-0 items-center overflow-x-auto border-b border-line bg-paper">
        {steps.map((step, i) => {
          const done = i < currentStepIndex;
          const active = i === currentStepIndex;

          return (
            <Link
              key={step.href}
              href={step.href}
              className={`relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-4 py-3 text-hint transition ${
                active ? "font-semibold text-forest" : done ? "text-ink hover:text-forest" : "text-muted/50"
              }`}
            >
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold leading-none ${
                done ? "bg-forest text-paper" : active ? "border border-forest text-forest" : "border border-line text-muted/50"
              }`}>
                {done ? "✓" : i + 1}
              </span>
              {step.label}
              {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-forest" />}
            </Link>
          );
        })}
      </nav>

      {/* Page */}
      <main className="min-h-0 flex-1 overflow-y-auto bg-canvas">
        {children}
      </main>
    </div>
  );
}

export default function EstimateLayout({ children }: { children: React.ReactNode }) {
  return (
    <EstimateProvider>
      <EstimateLayoutInner>{children}</EstimateLayoutInner>
    </EstimateProvider>
  );
}
