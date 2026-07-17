import type { ReactNode } from "react";

const DOT_COLOR = {
  green: "bg-leaf",
  sage: "bg-sage",
  muted: "bg-muted",
  danger: "bg-danger",
} as const;

type BadgeProps = {
  children: ReactNode;
  color?: keyof typeof DOT_COLOR;
  dot?: boolean;
};

export function Badge({ children, color = "muted", dot = false }: BadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {dot && <span className={`inline-block h-2 w-2 shrink-0 rotate-45 ${DOT_COLOR[color]}`} />}
      <span className="text-eyebrow text-muted">{children}</span>
    </span>
  );
}
