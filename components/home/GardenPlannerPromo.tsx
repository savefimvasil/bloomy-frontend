import Link from "next/link";
import { SectionLabel } from "@/components/ui/section-label";
import { Button } from "@/components/ui/button";

const FEATURES = [
  "Draw any garden shape — boundary editor included",
  "Add zones: lawn, flower beds, patios, decks and more",
  "Place objects: furniture, trees, water features",
  "AI-generated visualisation of your plan",
  "Save and revisit your project anytime",
  "Share with clients or contractors",
];

export function GardenPlannerPromo() {
  return (
    <section className="bg-forest text-paper">
      <div className="container py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">

          <div>
            <SectionLabel light>Live now</SectionLabel>
            <h2 className="mt-4 text-display-lg">
              Garden<br />Planner
            </h2>
            <p className="mt-5 max-w-md text-body text-paper/72">
              Design your entire garden layout — boundaries, zones, and objects — in a
              purpose-built visual editor. Start for free, save when you're ready.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/projects/new" variant="light">
                Start planning
              </Button>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 rounded-xl border border-paper/30 px-7 py-3.5 text-sm font-medium text-paper transition hover:border-paper/60"
              >
                Create free account →
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {FEATURES.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-body text-paper/80"
              >
                <svg className="mt-0.5 shrink-0 text-lime" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M2 7 L5.5 10.5 L12 3.5" />
                </svg>
                <span>{item}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
