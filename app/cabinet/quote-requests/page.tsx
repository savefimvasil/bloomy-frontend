"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CabinetEmptyState } from "@/components/ui/cabinet-empty-state";
import { CabinetRow } from "@/components/ui/cabinet-row";
import { FilterBar } from "@/components/ui/filter-bar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeading } from "@/components/ui/page-heading";
import { Spinner } from "@/components/ui/spinner";
import { apiFetch } from "@/lib/api";
import { API } from "@/lib/endpoints";
import { relativeTime } from "@/lib/dateUtils";
import { requestStatusColor, requestStatusLabel } from "@/lib/statusColors";
import { useQuoteRequests } from "@/store/cabinet";
import { useChatStore } from "@/store/chat";
import type { QuoteRequestSummary, RequestStatus } from "@/types/models";

type Filter = "all" | RequestStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all",         label: "All" },
  { key: "open",        label: "Open" },
  { key: "awarded",     label: "Awarded" },
  { key: "in_progress", label: "In progress" },
  { key: "completed",   label: "Completed" },
  { key: "closed",      label: "Closed" },
];

const NON_DELETABLE: RequestStatus[] = ["awarded", "in_progress", "completed"];

function RequestRow({
  req,
  onDelete,
}: {
  req: QuoteRequestSummary;
  onDelete: (id: string) => void;
}) {
  const chatUnread = useChatStore((s) => {
    const room = s.rooms.find((r) => r.jobId === req.id);
    return room ? (s.unread[room.id] ?? 0) : 0;
  });

  const canDelete = !NON_DELETABLE.includes(req.status);

  return (
    <CabinetRow
      info={
        <>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-body font-semibold text-ink">{req.title}</span>
            <Badge dot color={requestStatusColor(req.status)}>
              {requestStatusLabel(req.status)}
            </Badge>
            {req.isDirectRequest && (
              <span className="rounded-full bg-forest/10 px-2 py-0.5 text-hint font-medium text-forest">Direct</span>
            )}
            {chatUnread > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-forest px-1.5 text-hint font-semibold text-paper">
                {chatUnread} new
              </span>
            )}
          </div>
          <p className="text-hint text-muted">
            {req.postcode}
            {req.startBy ? ` · Start by ${req.startBy}` : ""}
            {" · "}
            {req.proposalCount} {req.proposalCount === 1 ? "proposal" : "proposals"}
          </p>
        </>
      }
      meta={relativeTime(req.createdAt)}
      actions={
        <>
          <Button href={`/cabinet/quote-requests/${req.id}`} variant="secondary" size="sm">
            {req.status === "awarded" && chatUnread > 0 ? "View & chat" : "View"}
          </Button>
          {canDelete && (
            <Button onClick={() => onDelete(req.id)} variant="danger" size="sm">Delete</Button>
          )}
        </>
      }
    />
  );
}

export default function QuoteRequestsPage() {
  const { items: requests, loading, loadingMore, error, total, hasMore, fetch: fetchQuoteRequests, loadMore, remove: removeQuoteRequest } = useQuoteRequests();
  const fetchRooms = useChatStore((s) => s.fetchRooms);
  const roomsLoaded = useChatStore((s) => s.roomsLoaded);
  const [filter, setFilter] = useState<Filter>("all");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => { void fetchQuoteRequests(); }, [fetchQuoteRequests]);
  useEffect(() => { if (!roomsLoaded) void fetchRooms(); }, [roomsLoaded, fetchRooms]);

  async function handleDelete(id: string) {
    setDeleteError(null);
    const res = await apiFetch(API.quoteRequests.detail(id), { method: "DELETE" });
    if (!res.ok) {
      setDeleteError("Failed to delete the request. Please try again.");
      return;
    }
    removeQuoteRequest(id);
  }

  const counts = useMemo<Record<Filter, number>>(() => ({
    all:         requests.length,
    open:        requests.filter((r) => r.status === "open").length,
    awarded:     requests.filter((r) => r.status === "awarded").length,
    in_progress: requests.filter((r) => r.status === "in_progress").length,
    completed:   requests.filter((r) => r.status === "completed").length,
    closed:      requests.filter((r) => r.status === "closed").length,
  }), [requests]);

  const visible = useMemo(
    () => filter === "all" ? requests : requests.filter((r) => r.status === filter),
    [filter, requests],
  );

  const pendingReq = pendingDeleteId ? requests.find((r) => r.id === pendingDeleteId) : null;

  if (loading) return <div className="flex justify-center py-12"><Spinner label="Loading requests…" /></div>;
  if (error) return <p className="text-body text-danger">{error}</p>;

  if (requests.length === 0) return (
    <CabinetEmptyState
      eyebrow="Quote Requests"
      title={<>NO REQUESTS YET</>}
      description={<>Open a garden project, run the estimate, then click <strong>Request contractor quotes</strong> to invite local contractors to send you proposals.</>}
      action={<Button href="/cabinet/projects" variant="secondary">Go to projects</Button>}
    />
  );

  return (
    <div>
      <ConfirmDialog
        open={!!pendingDeleteId}
        onCancel={() => { setPendingDeleteId(null); setDeleteError(null); }}
        onConfirm={() => {
          if (pendingDeleteId) {
            void handleDelete(pendingDeleteId);
            setPendingDeleteId(null);
          }
        }}
        title="Delete this request?"
        message={
          pendingReq && pendingReq.proposalCount > 0
            ? `This will permanently delete the request along with ${pendingReq.proposalCount} proposal${pendingReq.proposalCount === 1 ? "" : "s"} already received.`
            : "This will permanently delete the request."
        }
      />

      {deleteError && (
        <p className="mb-4 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-hint text-danger">
          {deleteError}
        </p>
      )}

      <PageHeading
        title={<>QUOTE REQUESTS</>}
        count={total}
        unit={["request", "requests"]}
      />

      <FilterBar
        filters={FILTERS.map(({ key, label }) => ({ key, label, count: counts[key] }))}
        active={filter}
        onChange={setFilter}
      />

      {visible.length === 0 ? (
        <p className="py-10 text-center text-body text-muted">
          No {filter} requests.
        </p>
      ) : (
        <div className="divide-y divide-line">
          {visible.map((req) => (
            <RequestRow key={req.id} req={req} onDelete={setPendingDeleteId} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-6 flex flex-col items-center gap-2">
          <p className="text-hint text-muted">Showing {requests.length} of {total}</p>
          <button
            onClick={() => void loadMore()}
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
