interface ZoneDotProps {
  fill: string;
  stroke: string;
  size?: "sm" | "md";
}

export function ZoneDot({ fill, stroke, size = "sm" }: ZoneDotProps) {
  return (
    <span
      className={size === "md" ? "h-4 w-4 shrink-0 rounded-sm border" : "h-3 w-3 shrink-0 rounded-sm border"}
      style={{ background: fill, borderColor: stroke }}
    />
  );
}
