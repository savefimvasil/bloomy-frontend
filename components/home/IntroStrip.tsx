import { SectionLabel } from "@/components/ui/section-label";

const FEATURES = [
  {
    num: "01",
    title: "Tile Planner",
    body: "Lay out tiles in any shape. Accurate cut piece counts, patterns, and grout gaps — all computed in real time.",
  },
  {
    num: "02",
    title: "Save & Revisit",
    body: "Create a free account and every plan is saved automatically. Open from any device and continue exactly where you left off.",
  },
  {
    num: "03",
    title: "Projects (coming soon)",
    body: "Full garden design projects with materials, drawings, and timelines — a wider workspace for larger commissions.",
  },
];

export function IntroStrip() {
  return (
    <section className="bg-forest text-paper">
      <div className="container py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-3">
          {FEATURES.map((item) => (
            <div key={item.num} className="flex flex-col gap-4">
              <SectionLabel light>{item.num}</SectionLabel>
              <h3 className="text-display-sm">{item.title}</h3>
              <p className="text-body text-paper/72">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
