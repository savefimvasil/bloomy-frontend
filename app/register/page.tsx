"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SplitHighlight } from "@/components/ui/split-highlight";

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

type LoginResponse = {
  accessToken: string;
  user: {
    id: string;
    name: string;
    surname: string;
    email: string;
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

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

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

      const loginResponse = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const loginPayload = (await loginResponse.json()) as LoginResponse | { message?: string };

      if (!loginResponse.ok) {
        const message =
          "message" in loginPayload && loginPayload.message
            ? loginPayload.message
            : "Registration worked, but automatic login failed.";
        throw new Error(message);
      }

      const loginData = loginPayload as LoginResponse;
      localStorage.setItem("bloomy_access_token", loginData.accessToken);
      localStorage.setItem("bloomy_user_email", loginData.user.email);
      window.dispatchEvent(new Event("bloomy-auth-changed"));
      setForm(initialState);
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
      title="Create a fresh Bloomy account"
      description="One account to own garden projects, move into the dashboard, and grow the planning workflow step by step."
      imageAlt="Botanical signup visual"
      imageUrl="https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1400&q=80"
      aside={
        <div className="container py-12 md:py-28">
          <div className="mx-auto w-full max-w-md">
            <h2 className="text-4xl font-semibold tracking-tight text-forest">
              Create a Bloomy account
            </h2>
            <p className="mt-3 text-sm text-muted">One account for all Bloomy products</p>

            <form className="mt-4 flex flex-col gap-2" onSubmit={handleSubmit}>
              <Input
                label="Name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Your name"
                autoComplete="given-name"
                required
              />
              <Input
                label="Surname"
                value={form.surname}
                onChange={(event) => updateField("surname", event.target.value)}
                placeholder="Your surname"
                autoComplete="family-name"
                required
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="Your email"
                autoComplete="email"
                required
              />
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
              />
              <Input
                label="Confirm password"
                type="password"
                value={form.confirmPassword}
                onChange={(event) => updateField("confirmPassword", event.target.value)}
                placeholder="Repeat password"
                autoComplete="new-password"
                minLength={8}
                required
              />

              <Button type="submit" disabled={isSubmitting} className="mt-4 w-full">
                {isSubmitting ? "Creating..." : "Submit"}
              </Button>
            </form>

            {error ? <div className="mt-5 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div> : null}

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
