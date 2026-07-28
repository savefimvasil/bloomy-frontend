"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SplitHighlight } from "@/components/ui/split-highlight";
import { apiFetch } from "@/lib/api";
import { setAuth } from "@/store/auth";
import { useRedirectIfAuthenticated } from "@/lib/useRedirectIfAuthenticated";
import { loginSchema, type LoginFormValues } from "@/lib/schemas";

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

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    const response = await apiFetch("/auth/login", {
      method: "POST",
      body: { email: values.email, password: values.password },
    });

    const payload = (await response.json()) as LoginResponse | { message?: string };

    if (!response.ok) {
      setError("root", {
        message: "message" in payload && payload.message ? payload.message : "Login failed.",
      });
      return;
    }

    const data = payload as LoginResponse;
    setAuth(data.accessToken, data.user.email, data.user.role ?? "homeowner");
    router.push("/cabinet");
    router.refresh();
  });

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
            <p className="mt-3 text-hint text-muted">One account for all Bloomy products</p>

            <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
              <Input
                label="Email"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
              />
              <div className="flex flex-col gap-1">
                <Input
                  label="Password"
                  type="password"
                  placeholder="Your password"
                  autoComplete="current-password"
                  error={errors.password?.message}
                  {...register("password")}
                />
                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-hint text-muted underline underline-offset-4 hover:text-forest">
                    Forgot password?
                  </Link>
                </div>
              </div>

              {errors.root && (
                <div className="rounded-lg bg-danger/10 px-4 py-3 text-hint text-danger">{errors.root.message}</div>
              )}

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <p className="mt-8 text-hint text-muted">
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
