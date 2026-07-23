import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Cta = { label: string; href: string };

export type HeroSectionProps = {
  headline: ReactNode;
  description: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  backgroundImage?: string;
  backgroundGradient?: string;
  label?: string;
  badge?: string;
  tagline?: string;
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

export function HeroSection(props: HeroSectionProps) {
  const {
    headline,
    description,
    primaryCta,
    secondaryCta,
    backgroundImage,
    backgroundGradient,
    label,
    badge,
    tagline,
    scrollHint = false,
    watermark = false,
    fullHeight = true,
  } = props;

  const isDark = !!(backgroundImage || backgroundGradient);

  const background = backgroundImage
    ? `linear-gradient(rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.18) 60%, rgba(0,0,0,0.55) 100%), url('${backgroundImage}')`
    : backgroundGradient;

  const minH = fullHeight ? "min-h-screen" : "min-h-[88vh]";

  return (
    <section
      className={`relative -mt-[68px] ${minH} overflow-hidden${backgroundImage ? " bg-cover bg-center" : ""}`}
      style={{ background }}
    >
      {watermark && <TileGridWatermark />}

      <div className={`container relative flex ${minH} flex-col py-24 text-paper`}>

        {/* Top row — badge / label left, tagline right */}
        {(label || badge || tagline) && (
          <div className="flex items-start justify-between">
            <div>
              {badge && (
                <span className="inline-flex items-center gap-2 rounded-full border border-lime/40 bg-lime/10 px-3 py-1 text-eyebrow text-lime">
                  {badge}
                </span>
              )}
              {label && <p className="text-eyebrow text-paper/50">{label}</p>}
            </div>
            {tagline && <p className="text-eyebrow text-lime">{tagline}</p>}
          </div>
        )}

        <div className="flex-1" />

        {/* Main content — bottom left */}
        <div className="max-w-3xl">
          <h1 className="text-display-xl">{headline}</h1>

          <p className={`mt-7 max-w-lg text-body ${isDark ? "text-paper/70" : "text-muted"}`}>
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

        {scrollHint && (
          <div className="mt-16 flex items-center gap-3 text-paper/40">
            <div className="h-px w-10 bg-paper/30" />
            <span className="text-eyebrow">Scroll to explore</span>
          </div>
        )}
      </div>
    </section>
  );
}
