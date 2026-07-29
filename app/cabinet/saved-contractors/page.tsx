"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CabinetEmptyState } from "@/components/ui/cabinet-empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { Spinner } from "@/components/ui/spinner";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { StarDisplay } from "@/components/ui/star-display";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

type SavedContractor = {
  id: string;
  businessName: string | null;
  bio: string | null;
  postcode: string;
  verified: boolean;
  avgRating: number | null;
  reviewCount: number;
  savedAt: string;
};

export default function SavedContractorsPage() {
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const [contractors, setContractors] = useState<SavedContractor[]>([]);
  const [fetched, setFetched] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const loading = !fetched;

  useEffect(() => {
    if (!hasHydrated || !token) return;
    let cancelled = false;
    apiFetch("/contractor-profiles/saved/list")
      .then((r) => r.ok ? r.json() : [])
      .then((items: SavedContractor[]) => { if (!cancelled) setContractors(items); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setFetched(true); });
    return () => { cancelled = true; };
  }, [hasHydrated, token]);

  async function handleUnsave(id: string) {
    setRemovingId(id);
    try {
      const res = await apiFetch(`/contractor-profiles/saved/${id}`, { method: "DELETE" });
      if (res.ok) {
        setContractors((prev) => prev.filter((c) => c.id !== id));
      }
    } finally {
      setRemovingId(null);
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;

  if (contractors.length === 0) return (
    <CabinetEmptyState
      eyebrow="Your shortlist"
      title="No saved contractors"
      description="Browse contractors and save the ones you'd like to work with. They'll appear here for quick access."
      action={<Button href="/contractors">Browse contractors</Button>}
    />
  );

  return (
    <div className="max-w-2xl">
      <PageHeading
        title="Saved contractors"
        count={contractors.length}
        unit={["contractor", "contractors"]}
      />

      <div className="flex flex-col gap-3">
        {contractors.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-line bg-paper px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-body font-semibold text-ink">
                    {c.businessName ?? "Unnamed contractor"}
                  </span>
                  {c.verified && <VerifiedBadge compact />}
                </div>
                {c.bio && (
                  <p className="mt-0.5 line-clamp-1 text-hint text-muted">{c.bio}</p>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <span className="text-hint text-muted">{c.postcode}</span>
                  {c.avgRating !== null && (
                    <span className="text-hint">
                      <StarDisplay rating={Math.round(c.avgRating)} />
                      <span className="ml-1 text-muted">({c.reviewCount})</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button href={`/contractors/profile/${c.id}`} variant="secondary" size="sm">
                  Profile
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted hover:text-danger"
                  onClick={() => void handleUnsave(c.id)}
                  disabled={removingId === c.id}
                >
                  {removingId === c.id ? "Removing…" : "Remove"}
                </Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
