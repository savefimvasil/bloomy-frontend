"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

type GardenProject = {
  id: string;
  name: string | null;
  updatedAt: string;
  createdAt: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Updated today";
  if (days === 1) return "Updated yesterday";
  if (days < 30) return `Updated ${days} days ago`;
  return `Updated ${new Date(dateStr).toLocaleDateString(undefined, { day: "numeric", month: "short" })}`;
}

// ─── Project thumbnail ────────────────────────────────────────────────────────

function ProjectThumbnail() {
  return (
    <svg viewBox="0 0 72 72" className="h-full w-full" aria-hidden>
      <rect width="72" height="72" fill="#f0ede8" rx="6" />
      {/* Grid lines */}
      <line x1="0" y1="24" x2="72" y2="24" stroke="#d8d3cc" strokeWidth="0.5" />
      <line x1="0" y1="48" x2="72" y2="48" stroke="#d8d3cc" strokeWidth="0.5" />
      <line x1="24" y1="0" x2="24" y2="72" stroke="#d8d3cc" strokeWidth="0.5" />
      <line x1="48" y1="0" x2="48" y2="72" stroke="#d8d3cc" strokeWidth="0.5" />
      {/* Patio zone (tile) */}
      <polygon
        points="14,20 42,20 42,50 14,50"
        fill="rgba(232,227,219,0.8)"
        stroke="#9c9587"
        strokeWidth="1.5"
      />
      {/* Lawn zone */}
      <polygon
        points="44,22 60,22 60,52 44,52"
        fill="rgba(193,224,157,0.8)"
        stroke="#4aaa2d"
        strokeWidth="1.5"
      />
      {/* Small tree object */}
      <circle cx="52" cy="35" r="4" fill="#c5e8a3" stroke="#4aaa2d" strokeWidth="1" />
    </svg>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center gap-12 py-10 md:flex-row md:items-center md:gap-16">
      <div className="w-full max-w-[320px] shrink-0">
        <div className="overflow-hidden rounded-2xl border border-line bg-canvas shadow-soft">
          <svg viewBox="0 0 300 280" className="w-full" aria-hidden>
            <defs>
              <pattern id="es-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#d8d3cc" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="300" height="280" fill="#f0ede8" />
            <rect width="300" height="280" fill="url(#es-grid)" />

            {/* Lawn zone */}
            <polygon
              points="60,160 200,160 200,240 60,240"
              fill="rgba(193,224,157,0.7)"
              stroke="#4aaa2d"
              strokeWidth="2"
            />
            {/* Patio zone */}
            <polygon
              points="60,60 160,60 160,155 60,155"
              fill="rgba(232,227,219,0.7)"
              stroke="#9c9587"
              strokeWidth="2"
            />
            {/* Flower bed */}
            <polygon
              points="165,60 240,60 240,155 165,155"
              fill="rgba(240,196,219,0.7)"
              stroke="#c06090"
              strokeWidth="2"
            />
            {/* Tree object */}
            <circle cx="220" cy="200" r="14" fill="#c5e8a3" stroke="#4aaa2d" strokeWidth="2" />
            <line x1="220" y1="214" x2="220" y2="228" stroke="#8b6914" strokeWidth="2" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <p className="text-eyebrow text-muted">Garden Projects</p>
        <h2 className="text-display-xl text-ink">
          NO PROJECTS<br />YET.
        </h2>
        <p className="max-w-sm text-body text-muted">
          Create a garden project to plan zones — patio, lawn, beds, decking — and place objects like trees and furniture on your canvas.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={onCreate} className="px-7 py-3.5">
            Start a project
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Project row ──────────────────────────────────────────────────────────────

function ProjectRow({ project, onDelete }: { project: GardenProject; onDelete: (id: string) => void }) {
  return (
    <div className="group relative flex items-center gap-5 py-6">
      <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg">
        <ProjectThumbnail />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-body font-semibold text-ink">
          {project.name ?? "Untitled project"}
        </span>
        <p className="text-hint text-muted">Garden project</p>
      </div>

      <p className="shrink-0 text-hint text-muted transition-opacity group-hover:opacity-0">
        {relativeTime(project.updatedAt)}
      </p>

      <div className="absolute right-0 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          href={`/projects/${project.id}/plan`}
          variant="secondary"
          size="sm"
        >
          Open
        </Button>
        <Button
          onClick={() => onDelete(project.id)}
          variant="danger"
          size="sm"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<GardenProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.resolve().then(() => {
      if (!getAuthToken()) {
        setError("Not logged in.");
        setLoading(false);
        return;
      }
      void apiFetch("/garden-projects")
        .then(res => {
          if (!res.ok) throw new Error("Failed to load projects");
          return res.json() as Promise<GardenProject[]>;
        })
        .then(data => setProjects(data))
        .catch((e: unknown) => setError(e instanceof Error ? e.message : "Unknown error"))
        .finally(() => setLoading(false));
    });
  }, []);

  function handleCreate() {
    router.push("/projects/new");
  }

  async function handleDelete(id: string) {
    if (!getAuthToken()) return;
    await apiFetch(`/garden-projects/${id}`, { method: "DELETE" });
    setProjects(prev => prev.filter(p => p.id !== id));
  }

  if (loading) return <p className="text-body text-muted">Loading...</p>;

  if (error) {
    return (
      <div>
        <p className="mb-4 text-body text-danger">{error}</p>
        <Button href="/login">Go to login</Button>
      </div>
    );
  }

  if (projects.length === 0) {
    return <EmptyState onCreate={handleCreate} />;
  }

  return (
    <div>
      <div className="flex items-end gap-6 pb-4">
        <h1 className="text-display-xl text-ink">
          GARDEN<br />PROJECTS
        </h1>
        <p className="mb-1 text-eyebrow text-muted">
          {projects.length} {projects.length === 1 ? "project" : "projects"}
        </p>
      </div>

      <div className="border-t border-line" />

      <div className="divide-y divide-line">
        {projects.map(project => (
          <ProjectRow key={project.id} project={project} onDelete={handleDelete} />
        ))}
      </div>

      <div className="mt-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCreate}
          className="px-0 text-hint"
        >
          + New project
        </Button>
      </div>
    </div>
  );
}
