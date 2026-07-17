type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function Input({ label, hint, className = "", ...props }: InputProps) {
  return (
    <label className={`w-full ${className}`}>
      <span className="mt-2 block text-eyebrow text-forest/70">
        {label}
      </span>
      <input
        {...props}
        className="mt-2 block min-h-12 w-full bg-paper px-4 py-3 pr-12 text-body text-ink outline-none placeholder:text-muted/70 transition focus:bg-white focus:outline-2 focus:outline-leaf/25"
      />
      {hint && <span className="block text-hint text-muted">{hint}</span>}
    </label>
  );
}
