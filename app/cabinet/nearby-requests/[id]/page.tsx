"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { TabBar } from "@/components/ui/tab-bar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { apiFetch } from "@/lib/api";
import { getAuthToken } from "@/store/auth";
import { relativeTime, formatPriceNote } from "@/lib/formatters";
import { generateGardenPdf } from "@/lib/generateGardenPdf";
import { proposalStatusColor, requestStatusColor, proposalStatusLabel, requestStatusLabel } from "@/lib/statusColors";
import { BackButton } from "@/components/ui/back-button";
import { useChatStore } from "@/store/chat";
import type { NearbyRequestDetail } from "@/types/models";

type DetailTab = "details" | "chat";

export default function NearbyRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [req, setReq] = useState<NearbyRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [priceNote, setPriceNote] = useState("");
  const [timelineDays, setTimelineDays] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>(
    searchParams.get("tab") === "chat" ? "chat" : "details",
  );
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);

  const chatUnread = useChatStore((s) => {
    const room = s.rooms.find((r) => r.jobId === id);
    return room ? (s.unread[room.id] ?? 0) : 0;
  });

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

  // Resolve chat room when chat tab is open and proposal is accepted
  useEffect(() => {
    if (activeTab !== "chat" || !req || req.myProposal?.status !== "accepted" || chatRoomId) return;
    void useChatStore.getState()
      .openOrCreateRoom(req.id)
      .then(setChatRoomId)
      .catch(() => null);
  }, [activeTab, req, chatRoomId]);

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
  const proposalAccepted = req.myProposal?.status === "accepted";

  const tabs: { key: DetailTab; label: string; badge?: number }[] = [
    { key: "details", label: "Details" },
    ...(proposalAccepted ? [{ key: "chat" as DetailTab, label: "Chat", badge: chatUnread }] : []),
  ];

  return (
    <div className="max-w-2xl">
      <BackButton href="/cabinet/nearby-requests" label="All requests" />

      {/* Header */}
      <div className="mt-2 mb-4">
        <h1 className="text-display-sm text-forest">{req.title}</h1>
        <div className="mt-1 flex items-center gap-2 text-hint text-muted">
          <Badge dot color={requestStatusColor(req.status)}>{requestStatusLabel(req.status)}</Badge>
          <span>·</span>
          <span>{req.postcode}</span>
          {req.startBy && <><span>·</span><span>Start by {req.startBy}</span></>}
          <span>·</span>
          <span>{relativeTime(req.createdAt)}</span>
        </div>
      </div>

      {/* Tab bar — only when proposal accepted */}
      {proposalAccepted && (
        <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />
      )}

      <div className="mt-6">
        {activeTab === "details" && (
          <div className="flex flex-col gap-6">
            {/* Project scope */}
            {req.projectSummary.zoneCount > 0 && (
              <div className="rounded-lg border border-line bg-canvas p-4">
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
              <div className="flex flex-wrap gap-3">
                {hasPlan && (
                  <Button
                    href={`/cabinet/nearby-requests/${id}/plan`}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="secondary"
                    size="sm"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <rect x="1" y="1" width="12" height="12" rx="1.5" />
                      <path d="M3 4.5h8M3 7h5" />
                    </svg>
                    View plan
                  </Button>
                )}
                {req.calculationResult && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => generateGardenPdf(req.calculationResult!, req.title)}
                    className="border-forest/30 bg-forest/5 text-forest hover:bg-forest/10"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M7 2v7M4 6l3 3 3-3" /><path d="M2 11h10" />
                    </svg>
                    Materials PDF
                  </Button>
                )}
              </div>
            )}

            {/* Proposal section */}
            {req.myProposal ? (
              <div>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink">
                  Your proposal
                </h2>
                <div className="rounded-xl border border-forest/30 bg-forest/3 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <Badge dot color={proposalStatusColor(req.myProposal.status)}>
                      {proposalStatusLabel(req.myProposal.status)}
                    </Badge>
                    <div className="text-right">
                      {req.myProposal.priceNote && (
                        <p className="text-body font-semibold text-forest">{formatPriceNote(req.myProposal.priceNote)}</p>
                      )}
                      {req.myProposal.timelineDays && (
                        <p className="text-hint text-muted">{req.myProposal.timelineDays} days</p>
                      )}
                    </div>
                  </div>
                  <p className="text-body text-muted leading-relaxed">{req.myProposal.message}</p>
                  {proposalAccepted && (
                    <div className="mt-4 pt-4 border-t border-forest/20 flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-forest">
                        Accepted — chat with the homeowner to coordinate.
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("chat")}
                        className="text-forest underline underline-offset-4 hover:no-underline"
                      >
                        Open chat →
                      </Button>
                    </div>
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
                  <Textarea
                    label="Your message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your experience, your approach to this type of project, and why you're the right person for it…"
                    rows={5}
                    required
                    minLength={10}
                  />
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
