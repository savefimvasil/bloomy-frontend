"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { StarDisplay } from "@/components/ui/star-display";
import { useAuthStore } from "@/store/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

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
  const token = useAuthStore((s) => s.token);
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
      const res = await fetch(`${API_BASE}/quote-requests/reviews/${review.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reply: text.trim() }),
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
        className="mt-2 text-hint text-forest underline underline-offset-4 hover:text-moss transition"
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
        className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-body text-ink placeholder:text-muted/60 outline-none transition focus:border-forest/40 focus:bg-white focus:outline-2 focus:outline-leaf/25 resize-none"
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

export default function MyReviewsPage() {
  const token = useAuthStore((s) => s.token);
  const [reviews, setReviews] = useState<MyReview[] | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/quote-requests/my-reviews`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json() as Promise<MyReview[]>)
      .then(setReviews)
      .catch(() => setReviews([]));
  }, [token]);

  function handleReplySaved(reviewId: string, reply: string) {
    setReviews((prev) =>
      prev?.map((r) => r.id === reviewId ? { ...r, reply, replyAt: new Date().toISOString() } : r) ?? prev
    );
  }

  const avg = reviews?.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : null;

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-display-sm text-forest">My Reviews</h1>
          {avg !== null && reviews && (
            <p className="mt-1 text-hint text-muted">
              <StarDisplay rating={Math.round(avg)} />
              {" "}{avg} average · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {reviews === null && (
        <div className="flex justify-center py-16">
          <Spinner label="Loading reviews…" />
        </div>
      )}

      {reviews !== null && reviews.length === 0 && (
        <div className="rounded-xl border border-dashed border-line bg-canvas px-6 py-12 text-center">
          <p className="text-body font-medium text-ink mb-1">No reviews yet</p>
          <p className="text-hint text-muted">Reviews appear here once homeowners rate your completed jobs.</p>
        </div>
      )}

      {reviews !== null && reviews.length > 0 && (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-line bg-paper px-5 py-4">
              {/* Header row */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <StarDisplay rating={review.rating} />
                  <span className="text-hint text-muted">
                    {review.homeownerName}
                    {review.jobTitle ? ` · ${review.jobTitle}` : ""}
                  </span>
                </div>
                <span className="text-hint text-muted">
                  {new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>

              {/* Comment */}
              {review.comment && (
                <p className="mt-2 text-body text-ink">{review.comment}</p>
              )}
              {!review.comment && (
                <p className="mt-2 text-hint text-muted italic">No written comment.</p>
              )}

              {/* Existing reply */}
              {review.reply && (
                <div className="mt-3 border-l-2 border-forest/30 pl-3">
                  <p className="text-hint text-muted mb-0.5">
                    Your reply · {review.replyAt ? new Date(review.replyAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""}
                  </p>
                  <p className="text-hint text-ink">{review.reply}</p>
                </div>
              )}

              {/* Reply box */}
              <ReplyBox review={review} onSaved={(reply) => handleReplySaved(review.id, reply)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
