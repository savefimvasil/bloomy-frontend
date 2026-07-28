type InlineInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function InlineInput({ className = "", ...props }: InlineInputProps) {
  return (
    <input
      {...props}
      className={`rounded-lg border border-line bg-canvas px-2 py-1 text-body text-ink focus:border-forest/40 focus:outline-none ${className}`}
    />
  );
}
