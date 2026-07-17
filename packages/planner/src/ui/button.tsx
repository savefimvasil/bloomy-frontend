import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "default" | "secondary" | "danger" | "ghost";

const VARIANT: Record<Variant, string> = {
  default:   "border-transparent bg-forest text-paper hover:bg-moss",
  secondary: "border-line bg-canvas text-ink hover:bg-mist",
  danger:    "border-danger/30 bg-danger/5 text-danger hover:bg-danger/10",
  ghost:     "border-transparent bg-transparent text-muted hover:text-ink",
};

type PlannerButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  fullWidth?: boolean;
  children: ReactNode;
};

export function PlannerButton({
  variant = "secondary",
  fullWidth = false,
  className = "",
  children,
  ...props
}: PlannerButtonProps) {
  return (
    <button
      {...props}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2",
        "text-body font-medium transition",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT[variant],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
