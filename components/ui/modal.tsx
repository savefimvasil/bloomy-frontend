"use client";

import { useEffect, type ReactNode } from "react";

const MAX_WIDTH = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "5xl": "max-w-5xl",
} as const;

type ModalProps = {
  open: boolean;
  onClose: () => void;
  maxWidth?: keyof typeof MAX_WIDTH;
  children: ReactNode;
};

export function Modal({ open, onClose, maxWidth = "md", children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${MAX_WIDTH[maxWidth]} rounded-2xl border border-line bg-paper shadow-xl`}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-muted transition hover:bg-mist hover:text-ink"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M2 2l10 10M12 2L2 12" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}
