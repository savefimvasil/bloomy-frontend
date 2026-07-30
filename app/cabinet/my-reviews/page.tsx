"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CabinetEmptyState } from "@/components/ui/cabinet-empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { Spinner } from "@/components/ui/spinner";
import { StarDisplay } from "@/components/ui/star-display";
import { apiFetch } from "@/lib/api";
import { usePaginatedFetch } from "@/lib/usePaginatedFetch";
import { API } from "@/lib/endpoints";

type MyReview = {
  id: string;
  rating: number;
  comment: string | null;
  reply: string | null;
  replyAt: string | null;
  createdAt: string;
  homeownerName: string;
  jobTitle: string | null;
};

function ReplyBox({ review, onSaved }: { review: MyReview; onSaved: (reply: string) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(review.reply ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await apiFetch(API.quoteRequests.replyToReview(review.id), {
        method: "POST",
        body: { reply: text.trim() },
      });
      if (!res.ok) { setError("Could not save reply. Try again."); return; }
      onSaved(text.trim());
      setOpen(false);
    } catch {
      setError("Could not save reply. Try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 text-hint text-forest underline underline-offset-4 transition hover:text-moss"
      >
        {review.reply ? "Edit reply" : "Reply →"}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        maxLength={1000}
        autoFocus
        placeholder="Write a reply visible to homeowners on your public profile…"
        className="w-full rounded-xl border border-line bg-canvas px-4 py-3 text-body text-ink placeholder:text-muted/60 outline-none transition focus:border-forest/40 focus:bg-paper resize-none"
      />
      {error && <p className="mt-1 text-hint text-danger">{error}</p>}
      <div className="mt-2 flex gap-2">
        <Button type="submit" size="sm" disabled={saving || !text.trim()}>
          {saving ? "Saving…" : "Save reply"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => { setOpen(false); setText(review.reply ?? ""); }}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function ReviewCard({ review, onReplySaved }: { review: MyReview; onReplySaved: (id: string, reply: string) => void }) {
  const [localReply, setLocalReply] = useState(review.reply);
  const [localReplyAt, setLocalReplyAt] = useState(review.replyAt);

  const date = new Date(review.createdAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

  function handleSaved(reply: string) {
    setLocalReply(reply);
    setLocalReplyAt(new Date().toISOString());
    onReplySaved(review.id, reply);
  }

  return (
    <div className="rounded-xl border border-line bg-paper px-5 py-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <StarDisplay rating={review.rating} />
          <span className="text-hint text-muted">
            {review.homeownerName}
            {review.jobTitle ? ` · ${review.jobTitle}` : ""}
          </span>
        </div>
        <span className="text-hint text-muted">{date}</span>
      </div>

      {review.comment ? (
        <p className="mt-3 text-body text-ink">{review.comment}</p>
      ) : (
        <p className="mt-3 text-hint italic text-muted">No written comment.</p>
      )}

      {localReply && (
        <div className="mt-4 rounded-lg border-l-2 border-forest/30 bg-canvas px-4 py-3">
          <p className="text-eyebrow text-muted mb-1">
            Your reply
            {localReplyAt && (
              <> · {new Date(localReplyAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</>
            )}
          </p>
          <p className="text-hint text-ink">{localReply}</p>
        </div>
      )}

      <ReplyBox review={{ ...review, reply: localReply, replyAt: localReplyAt }} onSaved={handleSaved} />
    </div>
  );
}

export default function MyReviewsPage() {
  const { items: reviews, total, loading, loadingMore, error, hasMore, loadMore } =
    usePaginatedFetch<MyReview>("/quote-requests/my-reviews", 20);

  const avg = useMemo(() =>
    reviews.length
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : null,
    [reviews],
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleReplySaved(_reviewId: string, _reply: string) {
    // reply state is managed locally in each ReviewCard
  }

  if (loading) {
    return <div className="flex justify-center py-16"><Spinner label="Loading reviews…" /></div>;
  }

  if (error) return <p className="text-body text-danger">{error}</p>;

  if (reviews.length === 0) {
    return (
      <CabinetEmptyState
        eyebrow="My Reviews"
        title={<>NO REVIEWS<br />YET.</>}
        description="Reviews appear here once homeowners rate your completed jobs. Complete a job to start collecting reviews."
      />
    );
  }

  return (
    <div className="max-w-2xl">
      <PageHeading
        title={<>MY REVIEWS</>}
        count={total}
        unit={["review", "reviews"]}
        action={
          avg !== null ? (
            <div className="mb-1 flex items-center gap-2">
              <StarDisplay rating={Math.round(avg)} />
              <span className="text-hint text-muted">{avg} avg</span>
            </div>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} onReplySaved={handleReplySaved} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 flex flex-col items-center gap-2">
          <p className="text-hint text-muted">Showing {reviews.length} of {total}</p>
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-lg border border-line px-4 py-2 text-body text-muted transition hover:border-forest/40 hover:text-ink disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
