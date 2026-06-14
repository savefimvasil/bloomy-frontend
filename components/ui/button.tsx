import Link from "next/link";
import type { ReactNode } from "react";

export type ButtonVariant = "default" | "secondary" | "light" | "outline" | "ghost" | "danger";
export type ButtonSize = "default" | "sm";

type SharedProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type ButtonProps = SharedProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };

type ButtonLinkProps = SharedProps & { href: string };

function getVariantClasses(variant: ButtonVariant) {
  switch (variant) {
    case "secondary":
      return "bg-paper border border-line text-ink hover:border-muted";
    case "light":
      return "bg-paper text-forest hover:bg-paper/90";
    case "outline":
      return "border border-paper/40 text-paper bg-transparent hover:border-paper/70";
    case "ghost":
      return "bg-transparent text-muted hover:text-ink";
    case "danger":
      return "border border-line/60 bg-transparent text-danger/70 hover:border-danger hover:text-danger";
    default:
      return "bg-forest text-paper hover:bg-moss";
  }
}

function getSizeClasses(size: ButtonSize) {
  switch (size) {
    case "sm":
      return "rounded-lg px-4 py-2 text-hint";
    default:
      return "rounded-xl px-7 py-3.5 text-sm";
  }
}

function getBaseClasses(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return [
    "inline-flex items-center justify-center gap-2 font-medium transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-50",
    getSizeClasses(size),
    getVariantClasses(variant),
    className ?? "",
  ]
    .join(" ")
    .trim();
}

export function Button(props: ButtonProps | ButtonLinkProps) {
  const variant = props.variant ?? "default";
  const size = props.size ?? "default";

  if ("href" in props && typeof props.href === "string") {
    return (
      <Link href={props.href} className={getBaseClasses(variant, size, props.className)}>
        {props.children}
      </Link>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children, className, variant: _v, size: _s, href: _h, ...buttonProps } = props as ButtonProps & { href?: undefined };

  return (
    <button {...buttonProps} className={getBaseClasses(variant, size, className)}>
      {children}
    </button>
  );
}
