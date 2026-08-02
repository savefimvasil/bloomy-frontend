"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BloomyLogo } from "@/components/ui/bloomy-logo";
import { Dropdown } from "@/components/ui/dropdown";
import { IconButton } from "@/components/ui/icon-button";
import { CabinetIcon, BellIcon } from "@/components/ui/icons";
import { apiFetch } from "@/lib/api";
import { API } from "@/lib/endpoints";
import { useAuthStore } from "@/store/auth";
import { useChatStore, selectTotalUnread } from "@/store/chat";
import { useNotificationsStore, type AppNotification } from "@/store/notifications";

// ─── Nav config ───────────────────────────────────────────────────────────────

const TOOLS = [
  { href: "/projects/new", label: "Garden Planner" },
  { href: "/tile-plan",    label: "Tile Planner" },
];

// ─── Notification dropdown ────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function NotificationItem({ n, onRead }: { n: AppNotification; onRead: (id: string) => void }) {
  const inner = (
    <div
      className={`flex items-start gap-3 rounded-lg px-3 py-2.5 transition hover:bg-mist ${!n.read ? "bg-forest/5" : ""}`}
    >
      {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-forest" />}
      {n.read && <span className="mt-1.5 h-2 w-2 shrink-0" />}
      <div className="min-w-0 flex-1">
        <p className={`text-hint leading-snug ${!n.read ? "font-semibold text-ink" : "text-ink"}`}>{n.title}</p>
        <p className="mt-0.5 line-clamp-2 text-[11px] text-muted">{n.body}</p>
        <p className="mt-0.5 text-[11px] text-muted/60">{timeAgo(n.createdAt)}</p>
      </div>
    </div>
  );

  if (n.link) {
    return (
      <Link href={n.link} onClick={() => onRead(n.id)} className="block">
        {inner}
      </Link>
    );
  }
  return <button onClick={() => onRead(n.id)} className="block w-full text-left">{inner}</button>;
}

function NotificationBell({ token }: { token: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { unreadCount, notifications, loading, setUnreadCount, setNotifications, markOneRead, markAllRead, setLoading } =
    useNotificationsStore();

  // Poll unread count every 30 seconds
  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const res = await apiFetch(API.notifications.unreadCount);
        if (res.ok && active) {
          const data = await res.json() as { count: number };
          setUnreadCount(data.count);
        }
      } catch { /* network error — silently ignore */ }
    };
    void poll();
    const interval = setInterval(poll, 30_000);
    return () => { active = false; clearInterval(interval); };
  }, [token, setUnreadCount]);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    apiFetch(`${API.notifications.list}?page=1&limit=20`)
      .then((r) => r.ok ? r.json() : { data: [], total: 0 })
      .then(({ data, total }: { data: AppNotification[]; total: number }) => setNotifications(data, total))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, setNotifications, setLoading]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleRead = async (id: string) => {
    markOneRead(id);
    await apiFetch(API.notifications.markRead(id), { method: "POST" }).catch(() => {});
  };

  const handleReadAll = async () => {
    markAllRead();
    setOpen(false);
    await apiFetch(API.notifications.markAllRead, { method: "POST" }).catch(() => {});
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line bg-canvas text-muted transition hover:border-forest hover:bg-mist hover:text-forest"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span data-testid="notification-badge" className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-paper leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-line bg-paper shadow-soft">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line">
            <span className="text-hint font-semibold text-ink">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleReadAll} className="text-[11px] text-forest hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto p-1">
            {loading && (
              <p className="px-4 py-6 text-center text-hint text-muted">Loading…</p>
            )}
            {!loading && notifications.length === 0 && (
              <p className="px-4 py-6 text-center text-hint text-muted">No notifications yet</p>
            )}
            {!loading && notifications.map((n) => (
              <NotificationItem key={n.id} n={n} onRead={handleRead} />
            ))}
          </div>
          <div className="border-t border-line px-4 py-2.5">
            <Link
              href="/cabinet/notifications"
              onClick={() => setOpen(false)}
              className="text-[12px] font-medium text-forest hover:underline"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

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
            <div className="flex items-center gap-2">
              <NotificationBell token={token!} />
              <CabinetLink totalUnread={totalUnread} />
            </div>
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
