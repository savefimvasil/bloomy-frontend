import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/section-label";

const UPCOMING_FEATURES = [
  { icon: "🌿", label: "Material lists" },
  { icon: "📐", label: "Scale drawings" },
  { icon: "💰", label: "Cost estimates" },
  { icon: "👥", label: "Client sharing" },
  { icon: "📆", label: "Project timeline" },
  { icon: "📦", label: "Supplier quotes" },
];

export function ProjectsTeaser() {
  return (
    <section className="bg-forest text-paper">
      <div className="container py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-2 md:items-end">
          <div>
            <SectionLabel light>Coming soon</SectionLabel>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Full garden
              <br />
              design projects
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-paper/72">
              Move beyond a single tile plan. Bloomy Projects will bring together material
              lists, drawings, cost estimates, and client collaboration into one structured
              workspace — purpose-built for landscape designers and contractors.
            </p>
            <div className="mt-8">
              <Button href="/register" variant="light">
                Get early access
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {UPCOMING_FEATURES.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-paper/80"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
