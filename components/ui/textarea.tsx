type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function Textarea({ label, hint, error, className = "", ...props }: TextareaProps) {
  return (
    <label className={`w-full ${className}`}>
      <span className="mt-2 block text-eyebrow text-forest/70">{label}</span>
      <textarea
        {...props}
        aria-invalid={!!error}
        className={[
          "mt-2 block w-full resize-none bg-paper px-4 py-3 text-body text-ink outline-none placeholder:text-muted/70 transition focus:bg-white focus:outline-2",
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
