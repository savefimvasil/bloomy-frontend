"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { GardenPlannerCore } from "@/components/garden/GardenPlannerCore";
import type { GardenPlan } from "@/components/garden/types";

type ProjectMeta = {
  id: string;
  name: string | null;
  planData: Record<string, unknown> | null;
};

export default function ProjectPlanPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [project, setProject] = useState<ProjectMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAuthToken()) { router.push("/login"); return; }
    void apiFetch(`/garden-projects/${id}`)
      .then(res => {
        if (res.status === 404) throw new Error("Project not found");
        if (!res.ok) throw new Error("Failed to load project");
        return res.json() as Promise<ProjectMeta>;
      })
      .then(data => setProject(data))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Unknown error"))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleSave(plan: GardenPlan) {
    await apiFetch(`/garden-projects/${id}`, {
      method: "PUT",
      body: { planData: plan as unknown as Record<string, unknown>, name: project?.name ?? undefined },
    });
  }

  if (loading) return (
    <div className="flex h-full items-center justify-center bg-canvas">
      <p className="text-body text-muted">Loading project...</p>
    </div>
  );

  if (error || !project) return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-canvas">
      <p className="text-body text-danger">{error ?? "Project not found"}</p>
      <Link href="/cabinet/projects" className="text-body text-forest hover:underline">Back to projects</Link>
    </div>
  );

  const plan = project.planData
    ? (project.planData as unknown as GardenPlan)
    : {
        version: 2 as const,
        plannerType: "garden-plan" as const,
        exportedAt: new Date().toISOString(),
        zones: [],
        objects: [],
        view: { scale: 60, x: 80, y: 60 },
      };

  return (
    <GardenPlannerCore
      plan={plan}
      onSave={handleSave}
      projectName={project.name ?? "Garden project"}
      projectId={id}
    />
  );
}
