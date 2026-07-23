import { SectionLabel } from "@/components/ui/section-label";

const FEATURES = [
  {
    num: "01",
    title: "Tile Planner",
    body: "Draw any floor or patio shape and get accurate tile counts, cut-piece sizes, and grout gaps — computed in real time.",
  },
  {
    num: "02",
    title: "Garden Planner",
    body: "Design your full garden layout: draw boundaries, add zones, place objects, and run a materials estimate.",
  },
  {
    num: "03",
    title: "Contractor Marketplace",
    body: "Post your project and receive proposals from verified local contractors — or find nearby jobs if you offer the service.",
  },
];

export function IntroStrip() {
  return (
    <section className="text-paper">
      <div className="container py-16 md:py-20 text-forest">
        <div className="grid gap-10 md:grid-cols-3">
          {FEATURES.map((item) => (
            <div key={item.num} className="flex flex-col gap-4">
              <SectionLabel>{item.num}</SectionLabel>
              <h3 className="text-display-sm">{item.title}</h3>
              <p className="text-body text-forest">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
