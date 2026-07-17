"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEstimate } from "../estimateContext";
import { apiFetch } from "@/lib/api";

const GBP = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0 });

interface ToolEntry {
  id: string;
  name: string;
  description: string;
  pricePerDay: number;
}

export default function ToolsPage() {
  const router = useRouter();
  const { constructionData, steps, currentStepIndex, updateToolRentals, save, saving } = useEstimate();

  const [tools, setTools] = useState<ToolEntry[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  useEffect(() => {
    void apiFetch("/garden-projects/catalog")
      .then(r => r.json() as Promise<{ tools: ToolEntry[] }>)
      .then(data => setTools(data.tools))
      .finally(() => setLoadingCatalog(false));
  }, []);

  const toolRentals = constructionData.toolRentals ?? {};

  function toggleTool(toolId: string) {
    const current = toolRentals[toolId] ?? 0;
    updateToolRentals(toolId, current > 0 ? 0 : 1);
  }

  function setDays(toolId: string, days: number) {
    updateToolRentals(toolId, Math.max(0, days));
  }

  const totalEstimate = tools.reduce((sum, tool) => {
    const days = toolRentals[tool.id] ?? 0;
    return sum + (days > 0 ? days * tool.pricePerDay : 0);
  }, 0);

  async function handleNext() {
    await save();
    const next = steps[currentStepIndex + 1];
    if (next) router.push(next.href);
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <h1 className="mb-2 text-display-sm text-ink">Tools to rent</h1>
      <p className="mb-8 text-body text-muted">
        Select the tools you&apos;ll need and how many days you&apos;ll need them. Rental cost is included in your estimate.
      </p>

      {loadingCatalog ? (
        <div className="flex justify-center py-10">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-forest" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tools.map(tool => {
            const days = toolRentals[tool.id] ?? 0;
            const checked = days > 0;
            const lineCost = checked ? days * tool.pricePerDay : null;

            return (
              <div
                key={tool.id}
                className={`flex items-start gap-4 rounded-2xl border p-4 transition ${
                  checked ? "border-forest/40 bg-forest/5" : "border-line bg-paper"
                }`}
              >
                <button
                  onClick={() => toggleTool(tool.id)}
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
                    checked
                      ? "border-forest bg-forest text-paper"
                      : "border-line bg-canvas hover:border-forest/60"
                  }`}
                  aria-label={checked ? `Remove ${tool.name}` : `Add ${tool.name}`}
                >
                  {checked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 4l3 3 5-6" />
                    </svg>
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-body font-medium text-ink">{tool.name}</span>
                    <span className="shrink-0 text-hint text-muted">{GBP.format(tool.pricePerDay)}/day</span>
                  </div>
                  <p className="mt-0.5 text-hint text-muted">{tool.description}</p>
                </div>

                {checked && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => setDays(tool.id, days - 1)}
                      disabled={days <= 1}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-canvas text-ink hover:border-muted disabled:opacity-30"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-body font-medium text-ink">{days}</span>
                    <button
                      onClick={() => setDays(tool.id, days + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-canvas text-ink hover:border-muted"
                    >
                      +
                    </button>
                    <span className="ml-1 w-16 text-right text-hint text-forest">
                      {GBP.format(lineCost ?? 0)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalEstimate > 0 && (
        <div className="mt-5 flex items-center justify-between rounded-xl border border-forest/20 bg-forest/5 px-4 py-3">
          <span className="text-body font-medium text-ink">Tool rental estimate</span>
          <span className="text-body font-bold text-forest">{GBP.format(totalEstimate)}</span>
        </div>
      )}

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
