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
  loading: boolean;
  setUnreadCount: (n: number) => void;
  setNotifications: (items: AppNotification[]) => void;
  markOneRead: (id: string) => void;
  markAllRead: () => void;
  setLoading: (v: boolean) => void;
  connect: (token: string) => void;
  disconnect: () => void;
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

  connect: (token: string) => {
    if (_socket?.connected) return;
    _socket = io(`${SOCKET_URL}/notifications`, {
      auth: { token },
      transports: ["websocket", "polling"],
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
