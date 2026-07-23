"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeading } from "@/components/ui/page-heading";
import { Spinner } from "@/components/ui/spinner";
import { apiFetch } from "@/lib/api";
import { getAuthToken } from "@/store/auth";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import type { ContractorProfile } from "@/types/models";

export default function ContractorProfilePage() {
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [postcode, setPostcode] = useState("");
  const [radiusMiles, setRadiusMiles] = useState("25");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);


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
          setBusinessName(data.businessName);
          setBio(data.bio ?? "");
          setPostcode(data.postcode);
          setRadiusMiles(String(data.radiusMiles ?? 25));
          setPhone(data.phone ?? "");
          setWebsite(data.website ?? "");
        }
      })
      .catch((e: unknown) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveError(null);
    setSaved(false);
    setSaving(true);
    try {
      const res = await apiFetch("/contractor-profiles/me", {
        method: "PUT",
        body: {
          businessName: businessName.trim(),
          bio: bio.trim() || undefined,
          postcode: postcode.trim(),
          radiusMiles: parseInt(radiusMiles, 10) || 25,
          phone: phone.trim() || undefined,
          website: website.trim() || undefined,
        },
      });
      const payload = (await res.json()) as ContractorProfile | { message?: string };
      if (!res.ok) {
        setSaveError("message" in payload && payload.message ? payload.message : "Failed to save");
        return;
      }
      setProfile(payload as ContractorProfile);
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

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

      <form className="flex flex-col gap-6" onSubmit={handleSave}>
        <Input
          label="Business name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="e.g. Green Garden Services"
          required
        />

        <div className="flex flex-col gap-1">
          <label className="text-hint text-muted">
            About your business <span className="text-muted/70">(optional)</span>
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Your experience, qualifications, specialities — what a homeowner should know about you before choosing you."
            rows={4}
            className="w-full resize-none rounded-lg border border-line bg-canvas px-3 py-2 text-body text-ink placeholder:text-muted/60 focus:border-forest/40 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Your postcode"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            placeholder="e.g. SW1A 1AA"
            required
          />
          <Input
            label="Service radius (miles)"
            type="number"
            min="1"
            max="200"
            value={radiusMiles}
            onChange={(e) => setRadiusMiles(e.target.value)}
            required
          />
        </div>

        <p className="text-hint text-muted -mt-4">
          You will see homeowner requests within this radius of your postcode.
        </p>

        <Input
          label="Phone number (optional)"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+44 7700 900000"
        />

        <Input
          label="Website (optional)"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://yourwebsite.com"
        />

        {saveError && (
          <div className="bg-danger/10 px-4 py-3 text-sm text-danger">{saveError}</div>
        )}
        {saved && (
          <div className="bg-forest/10 px-4 py-3 text-sm text-forest">Profile saved.</div>
        )}

        <div>
          <Button type="submit" disabled={saving} className="px-8">
            {saving ? "Saving…" : profile ? "Save changes" : "Create profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
