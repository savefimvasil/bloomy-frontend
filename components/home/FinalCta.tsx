import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="bg-forest text-paper">
      <div className="container py-24 md:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-display-lg">
            Start today —<br />
            <span className="text-lime normal-case">completely free.</span>
          </h2>
          <p className="mt-6 text-body text-paper/70">
            No credit card, no subscription. Open either planner as a guest right now, or create a free account to save plans, run estimates, and connect with local contractors.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button href="/projects/new" variant="light" className="px-8 py-3 text-base">
              Plan a garden
            </Button>
            <Button href="/tile-plan" variant="outline" className="px-8 py-3 text-base">
              Open Tile Planner
            </Button>
            <Button href="/register" variant="outline" className="px-8 py-3 text-base">
              Create free account →
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
