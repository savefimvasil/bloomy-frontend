"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Spinner } from "@/components/ui/spinner";
import { apiFetch } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { relativeTime } from "@/lib/dateUtils";
import { generateGardenPdf } from "@/lib/generateGardenPdf";
import { proposalStatusColor, requestStatusColor } from "@/lib/statusColors";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import type { ProposalInRequest, QuoteRequestDetail, RequestStatus } from "@/types/models";

function ProposalCard({
  proposal,
  requestStatus,
  onAccept,
}: {
  proposal: ProposalInRequest;
  requestStatus: RequestStatus;
  onAccept: (id: string) => void;
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
              {proposal.status}
            </Badge>
            {proposal.contractor.verified && <VerifiedBadge compact />}
          </div>
        </div>
        <div className="text-right">
          {proposal.priceNote && (
            <p className="text-body font-semibold text-forest">{proposal.priceNote}</p>
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
              <a
                href={`mailto:${proposal.contractor.email}`}
                className="text-forest underline underline-offset-4"
              >
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
        {requestStatus === "open" && proposal.status === "pending" && (
          <Button size="sm" onClick={() => onAccept(proposal.id)}>
            Accept proposal
          </Button>
        )}
      </div>
    </div>
  );
}

export default function QuoteRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [req, setReq] = useState<QuoteRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useRequireAuth();

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

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAccept(proposalId: string) {
    if (!req) return;
    await apiFetch(`/quote-requests/mine/${req.id}/proposals/${proposalId}/accept`, {
      method: "POST",
    });
    setAcceptingId(null);
    setLoading(true);
    load();
  }

  if (loading) return <div className="flex justify-center py-12"><Spinner label="Loading…" /></div>;
  if (error || !req) return <p className="text-body text-danger">{error ?? "Not found"}</p>;

  return (
    <div className="max-w-2xl">
      <ConfirmDialog
        open={!!acceptingId}
        onCancel={() => setAcceptingId(null)}
        onConfirm={() => { if (acceptingId) void handleAccept(acceptingId); }}
        title="Accept this proposal?"
        message="All other proposals will be declined. The contractor's contact details will be revealed."
      />

      <button
        type="button"
        onClick={() => router.push("/cabinet/quote-requests")}
        className="mb-6 flex items-center gap-1.5 text-hint text-muted transition hover:text-ink"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 2L4 7L9 12" />
        </svg>
        Back to requests
      </button>

      <div className="border-b border-line pb-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-display-sm text-forest">{req.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Badge dot color={requestStatusColor(req.status)}>{req.status}</Badge>
              <span className="text-hint text-muted">{req.postcode}</span>
              {req.startBy && (
                <span className="text-hint text-muted">Start by {req.startBy}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {req.calculationResult && (
              <button
                type="button"
                onClick={() => generateGardenPdf(req.calculationResult!, req.title)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-forest/30 bg-forest/5 px-3 py-1.5 text-sm font-medium text-forest transition hover:bg-forest/10"
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M7 2v7M4 6l3 3 3-3" />
                  <path d="M2 11h10" />
                </svg>
                Materials PDF
              </button>
            )}
            <Button
              href={`/projects/${req.gardenProjectId}/plan`}
              variant="secondary"
              size="sm"
            >
              Open project →
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink">
          Proposals received ({req.proposals.length})
        </h2>

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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
