type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function Input({ label, hint, className = "", ...props }: InputProps) {
  return (
    <label className="space-y-2">
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-forest/72">
        {label}
      </span>
      <input
        {...props}
        className={`w-full bg-paper px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:bg-white focus:outline focus:outline-2 focus:outline-leaf/25 ${className}`.trim()}
      />
      {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}
