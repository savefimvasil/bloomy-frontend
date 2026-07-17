"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeading } from "@/components/ui/page-heading";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { relativeTime } from "@/lib/dateUtils";
import type { GardenProject } from "@/types/models";

// ─── Estimate thumbnail ───────────────────────────────────────────────────────

function EstimateThumbnail() {
  return (
    <svg viewBox="0 0 72 72" className="h-full w-full" aria-hidden>
      <rect width="72" height="72" fill="#f0ede8" rx="6" />
      <line x1="12" y1="22" x2="60" y2="22" stroke="#d8d3cc" strokeWidth="1" />
      <line x1="12" y1="33" x2="60" y2="33" stroke="#d8d3cc" strokeWidth="1" />
      <line x1="12" y1="44" x2="60" y2="44" stroke="#d8d3cc" strokeWidth="1" />
      <rect x="12" y="26" width="22" height="5" rx="2" fill="#c5e8a3" />
      <rect x="12" y="37" width="30" height="5" rx="2" fill="#c5e8a3" />
      <rect x="12" y="48" width="18" height="5" rx="2" fill="#e8c5d8" />
      <rect x="36" y="26" width="8" height="5" rx="2" fill="#d1c9be" />
      <rect x="44" y="37" width="8" height="5" rx="2" fill="#d1c9be" />
      <rect x="32" y="48" width="8" height="5" rx="2" fill="#d1c9be" />
    </svg>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-12 py-10 md:flex-row md:items-center md:gap-16">
      <div className="flex flex-col gap-5">
        <p className="text-eyebrow text-muted">Estimates</p>
        <h2 className="text-display-xl text-ink">
          NO ESTIMATES<br />YET.
        </h2>
        <p className="max-w-sm text-body text-muted">
          Open a garden project, use the Build Estimate wizard to configure each zone, and save — your material list will appear here.
        </p>
        <Link
          href="/cabinet/projects"
          className="inline-flex items-center gap-2 rounded-xl bg-forest px-7 py-3.5 text-sm font-medium text-paper transition hover:bg-moss"
        >
          Go to Projects
        </Link>
      </div>
    </div>
  );
}

// ─── Estimate row ─────────────────────────────────────────────────────────────

function EstimateRow({ project }: { project: GardenProject }) {
  const tilePlanIds = project.tilePlanIds ?? [];

  return (
    <div className="group relative flex items-center gap-5 py-5">
      <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg">
        <EstimateThumbnail />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/projects/${project.id}/estimate/summary`}
            className="text-body font-semibold text-ink hover:text-forest"
          >
            {project.name ?? "Untitled project"}
          </Link>
          <Badge dot color="green">Saved</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/projects/${project.id}/plan`}
            className="flex items-center gap-1 text-hint text-muted transition hover:text-forest"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="1" y="1" width="9" height="9" rx="1.5" />
              <line x1="1" y1="4" x2="10" y2="4" />
              <line x1="4" y1="4" x2="4" y2="10" />
            </svg>
            Garden plan
          </Link>

          {tilePlanIds.map((tpId, i) => (
            <Link
              key={tpId}
              href={`/tile-plan/edit?id=${tpId}&type=garden`}
              className="flex items-center gap-1 text-hint text-muted transition hover:text-forest"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor" aria-hidden>
                <rect x="0.5" y="0.5" width="4.5" height="4.5" rx="1" />
                <rect x="6" y="0.5" width="4.5" height="4.5" rx="1" />
                <rect x="0.5" y="6" width="4.5" height="4.5" rx="1" />
                <rect x="6" y="6" width="4.5" height="4.5" rx="1" />
              </svg>
              {tilePlanIds.length > 1 ? `Tile plan ${i + 1} ↗` : "Tile plan ↗"}
            </Link>
          ))}
        </div>
      </div>

      <p className="shrink-0 text-hint text-muted transition-opacity group-hover:opacity-0">
        {relativeTime(project.updatedAt)}
      </p>

      <div className="absolute right-0 opacity-0 transition-opacity group-hover:opacity-100">
        <Link
          href={`/projects/${project.id}/estimate/summary`}
          className="inline-flex items-center rounded-lg border border-line bg-paper px-3 py-1.5 text-hint font-medium text-ink shadow-sm transition hover:border-forest/40 hover:text-forest"
        >
          View estimate
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EstimatesPage() {
  const [projects, setProjects] = useState<GardenProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useRequireAuth();

  useEffect(() => {
    if (!getAuthToken()) return;
    void apiFetch("/garden-projects")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load projects");
        return res.json() as Promise<GardenProject[]>;
      })
      .then(data => setProjects(data.filter(p => p.hasEstimate)))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Unknown error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-12">
      <Spinner label="Loading estimates..." />
    </div>
  );

  if (error) return <p className="text-body text-danger">{error}</p>;

  if (projects.length === 0) return <EmptyState />;

  return (
    <div>
      <PageHeading
        title={<>ESTIMATES</>}
        count={projects.length}
        unit={["project", "projects"]}
      />

      <div className="border-t border-line" />

      <div className="divide-y divide-line">
        {projects.map(project => (
          <EstimateRow key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
