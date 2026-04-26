import Link from "next/link";
import { FeatureCard } from "@/components/ui/feature-card";
import { PageHero } from "@/components/ui/page-hero";

const features = [
  {
    title: "Garden Planning",
    description:
      "We shape planting concepts, zoning, and seasonal color systems for private and commercial spaces.",
  },
  {
    title: "Plant Care",
    description:
      "Maintenance plans cover watering, pruning, feeding, and recovery support for fragile plantings.",
  },
  {
    title: "Outdoor Styling",
    description:
      "From entry courts to terraces, we create coherent outdoor compositions with lighting and texture.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <PageHero
        eyebrow="Landscape Studio"
        title="Thoughtful garden spaces that feel alive in every season."
        description="Bloomy Garden designs, builds, and maintains outdoor environments with a balance of structure, softness, and long-term practicality."
      />

      <section className="grid gap-5 md:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard key={feature.title} title={feature.title} description={feature.description} />
        ))}
      </section>

      <section className="rounded-[1.75rem] border border-black/10 bg-[#f4f0e8] p-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5f7a65]">
            Start here
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#123524]">
            Use the new page structure as the base for your real product pages.
          </h2>
          <p className="mt-4 text-base leading-7 text-black/70">
            The app now has a proper layout, reusable UI components, and separate routes so the frontend can grow without turning into one big file.
          </p>
          <div className="mt-6 flex gap-3 text-sm font-medium">
            <Link
              href="/services"
              className="rounded-full bg-[#123524] px-5 py-3 text-white transition hover:bg-[#1d4f37]"
            >
              Explore services
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-[#123524]/20 px-5 py-3 text-[#123524] transition hover:bg-white"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
