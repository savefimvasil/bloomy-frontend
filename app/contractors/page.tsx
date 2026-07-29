"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isValid, toNormalised } from "postcode";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";

export default function ContractorsPage() {
  const router = useRouter();
  const [postcode, setPostcode] = useState("");
  const [error, setError] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const clean = postcode.trim().toUpperCase().replace(/\s+/g, "");
    if (!clean) return;

    // Accept full postcodes and outward codes (e.g. "SW1A", "BS1")
    const normalised = isValid(clean) ? (toNormalised(clean) ?? clean) : clean;

    if (isValid(clean) || /^[A-Z]{1,2}\d[A-Z\d]?$/i.test(clean)) {
      setError("");
      router.push(`/contractors/${encodeURIComponent(normalised)}`);
    } else {
      setError("Enter a valid UK postcode or area code (e.g. SW1A 1AA or SW1A)");
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center px-4 pb-20 pt-28">
        <div className="w-full max-w-md text-center">
          <p className="text-eyebrow text-muted mb-3">Contractor directory</p>
          <h1 className="text-display-lg text-forest mb-4">
            FIND LOCAL<br />CONTRACTORS
          </h1>
          <p className="mb-8 text-body text-muted">
            Discover garden professionals covering your postcode.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex flex-1 flex-col items-start gap-1">
              <input
                type="text"
                value={postcode}
                onChange={(e) => { setPostcode(e.target.value); setError(""); }}
                placeholder="Your postcode — e.g. SW1A 1AA"
                autoFocus
                className="min-h-12 w-full rounded-xl border border-line bg-paper px-4 text-body text-ink placeholder:text-muted/60 outline-none transition focus:border-forest/40 focus:bg-white focus:outline-2 focus:outline-leaf/25"
              />
              {error && <p className="text-hint text-danger">{error}</p>}
            </div>
            <Button type="submit" disabled={!postcode.trim()} className="shrink-0 px-6 self-start min-h-12">
              Search
            </Button>
          </form>

          <p className="mt-10 text-hint text-muted">
            Are you a contractor?{" "}
            <a href="/register" className="text-forest underline underline-offset-4 hover:text-moss">
              Join Bloomy and receive local job leads →
            </a>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
