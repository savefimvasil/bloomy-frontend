"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";

type HeatmapRow = {
  postcode: string;
  count: number;
  lat: number;
  lng: number;
};

export default function HeatmapPage() {
  const [rows, setRows] = useState<HeatmapRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiFetch("/quote-requests/heatmap")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json() as Promise<HeatmapRow[]>;
      })
      .then(setRows)
      .catch(() => setError("Failed to load heatmap. Make sure you are logged in."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner label="Loading heatmap…" />
    </div>
  );

  if (error) return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <p className="text-body text-danger">{error}</p>
    </div>
  );

  const total = rows?.reduce((s, r) => s + r.count, 0) ?? 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-eyebrow text-muted mb-1">Internal</p>
      <h1 className="text-display-sm text-forest mb-2">SUPPLY GAP HEATMAP</h1>
      <p className="text-body text-muted mb-8">
        Open requests with no contractor covering their postcode.
        These are postcodes to target for contractor recruitment.
      </p>

      {rows?.length === 0 ? (
        <div className="rounded-xl border border-line bg-canvas p-8 text-center">
          <p className="text-body text-muted">
            All open requests have at least one contractor covering them.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-4">
            <p className="text-hint text-muted">
              <span className="font-semibold text-ink">{rows?.length}</span> postcodes ·{" "}
              <span className="font-semibold text-ink">{total}</span> uncovered requests
            </p>
          </div>
          <div className="overflow-hidden rounded-xl border border-line bg-paper">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line bg-canvas">
                  <th className="px-4 py-3 text-eyebrow text-muted">Postcode</th>
                  <th className="px-4 py-3 text-eyebrow text-muted text-right">Open requests</th>
                  <th className="px-4 py-3 text-eyebrow text-muted text-right">Heat</th>
                </tr>
              </thead>
              <tbody>
                {rows?.map((row, i) => {
                  const max = rows[0].count;
                  const pct = Math.round((row.count / max) * 100);
                  return (
                    <tr key={row.postcode} className={`border-b border-line last:border-0 ${i % 2 === 0 ? "" : "bg-canvas/50"}`}>
                      <td className="px-4 py-3 font-mono text-body text-ink">{row.postcode}</td>
                      <td className="px-4 py-3 text-body text-right text-ink">{row.count}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="ml-auto h-2 rounded-full bg-line" style={{ width: "80px" }}>
                          <div
                            className="h-2 rounded-full bg-danger"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
