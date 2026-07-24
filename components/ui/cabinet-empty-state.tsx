import type { ReactNode } from "react";

interface CabinetEmptyStateProps {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  action?: ReactNode;
}

export function CabinetEmptyState({ eyebrow, title, description, action }: CabinetEmptyStateProps) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-eyebrow text-muted">{eyebrow}</p>
      <h2 className="text-display-xl text-ink">{title}</h2>
      <p className="max-w-sm text-body text-muted">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
