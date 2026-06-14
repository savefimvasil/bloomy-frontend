"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

// ─── Icons ──────────────────────────────────────────────────────────────────

function TilePlansIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <rect x="1" y="1" width="6" height="6" rx="1.5" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" />
    </svg>
  );
}

function ProjectsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 4.5C2 3.67 2.67 3 3.5 3H6L7.5 4.5H12.5C13.33 4.5 14 5.17 14 6V11.5C14 12.33 13.33 13 12.5 13H3.5C2.67 13 2 12.33 2 11.5V4.5Z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 2.5H11.5C12.33 2.5 13 3.17 13 4V11C13 11.83 12.33 12.5 11.5 12.5H9" />
      <polyline points="6,5 9,7.5 6,10" />
      <line x1="1.5" y1="7.5" x2="9" y2="7.5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
      <circle cx="6.5" cy="4.5" r="2.5" />
      <path d="M1.5 11.5C1.5 9.29 3.74 7.5 6.5 7.5s5 1.79 5 4" />
    </svg>
  );
}

// ─── Nav config ─────────────────────────────────────────────────────────────

const CABINET_NAV = [
  { href: "/cabinet/tile-plans", label: "Tile Plans", Icon: TilePlansIcon, soon: false },
  { href: "/cabinet/projects",   label: "Projects",   Icon: ProjectsIcon,  soon: true  },
];

// ─── Layout ─────────────────────────────────────────────────────────────────

export default function CabinetLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email] = useState(() =>
    typeof window !== "undefined" ? (localStorage.getItem("bloomy_user_email") ?? "") : ""
  );

  function handleLogout() {
    localStorage.removeItem("bloomy_access_token");
    localStorage.removeItem("bloomy_user_email");
    window.dispatchEvent(new Event("bloomy-auth-changed"));
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-full bg-canvas">

      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-paper md:flex">

        {/* Section label */}
        <div className="px-6 pb-2 pt-8">
          <p className="text-eyebrow text-muted">Cabinet</p>
        </div>

        {/* Nav items */}
        <nav className="mt-2 flex flex-col gap-0.5 px-3">
          {CABINET_NAV.map(({ href, label, Icon, soon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-body transition ${
                  active
                    ? "bg-forest/8 font-medium text-forest"
                    : "text-muted hover:bg-mist/50 hover:text-ink"
                }`}
              >
                <span className={active ? "text-forest" : "text-sage"}>
                  <Icon />
                </span>
                <span className="flex-1">{label}</span>
                {soon && (
                  <span className="rounded bg-mist px-1.5 py-0.5 text-hint text-muted">
                    soon
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: user + logout */}
        <div className="mt-auto border-t border-line px-3 py-4">
          {email && (
            <div className="flex items-center gap-2 px-3 py-1.5">
              <span className="text-sage">
                <UserIcon />
              </span>
              <span className="truncate text-hint text-muted">{email}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-body text-muted transition hover:bg-danger/5 hover:text-danger"
          >
            <LogoutIcon />
            Log out
          </button>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div className="flex w-full min-w-0 flex-col">

        {/* Mobile top tab bar */}
        <div className="flex items-center gap-1 border-b border-line bg-paper px-4 py-2 md:hidden">
          {CABINET_NAV.map(({ href, label, soon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-body transition ${
                  active ? "bg-forest text-paper" : "text-muted hover:text-ink"
                }`}
              >
                {label}
                {soon && (
                  <span className="text-hint opacity-70">·</span>
                )}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-hint text-muted transition hover:text-danger"
          >
            <LogoutIcon />
            Log out
          </button>
        </div>

        <div className="p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}
