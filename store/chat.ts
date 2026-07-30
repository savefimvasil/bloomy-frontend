"use client";

import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { apiFetch } from "@/lib/api";
import { getAuthToken } from "@/store/auth";
import type { ChatMessage, ChatRoomSummary } from "@/types/models";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3000";

// Module-level socket singleton — lives outside Zustand to avoid serialization.
let _socket: Socket | null = null;

interface ChatState {
  // Room list
  rooms: ChatRoomSummary[];
  roomsLoaded: boolean;
  roomsLoading: boolean;

  // Messages per room — keyed by roomId
  messages: Record<string, ChatMessage[]>;
  messagesLoaded: Record<string, boolean>;
  messagesLoading: Record<string, boolean>;

  // Socket / connection
  connected: boolean;

  // Which room the user is actively viewing (suppresses unread for that room)
  activeRoomId: string | null;

  // Unread counts per roomId
  unread: Record<string, number>;

  // Typing indicators: roomId → set of user IDs currently typing
  typing: Record<string, Set<string>>;

  // ── Socket lifecycle ─────────────────────────────────────────────────────

  connect: () => void;
  disconnect: () => void;

  // ── Data fetching ────────────────────────────────────────────────────────

  fetchRooms: () => Promise<void>;
  loadMessages: (roomId: string) => Promise<void>;

  // ── In-session actions ───────────────────────────────────────────────────

  setActiveRoom: (roomId: string | null) => void;
  joinRoom: (roomId: string) => void;
  sendMessage: (roomId: string, content: string) => void;
  markRead: (roomId: string) => void;
  emitTyping: (roomId: string, isTyping: boolean) => void;

  // Creates or finds the room for a given jobId (and optionally a specific contractor), returns roomId
  openOrCreateRoom: (jobId: string, contractorId?: string) => Promise<string>;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  rooms: [],
  roomsLoaded: false,
  roomsLoading: false,
  messages: {},
  messagesLoaded: {},
  messagesLoading: {},
  connected: false,
  activeRoomId: null,
  unread: {},
  typing: {},

  // ── Socket lifecycle ───────────────────────────────────────────────────────

  connect: () => {
    if (_socket?.connected) return;
    const token = getAuthToken();
    if (!token) return;

    _socket = io(`${SOCKET_URL}/chat`, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    _socket.on("connect", () => set({ connected: true }));

    _socket.on("disconnect", () => set({ connected: false }));

    _socket.on("user_typing", ({ roomId, userId: typingId, isTyping }: { roomId: string; userId: string; isTyping: boolean }) => {
      set((s) => {
        const prev = new Set(s.typing[roomId] ?? []);
        if (isTyping) prev.add(typingId); else prev.delete(typingId);
        return { typing: { ...s.typing, [roomId]: prev } };
      });
    });

    _socket.on("new_message", (msg: ChatMessage) => {
      set((s) => {
        const prev = s.messagesLoaded[msg.roomId]
          ? (s.messages[msg.roomId] ?? [])
          : null;
        const alreadyHave = prev?.some((m) => m.id === msg.id) ?? false;
        const isActive = msg.roomId === s.activeRoomId;

        return {
          ...(prev && !alreadyHave
            ? { messages: { ...s.messages, [msg.roomId]: [...prev, msg] } }
            : {}),
          ...(!isActive
            ? { unread: { ...s.unread, [msg.roomId]: (s.unread[msg.roomId] ?? 0) + 1 } }
            : {}),
          rooms: s.rooms.map((r) =>
            r.id === msg.roomId ? { ...r, lastMessageAt: msg.createdAt } : r,
          ),
        };
      });
    });
  },

  disconnect: () => {
    _socket?.disconnect();
    _socket = null;
    set({ connected: false });
  },

  // ── Data fetching ──────────────────────────────────────────────────────────

  fetchRooms: async () => {
    if (get().roomsLoading) return;
    set({ roomsLoading: true });
    try {
      const res = await apiFetch("/chat/rooms");
      if (!res.ok) throw new Error("Failed to load rooms");
      const rooms = (await res.json()) as ChatRoomSummary[];
      const unreadFromServer = Object.fromEntries(
        rooms.map((r) => [r.id, r.unreadCount]),
      );
      set((s) => ({
        rooms,
        roomsLoaded: true,
        unread: { ...unreadFromServer, ...s.unread },
      }));
    } finally {
      set({ roomsLoading: false });
    }
  },

  loadMessages: async (roomId: string) => {
    if (get().messagesLoaded[roomId] || get().messagesLoading[roomId]) return;
    set((s) => ({
      messagesLoading: { ...s.messagesLoading, [roomId]: true },
    }));
    try {
      const res = await apiFetch(`/chat/rooms/${roomId}/messages`);
      if (!res.ok) throw new Error("Failed to load messages");
      const msgs = (await res.json()) as ChatMessage[];
      set((s) => ({
        messages: { ...s.messages, [roomId]: msgs },
        messagesLoaded: { ...s.messagesLoaded, [roomId]: true },
      }));
    } finally {
      set((s) => ({
        messagesLoading: { ...s.messagesLoading, [roomId]: false },
      }));
    }
  },

  // ── In-session actions ─────────────────────────────────────────────────────

  setActiveRoom: (roomId) => set({ activeRoomId: roomId }),

  joinRoom: (roomId) => {
    _socket?.emit("join_room", roomId);
  },

  sendMessage: (roomId, content) => {
    if (!_socket?.connected || !content.trim()) return;
    _socket.emit("send_message", { roomId, content: content.trim() });
  },

  markRead: (roomId) => {
    set((s) => ({ unread: { ...s.unread, [roomId]: 0 } }));
  },

  emitTyping: (roomId, isTyping) => {
    _socket?.emit("typing", { roomId, isTyping });
  },

  openOrCreateRoom: async (jobId, contractorId?) => {
    const res = await apiFetch("/chat/rooms", {
      method: "POST",
      body: contractorId ? { jobId, contractorId } : { jobId },
    });
    if (!res.ok) throw new Error("Failed to open chat");
    const room = (await res.json()) as { id: string };
    // Invalidate so the room list refreshes next time it's viewed
    set({ roomsLoaded: false });
    return room.id;
  },
}));

// Selector helpers
export const selectTotalUnread = (s: ChatState) =>
  Object.values(s.unread).reduce((sum, n) => sum + n, 0);
