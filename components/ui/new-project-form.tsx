"use client";

import Link from "next/link";
import { useState } from "react";

type RegisterResponse = {
  message: string;
  user: {
    id: string;
    name: string;
    surname: string;
    email: string;
    createdAt: string;
  };
  project: {
    id: string;
    userId: string;
    hash: string;
    createdAt: string;
  };
};

type FormState = {
  name: string;
  surname: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

const initialState: FormState = {
  name: "",
  surname: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function NewProjectForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RegisterResponse | null>(null);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          surname: form.surname,
          email: form.email,
          password: form.password,
        }),
      });

      const payload = (await response.json()) as RegisterResponse | { message?: string };

      if (!response.ok) {
        const message = "message" in payload && payload.message ? payload.message : "Request failed.";
        throw new Error(message);
      }

      setResult(payload as RegisterResponse);
      setForm(initialState);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unknown error.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid overflow-hidden border border-border bg-surface lg:grid-cols-[1.04fr_0.96fr]">
      <div
        className="relative min-h-[340px] border-b border-border bg-brand-strong lg:min-h-full lg:border-b-0 lg:border-r"
        style={{
          backgroundImage:
            "linear-gradient(rgba(24,31,20,0.18), rgba(24,31,20,0.44)), url('https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1400&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 flex flex-col justify-end p-8 text-white md:p-10">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/64">Create project</p>
          <h1 className="mt-4 max-w-lg text-5xl font-semibold leading-[0.95] tracking-tight md:text-6xl">
            Start a new client and project.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/76">
            Create the user, attach the first project automatically, and move into the workspace with a cleaner project-first flow.
          </p>
        </div>
      </div>

      <div className="bg-surface p-8 md:p-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-brand-soft">New account</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-brand">Create user and project</h2>
          </div>
        </div>

        <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-brand-soft">Name</span>
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="w-full border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand focus:bg-white"
                placeholder="Anna"
                autoComplete="given-name"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-brand-soft">Surname</span>
              <input
                value={form.surname}
                onChange={(event) => updateField("surname", event.target.value)}
                className="w-full border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand focus:bg-white"
                placeholder="Hughes"
                autoComplete="family-name"
                required
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-brand-soft">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              className="w-full border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand focus:bg-white"
              placeholder="anna@bloomy.garden"
              autoComplete="email"
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-brand-soft">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                className="w-full border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand focus:bg-white"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-brand-soft">Confirm password</span>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(event) => updateField("confirmPassword", event.target.value)}
                className="w-full border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand focus:bg-white"
                placeholder="Repeat password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:bg-brand-soft"
          >
            {isSubmitting ? "Creating..." : "Create new project"}
          </button>
        </form>

        {error ? (
          <div className="mt-5 border border-danger/16 bg-danger-soft p-4 text-sm text-danger">
            {error}
          </div>
        ) : null}

        {result ? (
          <div className="mt-5 border border-border bg-background p-5">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-brand-soft">
                Created successfully
              </p>
              <p className="mt-3 text-2xl font-semibold text-brand">
                {result.user.name} {result.user.surname}
              </p>
              <p className="mt-2 text-sm text-ink-muted">{result.user.email}</p>
            </div>

            <div className="mt-5 border border-border bg-surface px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-black/45">First project hash</p>
              <p className="mt-2 break-all text-base font-medium text-brand">{result.project.hash}</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/login" className="bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-strong">
                Continue to login
              </Link>
              <Link href="/projects" className="border border-border px-4 py-2 text-sm font-medium text-brand transition hover:bg-surface-muted">
                Open projects page
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
