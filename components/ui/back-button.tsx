"use client";

import { useRouter } from "next/navigation";

export function BackButton({ href, label = "Back" }: { href: string; label?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className="mb-6 flex items-center gap-1.5 text-hint text-muted transition hover:text-ink"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M9 2L4 7L9 12" />
      </svg>
      {label}
    </button>
  );
}
