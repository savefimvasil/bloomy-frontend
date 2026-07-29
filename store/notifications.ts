"use client";

import { create } from "zustand";

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

interface NotificationsState {
  unreadCount: number;
  notifications: AppNotification[];
  loading: boolean;
  setUnreadCount: (n: number) => void;
  setNotifications: (items: AppNotification[]) => void;
  markOneRead: (id: string) => void;
  markAllRead: () => void;
  setLoading: (v: boolean) => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  unreadCount: 0,
  notifications: [],
  loading: false,
  setUnreadCount: (n) => set({ unreadCount: n }),
  setNotifications: (items) => set({ notifications: items }),
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
}));
