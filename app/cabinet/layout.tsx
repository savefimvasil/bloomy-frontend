"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  DashboardIcon,
  TilePlansIcon,
  ProjectsIcon,
  EstimatesIcon,
  JobsIcon,
  BrowseIcon,
  QuotesIcon,
  ProfileIcon,
  ReviewsIcon,
  SavedIcon,
  BellNavIcon,
  LogoutIcon,
  UserIcon,
} from "@/components/ui/icons";
import { useAuthStore, clearAuth } from "@/store/auth";
import { useCabinetStore } from "@/store/cabinet";
import { useChatStore, selectTotalUnread } from "@/store/chat";
import { useNotificationsStore } from "@/store/notifications";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

// ─── Role display names ──────────────────────────────────────────────────────

const ROLE_LABEL: Record<string, string> = {
  homeowner: "Homeowner",
  contractor: "Contractor",
};

// ─── Nav config ─────────────────────────────────────────────────────────────

const HOMEOWNER_NAV = [
  { href: "/cabinet",                    label: "Dashboard",           Icon: DashboardIcon,  chatBadge: false, notifBadge: false, exact: true  },
  { href: "/cabinet/quote-requests",     label: "Quote Requests",      Icon: JobsIcon,       chatBadge: true,  notifBadge: false, exact: false },
  { href: "/cabinet/projects",           label: "Projects",            Icon: ProjectsIcon,   chatBadge: false, notifBadge: false, exact: false },
  { href: "/cabinet/tile-plans",         label: "Tile Plans",          Icon: TilePlansIcon,  chatBadge: false, notifBadge: false, exact: false },
  { href: "/cabinet/estimates",          label: "Estimates",           Icon: EstimatesIcon,  chatBadge: false, notifBadge: false, exact: false },
  { href: "/cabinet/saved-contractors",  label: "Saved Contractors",   Icon: SavedIcon,      chatBadge: false, notifBadge: false, exact: false },
  { href: "/cabinet/notifications",      label: "Notifications",       Icon: BellNavIcon,    chatBadge: false, notifBadge: true,  exact: false },
];

const CONTRACTOR_NAV = [
  { href: "/cabinet",                    label: "Dashboard",           Icon: DashboardIcon,  chatBadge: false, notifBadge: false, exact: true  },
  { href: "/cabinet/nearby-requests",    label: "Browse Jobs",         Icon: BrowseIcon,     chatBadge: false, notifBadge: false, exact: false },
  { href: "/cabinet/my-proposals",       label: "My Proposals",        Icon: QuotesIcon,     chatBadge: true,  notifBadge: false, exact: false },
  { href: "/cabinet/my-reviews",         label: "My Reviews",          Icon: ReviewsIcon,    chatBadge: false, notifBadge: false, exact: false },
  { href: "/cabinet/contractor-profile", label: "My Profile",          Icon: ProfileIcon,    chatBadge: false, notifBadge: false, exact: false },
  { href: "/cabinet/notifications",      label: "Notifications",       Icon: BellNavIcon,    chatBadge: false, notifBadge: true,  exact: false },
];

// ─── Layout ─────────────────────────────────────────────────────────────────

export default function CabinetLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const email = useAuthStore((s) => s.email) ?? "";
  const role = useAuthStore((s) => s.role);
  const totalUnread = useChatStore(selectTotalUnread);
  const connectChat = useChatStore((s) => s.connect);
  const fetchRooms = useChatStore((s) => s.fetchRooms);
  const notifUnread = useNotificationsStore((s) => s.unreadCount);
  const connectNotifications = useNotificationsStore((s) => s.connect);
  const disconnectNotifications = useNotificationsStore((s) => s.disconnect);

  useEffect(() => {
    if (hasHydrated && !token) {
      void router.replace("/login");
    }
  }, [hasHydrated, token, router]);

  useEffect(() => {
    if (hasHydrated && token) {
      connectChat();
      void fetchRooms();
      connectNotifications(token);
    }
    return () => { disconnectNotifications(); };
  }, [hasHydrated, token, connectChat, fetchRooms, connectNotifications, disconnectNotifications]);

  if (!hasHydrated || !token) return null;

  const nav = role === "contractor" ? CONTRACTOR_NAV : HOMEOWNER_NAV;

  function handleLogout() {
    clearAuth();
    useCabinetStore.getState().clearAll();
    useChatStore.getState().disconnect();
    disconnectNotifications();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex flex-1 overflow-hidden bg-canvas">

      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-paper md:flex">

        <div className="px-6 pb-2 pt-8">
          <p className="text-eyebrow text-muted">Cabinet</p>
          {role && (
            <span className="mt-1 inline-block rounded bg-forest/8 px-2 py-0.5 text-hint text-forest">
              {ROLE_LABEL[role] ?? role}
            </span>
          )}
        </div>

        <nav className="mt-2 flex flex-col gap-0.5 px-3">
          {nav.map(({ href, label, Icon, exact, chatBadge, notifBadge }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            const badge = chatBadge ? totalUnread : notifBadge ? notifUnread : 0;
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
                {badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-forest px-1.5 text-eyebrow font-semibold text-paper">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

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

        <SiteHeader fixed={false} />

        {/* Mobile top tab bar */}
        <div className="z-10 flex items-center gap-1 overflow-x-auto border-b border-line bg-paper px-4 py-2 md:hidden">
          {nav.map(({ href, label, Icon, exact, chatBadge, notifBadge }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            const badge = chatBadge ? totalUnread : notifBadge ? notifUnread : 0;
            return (
              <Link
                key={href}
                href={href}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-body transition ${
                  active ? "bg-forest text-paper" : "text-muted hover:text-ink"
                }`}
              >
                <Icon />
                {label}
                {badge > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-forest px-1 text-eyebrow font-bold text-paper leading-none">
                    {badge}
                  </span>
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

        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex-1 p-6 md:p-8">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
          <SiteFooter />
        </div>
      </div>
    </div>
  );
}
