"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CabinetEmptyState } from "@/components/ui/cabinet-empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { Spinner } from "@/components/ui/spinner";
import { apiFetch } from "@/lib/api";
import { usePaginatedFetch } from "@/lib/usePaginatedFetch";
import { relativeTime } from "@/lib/dateUtils";
import type { NearbyRequest } from "@/types/models";

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

export default function NearbyRequestsPage() {
  const router = useRouter();

  const { items: requests, total, loading, loadingMore, error, hasMore, loadMore } =
    usePaginatedFetch<NearbyRequest>("/quote-requests/nearby", 20);

  const [directRequests, setDirectRequests] = useState<DirectRequest[]>([]);
  const [directLoading, setDirectLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/quote-requests/direct-to-me?limit=50")
      .then(res => res.ok ? res.json() as Promise<{ items: DirectRequest[] }> : { items: [] })
      .then(data => setDirectRequests(data.items ?? []))
      .catch(() => {/* non-critical */})
      .finally(() => setDirectLoading(false));
  }, []);

  async function handleAccept(id: string) {
    setAccepting(id);
    try {
      const res = await apiFetch(`/quote-requests/direct/${id}/accept`, { method: "POST" });
      if (!res.ok) { setAccepting(null); return; }
      router.push(`/cabinet/nearby-requests/${id}`);
    } catch {
      setAccepting(null);
    }
  }

  if (loading || directLoading) {
    return <div className="flex justify-center py-12"><Spinner label="Loading…" /></div>;
  }

  if (error) return <p className="text-body text-danger">{error}</p>;

  if (directRequests.length === 0 && requests.length === 0) {
    return (
      <CabinetEmptyState
        eyebrow="Jobs Near Me"
        title={<>NO OPEN<br />JOBS.</>}
        description={
          <>
            No homeowner requests match your area yet. Make sure your{" "}
            <Link href="/cabinet/contractor-profile" className="text-forest underline underline-offset-4">
              profile postcode
            </Link>{" "}
            is set so we know where to look.
          </>
        }
      />
    );
  }

  return (
    <div>
      <PageHeading
        title={<>JOBS NEAR ME</>}
        count={total + directRequests.length}
        unit={["job", "jobs"]}
      />

      {/* Direct requests — pinned at the top */}
      {directRequests.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-eyebrow text-muted">Sent directly to you</p>
          <div className="divide-y divide-amber-200/60 overflow-hidden rounded-2xl border border-amber-200/60 bg-amber-50/40">
            {directRequests.map((req) => {
              const zoneLine = req.projectSummary.zoneCount > 0
                ? [
                    `${req.projectSummary.zoneCount} zone${req.projectSummary.zoneCount !== 1 ? "s" : ""}`,
                    ...req.projectSummary.zoneSummary,
                  ].join(" · ")
                : null;

              return (
                <div key={req.id} className="flex items-start gap-5 px-5 py-5">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-body font-semibold text-ink">{req.title}</span>
                      <Badge dot color="amber">Direct</Badge>
                    </div>
                    <p className="text-hint text-muted">
                      {req.postcode}
                      {req.startBy
                        ? ` · Start by ${new Date(req.startBy).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                        : ""}
                      {zoneLine ? ` · ${zoneLine}` : ""}
                      {" · "}{relativeTime(req.createdAt)}
                    </p>
                    {req.note && (
                      <p className="mt-1 text-hint italic text-muted/80">&#34;{req.note}&#34;</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => void handleAccept(req.id)}
                      disabled={accepting === req.id}
                    >
                      {accepting === req.id ? "Accepting…" : "Accept & start"}
                    </Button>
                    <Button href={`/cabinet/nearby-requests/${req.id}`} variant="secondary" size="sm">
                      View →
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Open market jobs */}
      {requests.length > 0 && (
        <>
          {directRequests.length > 0 && (
            <p className="mb-2 text-eyebrow text-muted">Open to all contractors</p>
          )}
          <div className="border-t border-line" />
          <div className="divide-y divide-line">
            {requests.map((req) => (
              <div key={req.id} className="flex items-start gap-5 py-6">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-body font-semibold text-ink">{req.title}</span>
                    {req.hasProposed && <Badge dot color="sage">Proposed</Badge>}
                  </div>
                  <p className="text-hint text-muted">
                    {req.postcode}
                    {req.distanceMiles != null ? ` · ${req.distanceMiles} mi` : ""}
                    {req.startBy ? ` · Start by ${req.startBy}` : ""}
                    {" · "}
                    {relativeTime(req.createdAt)}
                  </p>
                </div>
                <Button
                  href={`/cabinet/nearby-requests/${req.id}`}
                  variant={req.hasProposed ? "secondary" : "default"}
                  size="sm"
                >
                  {req.hasProposed ? "View" : "Send proposal"}
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

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
