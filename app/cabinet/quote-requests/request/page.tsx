"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isValid, toNormalised } from "postcode";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { useAuthStore } from "@/store/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

type ContractorSummary = {
  id: string;
  businessName: string;
  postcode: string;
  verified: boolean;
  avgRating: number | null;
  reviewCount: number;
};

type Project = {
  id: string;
  name: string | null;
  hasEstimate: boolean;
  zoneCount: number;
};

export default function RequestQuotePage() {
  const router = useRouter();
  const params = useSearchParams();
  const contractorId = params.get("contractorId") ?? "";
  const preselectedProjectId = params.get("projectId") ?? "";
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  const [contractor, setContractor] = useState<ContractorSummary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [postcode, setPostcode] = useState("");
  const [note, setNote] = useState("");
  const [postcodeError, setPostcodeError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token || role !== "homeowner") {
      router.replace("/login");
      return;
    }
    if (!contractorId) {
      router.replace("/contractors");
      return;
    }

    Promise.all([
      fetch(`${API_BASE}/contractor-profiles/public/${contractorId}`).then((r) => r.json()),
      fetch(`${API_BASE}/garden-projects/`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([contractorData, projectsData]) => {
      setContractor(contractorData as ContractorSummary);
      const raw = projectsData as { id: string; name: string | null; planData?: { zones?: unknown[] }; constructionData?: { calculations?: unknown } }[];
      const mapped = raw.map((p) => ({
        id: p.id,
        name: p.name,
        hasEstimate: !!(p.constructionData?.calculations),
        zoneCount: (p.planData?.zones ?? []).length,
      }));
      setProjects(mapped);
      if (preselectedProjectId && mapped.some((p) => p.id === preselectedProjectId && p.hasEstimate)) {
        setSelectedProjectId(preselectedProjectId);
      }
    }).catch(() => {
      setSubmitError("Failed to load data");
    }).finally(() => setLoading(false));
  }, [hasHydrated, token, role, contractorId, preselectedProjectId, router]);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!selectedProjectId) return;

    const clean = postcode.trim().toUpperCase().replace(/\s+/g, "");
    if (!isValid(clean)) {
      setPostcodeError("Enter a valid UK postcode");
      return;
    }
    setPostcodeError("");
    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch(`${API_BASE}/quote-requests/direct`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          projectId: selectedProjectId,
          contractorProfileId: contractorId,
          postcode: toNormalised(clean) ?? clean,
          note: note.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(err.message ?? "Failed to send request");
      }
      router.push("/cabinet/quote-requests?sent=1");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const eligibleProjects = projects.filter((p) => p.hasEstimate);
  const ineligibleProjects = projects.filter((p) => !p.hasEstimate);

  return (
    <div className="max-w-lg">
      {loading && <div className="flex justify-center py-20"><Spinner label="Loading…" /></div>}

          {!loading && contractor && (
            <>
              {/* Back */}
              <Button href={`/contractors/profile/${contractorId}`} variant="ghost" size="sm" className="mb-6 -ml-2 text-muted">
                ← Back to profile
              </Button>

              {/* Contractor summary */}
              <div className="mb-8 rounded-xl border border-line bg-paper px-5 py-4">
                <p className="text-eyebrow text-muted mb-1">Requesting a quote from</p>
                <div className="flex items-center gap-2">
                  <h1 className="text-display-sm text-forest">{contractor.businessName}</h1>
                  {contractor.verified && <VerifiedBadge />}
                </div>
                <p className="text-hint text-muted mt-0.5">
                  {contractor.postcode}
                  {contractor.avgRating !== null && (
                    <> · <span className="text-amber-500">★</span> {contractor.avgRating} ({contractor.reviewCount} review{contractor.reviewCount !== 1 ? "s" : ""})</>
                  )}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                {/* Project selection */}
                <div>
                  <p className="mb-3 text-eyebrow text-forest/70">Select your garden project</p>

                  {projects.length === 0 && (
                    <div className="rounded-xl border border-dashed border-line bg-canvas px-5 py-6 text-center">
                      <p className="text-body text-ink mb-1">No garden projects yet</p>
                      <p className="text-hint text-muted mb-4">You need a project with a cost estimate before requesting a quote.</p>
                      <Button href="/projects/new" size="sm">Create a garden plan →</Button>
                    </div>
                  )}

                  {eligibleProjects.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {eligibleProjects.map((p) => (
                        <label key={p.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${selectedProjectId === p.id ? "border-forest bg-forest/5" : "border-line bg-paper hover:border-forest/40"}`}>
                          <input
                            type="radio"
                            name="project"
                            value={p.id}
                            checked={selectedProjectId === p.id}
                            onChange={() => setSelectedProjectId(p.id)}
                            className="mt-0.5 accent-forest"
                          />
                          <div>
                            <p className="text-body font-medium text-ink">{p.name ?? "Unnamed project"}</p>
                            <p className="text-hint text-muted">{p.zoneCount} zone{p.zoneCount !== 1 ? "s" : ""} · has estimate</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {ineligibleProjects.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1.5">
                      {ineligibleProjects.map((p) => (
                        <div key={p.id} className="flex items-start gap-3 rounded-xl border border-line bg-canvas px-4 py-3 opacity-50">
                          <input type="radio" disabled className="mt-0.5" />
                          <div>
                            <p className="text-body text-ink">{p.name ?? "Unnamed project"}</p>
                            <p className="text-hint text-muted">No estimate yet — <a href={`/projects/${p.id}/estimate`} className="text-forest underline">add one</a></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Postcode */}
                <div>
                  <label className="block text-eyebrow text-forest/70 mb-2">Your postcode</label>
                  <input
                    type="text"
                    value={postcode}
                    onChange={(e) => { setPostcode(e.target.value); setPostcodeError(""); }}
                    placeholder="e.g. NN1 3JZ"
                    className="min-h-12 w-full rounded-xl border border-line bg-paper px-4 text-body text-ink placeholder:text-muted/60 outline-none transition focus:border-forest/40 focus:bg-white focus:outline-2 focus:outline-leaf/25"
                  />
                  {postcodeError && <p className="mt-1 text-hint text-danger">{postcodeError}</p>}
                </div>

                {/* Note */}
                <div>
                  <label className="block text-eyebrow text-forest/70 mb-2">Note for contractor <span className="text-muted font-normal">(optional)</span></label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Any specific details, timelines, or questions…"
                    className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-body text-ink placeholder:text-muted/60 outline-none transition focus:border-forest/40 focus:bg-white focus:outline-2 focus:outline-leaf/25 resize-none"
                  />
                </div>

                {submitError && <p className="text-hint text-danger">{submitError}</p>}

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={!selectedProjectId || !postcode.trim() || submitting}
                    className="flex-1"
                  >
                    {submitting ? "Sending…" : `Send request to ${contractor.businessName}`}
                  </Button>
                </div>
              </form>
            </>
          )}
    </div>
  );
}
