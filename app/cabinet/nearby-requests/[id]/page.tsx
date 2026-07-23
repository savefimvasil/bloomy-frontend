"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { apiFetch } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { relativeTime } from "@/lib/dateUtils";
import { generateGardenPdf } from "@/lib/generateGardenPdf";
import type { NearbyRequestDetail, ProposalStatus } from "@/types/models";

function proposalColor(s: ProposalStatus): "green" | "sage" | "danger" {
  if (s === "accepted") return "green";
  if (s === "pending") return "sage";
  return "danger";
}

export default function NearbyRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [req, setReq] = useState<NearbyRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [priceNote, setPriceNote] = useState("");
  const [timelineDays, setTimelineDays] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useRequireAuth();

  function loadRequest() {
    if (!getAuthToken()) return;
    void apiFetch(`/quote-requests/nearby/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load request");
        return res.json() as Promise<NearbyRequestDetail>;
      })
      .then(setReq)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Unknown error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadRequest(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await apiFetch(`/quote-requests/nearby/${id}/propose`, {
        method: "POST",
        body: {
          message: message.trim(),
          priceNote: priceNote.trim() || undefined,
          timelineDays: timelineDays ? parseInt(timelineDays, 10) : undefined,
        },
      });
      const payload = (await res.json()) as { message?: string };
      if (!res.ok) {
        setSubmitError(payload.message ?? "Failed to submit proposal");
        return;
      }
      setLoading(true);
      loadRequest();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Spinner label="Loading…" /></div>;
  if (error || !req) return <p className="text-body text-danger">{error ?? "Not found"}</p>;

  const hasPlan = !!(req.planData as { zones?: unknown[] } | null)?.zones?.length;

  return (
    <div className="max-w-2xl">
      <button
        type="button"
        onClick={() => router.push("/cabinet/nearby-requests")}
        className="mb-6 flex items-center gap-1.5 text-hint text-muted transition hover:text-ink"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 2L4 7L9 12" />
        </svg>
        Back
      </button>

      {/* Request details */}
      <div className="border-b border-line pb-6 mb-8">
        <h1 className="text-display-sm text-forest">{req.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="text-hint text-muted">{req.postcode}</span>
          {req.startBy && <span className="text-hint text-muted">Start by {req.startBy}</span>}
          <span className="text-hint text-muted">{relativeTime(req.createdAt)}</span>
        </div>

        {req.projectSummary.zoneCount > 0 && (
          <div className="mt-4 rounded-lg bg-canvas border border-line p-4">
            <p className="text-hint uppercase tracking-wide text-muted mb-2">Project scope</p>
            <p className="text-body text-muted">
              {req.projectSummary.zoneCount} zone{req.projectSummary.zoneCount !== 1 ? "s" : ""}
              {req.projectSummary.zoneSummary.length > 0 &&
                `: ${req.projectSummary.zoneSummary.join(", ")}`}
            </p>
          </div>
        )}

        {/* Plan & materials actions */}
        {(hasPlan || req.calculationResult) && (
          <div className="mt-4 flex flex-wrap gap-3">
            {hasPlan && (
              <button
                type="button"
                onClick={() => router.push(`/cabinet/nearby-requests/${id}/plan`)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink transition hover:border-forest/40 hover:text-forest"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="1" y="1" width="12" height="12" rx="1.5" />
                  <path d="M3 4.5h8M3 7h5" />
                </svg>
                View plan
              </button>
            )}
            {req.calculationResult && (
              <button
                type="button"
                onClick={() => generateGardenPdf(req.calculationResult!, req.title)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-forest/30 bg-forest/5 px-4 py-2 text-sm font-medium text-forest transition hover:bg-forest/10"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M7 2v7M4 6l3 3 3-3" />
                  <path d="M2 11h10" />
                </svg>
                Materials PDF
              </button>
            )}
          </div>
        )}
      </div>

      {/* Proposal section */}
      {req.myProposal ? (
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink">
            Your proposal
          </h2>
          <div className="rounded-xl border border-forest/30 bg-forest/3 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <Badge dot color={proposalColor(req.myProposal.status)}>
                {req.myProposal.status}
              </Badge>
              <div className="text-right">
                {req.myProposal.priceNote && (
                  <p className="text-body font-semibold text-forest">{req.myProposal.priceNote}</p>
                )}
                {req.myProposal.timelineDays && (
                  <p className="text-hint text-muted">{req.myProposal.timelineDays} days</p>
                )}
              </div>
            </div>
            <p className="text-body text-muted leading-relaxed">{req.myProposal.message}</p>
            {req.myProposal.status === "accepted" && (
              <p className="mt-3 text-sm font-medium text-forest">
                Your proposal was accepted. The homeowner will contact you directly.
              </p>
            )}
          </div>
        </div>
      ) : req.status !== "open" ? (
        <p className="text-body text-muted">This request is no longer accepting proposals.</p>
      ) : (
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink">
            Send your proposal
          </h2>
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <label className="text-hint text-muted">Your message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your experience, your approach to this type of project, and why you're the right person for it…"
                rows={5}
                required
                minLength={10}
                className="w-full resize-none rounded-lg border border-line bg-canvas px-3 py-2 text-body text-ink placeholder:text-muted/60 focus:border-forest/40 focus:outline-none"
              />
            </div>

            <Input
              label="Price indication (optional)"
              value={priceNote}
              onChange={(e) => setPriceNote(e.target.value)}
              placeholder="e.g. £2,400–£3,000 depending on materials"
            />

            <Input
              label="Estimated duration in days (optional)"
              type="number"
              min="1"
              max="3650"
              value={timelineDays}
              onChange={(e) => setTimelineDays(e.target.value)}
              placeholder="e.g. 5"
            />

            {submitError && (
              <div className="bg-danger/10 px-4 py-3 text-sm text-danger">{submitError}</div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={submitting} className="px-8">
                {submitting ? "Sending…" : "Send proposal"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.push("/cabinet/nearby-requests")}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
