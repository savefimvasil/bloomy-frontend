"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeading } from "@/components/ui/page-heading";
import { Spinner } from "@/components/ui/spinner";
import { apiFetch } from "@/lib/api";
import { getAuthToken } from "@/store/auth";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { contractorProfileSchema, type ContractorProfileFormValues } from "@/lib/schemas";
import type { ContractorProfile } from "@/types/models";

export default function ContractorProfilePage() {
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContractorProfileFormValues>({
    resolver: zodResolver(contractorProfileSchema),
    defaultValues: { radiusMiles: "25" },
  });

  useEffect(() => {
    if (!getAuthToken()) return;
    void apiFetch("/contractor-profiles/me")
      .then((res) => {
        if (res.status === 404 || res.status === 204) return null;
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json() as Promise<ContractorProfile>;
      })
      .then((data) => {
        if (data) {
          setProfile(data);
          reset({
            businessName: data.businessName,
            bio: data.bio ?? "",
            postcode: data.postcode,
            radiusMiles: String(data.radiusMiles ?? 25),
            phone: data.phone ?? "",
            website: data.website ?? "",
          });
        }
      })
      .catch(() => { /* profile not found — form stays in create mode */ })
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = handleSubmit(async (values) => {
    setSaved(false);
    const res = await apiFetch("/contractor-profiles/me", {
      method: "PUT",
      body: {
        businessName: values.businessName.trim(),
        bio: values.bio?.trim() || undefined,
        postcode: values.postcode.trim(),
        radiusMiles: Number(values.radiusMiles),
        phone: values.phone?.trim() || undefined,
        website: values.website?.trim() || undefined,
      },
    });
    const payload = (await res.json()) as ContractorProfile | { message?: string };
    if (!res.ok) {
      setError("root", {
        message: "message" in payload && payload.message ? payload.message : "Failed to save",
      });
      return;
    }
    setProfile(payload as ContractorProfile);
    setSaved(true);
  });

  if (loading) return <div className="flex justify-center py-12"><Spinner label="Loading profile…" /></div>;

  return (
    <div className="max-w-xl">
      <PageHeading title={<>MY PROFILE</>} />

      {profile?.verified && (
        <div className="mb-6">
          <VerifiedBadge />
        </div>
      )}

      {!profile && (
        <p className="mb-8 text-body text-muted">
          Fill in your profile so homeowners can evaluate you when reviewing your proposals. Your postcode and radius determine which requests you see.
        </p>
      )}

      <form className="flex flex-col gap-6" onSubmit={onSubmit}>
        <Input
          label="Business name"
          placeholder="e.g. Green Garden Services"
          error={errors.businessName?.message}
          data-testid="profile-business-name"
          {...register("businessName")}
        />

        <Textarea
          label="About your business (optional)"
          placeholder="Your experience, qualifications, specialities — what a homeowner should know about you before choosing you."
          rows={4}
          {...register("bio")}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Your postcode"
            placeholder="e.g. SW1A 1AA"
            error={errors.postcode?.message}
            data-testid="profile-postcode"
            {...register("postcode")}
          />
          <Input
            label="Service radius (miles)"
            type="number"
            min="1"
            max="200"
            error={errors.radiusMiles?.message}
            data-testid="profile-radius"
            {...register("radiusMiles")}
          />
        </div>

        <p className="text-hint text-muted -mt-4">
          You will see homeowner requests within this radius of your postcode.
        </p>

        <Input
          label="Phone number (optional)"
          type="tel"
          placeholder="+44 7700 900000"
          error={errors.phone?.message}
          {...register("phone")}
        />

        <Input
          label="Website (optional)"
          type="url"
          placeholder="https://yourwebsite.com"
          error={errors.website?.message}
          {...register("website")}
        />

        {errors.root && (
          <div className="rounded-lg bg-danger/10 px-4 py-3 text-hint text-danger">{errors.root.message}</div>
        )}
        {saved && (
          <div className="rounded-lg bg-forest/10 px-4 py-3 text-hint text-forest">Profile saved.</div>
        )}

        <div>
          <Button type="submit" disabled={isSubmitting} className="px-8" data-testid="profile-save">
            {isSubmitting ? "Saving…" : profile ? "Save changes" : "Create profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
