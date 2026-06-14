import { Button } from "@/components/ui/button";
import { CheckList } from "@/components/ui/check-list";
import { SectionLabel } from "@/components/ui/section-label";
import { TilePlannerMockup } from "./TilePlannerMockup";

const FEATURES = [
  "Straight, brick & diagonal patterns",
  "Tiles and laminate — 9 preset sizes or custom",
  "Grout gap control with real-time preview",
  "Chess / two-colour checkerboard mode",
  "Cut tile calculator — offcuts under 30 mm flagged",
  "Export to PDF, PNG, or portable JSON",
];

export function TilePlannerSpotlight() {
  return (
    <section className="bg-canvas">
      <div className="container py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <SectionLabel>Live now</SectionLabel>
            <h2 className="mt-4 text-display-lg text-forest">
              The Tile<br />Planner
            </h2>
            <p className="mt-5 text-body text-muted">
              Draw any shape — rectangular, L-shaped, curved cutouts — then drop your tile
              size and pattern. Bloomy instantly calculates how many whole tiles you need,
              how many cuts, and the exact offcut sizes.
            </p>
            <div className="mt-8">
              <CheckList items={FEATURES} />
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button href="/tile-plan">Open Tile Planner</Button>
              <Button href="/tile-plan/promo" variant="secondary">
                See how it works
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <TilePlannerMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
