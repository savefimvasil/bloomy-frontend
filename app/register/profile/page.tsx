"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SplitHighlight } from "@/components/ui/split-highlight";
import { RegisterSteps } from "@/components/ui/register-steps";
import { apiFetch } from "@/lib/api";
import { setAuth } from "@/store/auth";
import { useRedirectIfAuthenticated } from "@/lib/useRedirectIfAuthenticated";

type LoginResponse = {
  accessToken: string;
  user: { id: string; name: string; surname: string; email: string; role: "homeowner" | "contractor" };
};

function RegisterProfilePageComponent() {
  const router = useRouter();
  const ready = useRedirectIfAuthenticated();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [role] = useState<"homeowner" | "contractor">(() =>
    typeof window === "undefined"
      ? "homeowner"
      : ((sessionStorage.getItem("bloomy_reg_role") ?? "homeowner") as "homeowner" | "contractor")
  );
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [reason, setReason] = useState("");
  const [acceptPromo, setAcceptPromo] = useState(false);
  const [postcode, setPostcode] = useState("");
  const [radiusMiles, setRadiusMiles] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
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
      const body: Record<string, unknown> = {
        email,
        password,
        name: name.trim(),
        surname: surname.trim(),
        role,
        acceptPromo,
      };

      if (role === "contractor") {
        body.postcode = postcode.trim();
        body.radiusMiles = Number(radiusMiles);
        if (businessName.trim()) body.businessName = businessName.trim();
        if (phone.trim()) body.phone = phone.trim();
      } else {
        body.reason = reason.trim() || undefined;
      }

      const response = await apiFetch("/users/register/complete", {
        method: "POST",
        body,
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(payload.message ?? "Registration failed.");
        return;
      }

      sessionStorage.removeItem("bloomy_reg_password");
      sessionStorage.removeItem("bloomy_reg_role");

      const loginResponse = await apiFetch("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      const loginPayload = (await loginResponse.json()) as LoginResponse | { message?: string };

      if (loginResponse.ok) {
        const loginData = loginPayload as LoginResponse;
        setAuth(loginData.accessToken, loginData.user.email, loginData.user.role ?? "homeowner");
      }

      router.push("/cabinet");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unknown error.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!ready) return null;

  return (
    <SplitHighlight
      title="Almost there"
      description="Tell us a little about yourself to personalise your Bloomy experience."
      imageAlt="Botanical signup visual"
      imageUrl="https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1400&q=80"
      aside={
        <div className="container py-12 md:py-28">
          <div className="mx-auto w-full max-w-md">
            <RegisterSteps current={5} total={5} />
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

              {role === "contractor" ? (
                <>
                  <Input
                    label="Postcode"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="e.g. SW1A 1AA"
                    autoComplete="postal-code"
                    required
                  />
                  <Input
                    label="Service radius (miles)"
                    type="number"
                    value={radiusMiles}
                    onChange={(e) => setRadiusMiles(e.target.value)}
                    placeholder="e.g. 25"
                    min="1"
                    max="200"
                    required
                  />
                  <Input
                    label="Business name (optional)"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your trading name"
                    autoComplete="organization"
                  />
                  <Input
                    label="Phone (optional)"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 07700 900123"
                    autoComplete="tel"
                  />
                </>
              ) : (
                <div className="flex flex-col gap-1">
                  <label className="text-hint text-muted">
                    Why are you using Bloomy?{" "}
                    <span className="text-muted/70">(optional)</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. planning a garden renovation, interior flooring project..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-line bg-canvas px-3 py-2 text-body text-ink placeholder:text-muted/60 focus:border-forest/40 focus:outline-none"
                  />
                </div>
              )}

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
  );
}
