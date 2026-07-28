"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CabinetEmptyState } from "@/components/ui/cabinet-empty-state";
import { CabinetRow } from "@/components/ui/cabinet-row";
import { FilterBar } from "@/components/ui/filter-bar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeading } from "@/components/ui/page-heading";
import { Spinner } from "@/components/ui/spinner";
import { apiFetch } from "@/lib/api";
import { relativeTime } from "@/lib/dateUtils";
import { requestStatusColor, requestStatusLabel } from "@/lib/statusColors";
import { useQuoteRequests } from "@/store/cabinet";
import { useChatStore } from "@/store/chat";
import type { QuoteRequestSummary, RequestStatus } from "@/types/models";

type Filter = "all" | RequestStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all",     label: "All" },
  { key: "open",    label: "Open" },
  { key: "awarded", label: "Awarded" },
  { key: "closed",  label: "Closed" },
];

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

  return (
    <CabinetRow
      info={
        <>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-body font-semibold text-ink">{req.title}</span>
            <Badge dot color={requestStatusColor(req.status)}>
              {requestStatusLabel(req.status)}
            </Badge>
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
          {req.status !== "awarded" && (
            <Button onClick={() => onDelete(req.id)} variant="danger" size="sm">Delete</Button>
          )}
        </>
      }
    />
  );
}

export default function QuoteRequestsPage() {
  const { items: requests, loading, error, fetch: fetchQuoteRequests, remove: removeQuoteRequest } = useQuoteRequests();
  const fetchRooms = useChatStore((s) => s.fetchRooms);
  const roomsLoaded = useChatStore((s) => s.roomsLoaded);
  const [filter, setFilter] = useState<Filter>("all");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => { void fetchQuoteRequests(); }, [fetchQuoteRequests]);

  // Load rooms so per-row unread dots can be computed
  useEffect(() => { if (!roomsLoaded) void fetchRooms(); }, [roomsLoaded, fetchRooms]);

  async function handleDelete(id: string) {
    await apiFetch(`/quote-requests/mine/${id}`, { method: "DELETE" });
    removeQuoteRequest(id);
  }

  if (loading) return <div className="flex justify-center py-12"><Spinner label="Loading requests…" /></div>;
  if (error) return <p className="text-body text-danger">{error}</p>;

  if (requests.length === 0) return (
    <CabinetEmptyState
      eyebrow="Quote Requests"
      title={<>NO REQUESTS<br />YET.</>}
      description={<>Open a garden project, run the estimate, then click <strong>Request contractor quotes</strong> to invite local contractors to send you proposals.</>}
      action={<Button href="/cabinet/projects" variant="secondary">Go to projects</Button>}
    />
  );

  const counts: Record<Filter, number> = {
    all:     requests.length,
    open:    requests.filter((r) => r.status === "open").length,
    awarded: requests.filter((r) => r.status === "awarded").length,
    closed:  requests.filter((r) => r.status === "closed").length,
  };

  const visible = filter === "all" ? requests : requests.filter((r) => r.status === filter);

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
    </div>
  );
}
