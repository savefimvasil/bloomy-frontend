"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CabinetCard } from "@/components/ui/cabinet-row";
import { CabinetEmptyState } from "@/components/ui/cabinet-empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { Spinner } from "@/components/ui/spinner";
import { apiFetch } from "@/lib/api";
import { usePaginatedFetch } from "@/lib/usePaginatedFetch";
import { formatDate } from "@/lib/formatters";

type DirectRequest = {
  id: string;
  title: string;
  postcode: string;
  startBy: string | null;
  status: string;
  note: string | null;
  createdAt: string;
  projectSummary: { zoneCount: number; zoneSummary: string[] };
};

export default function DirectRequestsPage() {
  const router = useRouter();
  const { items: requests, total, loading, loadingMore, error, hasMore, loadMore } =
    usePaginatedFetch<DirectRequest>("/quote-requests/direct-to-me", 20);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [acceptError, setAcceptError] = useState("");

  async function handleAccept(id: string) {
    setAccepting(id);
    setAcceptError("");
    try {
      const res = await apiFetch(`/quote-requests/direct/${id}/accept`, { method: "POST" });
      if (!res.ok) { setAcceptError("Could not accept. Please try again."); setAccepting(null); return; }
      router.push(`/cabinet/nearby-requests/${id}`);
    } catch {
      setAcceptError("Could not accept. Please try again.");
      setAccepting(null);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Spinner label="Loading requests…" /></div>;
  }

  if (error) return <p className="text-body text-danger">{error}</p>;

  if (requests.length === 0) {
    return (
      <CabinetEmptyState
        eyebrow="Direct Requests"
        title={<>NO REQUESTS YET</>}
        description="When a homeowner sends a job directly to you, it appears here for you to accept."
      />
    );
  }

  return (
    <div>
      <PageHeading
        title={<>DIRECT REQUESTS</>}
        count={total}
        unit={["request", "requests"]}
      />

      {acceptError && <p className="mb-4 text-hint text-danger">{acceptError}</p>}

      <div className="divide-y divide-line">
        {requests.map((req) => {
          const zoneLine = [
            `${req.projectSummary.zoneCount} zone${req.projectSummary.zoneCount !== 1 ? "s" : ""}`,
            ...req.projectSummary.zoneSummary,
          ].join(" · ");

          return (
            <CabinetCard
              key={req.id}
              header={
                <>
                  <span className="text-body font-semibold text-ink">{req.title}</span>
                  <Badge dot color="amber">Direct</Badge>
                </>
              }
              meta={
                <>
                  <span className="text-hint text-muted">{req.postcode}</span>
                  {req.startBy && (
                    <span className="text-hint text-muted">
                      Start by {new Date(req.startBy).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  )}
                  {req.projectSummary.zoneCount > 0 && (
                    <span className="text-hint text-muted">{zoneLine}</span>
                  )}
                  <span className="text-hint text-muted/60">{formatDate(req.createdAt)}</span>
                </>
              }
              body={req.note ?? undefined}
              footer={
                <div className="mt-1 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => void handleAccept(req.id)}
                    disabled={accepting === req.id}
                  >
                    {accepting === req.id ? "Accepting…" : "Accept & start work"}
                  </Button>
                  <Button href={`/cabinet/nearby-requests/${req.id}`} variant="secondary" size="sm">
                    View project →
                  </Button>
                </div>
              }
            />
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-6 flex flex-col items-center gap-2">
          <p className="text-hint text-muted">Showing {requests.length} of {total}</p>
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-lg border border-line px-4 py-2 text-body text-muted transition hover:border-forest/40 hover:text-ink disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
