"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SplitHighlight } from "@/components/ui/split-highlight";
import { apiFetch } from "@/lib/api";
import { setAuth } from "@/store/auth";
import { useRedirectIfAuthenticated } from "@/lib/useRedirectIfAuthenticated";

type LoginResponse = {
  accessToken: string;
  user: {
    id: string;
    name: string;
    surname: string;
    email: string;
    role: "homeowner" | "contractor";
  };
};

export default function LoginPage() {
  const router = useRouter();
  const ready = useRedirectIfAuthenticated();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      const payload = (await response.json()) as LoginResponse | { message?: string };

      if (!response.ok) {
        setError("message" in payload && payload.message ? payload.message : "Login failed.");
        return;
      }

      const data = payload as LoginResponse;
      setAuth(data.accessToken, data.user.email, data.user.role ?? "homeowner");
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
      title="Login to your Bloomy account"
      description="One account for all Bloomy project spaces, with a clearer, greener interface and less visual noise."
      imageAlt="Botanical login visual"
      imageUrl="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1400&q=80"
      aside={
        <div className="container py-12 md:py-28 flex flex-col justify-center h-full">
          <div className="mx-auto w-full max-w-md">
            <h2 className="text-display-sm text-forest">
              Login to your Bloomy account
            </h2>
            <p className="mt-3 text-sm text-muted">One account for all Bloomy products</p>

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
              <div className="flex flex-col gap-1">
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                  required
                />
                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-hint text-muted underline underline-offset-4 hover:text-forest">
                    Forgot password?
                  </Link>
                </div>
              </div>

              {error ? <div className="bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div> : null}

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <p className="mt-8 text-sm text-muted">
              Need an account?{" "}
              <Link href="/register" className="font-medium text-forest underline underline-offset-4">
                Create one here.
              </Link>
            </p>
          </div>
        </div>
      }
    />
  );
}
