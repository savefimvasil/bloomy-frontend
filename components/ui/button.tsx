import Link from "next/link";
import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type SharedProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
};

type ButtonProps = SharedProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type ButtonLinkProps = SharedProps & {
  href: string;
};

function getVariantClasses(variant: ButtonVariant) {
  if (variant === "secondary") {
    return "border border-paper/70 bg-paper/92 !text-forest shadow-soft hover:border-paper hover:bg-paper hover:!text-forest";
  }

  if (variant === "ghost") {
    return "bg-transparent !text-forest hover:bg-paper/60 hover:!text-forest";
  }

  return "bg-gradient-to-r from-leaf to-moss !text-paper hover:from-moss hover:to-forest hover:!text-paper";
}

function getBaseClasses(variant: ButtonVariant, className?: string) {
  return [
    "inline-flex items-center justify-center px-6 py-3 text-sm font-medium transition",
    "disabled:cursor-not-allowed disabled:opacity-55",
    getVariantClasses(variant),
    className ?? "",
  ]
    .join(" ")
    .trim();
}

export function Button(props: ButtonProps | ButtonLinkProps) {
  const variant = props.variant ?? "primary";

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
