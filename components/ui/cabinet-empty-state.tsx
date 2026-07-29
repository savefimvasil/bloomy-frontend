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
      <h3 className="text-display-lg text-ink">{title}</h3>
      <p className="max-w-sm text-body text-muted">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
