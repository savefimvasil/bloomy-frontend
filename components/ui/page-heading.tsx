import type { ReactNode } from "react";

type PageHeadingProps = {
  title: ReactNode;
  count?: number;
  unit?: [string, string]; // [singular, plural]
  action?: ReactNode;
};

export function PageHeading({ title, count, unit, action }: PageHeadingProps) {
  return (
    <div className="flex items-end justify-between pb-4">
      <div className="flex items-end gap-6">
        <h2 className="text-display-lg text-ink">{title}</h2>
        {count !== undefined && unit && (
          <p className="mb-1 text-eyebrow text-muted">
            {count} {count === 1 ? unit[0] : unit[1]}
          </p>
        )}
      </div>
      {action && <div className="mb-1">{action}</div>}
    </div>
  );
}
