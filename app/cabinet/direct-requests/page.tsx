"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CabinetCard } from "@/components/ui/cabinet-row";
import { CabinetEmptyState } from "@/components/ui/cabinet-empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/store/auth";
import { formatDate } from "@/lib/formatters";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

type DirectRequest = {
  id: string;
  title: string;
  postcode: string;
  startBy: string | null;
  status: string;
  note: string | null;
  createdAt: string;
  projectSummary: { zoneCount: number; zoneSummary: string[] };
};

export default function DirectRequestsPage() {
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const [requests, setRequests] = useState<DirectRequest[] | null>(null);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/quote-requests/direct-to-me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json() as Promise<DirectRequest[]>)
      .then(setRequests)
      .catch(() => setRequests([]));
  }, [token]);

  async function handleAccept(id: string) {
    setAccepting(id);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/quote-requests/direct/${id}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setError("Could not accept. Please try again."); setAccepting(null); return; }
      router.push(`/cabinet/nearby-requests/${id}`);
    } catch {
      setError("Could not accept. Please try again.");
      setAccepting(null);
    }
  }

  if (requests === null) {
    return <div className="flex justify-center py-12"><Spinner label="Loading requests…" /></div>;
  }

  if (requests.length === 0) {
    return (
      <CabinetEmptyState
        eyebrow="Direct Requests"
        title={<>NO REQUESTS<br />YET.</>}
        description="When a homeowner sends a job directly to you, it appears here for you to accept."
      />
    );
  }

  return (
    <div>
      <PageHeading
        title={<>DIRECT REQUESTS</>}
        count={requests.length}
        unit={["request", "requests"]}
      />

      {error && <p className="mb-4 text-hint text-danger">{error}</p>}

      <div className="divide-y divide-line">
        {requests.map((req) => {
          const zoneLine = [
            `${req.projectSummary.zoneCount} zone${req.projectSummary.zoneCount !== 1 ? "s" : ""}`,
            ...req.projectSummary.zoneSummary,
          ].join(" · ");

          return (
            <CabinetCard
              key={req.id}
              header={
                <>
                  <span className="text-body font-semibold text-ink">{req.title}</span>
                  <Badge dot color="amber">Direct</Badge>
                </>
              }
              meta={
                <>
                  <span className="text-hint text-muted">{req.postcode}</span>
                  {req.startBy && (
                    <span className="text-hint text-muted">
                      Start by {new Date(req.startBy).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  )}
                  {req.projectSummary.zoneCount > 0 && (
                    <span className="text-hint text-muted">{zoneLine}</span>
                  )}
                  <span className="text-hint text-muted/60">{formatDate(req.createdAt)}</span>
                </>
              }
              body={req.note ?? undefined}
              footer={
                <div className="mt-1 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => void handleAccept(req.id)}
                    disabled={accepting === req.id}
                  >
                    {accepting === req.id ? "Accepting…" : "Accept & start work"}
                  </Button>
                  <Button href={`/cabinet/nearby-requests/${req.id}`} variant="secondary" size="sm">
                    View project →
                  </Button>
                </div>
              }
            />
          );
        })}
      </div>
    </div>
  );
}
