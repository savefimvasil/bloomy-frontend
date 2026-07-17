"use client";

import { Button } from "./button";
import { Modal } from "./modal";

type ConfirmDialogProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
};

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Delete",
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} maxWidth="sm">
      <div className="p-7">
        <h2 className="pr-8 text-xl font-semibold text-ink">{title}</h2>
        <p className="mt-2 text-body text-muted">{message}</p>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} className="flex-1 border-danger text-danger hover:bg-danger/8">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
