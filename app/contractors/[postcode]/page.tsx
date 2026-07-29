"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { isValid, toNormalised } from "postcode";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

type ContractorListing = {
  id: string;
  businessName: string;
  bio: string | null;
  postcode: string;
  verified: boolean;
  website: string | null;
  distanceMiles: number;
};

export default function ContractorDirectoryPage() {
  const { postcode } = useParams<{ postcode: string }>();
  const decoded = decodeURIComponent(postcode).toUpperCase();
  const router = useRouter();

  // null = loading, [] = no results, [...] = results
  const [contractors, setContractors] = useState<ContractorListing[] | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContractors(null);
    let active = true;
    fetch(`${API_BASE}/contractor-profiles/near?postcode=${encodeURIComponent(decoded)}`)
      .then((r) => r.json() as Promise<ContractorListing[]>)
      .then((data) => { if (active) setContractors(data); })
      .catch(() => { if (active) setContractors([]); });
    return () => { active = false; };
  }, [decoded]);

  function handleReSearch(e: React.SyntheticEvent) {
    e.preventDefault();
    const clean = search.trim().toUpperCase().replace(/\s+/g, "");
    if (!clean) return;
    const normalised = isValid(clean) ? (toNormalised(clean) ?? clean) : clean;
    router.push(`/contractors/${encodeURIComponent(normalised)}`);
  }


  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center px-4 pb-20 pt-28">
        <div className="w-full max-w-2xl">

          {/* Re-search bar */}
          <form onSubmit={handleReSearch} className="mb-8 flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={decoded}
              className="min-h-12 flex-1 rounded-xl border border-line bg-paper px-4 text-body text-ink placeholder:text-muted/60 outline-none transition focus:border-forest/40 focus:bg-white focus:outline-2 focus:outline-leaf/25"
            />
            <Button type="submit" variant="secondary" disabled={!search.trim()} className="shrink-0 px-6">
              Search
            </Button>
          </form>

          <h1 className="text-display-sm text-forest mb-1">
            Contractors near {decoded}
          </h1>

          {contractors === null && (
            <div className="flex justify-center py-16">
              <Spinner label="Searching…" />
            </div>
          )}

          {contractors !== null && contractors.length === 0 && (
            <div className="mt-6 rounded-xl border border-line bg-canvas px-6 py-10 text-center">
              <p className="text-body font-medium text-ink mb-2">No contractors found near {decoded}</p>
              <p className="text-hint text-muted mb-6">
                No garden professionals have registered in this area yet.
              </p>
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button href="/contractors" variant="secondary">
                  Try another postcode
                </Button>
                <Button href="/register">
                  Register as a contractor here
                </Button>
              </div>
            </div>
          )}

          {contractors !== null && contractors.length > 0 && (
            <>
              <p className="mb-6 text-hint text-muted">
                {contractors.length} contractor{contractors.length !== 1 ? "s" : ""} cover this area
              </p>

              <div className="flex flex-col gap-3">
                {contractors.map((c) => (
                  <div key={c.id} className="rounded-xl border border-line bg-paper px-5 py-5 transition hover:border-forest/30">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-body font-semibold text-ink">{c.businessName}</h2>
                          {c.verified && <VerifiedBadge compact />}
                        </div>
                        <p className="mt-0.5 text-hint text-muted">
                          {c.postcode} · {c.distanceMiles} mi away
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        {c.website && (
                          <Button
                            variant="secondary"
                            size="sm"
                            href={c.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Website ↗
                          </Button>
                        )}
                        <Button href={`/contractors/profile/${c.id}`} size="sm">
                          View profile →
                        </Button>
                      </div>
                    </div>
                    {c.bio && (
                      <p className="mt-3 text-hint text-muted leading-relaxed line-clamp-3">{c.bio}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-10 rounded-xl border border-dashed border-line bg-canvas px-6 py-6 text-center">
                <p className="text-body font-medium text-ink mb-1">Are you a contractor in this area?</p>
                <p className="mb-4 text-hint text-muted">Join Bloomy and start receiving local job requests.</p>
                <Button href="/register" variant="secondary">
                  Join as a contractor →
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
