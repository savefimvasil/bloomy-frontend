"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CabinetEmptyState } from "@/components/ui/cabinet-empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { Spinner } from "@/components/ui/spinner";
import { usePaginatedFetch } from "@/lib/usePaginatedFetch";
import { relativeTime } from "@/lib/dateUtils";
import type { NearbyRequest } from "@/types/models";

export default function NearbyRequestsPage() {
  const { items: requests, total, loading, loadingMore, error, hasMore, loadMore } =
    usePaginatedFetch<NearbyRequest>("/quote-requests/nearby", 20);

  if (loading) return <div className="flex justify-center py-12"><Spinner label="Loading…" /></div>;
  if (error) return <p className="text-body text-danger">{error}</p>;

  if (requests.length === 0) return (
    <CabinetEmptyState
      eyebrow="Requests Near Me"
      title={<>NO OPEN<br />REQUESTS.</>}
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

  return (
    <div>
      <PageHeading
        title={<>REQUESTS NEAR ME</>}
        count={total}
        unit={["request", "requests"]}
      />
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
