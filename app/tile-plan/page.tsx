"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useIsLoggedIn, getAuthToken } from "@/lib/auth";

type Plan = {
  id: string;
  name: string | null;
  planType: string | null;
  updatedAt: string;
};

// ─── Local building blocks ──────────────────────────────────────────────────

function OptionCard({
  icon,
  title,
  description,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group flex flex-col items-start gap-3 rounded-lg border border-line bg-paper p-6 text-left transition cursor-pointer hover:border-leaf hover:shadow-soft disabled:opacity-50"
    >
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-xs text-muted">{description}</p>
      </div>
    </button>
  );
}

function PlanListRow({ plan, onClick }: { plan: Plan; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between rounded-lg border border-line bg-paper px-5 py-4 text-left transition hover:border-leaf hover:shadow-soft"
    >
      <div>
        <p className="font-medium text-ink">{plan.name ?? "Untitled plan"}</p>
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
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function PlanSelectionPage() {
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();
  const [showExisting, setShowExisting] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [creating, setCreating] = useState(false);

  async function loadPlans() {
    if (!getAuthToken()) return;
    setLoadingPlans(true);
    try {
      const res = await apiFetch("/tile-plans");
      if (!res.ok) throw new Error("Failed to load plans");
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
    if (!getAuthToken()) {
      router.push("/tile-plan/edit?type=garden");
      return;
    }
    setCreating(true);
    try {
      const res = await apiFetch("/tile-plans", {
        method: "POST",
        body: { planType: "garden", name: "Garden plan" },
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
              <h1 className="text-center text-display-sm text-ink">
                What would you like to do?
              </h1>
              <p className="mt-2 text-center text-sm text-muted">
                Continue where you left off, or start something new
              </p>

              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <OptionCard
                  icon="📂"
                  title="Edit existing plan"
                  description="Open one of your saved plans"
                  onClick={handleShowExisting}
                />
                <OptionCard
                  icon="✏️"
                  title={creating ? "Creating..." : "Create new plan"}
                  description="Start a fresh garden layout"
                  onClick={handleCreateNew}
                  disabled={creating}
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExisting(false)}
                  className="px-0 text-sm hover:text-forest"
                >
                  ← Back
                </Button>
                <h1 className="text-display-sm text-ink">Your plans</h1>
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
                    <PlanListRow key={plan.id} plan={plan} onClick={() => handleOpenPlan(plan)} />
                  ))}

                  <Button
                    variant="secondary"
                    onClick={handleCreateNew}
                    disabled={creating}
                    className="mt-2 border-dashed text-sm text-muted hover:text-forest"
                  >
                    + {creating ? "Creating..." : "New plan"}
                  </Button>
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
        <h1 className="text-center text-display-sm text-ink">
          Create a new plan
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          Choose the type of space you are planning
        </p>

        <div className="mt-10">
          <OptionCard
            icon="🌿"
            title="Garden / Outdoor"
            description={
              <>
                Patios, terraces, garden paths, pool surrounds
                <br />
                <span className="text-muted/70">Standard sizes: 600×600, 900×600 mm</span>
              </>
            }
            onClick={() => router.push("/tile-plan/edit?type=garden")}
          />
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
