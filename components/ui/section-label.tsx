type SectionLabelProps = {
  children: React.ReactNode;
  light?: boolean; // true when on a dark background
};

export function SectionLabel({ children, light = false }: SectionLabelProps) {
  return (
    <p
      className={`text-[11px] uppercase tracking-[0.24em] ${
        light ? "text-lime" : "text-leaf"
      }`}
    >
      {children}
    </p>
  );
}
