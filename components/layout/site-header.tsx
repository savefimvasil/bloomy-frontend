"use client";

import Link from "next/link";
import { useState } from "react";
import { BloomyLogo } from "@/components/ui/bloomy-logo";
import { Dropdown } from "@/components/ui/dropdown";
import { IconButton } from "@/components/ui/icon-button";
import { useAuthStore } from "@/store/auth";

function CabinetIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
      <rect x="0" y="0" width="5" height="5" rx="1.5" />
      <rect x="7" y="0" width="5" height="5" rx="1.5" />
      <rect x="0" y="7" width="5" height="5" rx="1.5" />
      <rect x="7" y="7" width="5" height="5" rx="1.5" />
    </svg>
  );
}

const PRODUCTS = [
  { href: "/projects/new", label: "Garden Planner" },
  { href: "/tile-plan", label: "Tile Planner" },
];

export function SiteHeader() {
  const isLoggedIn = useAuthStore((s) => s.token !== null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 z-40 w-full border-b border-line/60 bg-paper/95 backdrop-blur-md">
      <div className="container flex h-[68px] items-center justify-between">

        {/* Logo */}
        <Link href="/" className="inline-flex items-center text-forest">
          <BloomyLogo className="h-auto w-[148px] sm:w-[160px]" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 sm:flex">
          <Dropdown label="Products" items={PRODUCTS} />

          <span className="h-4 w-px bg-line" />

          {isLoggedIn ? (
            <Link
              href="/cabinet"
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-3.5 py-1.5 text-eyebrow text-ink transition hover:border-forest hover:bg-mist hover:text-forest"
            >
              <CabinetIcon />
              Cabinet
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-eyebrow text-forest transition hover:text-moss"
            >
              Log in →
            </Link>
          )}
        </nav>

        {/* Mobile hamburger */}
        <IconButton
          variant="ghost"
          size="lg"
          className="sm:hidden text-base text-ink"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? "✕" : "☰"}
        </IconButton>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute left-0 right-0 top-[68px] flex flex-col gap-1 border-t border-line bg-paper/98 px-6 py-4 shadow-soft backdrop-blur-md sm:hidden">
          <p className="mb-1 text-eyebrow text-muted/50">Products</p>
          {PRODUCTS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-2 pl-2 text-eyebrow text-muted transition hover:text-ink"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <div className="my-2 h-px bg-line" />

          {isLoggedIn ? (
            <Link
              href="/cabinet"
              className="inline-flex w-fit items-center gap-1.5 rounded-full border border-line bg-canvas px-3.5 py-1.5 text-eyebrow text-ink"
              onClick={() => setMenuOpen(false)}
            >
              <CabinetIcon />
              Cabinet
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-eyebrow text-forest"
              onClick={() => setMenuOpen(false)}
            >
              Log in →
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
