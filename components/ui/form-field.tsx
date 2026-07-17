import type { ReactNode } from "react";

type FormFieldProps = {
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
};

export function FormField({ label, error, hint, className = "", children }: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <span className="text-hint text-muted">{label}</span>}
      {children}
      {error && <p className="text-hint text-danger">{error}</p>}
      {hint && <p className="text-hint text-muted/70">{hint}</p>}
    </div>
  );
}
