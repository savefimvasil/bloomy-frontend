"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BloomyLogo } from "@/components/ui/bloomy-logo";

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

export function SiteHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(() =>
    typeof window !== "undefined"
      ? Boolean(localStorage.getItem("bloomy_access_token"))
      : false
  );
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function sync() {
      setIsLoggedIn(Boolean(localStorage.getItem("bloomy_access_token")));
    }
    window.addEventListener("storage", sync);
    window.addEventListener("bloomy-auth-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("bloomy-auth-changed", sync);
    };
  }, []);

  const navLinks = [{ href: "/tile-plan", label: "Tile Planner" }];

  return (
    <header className="fixed top-0 z-40 w-full border-b border-line/60 bg-paper/95 backdrop-blur-md">
      <div className="container flex h-[68px] items-center justify-between">

        {/* Logo */}
        <Link href="/" className="inline-flex items-center text-forest">
          <BloomyLogo className="h-auto w-[148px] sm:w-[160px]" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 sm:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-eyebrow text-muted transition hover:text-ink"
            >
              {item.label}
            </Link>
          ))}

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
        <button
          className="flex h-10 w-10 items-center justify-center rounded text-ink sm:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <span className="text-base">{menuOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="absolute left-0 right-0 top-[68px] flex flex-col gap-4 border-t border-line bg-paper/98 px-6 py-4 shadow-soft backdrop-blur-md sm:hidden">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-eyebrow text-muted transition hover:text-ink"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}

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
