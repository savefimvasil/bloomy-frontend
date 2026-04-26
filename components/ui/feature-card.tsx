type FeatureCardProps = {
  title: string;
  description: string;
};

export function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <article className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-[0_20px_50px_rgba(18,53,36,0.08)]">
      <h2 className="text-xl font-semibold text-[#123524]">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-black/65">{description}</p>
    </article>
  );
}
