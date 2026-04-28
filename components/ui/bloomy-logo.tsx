type BloomyLogoProps = {
  className?: string;
  title?: string;
};

export function BloomyLogo({
  className = "h-auto w-[164px]",
  title = "Bloomy Garden",
}: BloomyLogoProps) {
  return (
    <svg
      viewBox="0 0 320 84"
      role="img"
      aria-label={title}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>

      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter">
        <path d="M112 14V28" />
        <path d="M112 14H208" />
        <path d="M208 14V28" />
      </g>

      <text
        x="160"
        y="53"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="Instrument Sans, Avenir Next, Segoe UI, sans-serif"
        fontSize="24"
        fontWeight="600"
        letterSpacing="0.18em"
      >
        BLOOMY GARDEN
      </text>

      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
        <path d="M58 67H262" />
      </g>
    </svg>
  );
}
