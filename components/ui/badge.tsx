import type { ReactNode } from "react";

const COLORS = {
  green: {
    pill: "bg-leaf/15 text-leaf",
    dot: "bg-leaf",
  },
  sage: {
    pill: "bg-sage/20 text-sage",
    dot: "bg-sage",
  },
  muted: {
    pill: "bg-muted/10 text-muted",
    dot: "bg-muted",
  },
  danger: {
    pill: "bg-danger/10 text-danger",
    dot: "bg-danger",
  },
} as const;

type BadgeProps = {
  children: ReactNode;
  color?: keyof typeof COLORS;
  dot?: boolean;
};

export function Badge({ children, color = "muted", dot = false }: BadgeProps) {
  const c = COLORS[color];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 ${c.pill}`}>
      {dot && <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${c.dot}`} />}
      <span className="text-eyebrow">{children}</span>
    </span>
  );
}
