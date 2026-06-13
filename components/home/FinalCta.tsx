import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="bg-canvas">
      <div className="container py-24 md:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-forest md:text-5xl">
            Start planning today —
            <br />
            <span className="text-leaf">completely free.</span>
          </h2>
          <p className="mt-6 text-sm leading-7 text-muted">
            No credit card. No subscription. Open the Tile Planner right now as a guest,
            or create a free account to save your plans and access them anywhere.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button href="/tile-plan" className="px-8 py-3 text-base">
              Open Tile Planner
            </Button>
            <Link
              href="/register"
              className="text-sm font-medium text-forest underline underline-offset-4 hover:text-leaf"
            >
              Create free account →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
