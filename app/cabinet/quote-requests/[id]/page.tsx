"use client";

import Image from "next/image";
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
import type { ProposalInRequest, QuoteRequestDetail, RequestStatus, NearbyContractor, JobReview } from "@/types/models";

type DetailTab = "proposals" | "photos" | "chat";

// ─── Star rating ─────────────────────────────────────────────────────────────

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          className="text-2xl leading-none transition-transform active:scale-90"
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <span className={(hovered || value) >= n ? "text-amber-400" : "text-muted/30"}>★</span>
        </button>
      ))}
    </div>
  );
}

// ─── Review modal ─────────────────────────────────────────────────────────────

function ReviewModal({
  jobId,
  contractorName,
  existing,
  onClose,
  onSubmitted,
}: {
  jobId: string;
  contractorName: string;
  existing: JobReview | null;
  onClose: () => void;
  onSubmitted: (r: JobReview) => void;
}) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (existing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm" onClick={onClose}>
        <div className="w-full max-w-md rounded-2xl border border-line bg-paper p-6 shadow-xl mx-4" onClick={e => e.stopPropagation()}>
          <p className="mb-1 text-eyebrow text-muted">Your review</p>
          <div className="flex gap-1 text-2xl text-amber-400 mb-3">
            {"★".repeat(existing.rating)}<span className="text-muted/30">{"★".repeat(5 - existing.rating)}</span>
          </div>
          {existing.comment && <p className="text-body text-muted leading-relaxed">{existing.comment}</p>}
          <Button variant="secondary" className="mt-5 w-full" onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  async function handleSubmit() {
    if (rating === 0) { setError("Please select a star rating"); return; }
    setSaving(true);
    try {
      const res = await apiFetch(`/quote-requests/mine/${jobId}/review`, {
        method: "POST",
        body: { rating, comment: comment.trim() || undefined },
      });
      const data = await res.json() as JobReview | { message?: string };
      if (!res.ok) { setError("message" in data && data.message ? data.message : "Failed to submit"); return; }
      onSubmitted(data as JobReview);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-line bg-paper p-6 shadow-xl mx-4" onClick={e => e.stopPropagation()}>
        <p className="mb-1 text-eyebrow text-muted">Leave a review</p>
        <h3 className="mb-4 text-display-sm text-forest">{contractorName}</h3>

        <div className="mb-4">
          <p className="mb-2 text-hint text-muted">How was the work?</p>
          <StarRating value={rating} onChange={setRating} />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-hint text-muted">Comment (optional)</label>
          <textarea
            rows={3}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Quality of work, punctuality, communication…"
            aria-label="Comment (optional)"
            className="w-full resize-none rounded-lg border border-line bg-canvas px-3 py-2 text-body text-ink focus:border-forest/40 focus:outline-none"
            data-testid="review-comment"
          />
        </div>

        {error && <p className="mb-3 text-hint text-danger">{error}</p>}

        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={saving} data-testid="review-submit">
            {saving ? "Submitting…" : "Submit review"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Photo uploader ───────────────────────────────────────────────────────────

const UPLOADS_BASE = process.env.NEXT_PUBLIC_UPLOADS_BASE_URL ?? "";

function PhotoGrid({
  jobId,
  photoUrls,
  completionPhotoUrls,
  canUpload,
  onPhotosChange,
}: {
  jobId: string;
  photoUrls: string[];
  completionPhotoUrls: string[];
  canUpload: boolean;
  onPhotosChange: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { setErr("Max file size is 15 MB"); return; }
    setErr("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await apiFetch("/uploads/photo", { method: "POST", body: form });
      if (!res.ok) { setErr("Upload failed"); return; }
      const { url } = await res.json() as { url: string };
      const r2 = await apiFetch(`/quote-requests/mine/${jobId}/photos`, { method: "POST", body: { url } });
      if (r2.ok) {
        const d = await r2.json() as { photoUrls: string[] };
        onPhotosChange(d.photoUrls);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(url: string) {
    const res = await apiFetch(`/quote-requests/mine/${jobId}/photos?url=${encodeURIComponent(url)}`, { method: "DELETE" });
    if (res.ok) {
      const d = await res.json() as { photoUrls: string[] };
      onPhotosChange(d.photoUrls);
    }
  }

  const allPhotos = [
    ...photoUrls.map(u => ({ url: u, tag: "" })),
    ...completionPhotoUrls.map(u => ({ url: u, tag: "Completion" })),
  ];

  return (
    <div>
      {allPhotos.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {allPhotos.map(({ url, tag }) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-canvas">
              <Image src={`${UPLOADS_BASE}${url}`} alt="" fill className="object-cover" unoptimized />
              {tag && (
                <span className="absolute bottom-1 left-1 rounded bg-ink/60 px-1.5 py-0.5 text-[10px] text-paper">{tag}</span>
              )}
              {canUpload && !tag && (
                <button
                  onClick={() => void handleDelete(url)}
                  className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-ink/60 text-paper text-xs group-hover:flex"
                  aria-label="Remove photo"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {canUpload && photoUrls.length < 10 && (
        <label className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line px-4 py-2.5 text-hint text-muted transition hover:border-forest hover:text-forest ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M7 2v7M4 6l3-3 3 3" /><path d="M2 11h10" />
          </svg>
          {uploading ? "Uploading…" : "Add photo"}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} data-testid="photo-upload" />
        </label>
      )}
      {err && <p className="mt-2 text-hint text-danger">{err}</p>}
    </div>
  );
}

// ─── Contractor initials avatar ──────────────────────────────────────────────

function ContractorAvatar({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`
    : (parts[0]?.[0] ?? "?");
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest/10 text-hint font-semibold text-forest uppercase">
      {initials}
    </div>
  );
}

// ─── Nearby contractors panel ──────────────────────────────────────────────────

function NearbyContractorsPanel({ jobId, gardenProjectId }: { jobId: string; gardenProjectId: string }) {
  const [contractors, setContractors] = useState<NearbyContractor[] | null>(null);

  useEffect(() => {
    void apiFetch(`/quote-requests/mine/${jobId}/nearby-contractors`)
      .then(r => r.ok ? r.json() as Promise<NearbyContractor[]> : [])
      .then(setContractors)
      .catch(() => setContractors([]));
  }, [jobId]);

  if (contractors === null) return null;
  if (contractors.length === 0) return null;

  return (
    <div className="mt-6 rounded-xl border border-line bg-canvas p-4">
      <p className="mb-1 text-hint font-semibold uppercase tracking-wider text-muted">
        Contractors near you
      </p>
      <p className="mb-4 text-hint text-muted">
        These contractors cover your area — send your project plan directly to any of them.
      </p>
      <div className="divide-y divide-line">
        {contractors.map(c => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-body font-semibold text-ink">{c.businessName}</span>
                {c.verified && <VerifiedBadge compact />}
              </div>
              {c.bio && (
                <p className="mt-0.5 line-clamp-1 text-hint text-muted">{c.bio}</p>
              )}
              <p className="mt-0.5 text-hint text-muted/70">{c.postcode} · {c.distanceMiles} mi away</p>
            </div>
            <div className="flex items-center gap-2">
              <Button href={`/contractors/profile/${c.id}`} variant="ghost" size="sm" className="text-muted">
                Profile
              </Button>
              <Button
                href={`/cabinet/quote-requests/request?contractorId=${c.id}&projectId=${gardenProjectId}`}
                size="sm"
              >
                Send request →
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Proposal card ────────────────────────────────────────────────────────────

function ProposalCard({
  proposal,
  requestStatus,
  onAccept,
  onChat,
  chatUnread,
  chatOpening,
}: {
  proposal: ProposalInRequest;
  requestStatus: RequestStatus;
  onAccept: (id: string) => void;
  onChat: () => void;
  chatUnread: number;
  chatOpening: boolean;
}) {
  const isAccepted = proposal.status === "accepted";
  const contractorName = proposal.contractor.businessName ?? `${proposal.contractor.name} ${proposal.contractor.surname}`;
  return (
    <div className={`rounded-xl border p-5 ${isAccepted ? "border-forest bg-forest/3" : "border-line bg-paper"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <ContractorAvatar name={contractorName} />
          <div className="min-w-0">
            <p className="text-body font-semibold text-ink">{contractorName}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge dot color={proposalStatusColor(proposal.status)}>
                {proposalStatusLabel(proposal.status)}
              </Badge>
              {proposal.contractor.verified && <VerifiedBadge compact />}
              {proposal.contractor.avgRating != null && (
                <span className="text-hint text-amber-500">
                  ★ {proposal.contractor.avgRating}
                  <span className="text-muted"> ({proposal.contractor.reviewCount})</span>
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          {proposal.priceNote && (
            <p className="text-body font-semibold text-forest">{formatPriceNote(proposal.priceNote)}</p>
          )}
          {proposal.timelineDays && (
            <p className="text-hint text-muted">{proposal.timelineDays} day{proposal.timelineDays !== 1 ? "s" : ""}</p>
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
              <a href={`tel:${proposal.contractor.phone}`} className="text-forest">{proposal.contractor.phone}</a>
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <p className="text-hint text-muted">{relativeTime(proposal.createdAt)}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={onChat}
            disabled={chatOpening}
            className="relative inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-hint text-muted transition hover:border-forest/60 hover:text-forest disabled:opacity-50"
            data-testid="open-chat-btn"
          >
            {chatOpening ? "Opening…" : isAccepted ? "Open chat" : "Chat"}
            {chatUnread > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-forest px-1 text-[10px] font-bold text-paper leading-none">
                {chatUnread}
              </span>
            )}
          </button>
          {requestStatus === "open" && proposal.status === "pending" && (
            <Button size="sm" onClick={() => onAccept(proposal.id)} data-testid="accept-proposal-btn">Accept proposal</Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QuoteRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [req, setReq] = useState<QuoteRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("proposals");
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [review, setReview] = useState<JobReview | null>(null);
  const [proposalSort, setProposalSort] = useState<"newest" | "rating" | "price">("newest");
  const [chatOpeningId, setChatOpeningId] = useState<string | null>(null);

  const chatRooms = useChatStore((s) => s.rooms);
  const chatUnreadMap = useChatStore((s) => s.unread);

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
      .then((data) => {
        setReq(data);
        if (data.status === "completed") {
          void apiFetch(`/quote-requests/mine/${id}/review`)
            .then(r => r.ok ? r.json() as Promise<JobReview | null> : null)
            .then(r => setReview(r))
            .catch(() => null);
        }
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Unknown error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab !== "chat" || !req || (req.status !== "awarded" && req.status !== "in_progress" && req.status !== "completed") || chatRoomId) return;
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

  async function handleStatusAction(action: "start" | "complete") {
    if (!req) return;
    setActionLoading(true);
    try {
      const res = await apiFetch(`/quote-requests/mine/${req.id}/${action}`, { method: "POST" });
      if (res.ok) {
        const updated = await res.json() as { status: RequestStatus };
        setReq(prev => prev ? { ...prev, status: updated.status } : prev);
        if (action === "complete") setShowReview(true);
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function handleOpenChat(contractorId: string) {
    if (!req) return;
    setChatOpeningId(contractorId);
    try {
      const roomId = await useChatStore.getState().openOrCreateRoom(req.id, contractorId);
      setChatRoomId(roomId);
      setActiveTab("chat");
    } catch {
      // fail silently
    } finally {
      setChatOpeningId(null);
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Spinner label="Loading…" /></div>;
  if (error || !req) return <p className="text-body text-danger">{error ?? "Not found"}</p>;

  const isAwarded = req.status === "awarded";
  const isInProgress = req.status === "in_progress";
  const isCompleted = req.status === "completed";
  const hasChat = isAwarded || isInProgress || isCompleted;

  const acceptedProposal = req.proposals.find(p => p.status === "accepted");
  const acceptedContractorName = acceptedProposal?.contractor.businessName
    ?? (acceptedProposal ? `${acceptedProposal.contractor.name} ${acceptedProposal.contractor.surname}` : "Contractor");

  const photoCount = (req.photoUrls?.length ?? 0) + (req.completionPhotoUrls?.length ?? 0);
  const tabs: { key: DetailTab; label: string; badge?: number }[] = [
    { key: "proposals", label: `Proposals (${req.proposals.length})` },
    { key: "photos", label: photoCount > 0 ? `Photos (${photoCount})` : "Photos" },
    ...(hasChat ? [{ key: "chat" as DetailTab, label: "Chat", badge: chatUnread }] : []),
  ];

  return (
    <div className="max-w-2xl">
      <ConfirmDialog
        open={!!acceptingId}
        onCancel={() => setAcceptingId(null)}
        onConfirm={() => { if (acceptingId) void handleAccept(acceptingId); }}
        title="Accept this proposal?"
        message="All other proposals will be declined. The contractor's contact details will be revealed."
        confirmLabel="Accept"
      />

      {showReview && (
        <ReviewModal
          jobId={req.id}
          contractorName={acceptedContractorName}
          existing={review}
          onClose={() => setShowReview(false)}
          onSubmitted={(r) => { setReview(r); setShowReview(false); }}
        />
      )}

      <BackButton href="/cabinet/quote-requests" label="All requests" />

      {/* Header */}
      <div className="mt-2 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-display-sm text-forest">{req.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Badge dot color={requestStatusColor(req.status)}>{requestStatusLabel(req.status)}</Badge>
              {req.isDirectRequest && (
                <span className="rounded-full bg-forest/10 px-2.5 py-0.5 text-hint font-medium text-forest">Direct request</span>
              )}
              <span className="text-hint text-muted">{req.postcode}</span>
              {req.startBy && <span className="text-hint text-muted">Start by {req.startBy}</span>}
            </div>
            {req.isDirectRequest && req.note && (
              <div className="mt-3 border-l-2 border-forest/30 pl-3">
                <p className="text-hint text-muted mb-0.5">Your note to the contractor</p>
                <p className="text-hint text-ink">{req.note}</p>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
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

        {/* Job status action bar */}
        {(isAwarded || isInProgress || isCompleted) && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-canvas px-4 py-3">
            <div className="flex-1">
              <p className="text-hint font-medium text-ink">
                {(isAwarded || isInProgress) && "When the contractor has finished, mark the job as complete."}
                {isCompleted && (
                  <>Work completed. </>
                )}
              </p>
            </div>
            {(isAwarded || isInProgress) && (
              <Button size="sm" disabled={actionLoading} onClick={() => void handleStatusAction("complete")} data-testid="mark-complete-btn">
                {actionLoading ? "Saving…" : "Mark work done"}
              </Button>
            )}
          </div>
        )}

        {/* Review nudge — prominent card after completion */}
        {isCompleted && !review && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-body font-semibold text-ink mb-1">Leave a review for {acceptedContractorName}</p>
            <p className="text-hint text-muted mb-3">Reviews help other homeowners choose the right contractor. It only takes a minute.</p>
            <Button size="sm" onClick={() => setShowReview(true)} data-testid="write-review-btn">Write a review →</Button>
          </div>
        )}
        {isCompleted && review && (
          <div className="mt-4 rounded-xl border border-line bg-canvas px-5 py-3 flex items-center justify-between gap-3">
            <p className="text-hint text-muted">You reviewed {acceptedContractorName}.</p>
            <button className="text-hint text-forest hover:underline" onClick={() => setShowReview(true)}>View review</button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <div className="mt-4">
        {activeTab === "proposals" && (
          <>
            {req.proposals.length === 0 ? (
              <>
                <div className="rounded-xl border border-line bg-canvas p-8 text-center">
                  <p className="text-body text-muted">
                    No proposals yet. Contractors in your area will see this request and respond.
                  </p>
                </div>
                <NearbyContractorsPanel jobId={req.id} gardenProjectId={req.gardenProjectId} />
              </>
            ) : (
              <>
                {/* Sort controls */}
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-hint text-muted shrink-0">Sort by:</span>
                  {(["newest", "rating", "price"] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setProposalSort(opt)}
                      className={`rounded-full px-3 py-1 text-hint transition ${proposalSort === opt ? "bg-forest text-paper font-medium" : "border border-line text-muted hover:border-forest/40 hover:text-ink"}`}
                    >
                      {opt === "newest" ? "Newest" : opt === "rating" ? "Rating" : "Price"}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-4">
                  {[...req.proposals]
                    .sort((a, b) => {
                      if (a.status === "accepted") return -1;
                      if (b.status === "accepted") return 1;
                      if (proposalSort === "rating") {
                        return (b.contractor.avgRating ?? 0) - (a.contractor.avgRating ?? 0);
                      }
                      if (proposalSort === "price") {
                        const pa = parseFloat(a.priceNote?.replace(/[^0-9.]/g, "") ?? "0") || 0;
                        const pb = parseFloat(b.priceNote?.replace(/[^0-9.]/g, "") ?? "0") || 0;
                        return pa - pb;
                      }
                      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    })
                    .map((p) => {
                      const chatRoom = chatRooms.find(r => r.jobId === req.id && r.otherPartyId === p.contractor.id);
                      const proposalUnread = chatRoom ? (chatUnreadMap[chatRoom.id] ?? 0) : 0;
                      return (
                      <ProposalCard
                        key={p.id}
                        proposal={p}
                        requestStatus={req.status}
                        onAccept={setAcceptingId}
                        onChat={() => void handleOpenChat(p.contractor.id)}
                        chatUnread={proposalUnread}
                        chatOpening={chatOpeningId === p.contractor.id}
                      />
                    );
                    })}
                </div>
              </>
            )}
          </>
        )}

        {activeTab === "photos" && (
          <PhotoGrid
            jobId={req.id}
            photoUrls={req.photoUrls ?? []}
            completionPhotoUrls={req.completionPhotoUrls ?? []}
            canUpload
            onPhotosChange={(urls) => setReq((prev) => prev ? { ...prev, photoUrls: urls } : prev)}
          />
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
