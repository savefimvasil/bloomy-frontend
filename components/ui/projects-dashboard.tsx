"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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
    <section className="bg-canvas">
      <div className="grid min-h-screen lg:grid-cols-[1fr_1fr] pt-15">
        <div className="bg-forest text-paper">
          <div className="container flex min-h-screen flex-col justify-end py-10">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-paper/68">Projects</p>
              <h1 className="mt-4 text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
                Fresh project
                <br />
                workspace.
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-paper/80 md:text-base">
                A greener, brighter overview of every project owned by the current client account.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-paper">
          <div className="container py-10">
          {isLoading ? <div className="text-sm text-muted">Loading projects...</div> : null}

          {!isLoading && error ? (
            <div className="bg-danger/10 px-5 py-5 text-sm text-danger">
              <p>{error}</p>
              <div className="mt-4">
                <Button href="/login">Go to login</Button>
              </div>
            </div>
          ) : null}

          {!isLoading && data?.user ? (
            <div className="bg-mist px-6 py-6">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Logged in as</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-forest">
                {data.user.name} {data.user.surname}
              </h2>
              <p className="mt-2 text-sm text-muted">{data.user.email}</p>
            </div>
          ) : null}

          {!isLoading && data && data.projects.length > 0 ? (
            <div className="mt-8 grid gap-4">
              {data.projects.map((project) => (
                <article key={project.id} className="bg-white px-6 py-6 shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">Project hash</p>
                      <p className="mt-3 break-all text-2xl font-semibold text-forest">{project.hash}</p>
                    </div>
                    <div className="bg-mist px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-forest">
                      Active
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    <div className="bg-canvas px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">Project ID</p>
                      <p className="mt-2 break-all text-sm text-forest">{project.id}</p>
                    </div>
                    <div className="bg-canvas px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">Created</p>
                      <p className="mt-2 text-sm text-forest">{new Date(project.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          {!isLoading && data && data.projects.length === 0 ? (
            <div className="mt-8 bg-mist px-5 py-5 text-sm text-muted">
              No projects found for this user yet.
            </div>
          ) : null}

          {!isLoading && !error ? (
            <div className="mt-8">
              <Link href="/projects/new" className="text-sm font-medium text-forest underline underline-offset-4">
                Create another project owner
              </Link>
            </div>
          ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
