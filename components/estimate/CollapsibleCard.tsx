"use client";

import { useState, type ReactNode } from "react";
import { CardButton } from "@/components/ui/card-button";

interface CollapsibleCardProps {
  left: ReactNode;
  amount: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round"
      className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="M2 5l5 5 5-5" />
    </svg>
  );
}

export function CollapsibleCard({ left, amount, children, defaultOpen = true }: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper">
      <CardButton
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-2.5">{left}</div>
        <div className="flex items-center gap-4">
          <span className="text-body font-semibold text-ink">{amount}</span>
          <Chevron open={open} />
        </div>
      </CardButton>

      {open && (
        <div className="border-t border-line px-5 pb-4 pt-2">
          {children}
        </div>
      )}
    </div>
  );
}
