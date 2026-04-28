type FeatureCardProps = {
  title: string;
  description: string;
};

export function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <article className="rounded-[1.6rem] border border-border bg-surface p-6 shadow-[0_20px_50px_rgba(18,53,36,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(18,53,36,0.11)]">
      <div className="h-10 w-10 rounded-full bg-accent-soft/70" />
      <h2 className="mt-5 text-xl font-semibold text-brand">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-ink-muted">{description}</p>
    </article>
  );
}
