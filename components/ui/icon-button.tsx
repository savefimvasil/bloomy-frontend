export type IconButtonSize = "sm" | "md" | "lg";
export type IconButtonVariant = "bordered" | "ghost" | "round";

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: IconButtonSize;
  variant?: IconButtonVariant;
};

function getSizeClasses(size: IconButtonSize) {
  switch (size) {
    case "sm":
      return "h-7 w-7 text-sm";
    case "lg":
      return "h-10 w-10 text-base";
    default:
      return "h-8 w-8 text-lg";
  }
}

function getVariantClasses(variant: IconButtonVariant) {
  switch (variant) {
    case "ghost":
      return "text-muted hover:bg-canvas hover:text-ink";
    case "round":
      return "rounded-full border border-line bg-canvas text-muted shadow-sm hover:bg-mist hover:text-ink";
    default:
      return "rounded border border-line bg-paper text-ink shadow-sm hover:bg-mist hover:border-leaf/50";
  }
}

export function IconButton({
  size = "md",
  variant = "bordered",
  className = "",
  ...props
}: IconButtonProps) {
  const base =
    "inline-flex shrink-0 items-center justify-center font-medium transition disabled:opacity-30 disabled:cursor-not-allowed";
  const radius = variant === "round" ? "" : "rounded";
  return (
    <button
      {...props}
      className={`${base} ${radius} ${getSizeClasses(size)} ${getVariantClasses(variant)} ${className}`}
    />
  );
}
