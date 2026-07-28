"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SplitHighlight } from "@/components/ui/split-highlight";
import { RegisterSteps } from "@/components/ui/register-steps";
import { apiFetch } from "@/lib/api";
import { useRedirectIfAuthenticated } from "@/lib/useRedirectIfAuthenticated";

export default function RegisterPage() {
  const router = useRouter();
  const ready = useRedirectIfAuthenticated();
  const [email, setEmail] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!acceptTerms) {
      setError("You must accept the terms to continue.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiFetch("/users/register/init", {
        method: "POST",
        body: { email: email.trim(), acceptTerms: true },
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(payload.message ?? "Request failed.");
        return;
      }

      router.push(`/register/verify?email=${encodeURIComponent(email.trim())}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unknown error.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!ready) return null;

  return (
    <SplitHighlight
      title="Create a fresh Bloomy account"
      description="One account to own garden projects, move into the dashboard, and grow the planning workflow step by step."
      imageAlt="Botanical signup visual"
      imageUrl="https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1400&q=80"
      aside={
        <div className="container py-12 md:py-28">
          <div className="mx-auto w-full max-w-md">
            <RegisterSteps current={1} total={5} />
            <h2 className="text-display-sm text-forest">
              Create a Bloomy account
            </h2>
            <p className="mt-3 text-sm text-muted">
              Enter your email and we&apos;ll send you a verification code.
            </p>

            <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
                required
              />

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-forest"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  required
                />
                <span className="text-sm text-muted leading-snug">
                  I agree to the{" "}
                  <Link href="/terms" className="font-medium text-forest underline underline-offset-4">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="font-medium text-forest underline underline-offset-4">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
                {isSubmitting ? "Sending code..." : "Continue"}
              </Button>
            </form>

            {error ? (
              <div className="mt-5 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
            ) : null}

            <p className="mt-8 text-sm text-muted">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-forest underline underline-offset-4">
                Login here.
              </Link>
            </p>
          </div>
        </div>
      }
    />
  );
}
