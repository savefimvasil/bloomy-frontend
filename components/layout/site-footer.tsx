"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BloomyLogo } from "@/components/ui/bloomy-logo";

const FOR_HOMEOWNERS = [
  { href: "/projects/new",           label: "Plan your garden" },
  { href: "/tile-plan",              label: "Tile planner" },
  { href: "/contractors",            label: "Find a contractor" },
  { href: "/cabinet/quote-requests", label: "My quote requests" },
];

const FOR_CONTRACTORS = [
  { href: "/cabinet/direct-requests",    label: "Direct requests" },
  { href: "/cabinet/nearby-requests",    label: "Browse local jobs" },
  { href: "/register",                   label: "Join as a contractor" },
  { href: "/cabinet/my-proposals",       label: "My proposals" },
  { href: "/cabinet/my-reviews",         label: "My reviews" },
  { href: "/cabinet/contractor-profile", label: "My profile" },
];

const RESOURCES = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/contractors",   label: "Contractor directory" },
];

function FooterColumn({ heading, links }: { heading: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="mb-4 text-eyebrow text-muted/60">{heading}</p>
      <ul className="flex flex-col gap-2.5">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} className="text-hint text-muted transition hover:text-ink">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/tile-plan/edit") return null;

  return (
    <footer className="border-t border-line bg-canvas">
      <div className="container py-12 md:py-14">

        {/* Brand row */}
        <div className="mb-10 flex flex-col gap-2">
          <Link href="/" className="inline-flex text-forest">
            <BloomyLogo className="h-auto w-[140px]" />
          </Link>
          <p className="text-hint text-muted">
            Plan your garden, estimate materials, connect with local contractors.
          </p>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <FooterColumn heading="For homeowners" links={FOR_HOMEOWNERS} />
          <FooterColumn heading="For contractors" links={FOR_CONTRACTORS} />
          <FooterColumn heading="Resources" links={RESOURCES} />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-line">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-4">
          <p className="text-hint text-muted">© {new Date().getFullYear()} Bloomy Garden</p>
          <div className="flex flex-wrap items-center gap-4 text-hint text-muted">
            <Link href="/terms"   className="transition hover:text-ink">Terms</Link>
            <Link href="/privacy" className="transition hover:text-ink">Privacy</Link>
            <span className="h-3 w-px bg-line" />
            <Link href="/admin/heatmap" className="text-muted/50 transition hover:text-muted">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
