"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CabinetEmptyState } from "@/components/ui/cabinet-empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { Spinner } from "@/components/ui/spinner";
import { StarDisplay } from "@/components/ui/star-display";
import { apiFetch } from "@/lib/api";
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
  const date = new Date(review.createdAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

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

      {review.reply && (
        <div className="mt-4 rounded-lg border-l-2 border-forest/30 bg-canvas px-4 py-3">
          <p className="text-eyebrow text-muted mb-1">
            Your reply
            {review.replyAt && (
              <> · {new Date(review.replyAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</>
            )}
          </p>
          <p className="text-hint text-ink">{review.reply}</p>
        </div>
      )}

      <ReplyBox review={review} onSaved={(reply) => onReplySaved(review.id, reply)} />
    </div>
  );
}

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<MyReview[] | null>(null);

  useEffect(() => {
    apiFetch(API.quoteRequests.myReviews)
      .then((r) => r.json() as Promise<MyReview[]>)
      .then(setReviews)
      .catch(() => setReviews([]));
  }, []);

  function handleReplySaved(reviewId: string, reply: string) {
    setReviews((prev) =>
      prev?.map((r) => r.id === reviewId ? { ...r, reply, replyAt: new Date().toISOString() } : r) ?? prev,
    );
  }

  const avg = reviews?.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : null;

  if (reviews === null) {
    return <div className="flex justify-center py-16"><Spinner label="Loading reviews…" /></div>;
  }

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
        count={reviews.length}
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
    </div>
  );
}
