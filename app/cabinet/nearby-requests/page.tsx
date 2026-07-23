"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/ui/page-heading";
import { Spinner } from "@/components/ui/spinner";
import { useApiFetch } from "@/lib/useApiFetch";
import { relativeTime } from "@/lib/dateUtils";
import type { NearbyRequest } from "@/types/models";

function EmptyState() {
  return (
    <div className="flex flex-col gap-5 py-10">
      <p className="text-eyebrow text-muted">Requests Near Me</p>
      <h2 className="text-display-xl text-ink">NO OPEN<br />REQUESTS.</h2>
      <p className="max-w-sm text-body text-muted">
        No homeowner requests match your area yet. Make sure your{" "}
        <a href="/cabinet/contractor-profile" className="text-forest underline underline-offset-4">
          profile postcode
        </a>{" "}
        is set so we know where to look.
      </p>
    </div>
  );
}

export default function NearbyRequestsPage() {
  const { data, loading, error } = useApiFetch<NearbyRequest[]>("/quote-requests/nearby");

  if (loading) return <div className="flex justify-center py-12"><Spinner label="Loading…" /></div>;
  if (error) return <p className="text-body text-danger">{error}</p>;
  const requests = data ?? [];

  return (
    <div>
      <PageHeading
        title={<>REQUESTS NEAR ME</>}
        count={requests.length}
        unit={["request", "requests"]}
      />

      {requests.length === 0 ? (
        <EmptyState />
      ) : (
        <>
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
    </div>
  );
}
