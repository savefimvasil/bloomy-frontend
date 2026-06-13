import { Button } from "@/components/ui/button";

type Cta = { label: string; href: string };

type HeroSectionProps = {
  headline: React.ReactNode;
  description: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  // Background — provide one
  backgroundImage?: string;
  backgroundGradient?: string;
  // Top elements
  label?: string;   // small text top-left (below header)
  badge?: string;   // pill chip top-left
  tagline?: string; // text top-right (e.g. "FOR DESIGNERS & CONTRACTORS")
  // Extras
  scrollHint?: boolean;
  watermark?: boolean;
  fullHeight?: boolean;
};

function TileGridWatermark() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="tw" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
            <rect x="2"  y="2"  width="28" height="28" fill="white" rx="2" />
            <rect x="34" y="2"  width="28" height="28" fill="white" rx="2" />
            <rect x="2"  y="34" width="28" height="28" fill="white" rx="2" />
            <rect x="34" y="34" width="28" height="28" fill="white" rx="2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tw)" />
      </svg>
    </div>
  );
}

export function HeroSection({
  headline,
  description,
  primaryCta,
  secondaryCta,
  backgroundImage,
  backgroundGradient,
  label,
  badge,
  scrollHint = false,
  watermark = false,
  fullHeight = true,
}: HeroSectionProps) {
  const isDark = !!(backgroundImage || backgroundGradient);

  const background = backgroundImage
    ? `linear-gradient(rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.18) 60%, rgba(0,0,0,0.55) 100%), url('${backgroundImage}')`
    : backgroundGradient;

  const minH = fullHeight ? "min-h-screen" : "min-h-[88vh]";

  return (
    <section
      className={`relative ${minH} overflow-hidden`}
      style={{
        background,
        ...(backgroundImage && { backgroundSize: "cover", backgroundPosition: "center" }),
      }}
    >
      {watermark && <TileGridWatermark />}

      <div className={`container relative flex ${minH} flex-col py-24 text-paper`}>

        {(label || badge) && (
          <div className="flex items-start justify-between">
            <div>
              {badge && (
                <span className="inline-flex items-center gap-2 rounded-full border border-lime/40 bg-lime/10 px-3 py-1 text-xs font-medium text-lime">
                  {badge}
                </span>
              )}
              {label && (
                <p className="text-[11px] uppercase tracking-[0.28em] text-paper/50">{label}</p>
              )}
            </div>
          </div>
        )}

        {/* Spacer pushes content down */}
        <div className="flex-1" />

        {/* Main content — bottom-left */}
        <div className="max-w-3xl">
          <h1 className="text-5xl font-semibold leading-[0.9] tracking-tight md:text-7xl lg:text-8xl">
            {headline}
          </h1>

          <p className={`mt-7 max-w-lg text-sm leading-7 md:text-base ${isDark ? "text-paper/70" : "text-ink"}`}>
            {description}
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button
              href={primaryCta.href}
              variant={isDark ? "light" : "default"}
              className="px-8 py-4 text-base"
            >
              {primaryCta.label}
            </Button>
            <Button
              href={secondaryCta.href}
              variant={isDark ? "outline" : "secondary"}
              className="px-8 py-4 text-base"
            >
              {secondaryCta.label}
            </Button>
          </div>
        </div>

        {/* Scroll hint */}
        {scrollHint && (
          <div className="mt-16 flex items-center gap-3 text-paper/40">
            <div className="h-px w-10 bg-paper/30" />
            <span className="text-[11px] uppercase tracking-[0.22em]">Scroll to explore</span>
          </div>
        )}
      </div>
    </section>
  );
}
