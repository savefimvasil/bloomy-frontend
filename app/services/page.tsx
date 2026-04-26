import { FeatureCard } from "@/components/ui/feature-card";
import { PageHero } from "@/components/ui/page-hero";

const services = [
  {
    title: "Concept Design",
    description: "Moodboards, planting palettes, and layout ideas for new gardens or redesigns.",
  },
  {
    title: "Implementation Support",
    description: "Material selection, staging guidance, and on-site coordination during rollout.",
  },
  {
    title: "Seasonal Refresh",
    description: "Ongoing updates to keep a space healthy, expressive, and aligned with the calendar.",
  },
];

export default function ServicesPage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Services"
        title="A clear services route for the marketing site."
        description="This route is ready for real content and gives the project a more production-like folder structure."
      />

      <section className="grid gap-5 md:grid-cols-3">
        {services.map((service) => (
          <FeatureCard key={service.title} title={service.title} description={service.description} />
        ))}
      </section>
    </div>
  );
}
