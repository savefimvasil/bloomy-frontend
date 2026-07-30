"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SplitHighlight } from "@/components/ui/split-highlight";
import { RegisterSteps } from "@/components/ui/register-steps";
import { apiFetch } from "@/lib/api";
import { useRedirectIfAuthenticated } from "@/lib/useRedirectIfAuthenticated";
import { registerInitSchema, type RegisterInitFormValues } from "@/lib/schemas";

export default function RegisterPage() {
  const router = useRouter();
  const ready = useRedirectIfAuthenticated();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInitFormValues>({
    resolver: zodResolver(registerInitSchema),
    defaultValues: { acceptTerms: undefined },
  });

  const onSubmit = handleSubmit(async (values) => {
    const response = await apiFetch("/users/register/init", {
      method: "POST",
      body: { email: values.email.trim(), acceptTerms: true },
    });

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setError("root", { message: payload.message ?? "Request failed." });
      return;
    }

    sessionStorage.setItem("reg_email", values.email.trim());
    router.push(`/register/verify?email=${encodeURIComponent(values.email.trim())}`);
  });

  if (!ready) return null;

  return (
    <SplitHighlight
      title="Create a fresh Bloomy account"
      description="One account to own garden projects, move into the dashboard, and grow the planning workflow step by step."
      imageAlt="Botanical signup visual"
      imageUrl="https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1400&q=80"
      aside={
        <div className="container py-12 md:py-28">
          <div className="mx-auto w-full max-w-md">
            <RegisterSteps current={1} total={5} />
            <h2 className="text-display-sm text-forest">
              Create a Bloomy account
            </h2>
            <p className="mt-3 text-hint text-muted">
              Enter your email and we&apos;ll send you a verification code.
            </p>

            <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
              <Input
                label="Email"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
              />

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-forest"
                  {...register("acceptTerms")}
                />
                <span className="text-hint text-muted leading-snug">
                  I agree to the{" "}
                  <Link href="/terms" className="font-medium text-forest underline underline-offset-4">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="font-medium text-forest underline underline-offset-4">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-hint text-danger">{errors.acceptTerms.message}</p>
              )}

              <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
                {isSubmitting ? "Sending code..." : "Continue"}
              </Button>
            </form>

            {errors.root && (
              <div className="mt-5 rounded-lg bg-danger/10 px-4 py-3 text-hint text-danger">{errors.root.message}</div>
            )}

            <p className="mt-8 text-hint text-muted">
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
