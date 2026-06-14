type ToggleButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

const BASE = "flex-1 rounded border px-3 py-1.5 text-xs font-medium transition";
const ACTIVE = "border-leaf bg-leaf/15 text-forest";
const INACTIVE = "border-line bg-paper text-muted hover:border-leaf/50";
const DISABLED = "border-line bg-paper text-muted/40 cursor-not-allowed opacity-40";

export function ToggleButton({
  active = false,
  disabled,
  className = "",
  ...props
}: ToggleButtonProps) {
  const state = disabled ? DISABLED : active ? ACTIVE : INACTIVE;
  return (
    <button
      {...props}
      disabled={disabled}
      className={`${BASE} ${state} ${className}`}
    />
  );
}
