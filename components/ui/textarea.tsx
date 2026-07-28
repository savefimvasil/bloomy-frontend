type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
};

export function Textarea({ label, hint, className = "", ...props }: TextareaProps) {
  return (
    <label className={`w-full ${className}`}>
      <span className="mt-2 block text-eyebrow text-forest/70">{label}</span>
      <textarea
        {...props}
        className="mt-2 block w-full resize-none bg-paper px-4 py-3 text-body text-ink outline-none placeholder:text-muted/70 transition focus:bg-white focus:outline-2 focus:outline-leaf/25"
      />
      {hint && <span className="block text-hint text-muted">{hint}</span>}
    </label>
  );
}
