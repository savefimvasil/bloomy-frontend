"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
      router.push("/projects");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unknown error.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid overflow-hidden border border-border bg-surface lg:grid-cols-[1.04fr_0.96fr]">
      <div
        className="relative min-h-[320px] border-b border-border bg-brand-strong lg:min-h-full lg:border-b-0 lg:border-r"
        style={{
          backgroundImage:
            "linear-gradient(rgba(24,31,20,0.2), rgba(24,31,20,0.48)), url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 flex flex-col justify-end p-8 text-white md:p-10">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/64">Secure access</p>
          <h1 className="mt-4 max-w-md text-5xl font-semibold leading-[0.95] tracking-tight md:text-6xl">
            Login to your projects.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/76">
            A flatter, cleaner client access page that leads directly into the protected project workspace.
          </p>
        </div>
      </div>

      <div className="bg-surface p-8 md:p-10">
        <p className="text-[11px] uppercase tracking-[0.2em] text-brand-soft">Client access</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-brand">Access your projects</h2>

        <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
          <label className="space-y-2">
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-brand-soft">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand focus:bg-white"
              placeholder="anna@bloomy.garden"
              autoComplete="email"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-brand-soft">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand focus:bg-white"
              placeholder="Your password"
              autoComplete="current-password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:bg-brand-soft"
          >
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        {error ? (
          <div className="mt-5 border border-danger/16 bg-danger-soft p-4 text-sm text-danger">
            {error}
          </div>
        ) : null}

        <p className="mt-8 text-sm text-ink-muted">
          Need an account first?{" "}
          <Link href="/projects/new" className="font-medium text-brand underline decoration-brand/30 underline-offset-4">
            Create one here
          </Link>
        </p>
      </div>
    </section>
  );
}
