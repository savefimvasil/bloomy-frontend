"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { apiFetch } from "@/lib/api";
import { API } from "@/lib/endpoints";
import { fmtGBP } from "@/lib/currency";

type Material = {
  id: string;
  name: string;
  unit: string;
  pricePerUnit: number;
  updatedAt: string;
};

type Tool = {
  id: string;
  name: string;
  description: string | null;
  pricePerDay: number;
  updatedAt: string;
};

type LabourRate = {
  id: string;
  name: string;
  description: string | null;
  pricePerUnit: number;
  unit: string;
  updatedAt: string;
};

// ─── Inline price cell ────────────────────────────────────────────────────────

function PriceCell({
  value,
  onSave,
}: {
  value: number;
  onSave: (v: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    const parsed = parseFloat(draft);
    if (isNaN(parsed) || parsed < 0) { setError("Enter a valid price"); return; }
    setSaving(true);
    setError("");
    try {
      await onSave(parsed);
      setEditing(false);
    } catch {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") void handleSave();
    if (e.key === "Escape") { setEditing(false); setDraft(String(value)); setError(""); }
  }

  if (!editing) {
    return (
      <button
        onClick={() => { setDraft(String(value)); setEditing(true); }}
        className="group flex items-center gap-2 rounded px-2 py-1 text-body text-ink transition hover:bg-mist"
        title="Click to edit"
      >
        <span>{fmtGBP(value)}</span>
        <svg className="opacity-0 group-hover:opacity-50" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M8 2l2 2-6 6H2V8L8 2z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <span className="text-hint text-muted">£</span>
        <input
          autoFocus
          type="number"
          min="0"
          step="0.01"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-24 rounded border border-forest/40 bg-paper px-2 py-1 text-body text-ink outline-none focus:border-forest"
        />
        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="rounded bg-forest px-2 py-1 text-hint font-medium text-paper transition hover:bg-moss disabled:opacity-50"
        >
          {saving ? "…" : "Save"}
        </button>
        <button
          onClick={() => { setEditing(false); setDraft(String(value)); setError(""); }}
          className="rounded px-2 py-1 text-hint text-muted transition hover:text-ink"
        >
          ✕
        </button>
      </div>
      {error && <p className="text-[11px] text-danger">{error}</p>}
    </div>
  );
}

// ─── Materials table ──────────────────────────────────────────────────────────

function MaterialsTable({ items, onUpdate }: { items: Material[]; onUpdate: (id: string, price: number) => void }) {
  async function save(id: string, price: number) {
    const res = await apiFetch(API.pricing.updateMaterial(id), {
      method: "PATCH",
      body: { pricePerUnit: price },
    });
    if (!res.ok) throw new Error("Failed");
    onUpdate(id, price);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <table className="w-full text-left">
        <thead className="border-b border-line bg-canvas">
          <tr>
            <th className="px-4 py-3 text-eyebrow text-muted">Material</th>
            <th className="px-4 py-3 text-eyebrow text-muted">Unit</th>
            <th className="px-4 py-3 text-eyebrow text-muted">Price per unit</th>
            <th className="px-4 py-3 text-eyebrow text-muted hidden sm:table-cell">ID</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((m) => (
            <tr key={m.id} className="bg-paper hover:bg-mist/40 transition">
              <td className="px-4 py-3 text-body text-ink">{m.name}</td>
              <td className="px-4 py-3 text-hint text-muted">{m.unit}</td>
              <td className="px-4 py-3">
                <PriceCell value={Number(m.pricePerUnit)} onSave={(p) => save(m.id, p)} />
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <span className="rounded bg-canvas px-1.5 py-0.5 font-mono text-[11px] text-muted">{m.id}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Tools table ──────────────────────────────────────────────────────────────

function ToolsTable({ items, onUpdate }: { items: Tool[]; onUpdate: (id: string, price: number) => void }) {
  async function save(id: string, price: number) {
    const res = await apiFetch(API.pricing.updateTool(id), {
      method: "PATCH",
      body: { pricePerDay: price },
    });
    if (!res.ok) throw new Error("Failed");
    onUpdate(id, price);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <table className="w-full text-left">
        <thead className="border-b border-line bg-canvas">
          <tr>
            <th className="px-4 py-3 text-eyebrow text-muted">Tool</th>
            <th className="px-4 py-3 text-eyebrow text-muted">Price / day</th>
            <th className="px-4 py-3 text-eyebrow text-muted hidden sm:table-cell">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((t) => (
            <tr key={t.id} className="bg-paper hover:bg-mist/40 transition">
              <td className="px-4 py-3 text-body text-ink">{t.name}</td>
              <td className="px-4 py-3">
                <PriceCell value={Number(t.pricePerDay)} onSave={(p) => save(t.id, p)} />
              </td>
              <td className="px-4 py-3 hidden sm:table-cell text-hint text-muted">{t.description ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Labour table ─────────────────────────────────────────────────────────────

function LabourTable({ items, onUpdate }: { items: LabourRate[]; onUpdate: (id: string, price: number) => void }) {
  async function save(id: string, price: number) {
    const res = await apiFetch(API.pricing.updateLabour(id), {
      method: "PATCH",
      body: { pricePerUnit: price },
    });
    if (!res.ok) throw new Error("Failed");
    onUpdate(id, price);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <table className="w-full text-left">
        <thead className="border-b border-line bg-canvas">
          <tr>
            <th className="px-4 py-3 text-eyebrow text-muted">Labour type</th>
            <th className="px-4 py-3 text-eyebrow text-muted">Unit</th>
            <th className="px-4 py-3 text-eyebrow text-muted">Rate</th>
            <th className="px-4 py-3 text-eyebrow text-muted hidden sm:table-cell">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((l) => (
            <tr key={l.id} className="bg-paper hover:bg-mist/40 transition">
              <td className="px-4 py-3 text-body text-ink">{l.name}</td>
              <td className="px-4 py-3 text-hint text-muted">per {l.unit}</td>
              <td className="px-4 py-3">
                <PriceCell value={Number(l.pricePerUnit)} onSave={(p) => save(l.id, p)} />
              </td>
              <td className="px-4 py-3 hidden sm:table-cell text-hint text-muted">{l.description ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPricingPage() {
  const [materials, setMaterials] = useState<Material[] | null>(null);
  const [tools, setTools] = useState<Tool[] | null>(null);
  const [labour, setLabour] = useState<LabourRate[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch(API.pricing.materials).then((r) => r.ok ? r.json() as Promise<Material[]> : Promise.reject()),
      apiFetch(API.pricing.tools).then((r) => r.ok ? r.json() as Promise<Tool[]> : Promise.reject()),
      apiFetch(API.pricing.labour).then((r) => r.ok ? r.json() as Promise<LabourRate[]> : Promise.reject()),
    ])
      .then(([mats, toolItems, labourItems]) => { setMaterials(mats); setTools(toolItems); setLabour(labourItems); })
      .catch(() => setError("Failed to load pricing data."));
  }, []);

  function updateMaterial(id: string, price: number) {
    setMaterials((prev) => prev?.map((m) => m.id === id ? { ...m, pricePerUnit: price } : m) ?? prev);
  }

  function updateTool(id: string, price: number) {
    setTools((prev) => prev?.map((t) => t.id === id ? { ...t, pricePerDay: price } : t) ?? prev);
  }

  function updateLabour(id: string, price: number) {
    setLabour((prev) => prev?.map((l) => l.id === id ? { ...l, pricePerUnit: price } : l) ?? prev);
  }

  const loading = materials === null && tools === null && labour === null && !error;

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-display-lg text-ink">Pricing</h1>
          <p className="mt-1 text-body text-muted">
            Click any price to edit it. Changes take effect on the next estimate calculation.
          </p>
        </div>

        {loading && <div className="flex justify-center py-16"><Spinner /></div>}

        {error && (
          <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-body text-danger">{error}</div>
        )}

        {materials && (
          <section className="mb-10">
            <h2 className="mb-3 text-hint font-semibold uppercase tracking-wider text-muted">
              Materials ({materials.length})
            </h2>
            <MaterialsTable items={materials} onUpdate={updateMaterial} />
          </section>
        )}

        {tools && (
          <section className="mb-10">
            <h2 className="mb-3 text-hint font-semibold uppercase tracking-wider text-muted">
              Tool rentals ({tools.length})
            </h2>
            <ToolsTable items={tools} onUpdate={updateTool} />
          </section>
        )}

        {labour && (
          <section>
            <h2 className="mb-3 text-hint font-semibold uppercase tracking-wider text-muted">
              Labour rates ({labour.length})
            </h2>
            <p className="mb-3 text-hint text-muted">
              Reference rates shown to users as guidance — not used in automatic calculations.
            </p>
            <LabourTable items={labour} onUpdate={updateLabour} />
          </section>
        )}
      </div>
    </div>
  );
}
