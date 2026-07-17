interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  "aria-label"?: string;
}

export function Checkbox({ checked, onChange, className, "aria-label": ariaLabel }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={[
        "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition",
        checked ? "border-forest bg-forest text-paper" : "border-line bg-canvas hover:border-forest/60",
        className ?? "",
      ].filter(Boolean).join(" ")}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M1 4l3 3 5-6" />
        </svg>
      )}
    </button>
  );
}
