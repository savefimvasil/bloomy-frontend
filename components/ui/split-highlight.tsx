import type { ReactNode } from "react";

type SplitHighlightProps = {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  aside: ReactNode;
};

export function SplitHighlight({
  title,
  description,
  imageUrl,
  imageAlt,
  aside,
}: SplitHighlightProps) {
  return (
    <section className="grid bg-paper lg:grid-cols-[1fr_1fr]">
      <div className="bg-forest">
        <div
          className="relative overflow-hidden bg-moss h-full"
          aria-label={imageAlt}
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${imageUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="container flex lg:min-h-screen flex-col justify-end text-paper py-6 pt-24 lg:pt-0">
            <div className="max-w-2xl p-4 md:p-8 lg:p-10">
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
