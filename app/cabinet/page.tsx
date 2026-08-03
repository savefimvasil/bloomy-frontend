"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useNotificationsStore, type AppNotification } from "@/store/notifications";

// ─── Types ────────────────────────────────────────────────────────────────────

type QuickStat = { label: string; value: number; href: string };

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, href }: QuickStat) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-1 rounded-xl border border-line bg-paper px-5 py-4 transition hover:border-forest/40 hover:bg-mist"
    >
      <span className="text-display-lg font-bold text-ink">{value}</span>
      <span className="text-hint text-muted">{label}</span>
    </Link>
  );
}

// ─── Quick-action card ────────────────────────────────────────────────────────

function ActionCard({ title, description, href, cta }: { title: string; description: string; href: string; cta: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-2 rounded-xl border border-line bg-paper px-5 py-4 transition hover:border-forest/40 hover:bg-mist"
    >
      <p className="text-body font-semibold text-ink">{title}</p>
      <p className="text-hint text-muted">{description}</p>
      <span className="mt-1 text-hint font-medium text-forest">{cta} →</span>
    </Link>
  );
}

// ─── Notification preview ─────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function NotifPreview({ n }: { n: AppNotification }) {
  const inner = (
    <div className={`flex items-start gap-3 rounded-lg px-4 py-3 transition hover:bg-mist ${!n.read ? "bg-forest/5" : "bg-paper"}`}>
      {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-forest" />}
      {n.read && <span className="mt-1.5 h-2 w-2 shrink-0" />}
      <div className="min-w-0 flex-1">
        <p className={`text-hint leading-snug ${!n.read ? "font-semibold text-ink" : "text-ink"}`}>{n.title}</p>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-muted">{n.body}</p>
      </div>
      <span className="shrink-0 text-[11px] text-muted/60">{timeAgo(n.createdAt)}</span>
    </div>
  );
  if (n.link) return <Link href={n.link}>{inner}</Link>;
  return <div>{inner}</div>;
}

// ─── Homeowner dashboard ──────────────────────────────────────────────────────

function HomeownerDashboard() {
  const [stats, setStats] = useState<{ total: number; open: number; inProgress: number; pendingProposals: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch("/quote-requests/mine?page=1&limit=100")
      .then((r) => r.ok ? r.json() : { data: [], total: 0 })
      .then(({ data, total }: { data: { status: string; proposalCount?: number }[]; total: number }) => {
        if (cancelled) return;
        setStats({
          total,
          open: data.filter((j) => j.status === "open").length,
          inProgress: data.filter((j) => ["awarded", "in_progress"].includes(j.status)).length,
          pendingProposals: data.filter((j) => j.status === "open" && (j.proposalCount ?? 0) > 0).length,
        });
      })
      .catch(() => { if (!cancelled) setStats({ total: 0, open: 0, inProgress: 0, pendingProposals: 0 }); });
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      {/* Contextual alerts */}
      {stats !== null && stats.pendingProposals > 0 && (
        <Link
          href="/cabinet/quote-requests"
          className="flex items-center gap-3 rounded-xl border border-forest/30 bg-forest/5 px-4 py-3 transition hover:bg-forest/10"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest text-[12px] font-bold text-paper">
            {stats.pendingProposals}
          </span>
          <span className="text-hint font-medium text-ink">
            {stats.pendingProposals === 1
              ? "1 request has new contractor proposals to review"
              : `${stats.pendingProposals} requests have new contractor proposals to review`}
          </span>
          <span className="ml-auto text-hint text-forest">Review →</span>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats === null ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-line" />
          ))
        ) : (
          <>
            <StatCard label="Total requests" value={stats.total} href="/cabinet/quote-requests" />
            <StatCard label="Open" value={stats.open} href="/cabinet/quote-requests" />
            <StatCard label="In progress" value={stats.inProgress} href="/cabinet/quote-requests" />
          </>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <p className="mb-3 text-eyebrow text-muted">Quick actions</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <ActionCard
            title="Post a quote request"
            description="Describe your garden project and receive proposals from local contractors."
            href="/cabinet/quote-requests/new"
            cta="Get quotes"
          />
          <ActionCard
            title="Plan a garden project"
            description="Use the AI-powered planner to design your outdoor space."
            href="/projects/new"
            cta="Start planning"
          />
          <ActionCard
            title="Find contractors"
            description="Browse verified local contractors and send direct requests."
            href="/contractors"
            cta="Browse"
          />
          <ActionCard
            title="Tile planner"
            description="Plan and visualise your patio or path tile layout."
            href="/tile-plan"
            cta="Open planner"
          />
        </div>
      </div>
    </>
  );
}

// ─── Contractor dashboard ─────────────────────────────────────────────────────

