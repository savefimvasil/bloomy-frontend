"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SplitHighlight } from "@/components/ui/split-highlight";

type LoginResponse = {
  accessToken: string;
  user: {
    id: string;
    name: string;
    surname: string;
    email: string;
  };
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as LoginResponse | { message?: string };

      if (!response.ok) {
        throw new Error("message" in payload && payload.message ? payload.message : "Login failed.");
      }

      const data = payload as LoginResponse;
      localStorage.setItem("bloomy_access_token", data.accessToken);
      localStorage.setItem("bloomy_user_email", data.user.email);
      window.dispatchEvent(new Event("bloomy-auth-changed"));
      router.push("/projects");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unknown error.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SplitHighlight
      title="Login to your Bloomy account"
      description="One account for all Bloomy project spaces, with a clearer, greener interface and less visual noise."
      imageAlt="Botanical login visual"
      imageUrl="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1400&q=80"
      aside={
        <div className="container flex min-h-screen items-center py-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mt-10">
              <h2 className="text-4xl font-semibold tracking-tight text-forest">
                Login to your Bloomy account
              </h2>
              <p className="mt-3 text-sm text-muted">
                One account for all Bloomy products
              </p>
            </div>

            <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@bloomy.garden"
                autoComplete="email"
                required
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
                required
              />

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Signing in..." : "Submit"}
              </Button>
            </form>

            {error ? <div className="mt-5 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div> : null}

            <p className="mt-8 text-sm text-muted">
              Need an account?{" "}
              <Link href="/projects/new" className="font-medium text-forest underline underline-offset-4">
                Create one here.
              </Link>
            </p>
          </div>
        </div>
      }
    />
  );
}
