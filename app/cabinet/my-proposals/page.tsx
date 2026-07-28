"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CabinetCard } from "@/components/ui/cabinet-row";
import { FilterBar } from "@/components/ui/filter-bar";
import { CabinetEmptyState } from "@/components/ui/cabinet-empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { Spinner } from "@/components/ui/spinner";
import { useApiFetch } from "@/lib/useApiFetch";
import { formatDate, formatPriceNote } from "@/lib/formatters";
import { proposalStatusColor, proposalStatusLabel } from "@/lib/statusColors";
import { useChatStore } from "@/store/chat";
import type { MyProposal, ProposalStatus } from "@/types/models";

type Filter = "all" | ProposalStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all",      label: "All" },
  { key: "pending",  label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
];

function ProposalRow({ p }: { p: MyProposal }) {
  const chatUnread = useChatStore((s) => {
    if (!p.request) return 0;
    const room = s.rooms.find((r) => r.jobId === p.request!.id);
    return room ? (s.unread[room.id] ?? 0) : 0;
  });

  return (
    <CabinetCard
      header={p.request && (
        <>
          <Link
            href={`/cabinet/nearby-requests/${p.request.id}`}
            className="text-body font-semibold text-ink transition hover:text-forest"
          >
            {p.request.title}
          </Link>
          <span className="text-hint text-muted">{p.request.postcode}</span>
        </>
      )}
      meta={
        <>
          <Badge dot color={proposalStatusColor(p.status)}>{proposalStatusLabel(p.status)}</Badge>
          {p.priceNote && <span className="text-body font-medium text-forest">{formatPriceNote(p.priceNote)}</span>}
          {p.timelineDays && <span className="text-hint text-muted">{p.timelineDays} days</span>}
          <span className="text-hint text-muted">{formatDate(p.createdAt)}</span>
        </>
      }
      body={p.message}
      footer={p.status === "accepted" && p.request && (
        <Link
          href={`/cabinet/nearby-requests/${p.request.id}?tab=chat`}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-forest/30 bg-forest/5 px-3 py-1.5 text-sm font-medium text-forest transition hover:bg-forest/10"
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M2 2H12V9H8L5.5 12V9H2V2Z" />
          </svg>
          Chat with homeowner
          {chatUnread > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-forest px-1 text-[10px] font-bold text-paper leading-none">
              {chatUnread}
            </span>
          )}
        </Link>
      )}
    />
  );
}

export default function MyProposalsPage() {
  const { data, loading, error } = useApiFetch<MyProposal[]>("/quote-requests/my-proposals");
  const fetchRooms = useChatStore((s) => s.fetchRooms);
  const roomsLoaded = useChatStore((s) => s.roomsLoaded);
  const [filter, setFilter] = useState<Filter>("all");

  // Load rooms so per-row unread dots work
  useEffect(() => { if (!roomsLoaded) void fetchRooms(); }, [roomsLoaded, fetchRooms]);

  if (loading) return <div className="flex justify-center py-12"><Spinner label="Loading…" /></div>;
  if (error) return <p className="text-body text-danger">{error}</p>;

  const proposals = data ?? [];
  if (proposals.length === 0) return (
    <CabinetEmptyState
      eyebrow="My Proposals"
      title={<>NO PROPOSALS<br />YET.</>}
      description="Browse homeowner requests near you and send your first proposal."
      action={<Button href="/cabinet/nearby-requests">Browse requests</Button>}
    />
  );

  const counts: Record<Filter, number> = {
    all:      proposals.length,
    pending:  proposals.filter((p) => p.status === "pending").length,
    accepted: proposals.filter((p) => p.status === "accepted").length,
    rejected: proposals.filter((p) => p.status === "rejected").length,
  };

  const visible = filter === "all" ? proposals : proposals.filter((p) => p.status === filter);

  return (
    <div>
      <PageHeading
        title={<>MY PROPOSALS</>}
        count={proposals.length}
        unit={["proposal", "proposals"]}
      />

      <FilterBar
        filters={FILTERS.map(({ key, label }) => ({ key, label, count: counts[key] }))}
        active={filter}
        onChange={setFilter}
      />

      {visible.length === 0 ? (
        <p className="py-10 text-center text-body text-muted">
          No {filter} proposals.
        </p>
      ) : (
        <div className="divide-y divide-line">
          {visible.map((p) => (
            <ProposalRow key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