function ContractorDashboard() {
  const [stats, setStats] = useState<{ proposals: number; active: number; direct: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiFetch("/quote-requests/my-proposals?page=1&limit=100").then((r) => r.ok ? r.json() : { data: [], total: 0 }),
      apiFetch("/quote-requests/direct-to-me?page=1&limit=100").then((r) => r.ok ? r.json() : { data: [], total: 0 }),
    ]).then(([pRes, dRes]: [{ data: { status: string }[]; total: number }, { data: unknown[]; total: number }]) => {
      if (cancelled) return;
      setStats({
        proposals: pRes.total,
        active: pRes.data.filter((p) => ["awarded", "in_progress"].includes(p.status)).length,
        direct: dRes.total,
      });
    }).catch(() => { if (!cancelled) setStats({ proposals: 0, active: 0, direct: 0 }); });
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      {/* Contextual alerts */}
      {stats !== null && stats.direct > 0 && (
        <Link
          href="/cabinet/direct-requests"
          className="flex items-center gap-3 rounded-xl border border-amber-400/40 bg-amber-50/70 px-4 py-3 transition hover:bg-amber-50"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[12px] font-bold text-paper">
            {stats.direct}
          </span>
          <span className="text-hint font-medium text-ink">
            {stats.direct === 1
              ? "1 homeowner sent you a direct request"
              : `${stats.direct} homeowners sent you direct requests`}
          </span>
          <span className="ml-auto text-hint text-amber-700">View →</span>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats === null ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-line" />
          ))
        ) : (
          <>
            <StatCard label="My proposals" value={stats.proposals} href="/cabinet/my-proposals" />
            <StatCard label="Active jobs" value={stats.active} href="/cabinet/my-proposals" />
            <StatCard label="Direct requests" value={stats.direct} href="/cabinet/direct-requests" />
          </>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <p className="mb-3 text-eyebrow text-muted">Quick actions</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <ActionCard
            title="Browse nearby jobs"
            description="See open quote requests from homeowners in your service area."
            href="/cabinet/nearby-requests"
            cta="Browse jobs"
          />
          <ActionCard
            title="Direct requests"
            description="Review jobs that homeowners have sent directly to you."
            href="/cabinet/direct-requests"
            cta="View requests"
          />
          <ActionCard
            title="My reviews"
            description="See your ratings and respond to homeowner reviews."
            href="/cabinet/my-reviews"
            cta="View reviews"
          />
          <ActionCard
            title="My profile"
            description="Keep your profile, photos, and verification documents up to date."
            href="/cabinet/contractor-profile"
            cta="Edit profile"
          />
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CabinetDashboard() {
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const email = useAuthStore((s) => s.email) ?? "";
  const role = useAuthStore((s) => s.role);
  const { notifications, setNotifications, unreadCount } = useNotificationsStore();
  const [notifsLoaded, setNotifsLoaded] = useState(false);

  useEffect(() => {
    if (!hasHydrated || !token) return;
    let cancelled = false;
    apiFetch("/notifications?page=1&limit=20")
      .then((r) => r.ok ? r.json() : { data: [], total: 0 })
      .then(({ data, total }: { data: AppNotification[]; total: number }) => {
        if (cancelled) return;
        setNotifications(data, total);
        setNotifsLoaded(true);
      })
      .catch(() => { if (!cancelled) setNotifsLoaded(true); });
    return () => { cancelled = true; };
  }, [hasHydrated, token, setNotifications]);

  if (!hasHydrated) return <Spinner />;

  const firstName = email.split("@")[0];
  const recentNotifs = notifications.slice(0, 5);

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      {/* Greeting */}
      <div>
        <h2 className="text-display-lg text-ink">Welcome back, {firstName}</h2>
        <p className="mt-1 text-hint text-muted capitalize">{role} account</p>
      </div>

      {/* Role dashboard */}
      {role === "contractor" ? <ContractorDashboard /> : <HomeownerDashboard />}

      {/* Recent notifications */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-eyebrow text-muted">
            Recent notifications
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-forest px-2 py-0.5 text-[10px] font-bold text-paper">{unreadCount} new</span>
            )}
          </p>
          <Link href="/cabinet/notifications" className="text-hint font-medium text-forest hover:underline">
            View all →
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-line bg-paper">
          {!notifsLoaded && (
            <div className="flex justify-center py-8"><Spinner /></div>
          )}
          {notifsLoaded && recentNotifs.length === 0 && (
            <p className="px-4 py-6 text-center text-hint text-muted">No notifications yet</p>
          )}
          {notifsLoaded && recentNotifs.map((n) => (
            <NotifPreview key={n.id} n={n} />
          ))}
        </div>
      </div>
    </div>
  );
}
