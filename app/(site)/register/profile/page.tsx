"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SplitHighlight } from "@/components/ui/split-highlight";
import { RegisterSteps } from "@/components/ui/register-steps";
import { apiFetch } from "@/lib/api";
import { setAuth } from "@/store/auth";
import { useRedirectIfAuthenticated } from "@/lib/useRedirectIfAuthenticated";
import {
  registerProfileBaseSchema,
  registerProfileContractorSchema,
  type RegisterProfileBaseFormValues,
  type RegisterProfileContractorFormValues,
} from "@/lib/schemas";

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

  const isContractor = role === "contractor";
  const schema = isContractor ? registerProfileContractorSchema : registerProfileBaseSchema;

  type FormValues = RegisterProfileContractorFormValues | RegisterProfileBaseFormValues;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!email) router.replace("/register");
  }, [email, router]);

  const onSubmit = handleSubmit(async (values) => {
    const password = sessionStorage.getItem("bloomy_reg_password");
    if (!password) {
      router.replace(`/register/password?email=${encodeURIComponent(email)}`);
      return;
    }

    const body: Record<string, unknown> = {
      email,
      password,
      name: values.name.trim(),
      surname: values.surname.trim(),
      role,
      acceptPromo: values.acceptPromo ?? false,
    };

    if (isContractor) {
      const cv = values as RegisterProfileContractorFormValues;
      body.postcode = cv.postcode?.trim();
      body.radiusMiles = Number(cv.radiusMiles);
      if (cv.businessName?.trim()) body.businessName = cv.businessName.trim();
      if (cv.phone?.trim()) body.phone = cv.phone.trim();
    } else {
      body.reason = values.reason?.trim() || undefined;
    }

    const response = await apiFetch("/users/register/complete", { method: "POST", body });
    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setError("root", { message: payload.message ?? "Registration failed." });
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
  });

  if (!ready) return null;

  const e = errors as Record<string, { message?: string }>;

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
            <h2 className="text-display-sm text-forest">Complete your profile</h2>
            <p className="mt-3 text-hint text-muted">
              For{" "}
              <span className="font-medium text-forest">{email || "your account"}</span>
            </p>

            <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
              <Input
                label="Name"
                placeholder="Your name"
                autoComplete="given-name"
                error={e.name?.message}
                {...register("name")}
              />
              <Input
                label="Surname"
                placeholder="Your surname"
                autoComplete="family-name"
                error={e.surname?.message}
                {...register("surname")}
              />

              {isContractor ? (
                <>
                  <Input
                    label="Postcode"
                    placeholder="e.g. SW1A 1AA"
                    autoComplete="postal-code"
                    error={e.postcode?.message}
                    {...register("postcode")}
                  />
                  <Input
                    label="Service radius (miles)"
                    type="number"
                    placeholder="e.g. 25"
                    min="1"
                    max="200"
                    error={e.radiusMiles?.message}
                    {...register("radiusMiles")}
                  />
                  <Input
                    label="Business name (optional)"
                    placeholder="Your trading name"
                    autoComplete="organization"
                    error={e.businessName?.message}
                    {...register("businessName")}
                  />
                  <Input
                    label="Phone (optional)"
                    type="tel"
                    placeholder="e.g. 07700 900123"
                    autoComplete="tel"
                    error={e.phone?.message}
                    {...register("phone")}
                  />
                </>
              ) : (
                <Textarea
                  label="Why are you using Bloomy? (optional)"
                  placeholder="e.g. planning a garden renovation, interior flooring project..."
                  rows={3}
                  {...register("reason")}
                />
              )}

              <label className="flex cursor-pointer items-start gap-3 pt-1">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-forest"
                  {...register("acceptPromo")}
                />
                <span className="text-hint text-muted leading-snug">
                  Send me tips, updates, and occasional promotions from Bloomy
                </span>
              </label>

              {errors.root && (
                <div className="rounded-lg bg-danger/10 px-4 py-3 text-hint text-danger">{errors.root.message}</div>
              )}

              <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>
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
