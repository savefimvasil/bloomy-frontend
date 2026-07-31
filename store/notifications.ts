"use client";

import { create } from "zustand";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3000";

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

let _socket: Socket | null = null;

interface NotificationsState {
  unreadCount: number;
  notifications: AppNotification[];
  notificationsTotal: number;
  loading: boolean;
  setUnreadCount: (n: number) => void;
  setNotifications: (items: AppNotification[], total: number) => void;
  appendNotifications: (items: AppNotification[]) => void;
  markOneRead: (id: string) => void;
  markAllRead: () => void;
  setLoading: (v: boolean) => void;
  connect: (token: string) => void;
  disconnect: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  unreadCount: 0,
  notifications: [],
  notificationsTotal: 0,
  loading: false,

  setUnreadCount: (n) => set({ unreadCount: n }),
  setNotifications: (items, total) => set({ notifications: items, notificationsTotal: total }),
  appendNotifications: (items) =>
    set((s) => ({ notifications: [...s.notifications, ...items] })),

  markOneRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    })),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  setLoading: (v) => set({ loading: v }),

  connect: (token: string) => {
    if (_socket?.connected) return;
    // Fetch initial unread count via HTTP so badge shows immediately on page load
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";
    fetch(`${apiBase}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? (r.json() as Promise<{ count: number }>) : { count: 0 }))
      .then(({ count }: { count: number }) => set({ unreadCount: count }))
      .catch(() => {});
    _socket = io(`${SOCKET_URL}/notifications`, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    // Real-time: backend emits initial count on connect, increments for new ones
    _socket.on("unread_count", (count: number) => {
      set({ unreadCount: count });
    });
    _socket.on("notification", () => {
      set((s) => ({ unreadCount: s.unreadCount + 1 }));
    });
  },

  disconnect: () => {
    _socket?.disconnect();
    _socket = null;
  },
}));
