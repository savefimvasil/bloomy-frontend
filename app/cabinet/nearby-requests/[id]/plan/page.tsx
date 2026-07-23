"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { GardenPlannerCore } from "@bloomy/bloomy-planner";
import { apiFetch } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { useRequireAuth } from "@/lib/useRequireAuth";
import type { GardenPlan } from "@bloomy/bloomy-planner";
import type { NearbyRequestDetail } from "@/types/models";

export default function NearbyRequestPlanPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [req, setReq] = useState<NearbyRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useRequireAuth();

  useEffect(() => {
    if (!getAuthToken()) return;
    void apiFetch(`/quote-requests/nearby/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load request");
        return res.json() as Promise<NearbyRequestDetail>;
      })
      .then(setReq)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Unknown error"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner label="Loading plan…" />
      </div>
    );
  }

  if (error || !req || !req.planData) {
    return (
      <div className="py-16 text-center">
        <p className="text-body text-danger">{error ?? "No plan available for this request."}</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-4 text-sm text-forest underline underline-offset-4"
        >
          Go back
        </button>
      </div>
    );
  }

  const plan = req.planData as unknown as GardenPlan;

  return (
    // Break out of the cabinet layout's padding so the planner fills the viewport.
    <div className="-m-6 md:-m-8 overflow-hidden" style={{ height: "calc(100dvh - 2.5rem)" }}>
      <GardenPlannerCore
        plan={plan}
        projectName={req.title}
        readOnly
        onBack={() => router.back()}
      />
    </div>
  );
}
