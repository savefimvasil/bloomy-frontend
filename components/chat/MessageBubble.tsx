"use client";

import { relativeTime } from "@/lib/dateUtils";
import type { ChatMessage } from "@/types/models";

export function MessageBubble({
  msg,
  isMine,
}: {
  msg: ChatMessage;
  isMine: boolean;
}) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[70%] flex-col gap-1 ${isMine ? "items-end" : "items-start"}`}
      >
        {!isMine && (
          <p className="px-1 text-hint text-muted">{msg.senderName}</p>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 text-body leading-relaxed ${
            isMine
              ? "rounded-tr-sm bg-forest text-paper"
              : "rounded-tl-sm border border-line bg-paper text-ink"
          }`}
        >
          {msg.content}
        </div>
        <p className="px-1 text-hint text-muted">{relativeTime(msg.createdAt)}</p>
      </div>
    </div>
  );
}
