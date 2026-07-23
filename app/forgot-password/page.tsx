"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SplitHighlight } from "@/components/ui/split-highlight";
import { apiFetch } from "@/lib/api";
import { useRedirectIfAuthenticated } from "@/lib/useRedirectIfAuthenticated";

export default function ForgotPasswordPage() {
  const ready = useRedirectIfAuthenticated();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await apiFetch("/users/password-reset/request", {
        method: "POST",
        body: { email: email.trim() },
      });

      if (!res.ok) {
        const payload = (await res.json()) as { message?: string };
        setError(payload.message ?? "Something went wrong.");
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!ready) return null;

  return (
    <SplitHighlight
      title="Reset your password"
      description="Enter your email and we'll send you a link to set a new password."
      imageAlt="Botanical visual"
      imageUrl="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1400&q=80"
      aside={
        <div className="container py-12 md:py-28 flex flex-col justify-center h-full">
          <div className="mx-auto w-full max-w-md">
            {submitted ? (
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-forest/10">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-forest" aria-hidden>
                    <path d="M2 6l9 6 9-6" />
                    <rect x="2" y="4" width="18" height="14" rx="2" />
                  </svg>
                </div>
                <h2 className="text-display-sm text-forest">Check your inbox</h2>
                <p className="mt-3 text-body text-muted">
                  If an account exists for{" "}
                  <span className="font-medium text-forest">{email}</span>, a reset link is on its way. Check your spam folder if it doesn&apos;t arrive within a minute.
                </p>
                <p className="mt-8 text-sm text-muted">
                  <Link href="/login" className="font-medium text-forest underline underline-offset-4">
                    Back to login
                  </Link>
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-display-sm text-forest">Forgot your password?</h2>
                <p className="mt-3 text-sm text-muted">
                  Enter your email and we&apos;ll send you a reset link.
                </p>

                <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoComplete="email"
                    required
                  />

                  {error && (
                    <div className="bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
                  )}

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Sending…" : "Send reset link"}
                  </Button>
                </form>

                <p className="mt-8 text-sm text-muted">
                  Remembered it?{" "}
                  <Link href="/login" className="font-medium text-forest underline underline-offset-4">
                    Back to login
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      }
    />
  );
}
