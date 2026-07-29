"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { StarDisplay } from "@/components/ui/star-display";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
const UPLOADS_BASE = process.env.NEXT_PUBLIC_UPLOADS_BASE_URL ?? "";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  reply: string | null;
  replyAt: string | null;
  createdAt: string;
  homeownerName: string;
};

type PublicProfile = {
  id: string;
  businessName: string;
  bio: string | null;
  postcode: string;
  verified: boolean;
  website: string | null;
  phone: string | null;
  avgRating: number | null;
  reviewCount: number;
  completionPhotos: string[];
  reviews: Review[];
};

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-xl border border-line bg-paper px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StarDisplay rating={review.rating} />
          <span className="text-hint text-muted">
            {review.homeownerName} · {new Date(review.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
          </span>
        </div>
      </div>
      {review.comment && (
        <p className="mt-2 text-body text-ink">{review.comment}</p>
      )}
      {review.reply && (
        <div className="mt-3 border-l-2 border-forest/30 pl-3">
          <p className="text-hint text-muted mb-0.5">Response from contractor</p>
          <p className="text-hint text-ink">{review.reply}</p>
        </div>
      )}
    </div>
  );
}

export default function PublicContractorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const role = useAuthStore((s) => s.role);
  const isHomeowner = hasHydrated && token !== null && role === "homeowner";

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingState, setSavingState] = useState<"idle" | "saving">("idle");

  useEffect(() => {
    fetch(`${API_BASE}/contractor-profiles/public/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json() as Promise<PublicProfile>;
      })
      .then((data) => { if (data) setProfile(data); })
      .catch(() => setNotFound(true));
  }, [id]);

  useEffect(() => {
    if (!isHomeowner) return;
    apiFetch("/contractor-profiles/saved/ids")
      .then((r) => r.ok ? r.json() : [])
      .then((ids: string[]) => setSaved(ids.includes(id)))
      .catch(() => {});
  }, [id, isHomeowner]);

  async function toggleSave() {
    setSavingState("saving");
    try {
      const method = saved ? "DELETE" : "POST";
      const res = await apiFetch(`/contractor-profiles/saved/${id}`, { method });
      if (res.ok) setSaved(!saved);
    } finally {
      setSavingState("idle");
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center px-4 pb-20 pt-28">
        <div className="w-full max-w-2xl">

          {!profile && !notFound && (
            <div className="flex justify-center py-20">
              <Spinner label="Loading profile…" />
            </div>
          )}

          {notFound && (
            <div className="rounded-xl border border-line bg-canvas px-6 py-12 text-center">
              <p className="text-body font-medium text-ink mb-2">Contractor not found</p>
              <Button href="/contractors" variant="secondary" className="mt-4">
                ← Back to directory
              </Button>
            </div>
          )}

          {profile && (
            <>
              {/* Header */}
              <div className="mb-8">
                <Button href="/contractors" variant="ghost" size="sm" className="mb-4 -ml-2 text-muted">
                  ← Back to directory
                </Button>

                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-display-sm text-forest">{profile.businessName}</h1>
                      {profile.verified && <VerifiedBadge />}
                    </div>
                    <p className="mt-1 text-hint text-muted">{profile.postcode}</p>
                    {profile.avgRating !== null && (
                      <div className="mt-1 flex items-center gap-1.5">
                        <StarDisplay rating={Math.round(profile.avgRating)} />
                        <span className="text-hint text-muted">{profile.avgRating} · {profile.reviewCount} review{profile.reviewCount !== 1 ? "s" : ""}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {profile.website && (
                      <Button variant="secondary" size="sm" href={profile.website} target="_blank" rel="noopener noreferrer">
                        Website ↗
                      </Button>
                    )}
                    {isHomeowner && (
                      <button
                        onClick={() => void toggleSave()}
                        disabled={savingState === "saving"}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-hint font-medium transition ${saved ? "border-forest/40 bg-forest/5 text-forest hover:bg-danger/5 hover:border-danger/30 hover:text-danger" : "border-line text-muted hover:border-forest/40 hover:text-forest"}`}
                      >
                        {saved ? "♥ Saved" : "♡ Save"}
                      </button>
                    )}
                    {isHomeowner ? (
                      <Button href={`/cabinet/quote-requests/request?contractorId=${id}`} size="sm">
                        Request a quote →
                      </Button>
                    ) : (
                      <Button href="/register" size="sm">
                        Sign up to request a quote →
                      </Button>
                    )}
                  </div>
                </div>

                {profile.bio && (
                  <p className="mt-4 text-body text-ink/80 leading-relaxed">{profile.bio}</p>
                )}
              </div>

              {/* Completion photos */}
              {profile.completionPhotos.length > 0 && (
                <section className="mb-8">
                  <h2 className="mb-3 text-eyebrow text-muted">Work examples</h2>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {profile.completionPhotos.map((url) => (
                      <div key={url} className="relative aspect-square overflow-hidden rounded-xl">
                        <Image src={`${UPLOADS_BASE}${url}`} alt="Completed garden work" fill className="object-cover" unoptimized />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Reviews */}
              <section>
                <h2 className="mb-3 text-eyebrow text-muted">
                  Reviews{profile.reviewCount > 0 ? ` (${profile.reviewCount})` : ""}
                </h2>

                {profile.reviews.length === 0 && (
                  <div className="rounded-xl border border-dashed border-line bg-canvas px-6 py-8 text-center">
                    <p className="text-hint text-muted">No reviews yet.</p>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  {profile.reviews.map((r) => (
                    <ReviewCard key={r.id} review={r} />
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
