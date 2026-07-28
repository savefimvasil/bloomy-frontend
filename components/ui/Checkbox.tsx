interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  "aria-label"?: string;
}

export function Checkbox({ checked, onChange, className, "aria-label": ariaLabel }: CheckboxProps) {
  return (
    <label
      className={["relative inline-flex shrink-0 cursor-pointer items-center", className ?? ""].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        className={[
          "flex h-5 w-5 items-center justify-center rounded border transition",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-forest/40 peer-focus-visible:ring-offset-1",
          checked ? "border-forest bg-forest text-paper" : "border-line bg-canvas hover:border-forest/60",
        ].join(" ")}
        aria-hidden
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 4l3 3 5-6" />
          </svg>
        )}
      </span>
    </label>
  );
}
