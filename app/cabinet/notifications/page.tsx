"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CabinetEmptyState } from "@/components/ui/cabinet-empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { Spinner } from "@/components/ui/spinner";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useNotificationsStore, type AppNotification } from "@/store/notifications";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function NotificationRow({ n, onRead }: { n: AppNotification; onRead: (id: string) => void }) {
  const inner = (
    <div className={`flex items-start gap-4 rounded-xl border px-5 py-4 transition hover:border-forest/30 hover:bg-mist ${!n.read ? "border-forest/20 bg-forest/5" : "border-line bg-paper"}`}>
      <div className="mt-1.5 h-2.5 w-2.5 shrink-0">
        {!n.read && <span className="block h-2.5 w-2.5 rounded-full bg-forest" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-body leading-snug ${!n.read ? "font-semibold text-ink" : "text-ink"}`}>{n.title}</p>
        <p className="mt-0.5 text-hint text-muted">{n.body}</p>
        <p className="mt-1 text-eyebrow text-muted/60">{timeAgo(n.createdAt)}</p>
      </div>
    </div>
  );

  if (n.link) {
    return (
      <Link href={n.link} onClick={() => onRead(n.id)}>
        {inner}
      </Link>
    );
  }
  return (
    <button onClick={() => onRead(n.id)} className="block w-full text-left">
      {inner}
    </button>
  );
}

export default function NotificationsPage() {
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const { notifications, setNotifications, markOneRead, markAllRead, setUnreadCount } = useNotificationsStore();
  const [fetched, setFetched] = useState(false);
  const loading = !fetched;

  useEffect(() => {
    if (!hasHydrated || !token) return;
    let cancelled = false;
    apiFetch("/notifications")
      .then((r) => r.ok ? r.json() : [])
      .then((items: AppNotification[]) => { if (!cancelled) setNotifications(items); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setFetched(true); });
    return () => { cancelled = true; };
  }, [hasHydrated, token, setNotifications]);

  const handleRead = async (id: string) => {
    markOneRead(id);
    await apiFetch(`/notifications/${id}/read`, { method: "POST" }).catch(() => {});
  };

  const handleReadAll = async () => {
    markAllRead();
    setUnreadCount(0);
    await apiFetch("/notifications/read-all", { method: "POST" }).catch(() => {});
  };

  const unread = notifications.filter((n) => !n.read).length;

  if (!loading && notifications.length === 0) {
    return (
      <div className="max-w-2xl">
        <CabinetEmptyState
          eyebrow="All clear"
          title="No notifications"
          description="You'll see activity here when homeowners or contractors respond to your work."
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <>
          <PageHeading
            title="Notifications"
            count={notifications.length}
            unit={["notification", "notifications"]}
            action={
              unread > 0 ? (
                <button onClick={handleReadAll} className="text-hint font-medium text-forest hover:underline">
                  Mark all as read
                </button>
              ) : undefined
            }
          />
          <div className="flex flex-col gap-2">
            {notifications.map((n) => (
              <NotificationRow key={n.id} n={n} onRead={handleRead} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
