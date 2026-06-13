"use client";

import { useEffect } from "react";
import Link from "next/link";

export type ExportKind = "png" | "pdf" | "json";

interface Props {
  kind: ExportKind | null; // null = closed
  onDownload: () => void;  // triggers the actual export without registration
  onClose: () => void;
}

const KIND_LABELS: Record<ExportKind, string> = {
  png: "PNG image",
  pdf: "PDF document",
  json: "JSON plan file",
};

export function ExportModal({ kind, onDownload, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    if (!kind) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [kind, onClose]);

  if (!kind) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Panel — stop propagation so clicking inside doesn't close */}
      <div
        className="relative mx-4 w-full max-w-lg rounded-2xl border border-line bg-paper shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-canvas hover:text-ink"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="p-7 pb-0">
          <h2 className="text-xl font-semibold text-ink">Export your plan</h2>
          <p className="mt-1.5 text-sm text-muted">
            Downloading your <strong className="text-ink">{KIND_LABELS[kind]}</strong>.
            Save it once or create a free account to store and manage all your plans.
          </p>
        </div>

        <div className="mt-6 grid gap-3 p-7 pt-0 sm:grid-cols-2">
          {/* Option A — register */}
          <div className="flex flex-col gap-4 rounded-xl border border-leaf/30 bg-forest p-5 text-paper">
            <div>
              <p className="font-semibold">Save to my account</p>
              <p className="mt-1.5 text-xs leading-5 text-paper/70">
                Create a free Bloomy account to save, name and revisit your plans any time.
                All exports are stored securely — no payment ever required.
              </p>
            </div>
            <Link
              href="/register"
              className="mt-auto inline-flex items-center justify-center rounded-lg bg-lime px-4 py-2.5 text-sm font-medium text-forest transition hover:bg-lime/85"
            >
              Create free account
            </Link>
          </div>

          {/* Option B — download once */}
          <div className="flex flex-col gap-4 rounded-xl border border-line bg-canvas p-5">
            <div>
              <p className="font-semibold text-ink">Download without saving</p>
              <p className="mt-1.5 text-xs leading-5 text-muted">
                Export once as a guest. Your plan won&apos;t be stored — download it now and keep the
                file yourself.
              </p>
            </div>
            <button
              onClick={onDownload}
              className="mt-auto inline-flex items-center justify-center rounded-lg border border-line bg-paper px-4 py-2.5 text-sm font-medium text-ink transition hover:border-leaf/50 hover:bg-canvas"
            >
              Download now
            </button>
          </div>
        </div>

        <p className="border-t border-line px-7 py-4 text-center text-xs text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-forest underline underline-offset-2 hover:text-leaf">
            Log in to save your plan
          </Link>
        </p>
      </div>
    </div>
  );
}
