import type { SelectHTMLAttributes, ReactNode } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  children: ReactNode;
};

export function Select({ className = "", children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border border-line bg-canvas px-3 py-2 text-body text-ink focus:border-forest/40 focus:outline-none ${className}`}
    >
      {children}
    </select>
  );
}
