const SIZE = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-10 w-10 border-4",
} as const;

type SpinnerProps = {
  label?: string;
  size?: keyof typeof SIZE;
};

export function Spinner({ label, size = "md" }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`animate-spin rounded-full border-line border-t-forest ${SIZE[size]}`} />
      {label && <p className="text-body text-muted">{label}</p>}
    </div>
  );
}
