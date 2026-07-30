"use client";

import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { proposalSchema, type ProposalFormValues } from "@/lib/schemas";
import { API } from "@/lib/endpoints";
import type { NearbyRequestDetail } from "@/types/models";

type DetailTab = "details" | "photos" | "chat";

const UPLOADS_BASE = process.env.NEXT_PUBLIC_UPLOADS_BASE_URL ?? "";

function CompletionPhotoUploader({
  jobId,
  completionPhotoUrls,
  onUploaded,
}: {
  jobId: string;
  completionPhotoUrls: string[];
  onUploaded: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { setErr("Max 15 MB"); return; }
    setErr("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const r1 = await apiFetch("/uploads/photo", { method: "POST", body: form });
      if (!r1.ok) { setErr("Upload failed"); return; }
      const { url } = await r1.json() as { url: string };
      const r2 = await apiFetch(`/quote-requests/nearby/${jobId}/completion-photo`, { method: "POST", body: { url } });
      if (r2.ok) {
        const d = await r2.json() as { completionPhotoUrls: string[] };
        onUploaded(d.completionPhotoUrls);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 mb-3">
        {completionPhotoUrls.map((url) => (
          <div key={url} className="relative aspect-square overflow-hidden rounded-lg border border-line bg-canvas">
            <Image src={`${UPLOADS_BASE}${url}`} alt="" fill className="object-cover" unoptimized />
          </div>
        ))}
      </div>
      {completionPhotoUrls.length < 20 && (
        <label className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line px-4 py-2.5 text-hint text-muted transition hover:border-forest hover:text-forest ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M7 2v7M4 6l3-3 3 3" /><path d="M2 11h10" />
          </svg>
          {uploading ? "Uploading…" : "Add completion photo"}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
      )}
      {err && <p className="mt-2 text-hint text-danger">{err}</p>}
    </div>
  );
}

function DirectRequestBanner({ jobId, note, onAccepted }: { jobId: string; note: string | null; onAccepted: () => void }) {
  const [accepting, setAccepting] = useState(false);
  const [err, setErr] = useState("");

  async function handleAccept() {
    setAccepting(true);
    setErr("");
    try {
      const res = await apiFetch(`/quote-requests/direct/${jobId}/accept`, { method: "POST" });
      if (!res.ok) { setErr("Could not accept. Please try again."); return; }
      onAccepted();
    } catch {
      setErr("Could not accept. Please try again.");
    } finally {
      setAccepting(false);
    }
  }

  return (
    <div className="rounded-xl border border-forest/30 bg-forest/5 px-5 py-5">
      <p className="text-eyebrow text-forest mb-2">Direct request from homeowner</p>
      {note && (
        <div className="mb-4 border-l-2 border-forest/30 pl-3">
          <p className="text-hint text-muted mb-0.5">Their note</p>
          <p className="text-hint text-ink">{note}</p>
        </div>
      )}
      <p className="text-hint text-muted mb-4">
        Accept this request to start work and open the chat with the homeowner.
      </p>
      {err && <p className="mb-3 text-hint text-danger">{err}</p>}
      <Button onClick={handleAccept} disabled={accepting}>
        {accepting ? "Accepting…" : "Accept & Start work"}
      </Button>
    </div>
  );
}

export default function NearbyRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [req, setReq] = useState<NearbyRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [startingWork, setStartingWork] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>(
    searchParams.get("tab") === "chat" ? "chat" : "details",
  );
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
  });

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

  useEffect(() => { loadRequest(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Open chat room when chat tab is open and contractor has any proposal
  useEffect(() => {
    if (activeTab !== "chat" || !req || !req.myProposal || chatRoomId) return;
    void useChatStore.getState()
      .openOrCreateRoom(req.id)
      .then(setChatRoomId)
      .catch(() => null);
  }, [activeTab, req, chatRoomId]);

  const onSubmit = handleSubmit(async (values: ProposalFormValues) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await apiFetch(`/quote-requests/nearby/${id}/propose`, {
        method: "POST",
        body: {
          message: values.message.trim(),
          priceNote: values.priceNote?.trim() || undefined,
          timelineDays: values.timelineDays ? Number(values.timelineDays) : undefined,
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
  });

  const onUpdate = handleSubmit(async (values: ProposalFormValues) => {
    setEditError(null);
    setSubmitting(true);
    try {
      const res = await apiFetch(`/quote-requests/nearby/${id}/proposal`, {
        method: "PUT",
        body: {
          message: values.message.trim(),
          priceNote: values.priceNote?.trim() || undefined,
          timelineDays: values.timelineDays ? Number(values.timelineDays) : undefined,
        },
      });
      const payload = (await res.json()) as { message?: string };
      if (!res.ok) { setEditError(payload.message ?? "Failed to update proposal"); return; }
      setEditMode(false);
      setLoading(true);
      loadRequest();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  });

  async function handleStartWork() {
    setStartingWork(true);
    try {
      await apiFetch(API.quoteRequests.contractorStartWork(id), { method: "POST" });
      setLoading(true);
      loadRequest();
    } finally {
      setStartingWork(false);
    }
  }

  async function handleWithdraw() {
    if (!window.confirm("Withdraw your proposal? This cannot be undone.")) return;
    setWithdrawing(true);
    try {
      await apiFetch(`/quote-requests/nearby/${id}/proposal`, { method: "DELETE" });
      setLoading(true);
      loadRequest();
    } finally {
      setWithdrawing(false);
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Spinner label="Loading…" /></div>;
  if (error || !req) return <p className="text-body text-danger">{error ?? "Not found"}</p>;

  const hasPlan = !!(req.planData as { zones?: unknown[] } | null)?.zones?.length;
  const proposalAccepted = req.myProposal?.status === "accepted";

  const photoCount = (req.photoUrls?.length ?? 0) + (req.completionPhotoUrls?.length ?? 0);
  const hasProposal = !!req.myProposal;
  const tabs: { key: DetailTab; label: string; badge?: number }[] = [
    { key: "details", label: "Details" },
    { key: "photos", label: photoCount > 0 ? `Photos (${photoCount})` : "Photos" },
    ...(hasProposal ? [{ key: "chat" as DetailTab, label: "Chat", badge: chatUnread }] : []),
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

      <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />

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

            {/* Direct request banner */}
            {req.isDirectRequest && !req.myProposal && (
              <DirectRequestBanner jobId={req.id} note={req.note} onAccepted={() => setActiveTab("chat")} />
            )}

            {/* Proposal section */}
            {!req.isDirectRequest && req.myProposal ? (
              <div>
                <h2 className="mb-4 text-hint font-semibold uppercase tracking-wide text-ink">
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
                  {!editMode && (
                    <p className="text-body text-muted leading-relaxed">{req.myProposal.message}</p>
                  )}

                  {editMode ? (
                    <form className="mt-4 flex flex-col gap-4" onSubmit={onUpdate}>
                      <Textarea
                        label="Your message"
                        rows={4}
                        error={errors.message?.message}
                        defaultValue={req.myProposal.message}
                        {...register("message")}
                      />
                      <Input
                        label="Price indication (optional)"
                        error={errors.priceNote?.message}
                        defaultValue={req.myProposal.priceNote ?? ""}
                        {...register("priceNote")}
                      />
                      <Input
                        label="Estimated duration in days (optional)"
                        type="number"
                        min="1"
                        max="3650"
                        defaultValue={req.myProposal.timelineDays ?? ""}
                        error={errors.timelineDays?.message}
                        {...register("timelineDays")}
                      />
                      {editError && (
                        <p className="text-hint text-danger">{editError}</p>
                      )}
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={submitting}>{submitting ? "Saving…" : "Save changes"}</Button>
                        <Button type="button" size="sm" variant="secondary" onClick={() => { setEditMode(false); setEditError(null); reset(); }}>Cancel</Button>
                      </div>
                    </form>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-forest/20">
                      {proposalAccepted ? (
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          {req.status === "awarded" ? (
                            <Button
                              type="button"
                              size="sm"
                              disabled={startingWork}
                              onClick={() => void handleStartWork()}
                            >
                              {startingWork ? "Updating…" : "Mark work started →"}
                            </Button>
                          ) : (
                            <p className="text-hint font-medium text-forest capitalize">{req.status.replace("_", " ")} — coordinate in chat.</p>
                          )}
                          <Button type="button" variant="ghost" size="sm" onClick={() => setActiveTab("chat")} className="text-forest underline underline-offset-4 hover:no-underline">
                            Open chat →
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <Button type="button" variant="ghost" size="sm" onClick={() => setActiveTab("chat")} className="text-forest underline underline-offset-4 hover:no-underline">
                            Chat with homeowner →
                          </Button>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                reset({
                                  message: req.myProposal!.message,
                                  priceNote: req.myProposal!.priceNote ?? "",
                                  timelineDays: req.myProposal!.timelineDays?.toString() ?? undefined,
                                });
                                setEditMode(true);
                              }}
                              className="text-hint text-muted hover:text-ink underline underline-offset-4"
                            >
                              Edit
                            </button>
                            <span className="text-muted/40">·</span>
                            <button
                              type="button"
                              onClick={handleWithdraw}
                              disabled={withdrawing}
                              className="text-hint text-danger/70 hover:text-danger underline underline-offset-4 disabled:opacity-50"
                            >
                              {withdrawing ? "Withdrawing…" : "Withdraw"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : !req.isDirectRequest && req.status !== "open" ? (
              <p className="text-body text-muted">This request is no longer accepting proposals.</p>
            ) : !req.isDirectRequest ? (
              <div>
                <h2 className="mb-4 text-hint font-semibold uppercase tracking-wide text-ink">
                  Send your proposal
                </h2>
                <form className="flex flex-col gap-5" onSubmit={onSubmit}>
                  <Textarea
                    label="Your message"
                    placeholder="Describe your experience, your approach to this type of project, and why you're the right person for it…"
                    rows={5}
                    error={errors.message?.message}
                    {...register("message")}
                  />
                  <Input
                    label="Price indication (optional)"
                    placeholder="e.g. £2,400–£3,000 depending on materials"
                    error={errors.priceNote?.message}
                    {...register("priceNote")}
                  />
                  <Input
                    label="Estimated duration in days (optional)"
                    type="number"
                    min="1"
                    max="3650"
                    placeholder="e.g. 5"
                    error={errors.timelineDays?.message}
                    {...register("timelineDays")}
                  />
                  {submitError && (
                    <div className="rounded-lg bg-danger/10 px-4 py-3 text-hint text-danger">{submitError}</div>
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
            ) : null}
          </div>
        )}

        {activeTab === "photos" && (
          <div className="flex flex-col gap-6">
            {(req.photoUrls?.length ?? 0) > 0 && (
              <div>
                <p className="mb-3 text-hint font-semibold uppercase tracking-wide text-muted">Garden photos from homeowner</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {req.photoUrls.map((url) => (
                    <div key={url} className="relative aspect-square overflow-hidden rounded-lg border border-line bg-canvas">
                      <Image src={`${UPLOADS_BASE}${url}`} alt="" fill className="object-cover" unoptimized />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {proposalAccepted && (
              <div>
                <p className="mb-3 text-hint font-semibold uppercase tracking-wide text-muted">Your completion photos</p>
                <CompletionPhotoUploader
                  jobId={req.id}
                  completionPhotoUrls={req.completionPhotoUrls ?? []}
                  onUploaded={(urls) => setReq((prev) => prev ? { ...prev, completionPhotoUrls: urls } : prev)}
                />
              </div>
            )}
            {(req.photoUrls?.length ?? 0) === 0 && !proposalAccepted && (
              <p className="text-body text-muted">No photos yet.</p>
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
