"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SplitHighlight } from "@/components/ui/split-highlight";
import { RegisterSteps } from "@/components/ui/register-steps";
import { useRedirectIfAuthenticated } from "@/lib/useRedirectIfAuthenticated";
import { registerPasswordSchema, type RegisterPasswordFormValues } from "@/lib/schemas";

function RegisterPasswordPageComponent() {
  const router = useRouter();
  const ready = useRedirectIfAuthenticated();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterPasswordFormValues>({ resolver: zodResolver(registerPasswordSchema) });

  const onSubmit = handleSubmit((values) => {
    sessionStorage.setItem("bloomy_reg_password", values.password);
    router.push(`/register/profile?email=${encodeURIComponent(email)}`);
  });

  if (!ready) return null;

  return (
    <SplitHighlight
      title="Set your password"
      description="Choose a strong password to protect your Bloomy account."
      imageAlt="Botanical signup visual"
      imageUrl="https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1400&q=80"
      aside={
        <div className="container py-12 md:py-28">
          <div className="mx-auto w-full max-w-md">
            <RegisterSteps current={4} total={5} />
            <h2 className="text-display-sm text-forest">
              Set your password
            </h2>
            <p className="mt-3 text-hint text-muted">
              For{" "}
              <span className="font-medium text-forest">{email || "your account"}</span>
            </p>

            <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
              <Input
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                error={errors.password?.message}
                data-testid="register-password"
                {...register("password")}
              />
              <Input
                label="Confirm password"
                type="password"
                placeholder="Repeat password"
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                data-testid="register-confirm-password"
                {...register("confirmPassword")}
              />

              <Button type="submit" className="mt-2 w-full" data-testid="register-password-submit">
                Continue
              </Button>
            </form>
          </div>
        </div>
      }
    />
  );
}

export default function RegisterPasswordPage() {
  return (
    <Suspense>
      <RegisterPasswordPageComponent />
    </Suspense>
  );
}
