"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Spinner } from "@/components/ui/spinner";
import { TabBar } from "@/components/ui/tab-bar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { apiFetch } from "@/lib/api";
import { getAuthToken } from "@/store/auth";
import { relativeTime, formatPriceNote } from "@/lib/formatters";
import { generateGardenPdf } from "@/lib/generateGardenPdf";
import { proposalStatusColor, requestStatusColor, proposalStatusLabel, requestStatusLabel } from "@/lib/statusColors";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { BackButton } from "@/components/ui/back-button";
import { useChatStore } from "@/store/chat";
import type { ProposalInRequest, QuoteRequestDetail, RequestStatus } from "@/types/models";

type DetailTab = "proposals" | "chat";

function ProposalCard({
  proposal,
  requestStatus,
  onAccept,
  onChat,
}: {
  proposal: ProposalInRequest;
  requestStatus: RequestStatus;
  onAccept: (id: string) => void;
  onChat: () => void;
}) {
  const isAccepted = proposal.status === "accepted";
  return (
    <div
      className={`rounded-xl border p-5 ${isAccepted ? "border-forest bg-forest/3" : "border-line bg-paper"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-body font-semibold text-ink">
            {proposal.contractor.businessName ??
              `${proposal.contractor.name} ${proposal.contractor.surname}`}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge dot color={proposalStatusColor(proposal.status)}>
              {proposalStatusLabel(proposal.status)}
            </Badge>
            {proposal.contractor.verified && <VerifiedBadge compact />}
          </div>
        </div>
        <div className="text-right">
          {proposal.priceNote && (
            <p className="text-body font-semibold text-forest">{formatPriceNote(proposal.priceNote)}</p>
          )}
          {proposal.timelineDays && (
            <p className="text-hint text-muted">
              {proposal.timelineDays} day{proposal.timelineDays !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      <p className="mt-4 text-body text-muted leading-relaxed">{proposal.message}</p>

      {isAccepted && (
        <div className="mt-4 rounded-lg bg-canvas p-4">
          <p className="mb-2 text-hint uppercase tracking-wide text-muted">Contact details</p>
          {proposal.contractor.email && (
            <p className="text-body text-ink">
              <span className="text-muted">Email: </span>
              <a href={`mailto:${proposal.contractor.email}`} className="text-forest underline underline-offset-4">
                {proposal.contractor.email}
              </a>
            </p>
          )}
          {proposal.contractor.phone && (
            <p className="mt-1 text-body text-ink">
              <span className="text-muted">Phone: </span>
              <a href={`tel:${proposal.contractor.phone}`} className="text-forest">
                {proposal.contractor.phone}
              </a>
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <p className="text-hint text-muted">{relativeTime(proposal.createdAt)}</p>
        <div className="flex items-center gap-2">
          {isAccepted && (
            <Button size="sm" variant="secondary" onClick={onChat}>
              Open chat
            </Button>
          )}
          {requestStatus === "open" && proposal.status === "pending" && (
            <Button size="sm" onClick={() => onAccept(proposal.id)}>
              Accept proposal
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QuoteRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [req, setReq] = useState<QuoteRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("proposals");
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);

  const chatUnread = useChatStore((s) => {
    const room = s.rooms.find((r) => r.jobId === id);
    return room ? (s.unread[room.id] ?? 0) : 0;
  });

  function load() {
    if (!getAuthToken()) return;
    void apiFetch(`/quote-requests/mine/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load request");
        return res.json() as Promise<QuoteRequestDetail>;
      })
      .then(setReq)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Unknown error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Resolve chat room when the chat tab is opened for an awarded job
  useEffect(() => {
    if (activeTab !== "chat" || !req || req.status !== "awarded" || chatRoomId) return;
    void useChatStore.getState()
      .openOrCreateRoom(req.id)
      .then(setChatRoomId)
      .catch(() => null);
  }, [activeTab, req, chatRoomId]);

  async function handleAccept(proposalId: string) {
    if (!req) return;
    await apiFetch(`/quote-requests/mine/${req.id}/proposals/${proposalId}/accept`, { method: "POST" });
    setAcceptingId(null);
    setLoading(true);
    load();
  }

  if (loading) return <div className="flex justify-center py-12"><Spinner label="Loading…" /></div>;
  if (error || !req) return <p className="text-body text-danger">{error ?? "Not found"}</p>;

  const isAwarded = req.status === "awarded";
  const tabs: { key: DetailTab; label: string; badge?: number }[] = [
    { key: "proposals", label: `Proposals (${req.proposals.length})` },
    ...(isAwarded ? [{ key: "chat" as DetailTab, label: "Chat", badge: chatUnread }] : []),
  ];

  return (
    <div className="max-w-2xl">
      <ConfirmDialog
        open={!!acceptingId}
        onCancel={() => setAcceptingId(null)}
        onConfirm={() => { if (acceptingId) void handleAccept(acceptingId); }}
        title="Accept this proposal?"
        message="All other proposals will be declined. The contractor's contact details will be revealed."
      />

      <BackButton href="/cabinet/quote-requests" label="All requests" />

      {/* Header */}
      <div className="mt-2 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-display-sm text-forest">{req.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Badge dot color={requestStatusColor(req.status)}>{requestStatusLabel(req.status)}</Badge>
              <span className="text-hint text-muted">{req.postcode}</span>
              {req.startBy && <span className="text-hint text-muted">Start by {req.startBy}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {req.calculationResult && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => generateGardenPdf(req.calculationResult!, req.title)}
                className="border-forest/30 bg-forest/5 text-forest hover:bg-forest/10"
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M7 2v7M4 6l3 3 3-3" /><path d="M2 11h10" />
                </svg>
                Materials PDF
              </Button>
            )}
            <Button href={`/projects/${req.gardenProjectId}/plan`} variant="secondary" size="sm">
              Open project →
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs — only show when awarded */}
      {isAwarded && (
        <TabBar
          tabs={tabs}
          active={activeTab}
          onChange={setActiveTab}
        />
      )}

      <div className="mt-4">
        {activeTab === "proposals" && (
          <>
            {req.proposals.length === 0 ? (
              <div className="rounded-xl border border-line bg-canvas p-8 text-center">
                <p className="text-body text-muted">
                  No proposals yet. Contractors in your area will see this request and respond.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {req.proposals.map((p) => (
                  <ProposalCard
                    key={p.id}
                    proposal={p}
                    requestStatus={req.status}
                    onAccept={setAcceptingId}
                    onChat={() => setActiveTab("chat")}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "chat" && (
          <>
            {!chatRoomId && <div className="flex justify-center py-12"><Spinner label="Opening chat…" /></div>}
            {chatRoomId && <ChatWindow roomId={chatRoomId} />}
          </>
        )}
      </div>
    </div>
  );
}
