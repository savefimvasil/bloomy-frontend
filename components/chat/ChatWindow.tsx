"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageBubble } from "./MessageBubble";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useChatStore } from "@/store/chat";
import { useAuthStore } from "@/store/auth";
import type { ChatMessage } from "@/types/models";

// Stable reference so the selector never creates a new array each render
const EMPTY_MESSAGES: ChatMessage[] = [];

function parseUserIdFromToken(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );
    return (decoded as { sub?: string }).sub ?? null;
  } catch {
    return null;
  }
}

export function ChatWindow({ roomId }: { roomId: string }) {
  const messages = useChatStore((s) => s.messages[roomId] ?? EMPTY_MESSAGES);
  const messagesLoaded = useChatStore((s) => s.messagesLoaded[roomId] ?? false);
  const messagesLoading = useChatStore(
    (s) => s.messagesLoading[roomId] ?? false,
  );
  const connected = useChatStore((s) => s.connected);
  const loadMessages = useChatStore((s) => s.loadMessages);
  const joinRoom = useChatStore((s) => s.joinRoom);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const setActiveRoom = useChatStore((s) => s.setActiveRoom);
  const markRead = useChatStore((s) => s.markRead);

  const token = useAuthStore((s) => s.token);
  const userId = token ? parseUserIdFromToken(token) : null;

  const [input, setInput] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    void loadMessages(roomId);
    joinRoom(roomId);
    setActiveRoom(roomId);
    markRead(roomId);
    return () => setActiveRoom(null);
  }, [roomId, loadMessages, joinRoom, setActiveRoom, markRead]);

  // Scroll within the message container only — no page scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el || messages.length === 0) return;
    const isNewMessage = messages.length > prevCountRef.current && prevCountRef.current > 0;
    prevCountRef.current = messages.length;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: isNewMessage ? "smooth" : "instant",
    });
  }, [messages]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(roomId, trimmed);
    setInput("");
  }, [input, roomId, sendMessage]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (messagesLoading && !messagesLoaded) {
    return (
      <div className="flex justify-center py-12">
        <Spinner label="Loading messages…" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Connection indicator */}
      <div className="flex justify-end">
        <span
          className={`flex items-center gap-1.5 text-hint ${
            connected ? "text-forest" : "text-muted"
          }`}
        >
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              connected ? "bg-forest" : "bg-muted/40"
            }`}
          />
          {connected ? "Online" : "Connecting…"}
        </span>
      </div>

      {/* Message list */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto rounded-xl border border-line bg-canvas p-4"
        style={{ minHeight: "320px", maxHeight: "calc(100vh - 340px)" }}
      >
        {messages.length === 0 ? (
          <p className="py-8 text-center text-body text-muted">
            No messages yet. Say hello!
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isMine={userId === msg.senderId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          rows={2}
          className="flex-1 resize-none rounded-xl border border-line bg-paper px-4 py-3 text-body text-ink placeholder:text-muted focus:border-forest/40 focus:outline-none"
        />
        <Button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || !connected}
          className="self-end"
        >
          Send
        </Button>
      </div>
    </div>
  );
}
