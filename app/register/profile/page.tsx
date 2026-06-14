"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {Suspense, useEffect, useState} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SplitHighlight } from "@/components/ui/split-highlight";

type LoginResponse = {
  accessToken: string;
  user: { id: string; name: string; surname: string; email: string };
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

function RegisterProfilePageComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [reason, setReason] = useState("");
  const [acceptPromo, setAcceptPromo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) router.replace("/register");
  }, [email, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const password = sessionStorage.getItem("bloomy_reg_password");
    if (!password) {
      router.replace(`/register/password?email=${encodeURIComponent(email)}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/users/register/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: name.trim(),
          surname: surname.trim(),
          reason: reason.trim() || undefined,
          acceptPromo,
        }),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Registration failed.");
      }

      sessionStorage.removeItem("bloomy_reg_password");

      const loginResponse = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const loginPayload = (await loginResponse.json()) as LoginResponse | { message?: string };

      if (loginResponse.ok) {
        const loginData = loginPayload as LoginResponse;
        localStorage.setItem("bloomy_access_token", loginData.accessToken);
        localStorage.setItem("bloomy_user_email", loginData.user.email);
        window.dispatchEvent(new Event("bloomy-auth-changed"));
      }

      router.push("/cabinet");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unknown error.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SplitHighlight
      title="Almost there"
      description="Tell us a little about yourself to personalise your Bloomy experience."
      imageAlt="Botanical signup visual"
      imageUrl="https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1400&q=80"
      aside={
        <div className="container py-12 md:py-28">
          <div className="mx-auto w-full max-w-md">
            <h2 className="text-display-sm text-forest">
              Complete your profile
            </h2>
            <p className="mt-3 text-sm text-muted">
              For{" "}
              <span className="font-medium text-forest">{email || "your account"}</span>
            </p>

            <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="given-name"
                required
              />
              <Input
                label="Surname"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder="Your surname"
                autoComplete="family-name"
                required
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-forest">
                  Why are you using Bloomy?{" "}
                  <span className="font-normal text-muted">(optional)</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. planning a garden renovation, interior flooring project..."
                  rows={3}
                  className="w-full rounded-md border border-muted/30 bg-canvas px-3 py-2 text-sm text-forest placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-forest/30 resize-none"
                />
              </div>

              <label className="flex cursor-pointer items-start gap-3 pt-1">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-forest"
                  checked={acceptPromo}
                  onChange={(e) => setAcceptPromo(e.target.checked)}
                />
                <span className="text-sm text-muted leading-snug">
                  Send me tips, updates, and occasional promotions from Bloomy
                </span>
              </label>

              <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>

            {error ? (
              <div className="mt-5 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
            ) : null}
          </div>
        </div>
      }
    />
  );
}

export default function RegisterProfilePage() {
  return (
      <Suspense>
        <RegisterProfilePageComponent />
      </Suspense>
  )
};
