"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

type DocStatus = "pending" | "approved" | "rejected";

type PendingDoc = {
  id: string;
  type: string;
  description: string;
  status: DocStatus;
  adminNote: string | null;
  createdAt: string;
  contractor: {
    businessName: string | null;
    userId: string;
    postcode: string;
    verified: boolean;
  };
};

function statusColor(s: DocStatus): "amber" | "green" | "danger" {
  if (s === "approved") return "green";
  if (s === "rejected") return "danger";
  return "amber";
}

function DocCard({ doc, onAction }: { doc: PendingDoc; onAction: (id: string, action: "approve" | "reject", note?: string) => Promise<void> }) {
  const [note, setNote] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [acting, setActing] = useState<"approve" | "reject" | null>(null);

  async function submit(action: "approve" | "reject") {
    setActing(action);
    await onAction(doc.id, action, note.trim() || undefined);
    setActing(null);
  }

  return (
    <div className="rounded-xl border border-line bg-paper p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-body font-semibold text-ink">{doc.contractor.businessName ?? "Unnamed contractor"}</span>
            {doc.contractor.verified && (
              <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[11px] font-medium text-forest">Verified</span>
            )}
          </div>
          <p className="text-hint text-muted">{doc.contractor.postcode}</p>
        </div>
        <Badge dot color={statusColor(doc.status)}>{doc.status}</Badge>
      </div>

      <div className="mt-3 border-t border-line pt-3">
        <p className="text-eyebrow text-muted mb-0.5">Document type</p>
        <p className="text-body text-ink capitalize">{doc.type.replace(/-/g, " ")}</p>
      </div>

      {doc.description && (
        <div className="mt-2">
          <p className="text-eyebrow text-muted mb-0.5">Contractor note</p>
          <p className="text-body text-ink">{doc.description}</p>
        </div>
      )}

      {doc.adminNote && (
        <div className="mt-2">
          <p className="text-eyebrow text-muted mb-0.5">Admin note</p>
          <p className="text-body text-muted italic">{doc.adminNote}</p>
        </div>
      )}

      <div className="mt-4">
        {!expanded ? (
          <Button size="sm" variant="secondary" onClick={() => setExpanded(true)}>
            Review this document
          </Button>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-hint text-muted">Note to contractor (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="e.g. Document expired, please resubmit with a current certificate."
                className="w-full resize-none rounded-lg border border-line bg-canvas px-3 py-2 text-body text-ink placeholder:text-muted focus:border-forest focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => void submit("approve")}
                disabled={!!acting}
                className="bg-forest text-paper hover:bg-moss"
              >
                {acting === "approve" ? "Approving…" : "Approve"}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => void submit("reject")}
                disabled={!!acting}
                className="border-danger/30 text-danger hover:bg-danger/5"
              >
                {acting === "reject" ? "Rejecting…" : "Reject"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setExpanded(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminVerificationPage() {
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const [docs, setDocs] = useState<PendingDoc[]>([]);
  const [fetched, setFetched] = useState(false);
  const loading = !fetched;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated || !token) return;
    let cancelled = false;
    apiFetch("/verification/admin/pending")
      .then((r) => r.ok ? r.json() : Promise.reject(new Error("Failed to load")))
      .then((items: PendingDoc[]) => { if (!cancelled) setDocs(items); })
      .catch((e: unknown) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load"); })
      .finally(() => { if (!cancelled) setFetched(true); });
    return () => { cancelled = true; };
  }, [hasHydrated, token]);

  async function handleAction(docId: string, action: "approve" | "reject", note?: string) {
    const res = await apiFetch(`/verification/admin/documents/${docId}/${action}`, {
      method: "POST",
      body: { note },
    });
    if (res.ok) {
      setDocs((prev) => prev.filter((d) => d.id !== docId));
    } else {
      setError("Action failed. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-display-lg text-ink">Verification Queue</h1>
          <p className="mt-1 text-body text-muted">Review pending contractor verification documents.</p>
        </div>

        {loading && (
          <div className="flex justify-center py-16"><Spinner /></div>
        )}

        {error && (
          <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-body text-danger">{error}</div>
        )}

        {!loading && docs.length === 0 && !error && (
          <div className="rounded-xl border border-line bg-paper px-6 py-12 text-center">
            <p className="text-display-sm text-ink mb-2">All clear</p>
            <p className="text-body text-muted">No pending documents to review.</p>
          </div>
        )}

        {!loading && docs.length > 0 && (
          <div className="flex flex-col gap-4">
            <p className="text-eyebrow text-muted">{docs.length} pending document{docs.length !== 1 ? "s" : ""}</p>
            {docs.map((doc) => (
              <DocCard key={doc.id} doc={doc} onAction={handleAction} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
