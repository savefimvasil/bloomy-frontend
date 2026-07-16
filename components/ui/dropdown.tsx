"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export type DropdownItem = {
  label: string;
  href: string;
};

type DropdownProps = {
  label: string;
  items: DropdownItem[];
};

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
    >
      <path d="M2 3.5 L5 6.5 L8 3.5" />
    </svg>
  );
}

export function Dropdown({ label, items }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-hint font-medium text-muted transition hover:text-ink"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown open={open} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-line bg-paper py-1 shadow-soft">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2.5 text-hint font-medium text-muted transition hover:bg-mist hover:text-ink"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
