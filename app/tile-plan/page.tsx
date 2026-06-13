"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

type Plan = {
  id: string;
  name: string | null;
  planType: string | null;
  updatedAt: string;
};

export default function PlanSelectionPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showExisting, setShowExisting] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("bloomy_access_token"));
  }, []);

  async function loadPlans() {
    const token = localStorage.getItem("bloomy_access_token");
    if (!token) return;
    setLoadingPlans(true);
    try {
      const res = await fetch(`${apiBaseUrl}/tile-plans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as Plan[];
      setPlans(data ?? []);
    } finally {
      setLoadingPlans(false);
    }
  }

  function handleShowExisting() {
    setShowExisting(true);
    void loadPlans();
  }

  async function handleCreateNew() {
    const token = localStorage.getItem("bloomy_access_token");
    if (!token) {
      router.push("/tile-plan/edit?type=garden");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(`${apiBaseUrl}/tile-plans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planType: "garden", name: "Garden plan" }),
      });
      const project = (await res.json()) as { id: string };
      router.push(`/tile-plan/edit?id=${project.id}&type=garden`);
    } catch {
      router.push("/tile-plan/edit?type=garden");
    }
  }

  function handleOpenPlan(plan: Plan) {
    router.push(`/tile-plan/edit?id=${plan.id}&type=${plan.planType ?? "garden"}`);
  }

  if (isLoggedIn) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-canvas px-4 py-16">
        <div className="w-full max-w-xl">
          {!showExisting ? (
            <>
              <h1 className="text-center text-2xl font-semibold tracking-tight text-ink">
                What would you like to do?
              </h1>
              <p className="mt-2 text-center text-sm text-muted">
                Continue where you left off, or start something new
              </p>

              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  onClick={handleShowExisting}
                  className="group flex flex-col items-start gap-3 rounded-lg border border-line bg-paper p-6 text-left transition cursor-pointer hover:border-leaf hover:shadow-soft"
                >
                  <span className="text-3xl">📂</span>
                  <div>
                    <p className="font-semibold text-ink">Edit existing plan</p>
                    <p className="mt-0.5 text-xs text-muted">Open one of your saved plans</p>
                  </div>
                </button>

                <button
                  onClick={handleCreateNew}
                  disabled={creating}
                  className="group flex flex-col items-start gap-3 rounded-lg border border-line bg-paper p-6 text-left transition cursor-pointer hover:border-leaf hover:shadow-soft disabled:opacity-50"
                >
                  <span className="text-3xl">✏️</span>
                  <div>
                    <p className="font-semibold text-ink">
                      {creating ? "Creating..." : "Create new plan"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">Start a fresh garden layout</p>
                  </div>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowExisting(false)}
                  className="text-sm text-muted hover:text-forest"
                >
                  ← Back
                </button>
                <h1 className="text-xl font-semibold tracking-tight text-ink">
                  Your plans
                </h1>
              </div>

              {loadingPlans ? (
                <p className="mt-8 text-center text-sm text-muted">Loading plans...</p>
              ) : plans.length === 0 ? (
                <div className="mt-8 text-center">
                  <p className="text-sm text-muted">No saved plans yet.</p>
                  <Button className="mt-4" onClick={handleCreateNew} disabled={creating}>
                    {creating ? "Creating..." : "Create your first plan"}
                  </Button>
                </div>
              ) : (
                <div className="mt-6 flex flex-col gap-3">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => handleOpenPlan(plan)}
                      className="flex items-center justify-between rounded-lg border border-line bg-paper px-5 py-4 text-left transition hover:border-leaf hover:shadow-soft"
                    >
                      <div>
                        <p className="font-medium text-ink">
                          {plan.name ?? "Untitled plan"}
                        </p>
                        <p className="mt-0.5 text-xs text-muted capitalize">
                          {plan.planType ?? "garden"} ·{" "}
                          {new Date(plan.updatedAt).toLocaleDateString(undefined, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span className="text-sm text-forest">Open →</span>
                    </button>
                  ))}

                  <button
                    onClick={handleCreateNew}
                    disabled={creating}
                    className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-paper px-5 py-4 text-sm text-muted transition hover:border-leaf hover:text-forest disabled:opacity-50"
                  >
                    + {creating ? "Creating..." : "New plan"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Not logged in — just garden option
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-canvas px-4 py-16">
      <div className="w-full max-w-xl">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-ink">
          Create a new plan
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          Choose the type of space you are planning
        </p>

        <div className="mt-10">
          <button
            onClick={() => router.push("/tile-plan/edit?type=garden")}
            className="group flex w-full flex-col items-start gap-3 rounded-lg border border-line bg-paper p-6 text-left transition cursor-pointer hover:border-leaf hover:shadow-soft"
          >
            <span className="text-3xl">🌿</span>
            <div>
              <p className="font-semibold text-ink">Garden / Outdoor</p>
              <p className="mt-0.5 text-xs text-muted">Patios, terraces, garden paths, pool surrounds</p>
            </div>
            <p className="text-xs text-muted/70">Standard sizes: 600×600, 900×600 mm</p>
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          <a href="/login" className="text-forest underline underline-offset-2 hover:text-leaf">
            Sign in
          </a>{" "}
          to save your plans and access them from any device
        </p>
      </div>
    </div>
  );
}
