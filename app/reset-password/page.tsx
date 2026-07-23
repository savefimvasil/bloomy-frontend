"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SplitHighlight } from "@/components/ui/split-highlight";
import { apiFetch } from "@/lib/api";
import { useRedirectIfAuthenticated } from "@/lib/useRedirectIfAuthenticated";

function ResetPasswordPageComponent() {
  const router = useRouter();
  const ready = useRedirectIfAuthenticated();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!ready) return null;

  if (!token) {
    return (
      <SplitHighlight
        title="Invalid link"
        description="This reset link is missing a token."
        imageAlt="Botanical visual"
        imageUrl="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1400&q=80"
        aside={
          <div className="container py-12 md:py-28 flex flex-col justify-center h-full">
            <div className="mx-auto w-full max-w-md">
              <h2 className="text-display-sm text-forest">Invalid link</h2>
              <p className="mt-3 text-body text-muted">
                This reset link is invalid or has already been used.
              </p>
              <div className="mt-8">
                <Link href="/forgot-password" className="font-medium text-forest underline underline-offset-4">
                  Request a new reset link
                </Link>
              </div>
            </div>
          </div>
        }
      />
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await apiFetch("/users/password-reset/confirm", {
        method: "POST",
        body: { token, password },
      });

      const payload = (await res.json()) as { message?: string };

      if (!res.ok) {
        setError(payload.message ?? "Something went wrong.");
        return;
      }

      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SplitHighlight
      title="Set a new password"
      description="Choose a strong password to secure your Bloomy account."
      imageAlt="Botanical visual"
      imageUrl="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1400&q=80"
      aside={
        <div className="container py-12 md:py-28 flex flex-col justify-center h-full">
          <div className="mx-auto w-full max-w-md">
            {done ? (
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-forest/10">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-forest" aria-hidden>
                    <path d="M4 11l5 5 9-9" />
                  </svg>
                </div>
                <h2 className="text-display-sm text-forest">Password updated</h2>
                <p className="mt-3 text-body text-muted">
                  Your password has been changed. Redirecting you to login…
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-display-sm text-forest">Set a new password</h2>
                <p className="mt-3 text-sm text-muted">
                  Choose something strong — at least 8 characters.
                </p>

                <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
                  <Input
                    label="New password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <Input
                    label="Confirm new password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />

                  {error && (
                    <div className="bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
                  )}

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Updating…" : "Update password"}
                  </Button>
                </form>

                <p className="mt-8 text-sm text-muted">
                  <Link href="/forgot-password" className="font-medium text-forest underline underline-offset-4">
                    Request a new link
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordPageComponent />
    </Suspense>
  );
}
