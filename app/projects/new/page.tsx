"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { BoundaryEditor, boundaryArea } from "@/components/garden/BoundaryEditor";
import type { GardenPlan, Vertex } from "@/components/garden/types";

const DEFAULT_VERTICES: Vertex[] = [[0, 0], [8, 0], [8, 10], [0, 10]];

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("Garden project");
  const [vertices, setVertices] = useState<Vertex[]>(DEFAULT_VERTICES);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = name.trim().length > 0 && vertices.length >= 3;
  const area = boundaryArea(vertices);

  async function handleCreate() {
    if (!getAuthToken()) { router.push("/login"); return; }
    if (!valid) return;
    setCreating(true);
    setError(null);

    try {
      const createRes = await apiFetch("/garden-projects", {
        method: "POST",
        body: { name: name.trim() },
      });
      if (!createRes.ok) throw new Error("Failed to create project");
      const project = (await createRes.json()) as { id: string };

      const plan: GardenPlan = {
        version: 2,
        plannerType: "garden-plan",
        exportedAt: new Date().toISOString(),
        gardenBoundary: { vertices, offset: [0, 0] },
        zones: [],
        objects: [],
        view: { scale: 60, x: 80, y: 60 },
      };

      await apiFetch(`/garden-projects/${project.id}`, {
        method: "PUT",
        body: { planData: plan as unknown as Record<string, unknown>, name: name.trim() },
      });

      router.push(`/projects/${project.id}/plan`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setCreating(false);
    }
  }

  return (
    <div className="flex h-full flex-col">

      {/* Top bar */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-line bg-paper px-4">
        <Link href="/cabinet/projects" className="flex items-center gap-1.5 text-hint text-muted hover:text-ink">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11 L4 7 L9 3" />
          </svg>
          Projects
        </Link>
        <span className="text-hint text-line">/</span>
        <span className="text-body text-ink">Draw garden boundary</span>
      </header>

      {/* Canvas + sidebar */}
      <div className="flex min-h-0 flex-1">

        {/* Canvas — fills available space */}
        <div className="relative min-w-0 flex-1">
          {/* Hint */}
          <div className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full border border-line bg-paper/90 px-4 py-1.5 text-hint text-muted shadow-sm backdrop-blur-sm whitespace-nowrap">
            Drag vertices to shape · click an edge to add a point · × to remove
          </div>
          <BoundaryEditor vertices={vertices} onChange={setVertices} />
        </div>

        {/* Sidebar */}
        <aside className="flex w-[220px] shrink-0 flex-col gap-5 border-l border-line bg-paper p-5">
          <div>
            <p className="mb-4 text-eyebrow text-muted">Step 1 of 2</p>
            <p className="text-body font-semibold text-ink">Garden boundary</p>
            <p className="mt-1 text-hint text-muted">
              Shape the outer outline of your garden. You can refine it later.
            </p>
          </div>

          {/* Stats */}
          <div className="rounded-xl border border-line bg-canvas p-3 text-hint">
            <div className="flex items-center justify-between">
              <span className="text-muted">Area</span>
              <span className="font-semibold text-ink">{area.toFixed(1)} m²</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-muted">Vertices</span>
              <span className="text-ink">{vertices.length}</span>
            </div>
          </div>

          <div className="border-t border-line" />

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-hint text-muted">Project name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Back garden redesign"
              className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-body text-ink placeholder:text-muted/50 focus:border-forest/40 focus:outline-none"
            />
          </div>

          {error && <p className="text-hint text-danger">{error}</p>}

          <div className="mt-auto">
            <Button onClick={handleCreate} disabled={!valid || creating} className="w-full">
              {creating ? "Creating..." : "Create project"}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
