"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export type ExportKind = "png" | "pdf" | "json";

interface Props {
  kind: ExportKind | null;
  onDownload: () => void;
  onClose: () => void;
}

const KIND_LABELS: Record<ExportKind, string> = {
  png: "PNG image",
  pdf: "PDF document",
  json: "JSON plan file",
};

export function ExportModal({ kind, onDownload, onClose }: Props) {
  return (
    <Modal open={!!kind} onClose={onClose}>
      <div className="p-7 pb-0 pr-14">
        <h2 className="text-xl font-semibold text-ink">Export your plan</h2>
        <p className="mt-1.5 text-sm text-muted">
          Downloading your <strong className="text-ink">{kind ? KIND_LABELS[kind] : ""}</strong>.
          Save it once or create a free account to store and manage all your plans.
        </p>
      </div>

      <div className="mt-6 grid gap-3 p-7 pt-0 sm:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-xl border border-leaf/30 bg-forest p-5 text-paper">
          <div>
            <p className="font-semibold">Save to my account</p>
            <p className="mt-1.5 text-xs leading-5 text-paper/70">
              Create a free Bloomy account to save, name and revisit your plans any time.
              All exports are stored securely — no payment ever required.
            </p>
          </div>
          <Button href="/register" variant="light" size="sm" className="mt-auto bg-lime text-forest hover:bg-lime/85">
            Create free account
          </Button>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-line bg-canvas p-5">
          <div>
            <p className="font-semibold text-ink">Download without saving</p>
            <p className="mt-1.5 text-xs leading-5 text-muted">
              Export once as a guest. Your plan won&apos;t be stored — download it now and keep the
              file yourself.
            </p>
          </div>
          <Button onClick={onDownload} variant="secondary" size="sm" className="mt-auto">
            Download now
          </Button>
        </div>
      </div>

      <p className="border-t border-line px-7 py-4 text-center text-xs text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-forest underline underline-offset-2 hover:text-leaf">
          Log in to save your plan
        </Link>
      </p>
    </Modal>
  );
}
