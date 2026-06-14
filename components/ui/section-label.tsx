type SectionLabelProps = {
  children: React.ReactNode;
  light?: boolean;
};

export function SectionLabel({ children, light = false }: SectionLabelProps) {
  return (
    <p className={`text-eyebrow ${light ? "text-lime" : "text-leaf"}`}>
      {children}
    </p>
  );
}
