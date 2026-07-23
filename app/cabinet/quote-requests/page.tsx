"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeading } from "@/components/ui/page-heading";
import { Spinner } from "@/components/ui/spinner";
import { apiFetch } from "@/lib/api";
import { getAuthToken } from "@/store/auth";
import { relativeTime } from "@/lib/dateUtils";
import { requestStatusColor, requestStatusLabel } from "@/lib/statusColors";
import type { QuoteRequestSummary } from "@/types/models";

function EmptyState() {
  return (
    <div className="flex flex-col gap-5 py-10">
      <p className="text-eyebrow text-muted">Quote Requests</p>
      <h2 className="text-display-xl text-ink">NO REQUESTS<br />YET.</h2>
      <p className="max-w-sm text-body text-muted">
        Open a garden project, run the estimate, then click <strong>Request contractor quotes</strong> to invite local contractors to send you proposals.
      </p>
      <div>
        <Button href="/cabinet/projects" variant="secondary">
          Go to projects
        </Button>
      </div>
    </div>
  );
}

function RequestRow({
  req,
  onDelete,
}: {
  req: QuoteRequestSummary;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="group relative flex items-center gap-5 py-6">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-body font-semibold text-ink">{req.title}</span>
          <Badge dot color={requestStatusColor(req.status)}>{requestStatusLabel(req.status)}</Badge>
        </div>
        <p className="text-hint text-muted">
          {req.postcode}
          {req.startBy ? ` · Start by ${req.startBy}` : ""}
          {" · "}
          {req.proposalCount} {req.proposalCount === 1 ? "proposal" : "proposals"}
        </p>
      </div>

      <p className="shrink-0 text-hint text-muted transition-opacity group-hover:opacity-0">
        {relativeTime(req.createdAt)}
      </p>

      <div className="absolute right-0 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <Button href={`/cabinet/quote-requests/${req.id}`} variant="secondary" size="sm">
          View
        </Button>
        {req.status !== "awarded" && (
          <Button onClick={() => onDelete(req.id)} variant="danger" size="sm">
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}

export default function QuoteRequestsPage() {
  const [requests, setRequests] = useState<QuoteRequestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);


  useEffect(() => {
    if (!getAuthToken()) return;
    void apiFetch("/quote-requests/mine")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load requests");
        return res.json() as Promise<QuoteRequestSummary[]>;
      })
      .then(setRequests)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Unknown error"))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    await apiFetch(`/quote-requests/mine/${id}`, { method: "DELETE" });
    setRequests((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) return <div className="flex justify-center py-12"><Spinner label="Loading requests…" /></div>;
  if (error) return <p className="text-body text-danger">{error}</p>;
  if (requests.length === 0) return <EmptyState />;

  return (
    <div>
      <ConfirmDialog
        open={!!pendingDeleteId}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) {
            void handleDelete(pendingDeleteId);
            setPendingDeleteId(null);
          }
        }}
        title="Delete this request?"
        message="This will delete the request and all proposals you received."
      />

      <PageHeading
        title={<>QUOTE REQUESTS</>}
        count={requests.length}
        unit={["request", "requests"]}
      />
      <div className="border-t border-line" />
      <div className="divide-y divide-line">
        {requests.map((req) => (
          <RequestRow key={req.id} req={req} onDelete={setPendingDeleteId} />
        ))}
      </div>
    </div>
  );
}
