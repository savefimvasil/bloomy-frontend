import Link from "next/link";
import type { ReactNode } from "react";

export type ButtonVariant = "default" | "secondary" | "light" | "outline" | "ghost";

type SharedProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
};

type ButtonProps = SharedProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };

type ButtonLinkProps = SharedProps & { href: string };

function getVariantClasses(variant: ButtonVariant) {
  switch (variant) {
    case "secondary":
      // Light bg: white fill + dark border
      return "bg-paper border border-line text-ink hover:border-muted";
    case "light":
      return "bg-paper text-forest hover:bg-paper/90";
    case "outline":
      // Dark bg: transparent + white border + white text
      return "border border-paper/40 text-paper bg-transparent hover:border-paper/70";
    case "ghost":
      return "bg-transparent text-muted hover:text-ink";
    default:
      // Solid forest green
      return "bg-forest text-paper hover:bg-moss";
  }
}

function getBaseClasses(variant: ButtonVariant, className?: string) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-medium transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-50",
    getVariantClasses(variant),
    className ?? "",
  ]
    .join(" ")
    .trim();
}

export function Button(props: ButtonProps | ButtonLinkProps) {
  const variant = props.variant ?? "default";

  if ("href" in props && typeof props.href === "string") {
    return (
      <Link href={props.href} className={getBaseClasses(variant, props.className)}>
        {props.children}
      </Link>
    );
  }

  const { children, className, variant: _variant, ...buttonProps } = props;

  return (
    <button {...buttonProps} className={getBaseClasses(variant, className)}>
      {children}
    </button>
  );
}
