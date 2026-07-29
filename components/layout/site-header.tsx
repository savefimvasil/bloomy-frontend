"use client";

import Link from "next/link";
import { useState } from "react";
import { BloomyLogo } from "@/components/ui/bloomy-logo";
import { Dropdown } from "@/components/ui/dropdown";
import { IconButton } from "@/components/ui/icon-button";
import { useAuthStore } from "@/store/auth";
import { useChatStore, selectTotalUnread } from "@/store/chat";

// ─── Icons ───────────────────────────────────────────────────────────────────

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

// ─── Nav config ───────────────────────────────────────────────────────────────

const TOOLS = [
  { href: "/projects/new", label: "Garden Planner" },
  { href: "/tile-plan",    label: "Tile Planner" },
];

// ─── Cabinet button ───────────────────────────────────────────────────────────

function CabinetLink({ totalUnread }: { totalUnread: number }) {
  return (
    <Link
      href="/cabinet"
      className="relative inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-3.5 py-1.5 text-eyebrow text-ink transition hover:border-forest hover:bg-mist hover:text-forest"
    >
      <CabinetIcon />
      Cabinet
      {totalUnread > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-paper leading-none">
          {totalUnread > 99 ? "99+" : totalUnread}
        </span>
      )}
    </Link>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SiteHeader({ fixed = true }: { fixed?: boolean }) {
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const role = useAuthStore((s) => s.role);
  const isLoggedIn = hasHydrated && token !== null;
  const isContractor = isLoggedIn && role === "contractor";
  const totalUnread = useChatStore(selectTotalUnread);
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  return (
    <header
      className={`${fixed ? "fixed top-0 w-full" : "sticky top-0"} z-40 border-b border-line/60 bg-paper/95 backdrop-blur-md`}
    >
      <div className="container flex h-[68px] items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="inline-flex shrink-0 items-center text-forest">
          <BloomyLogo className="h-auto w-[148px] sm:w-[160px]" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 sm:flex">
          <Dropdown label="Tools" items={TOOLS} />

          {/* "Find contractors" — shown to non-contractors */}
          {!isContractor && (
            <Link
              href="/contractors"
              className="text-hint font-medium text-muted transition hover:text-ink"
            >
              Find contractors
            </Link>
          )}

          <span className="h-4 w-px bg-line" />

          {isLoggedIn ? (
            <CabinetLink totalUnread={totalUnread} />
          ) : (
            <>
              <Link href="/login" className="text-hint font-medium text-muted transition hover:text-ink">
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center rounded-full bg-forest px-4 py-1.5 text-eyebrow text-paper transition hover:bg-moss"
              >
                Get started
              </Link>
            </>
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
          <p className="mb-1 text-eyebrow text-muted/50">Tools</p>
          {TOOLS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-2 pl-2 text-eyebrow text-muted transition hover:text-ink"
              onClick={close}
            >
              {item.label}
            </Link>
          ))}

          {!isContractor && (
            <>
              <div className="my-2 h-px bg-line" />
              <Link
                href="/contractors"
                className="py-2 pl-2 text-eyebrow text-muted transition hover:text-ink"
                onClick={close}
              >
                Find contractors
              </Link>
            </>
          )}

          <div className="my-2 h-px bg-line" />

          {isLoggedIn ? (
            <Link
              href="/cabinet"
              className="relative inline-flex w-fit items-center gap-1.5 rounded-full border border-line bg-canvas px-3.5 py-1.5 text-eyebrow text-ink"
              onClick={close}
            >
              <CabinetIcon />
              Cabinet
              {totalUnread > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-paper leading-none">
                  {totalUnread > 99 ? "99+" : totalUnread}
                </span>
              )}
            </Link>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                className="py-2 pl-2 text-eyebrow text-muted transition hover:text-ink"
                onClick={close}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex w-fit items-center rounded-full bg-forest px-4 py-1.5 text-eyebrow text-paper"
                onClick={close}
              >
                Get started →
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
