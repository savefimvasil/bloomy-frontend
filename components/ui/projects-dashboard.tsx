"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ProjectsResponse = {
  user: {
    id: string;
    name: string;
    surname: string;
    email: string;
  } | null;
  projects: Array<{
    id: string;
    userId: string;
    hash: string;
    createdAt: string;
  }>;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

export function ProjectsDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProjectsResponse | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("bloomy_access_token");

    if (!token) {
      setError("You are not logged in yet.");
      setIsLoading(false);
      return;
    }

    async function loadProjects() {
      try {
        const response = await fetch(`${apiBaseUrl}/projects/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const payload = (await response.json()) as ProjectsResponse | { message?: string };

        if (!response.ok) {
          throw new Error("message" in payload && payload.message ? payload.message : "Could not load projects.");
        }

        setData(payload as ProjectsResponse);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unknown error.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProjects();
  }, []);

  return (
    <section className="space-y-8">
      <div className="grid overflow-hidden border border-border bg-surface lg:grid-cols-[1.04fr_0.96fr]">
        <div
          className="relative min-h-[320px] border-b border-border bg-brand-strong lg:min-h-full lg:border-b-0 lg:border-r"
          style={{
            backgroundImage:
              "linear-gradient(rgba(24,31,20,0.16), rgba(24,31,20,0.46)), url('https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 flex flex-col justify-end p-8 text-white md:p-10">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/64">Projects</p>
            <h1 className="mt-3 text-5xl font-semibold leading-[0.95] tracking-tight md:text-6xl">
              Your project studio.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/76">
              A flatter workspace for project ownership, with cleaner hierarchy and less decorative UI noise.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between bg-surface px-8 py-8 md:px-10 md:py-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-brand-soft">Account summary</p>
              <p className="mt-3 text-5xl font-semibold tracking-tight text-brand">
                {data?.projects.length ?? 0}
              </p>
              <p className="mt-1 max-w-xs text-sm leading-6 text-ink-muted">
                Projects currently linked to the authenticated user.
              </p>
            </div>
          </div>

          {data?.user ? (
            <div className="mt-10 border-t border-border pt-6">
              <p className="text-[11px] uppercase tracking-[0.18em] text-brand-soft">Logged in as</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-brand">
                {data.user.name} {data.user.surname}
              </h2>
              <p className="mt-2 text-sm text-ink-muted">{data.user.email}</p>
            </div>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <div className="border border-border bg-surface p-6 text-sm text-ink-muted">
          Loading projects...
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="border border-danger/16 bg-danger-soft p-6 text-sm text-danger">
          <p>{error}</p>
          <p className="mt-3">
            <Link href="/login" className="font-medium text-danger underline underline-offset-4">
              Go to login
            </Link>
          </p>
        </div>
      ) : null}

      {!isLoading && data ? (
        <div className="grid gap-px border border-border bg-border md:grid-cols-2">
          {data.projects.map((project) => (
            <article key={project.id} className="bg-surface p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-black/45">Project hash</p>
                  <p className="mt-3 break-all text-xl font-semibold text-brand">{project.hash}</p>
                </div>
                <div className="border border-border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-brand-soft">
                  Active
                </div>
              </div>

              <div className="mt-6 grid gap-px border border-border bg-border text-sm sm:grid-cols-2">
                <div className="bg-background px-4 py-4 text-ink-muted">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-black/45">Project ID</p>
                  <p className="mt-2 break-all text-sm text-brand">{project.id}</p>
                </div>
                <div className="bg-background px-4 py-4 text-ink-muted">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-black/45">Created</p>
                  <p className="mt-2 text-sm text-brand">{new Date(project.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!isLoading && data && data.projects.length === 0 ? (
        <div className="border border-border bg-surface p-6 text-sm text-ink-muted">
          No projects found for this user yet.
        </div>
      ) : null}
    </section>
  );
}
