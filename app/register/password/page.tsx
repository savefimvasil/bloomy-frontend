"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SplitHighlight } from "@/components/ui/split-highlight";

function RegisterPasswordPageComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    sessionStorage.setItem("bloomy_reg_password", password);
    router.push(`/register/profile?email=${encodeURIComponent(email)}`);
  }

  return (
    <Suspense>
      <SplitHighlight
          title="Set your password"
          description="Choose a strong password to protect your Bloomy account."
          imageAlt="Botanical signup visual"
          imageUrl="https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1400&q=80"
          aside={
            <div className="container py-12 md:py-28">
              <div className="mx-auto w-full max-w-md">
                <h2 className="text-4xl font-semibold tracking-tight text-forest">
                  Set your password
                </h2>
                <p className="mt-3 text-sm text-muted">
                  For{" "}
                  <span className="font-medium text-forest">{email || "your account"}</span>
                </p>

                <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
                  <Input
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      minLength={8}
                      required
                  />
                  <Input
                      label="Confirm password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                  />

                  <Button type="submit" className="mt-2 w-full">
                    Continue
                  </Button>
                </form>

                {error ? (
                    <div className="mt-5 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
                ) : null}
              </div>
            </div>
          }
      />
    </Suspense>
  );
}

export default function RegisterPasswordPage() {
  return (
      <Suspense>
        <RegisterPasswordPageComponent />
      </Suspense>
  )
};
