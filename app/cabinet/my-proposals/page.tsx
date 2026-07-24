"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CabinetEmptyState } from "@/components/ui/cabinet-empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { Spinner } from "@/components/ui/spinner";
import { useApiFetch } from "@/lib/useApiFetch";
import { relativeTime } from "@/lib/dateUtils";
import { proposalStatusColor, requestStatusColor, proposalStatusLabel, requestStatusLabel } from "@/lib/statusColors";
import type { MyProposal } from "@/types/models";

export default function MyProposalsPage() {
  const { data, loading, error } = useApiFetch<MyProposal[]>("/quote-requests/my-proposals");

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

  return (
    <div>
      <PageHeading
        title={<>MY PROPOSALS</>}
        count={proposals.length}
        unit={["proposal", "proposals"]}
      />
      <div className="border-t border-line" />
      <div className="divide-y divide-line">
        {proposals.map((p) => (
          <div key={p.id} className="py-6 flex flex-col gap-2">
            {p.request && (
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/cabinet/nearby-requests/${p.request.id}`}
                  className="text-body font-semibold text-ink transition hover:text-forest"
                >
                  {p.request.title}
                </Link>
                <Badge dot color={requestStatusColor(p.request.status)}>
                  {requestStatusLabel(p.request.status)}
                </Badge>
                <span className="text-hint text-muted">{p.request.postcode}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Badge dot color={proposalStatusColor(p.status)}>
                Proposal {proposalStatusLabel(p.status)}
              </Badge>
              {p.priceNote && (
                <span className="text-body font-medium text-forest">{p.priceNote}</span>
              )}
              {p.timelineDays && (
                <span className="text-hint text-muted">{p.timelineDays} days</span>
              )}
            </div>

            <p className="text-body text-muted line-clamp-2 leading-relaxed">{p.message}</p>

            {p.status === "accepted" && (
              <p className="text-sm font-medium text-forest">
                Accepted — the homeowner will contact you directly.
              </p>
            )}

            <p className="text-hint text-muted">{relativeTime(p.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
