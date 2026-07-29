type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Input({ label, hint, error, className = "", ...props }: InputProps) {
  return (
    <label className={`w-full ${className}`}>
      {label && (
        <span className="mt-2 block text-eyebrow text-forest/70">
          {label}
        </span>
      )}
      <input
        {...props}
        aria-invalid={!!error}
        className={[
          "mt-2 block min-h-12 w-full bg-paper px-4 py-3 pr-12 text-body text-ink outline-none placeholder:text-muted/70 transition focus:bg-white focus:outline-2",
          error
            ? "outline outline-1 outline-danger/50 focus:outline-danger/70"
            : "focus:outline-leaf/25",
        ].join(" ")}
      />
      {error && <span className="mt-1 block text-hint text-danger">{error}</span>}
      {!error && hint && <span className="block text-hint text-muted">{hint}</span>}
    </label>
  );
}
