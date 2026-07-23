"use client";

import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/tile-plan/edit") return null;

  return (
    <footer className="bg-canvas text-ink border-t border-line">
      <div className="container flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between md:py-8">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-forest">Bloomy Garden</p>
        <p className="text-sm text-muted">Landscape planning, onboarding, and project care.</p>
      </div>
    </footer>
  );
}
