type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function Input({ label, hint, className = "", ...props }: InputProps) {
  return (
    <label className={`w-full ${className}`}>
      <span className="text-[12px] font-medium uppercase tracking-[0.18em] text-forest/72 mt-2">
        {label}
      </span>
      <input
        {...props}
        className="block min-h-12 mt-2 w-full bg-paper px-4 py-3 pr-12 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:bg-white focus:outline-2 focus:outline-leaf/25"
      />
      {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}
