"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { clearAuth, useAuthEmail, useAuthRole } from "@/lib/auth";

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

function EstimatesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="12" height="12" rx="2" />
      <line x1="5" y1="5.5" x2="11" y2="5.5" />
      <line x1="5" y1="8" x2="9" y2="8" />
      <line x1="5" y1="10.5" x2="10" y2="10.5" />
    </svg>
  );
}

function JobsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="5" width="12" height="9" rx="1.5" />
      <path d="M5 5V4C5 2.9 5.9 2 7 2H9C10.1 2 11 2.9 11 4V5" />
      <line x1="8" y1="8" x2="8" y2="11" />
      <line x1="6.5" y1="9.5" x2="9.5" y2="9.5" />
    </svg>
  );
}

function BrowseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="7" cy="7" r="4.5" />
      <path d="M12.5 12.5L10.5 10.5" />
    </svg>
  );
}

function QuotesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 2H14V11H9L6 14V11H2V2Z" />
      <line x1="5" y1="5.5" x2="11" y2="5.5" />
      <line x1="5" y1="8" x2="9" y2="8" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <circle cx="8" cy="5.5" r="2.5" />
      <path d="M2 13.5C2 11.3 4.7 9.5 8 9.5s6 1.8 6 4" />
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

const HOMEOWNER_NAV = [
  { href: "/cabinet/projects",        label: "Projects",         Icon: ProjectsIcon,  soon: false },
  { href: "/cabinet/tile-plans",      label: "Tile Plans",       Icon: TilePlansIcon, soon: false },
  { href: "/cabinet/estimates",       label: "Estimates",        Icon: EstimatesIcon, soon: false },
  { href: "/cabinet/quote-requests",  label: "Quote Requests",   Icon: JobsIcon,      soon: false },
];

const CONTRACTOR_NAV = [
  { href: "/cabinet/nearby-requests",     label: "Requests Near Me", Icon: BrowseIcon,   soon: false },
  { href: "/cabinet/my-proposals",        label: "My Proposals",     Icon: QuotesIcon,   soon: false },
  { href: "/cabinet/contractor-profile",  label: "My Profile",       Icon: ProfileIcon,  soon: false },
];

// ─── Layout ─────────────────────────────────────────────────────────────────

export default function CabinetLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const email = useAuthEmail() ?? "";
  const role = useAuthRole();

  const nav = role === "contractor" ? CONTRACTOR_NAV : HOMEOWNER_NAV;

  function handleLogout() {
    clearAuth();
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
          {role && (
            <span className="mt-1 inline-block rounded bg-forest/8 px-2 py-0.5 text-hint text-forest capitalize">
              {role}
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav className="mt-2 flex flex-col gap-0.5 px-3">
          {nav.map(({ href, label, Icon, soon }) => {
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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="mt-1 w-full justify-start gap-3 text-body text-muted hover:bg-danger/5 hover:text-danger"
          >
            <LogoutIcon />
            Log out
          </Button>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div className="flex w-full min-w-0 flex-col">

        {/* Mobile top tab bar */}
        <div className="flex items-center gap-1 border-b border-line bg-paper px-4 py-2 md:hidden">
          {nav.map(({ href, label, soon }) => {
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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="ml-auto gap-1.5 text-hint text-muted hover:text-danger"
          >
            <LogoutIcon />
            Log out
          </Button>
        </div>

        <div className="p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}
