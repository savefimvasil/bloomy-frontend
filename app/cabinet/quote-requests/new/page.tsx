"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { quoteRequestSchema, type QuoteRequestFormValues } from "@/lib/schemas";
import { useAuthStore } from "@/store/auth";

type Choice = "broadcast" | "direct" | null;

export default function NewQuoteRequestPage() {
  const router = useRouter();
  const params = useSearchParams();
  const projectId = params.get("projectId") ?? "";

  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  const [choice, setChoice] = useState<Choice>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<QuoteRequestFormValues>({
    resolver: zodResolver(quoteRequestSchema),
  });

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token || role !== "homeowner") { router.replace("/login"); return; }
    if (!projectId) { router.replace("/cabinet/projects"); }
  }, [hasHydrated, token, role, projectId, router]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const res = await apiFetch("/quote-requests", {
        method: "POST",
        body: { gardenProjectId: projectId, postcode: values.postcode.trim(), startBy: values.startBy || undefined },
      });
      const payload = (await res.json()) as { message?: string };
      if (!res.ok) { setSubmitError(payload.message ?? "Failed to send request"); return; }
      setSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  });

  if (success) {
    return (
      <div className="max-w-lg">
        <div className="rounded-2xl border border-forest/20 bg-forest/3 px-6 py-12 text-center">
          <p className="text-body font-semibold text-forest mb-1">Request sent to local contractors</p>
          <p className="text-hint text-muted">Contractors in your area will see this project and send you proposals.</p>
          <Button
            className="mt-6"
            onClick={() => router.push("/cabinet/quote-requests")}
          >
            View my requests →
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <Button
        href={`/projects/${projectId}/estimate/summary`}
        variant="ghost"
        size="sm"
        className="mb-6 -ml-2 text-muted"
      >
        ← Back to estimate
      </Button>

      <h1 className="text-display-sm text-forest mb-1">Find a contractor</h1>
      <p className="text-hint text-muted mb-8">
        Choose how you want to connect with contractors for this project.
      </p>

      <div className="flex flex-col gap-4">

        {/* Option A — post to everyone */}
        <button
          type="button"
          onClick={() => setChoice(choice === "broadcast" ? null : "broadcast")}
          className={`w-full rounded-2xl border p-5 text-left transition ${
            choice === "broadcast"
              ? "border-forest bg-forest/5"
              : "border-line bg-paper hover:border-forest/40"
          }`}
        >
          <div className="flex items-start gap-4">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="9" cy="9" r="7" />
                <path d="M9 5v4l3 2" />
              </svg>
            </span>
            <div>
              <p className="text-body font-semibold text-ink">Post to local contractors</p>
              <p className="mt-1 text-hint text-muted">
                Your project plan is shared with all contractors in your area. They review it and send you proposals with pricing.
              </p>
            </div>
          </div>

          {choice === "broadcast" && (
            <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Postcode of the work"
                  type="text"
                  placeholder="e.g. SW1A 1AA"
                  error={errors.postcode?.message}
                  {...register("postcode")}
                />
                <Input
                  label="Preferred start date"
                  type="date"
                  {...register("startBy")}
                />
              </div>
              {submitError && <p className="text-hint text-danger">{submitError}</p>}
              <Button type="submit" disabled={submitting}>
                {submitting ? "Sending…" : "Send request to local contractors"}
              </Button>
            </form>
          )}
        </button>

        {/* Option B — pick a contractor */}
        <div className={`rounded-2xl border p-5 transition ${
          choice === "direct" ? "border-forest bg-forest/5" : "border-line bg-paper"
        }`}>
          <div className="flex items-start gap-4">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="7" cy="7" r="4.5" />
                <path d="M14 14L11 11" />
              </svg>
            </span>
            <div className="flex-1">
              <p className="text-body font-semibold text-ink">Choose a specific contractor</p>
              <p className="mt-1 text-hint text-muted">
                Browse the contractor directory, check reviews and past work, then send a direct quote request to whoever you like.
              </p>
              <Button
                href="/contractors"
                variant="secondary"
                size="sm"
                className="mt-4"
              >
                Browse contractors →
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
