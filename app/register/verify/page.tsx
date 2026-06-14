"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {Suspense, useState} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SplitHighlight } from "@/components/ui/split-highlight";
import { apiFetch } from "@/lib/api";

function RegisterVerifyPageComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await apiFetch("/users/register/verify", {
        method: "POST",
        body: { email, code: code.trim() },
      });

      const payload = (await response.json()) as { verified?: boolean; message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Invalid code.");
      }

      router.push(`/register/password?email=${encodeURIComponent(email)}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unknown error.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setError(null);
    setResendMessage(null);
    setIsResending(true);

    try {
      const response = await apiFetch("/users/register/init", {
        method: "POST",
        body: { email, acceptTerms: true },
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Failed to resend code.");
      }

      setResendMessage("A new code has been sent to your email.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unknown error.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <SplitHighlight
      title="Check your inbox"
      description="We sent a 6-digit verification code to your email address. It expires in 15 minutes."
      imageAlt="Botanical signup visual"
      imageUrl="https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1400&q=80"
      aside={
        <div className="container py-12 md:py-28">
          <div className="mx-auto w-full max-w-md">
            <h2 className="text-display-sm text-forest">
              Enter verification code
            </h2>
            <p className="mt-3 text-sm text-muted">
              We sent a code to <span className="font-medium text-forest">{email || "your email"}</span>.
            </p>

            <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
              <Input
                label="6-digit code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                autoComplete="one-time-code"
                required
              />

              <Button type="submit" disabled={isSubmitting || code.length !== 6} className="mt-2 w-full">
                {isSubmitting ? "Verifying..." : "Verify"}
              </Button>
            </form>

            {error ? (
              <div className="mt-5 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
            ) : null}

            {resendMessage ? (
              <div className="mt-5 bg-forest/10 px-4 py-3 text-sm text-forest">{resendMessage}</div>
            ) : null}

            <p className="mt-6 text-sm text-muted">
              Didn&apos;t receive it?{" "}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={isResending}
                className="inline px-0 font-medium text-forest underline underline-offset-4 hover:text-moss"
              >
                {isResending ? "Sending..." : "Resend code"}
              </Button>
            </p>

            <p className="mt-4 text-sm text-muted">
              Wrong email?{" "}
              <Link href="/register" className="font-medium text-forest underline underline-offset-4">
                Go back
              </Link>
            </p>
          </div>
        </div>
      }
    />
  );
}

export default function RegisterVerifyPage() {
  return (
      <Suspense>
        <RegisterVerifyPageComponent />
      </Suspense>
  )
}
