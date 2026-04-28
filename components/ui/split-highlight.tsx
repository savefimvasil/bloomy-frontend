import type { ReactNode } from "react";

type SplitHighlightProps = {
  title: string;
  description: string;
  eyebrow: string;
  imageUrl: string;
  imageAlt: string;
  aside: ReactNode;
};

export function SplitHighlight({
  title,
  description,
  eyebrow,
  imageUrl,
  imageAlt,
  aside,
}: SplitHighlightProps) {
  return (
    <section className="grid bg-paper lg:grid-cols-[1.05fr_0.95fr]">
      <div className="bg-forest">
        <div
          className="relative overflow-hidden bg-moss"
          aria-label={imageAlt}
          style={{
            backgroundImage: `linear-gradient(rgba(24, 56, 31, 0.18), rgba(24, 56, 31, 0.18)), url('${imageUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="container flex min-h-screen flex-col justify-end py-6 text-paper md:py-8">
            <div className="max-w-2xl">
                <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
                  {title}
                </h1>
                <p className="mt-5 max-w-xl text-sm leading-7 text-paper/82 md:text-base">
                  {description}
                </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-canvas">{aside}</div>
    </section>
  );
}
