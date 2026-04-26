type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="rounded-[2rem] bg-[linear-gradient(135deg,#123524_0%,#3e7b5f_45%,#dce8cf_100%)] px-8 py-16 text-white shadow-[0_30px_80px_rgba(18,53,36,0.18)]">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">{eyebrow}</p>
      <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
        {title}
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">{description}</p>
    </section>
  );
}
