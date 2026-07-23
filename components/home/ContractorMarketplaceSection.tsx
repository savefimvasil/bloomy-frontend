import Link from "next/link";
import { SectionLabel } from "@/components/ui/section-label";
import { Button } from "@/components/ui/button";

const HOMEOWNER_FEATURES = [
  "Share your garden plan directly from the planner",
  "Receive proposals from verified local contractors",
  "See pricing, timeline, and contractor details",
  "Accept the best proposal — others are declined automatically",
];

const CONTRACTOR_FEATURES = [
  "Browse open requests within your service area",
  "View the homeowner's garden plan and materials list",
  "Send a proposal with your price and timeline",
  "Build your local reputation with a verified profile",
];

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 shrink-0 text-lime"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 7 L5.5 10.5 L12 3.5" />
    </svg>
  );
}

export function ContractorMarketplaceSection() {
  return (
    <section className="bg-forest text-paper">
      <div className="container py-20 md:py-28">
        <SectionLabel light>Marketplace</SectionLabel>
        <h2 className="mt-4 text-display-lg">
          Plan it. Post it.<br />Get it built.
        </h2>
        <p className="mt-5 max-w-lg text-body text-paper/70">
          Once your garden plan is ready, Bloomy connects you with local contractors who can turn it into reality — or if you offer the service, find jobs near you.
        </p>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {/* Homeowner card */}
          <div className="rounded-2xl border border-white/15 bg-white/8 p-8">
            <p className="text-eyebrow text-paper/60">For homeowners</p>
            <h3 className="mt-3 text-display-sm text-paper">Post a project,<br />get proposals</h3>
            <ul className="mt-6 flex flex-col gap-3">
              {HOMEOWNER_FEATURES.map((item) => (
                <li key={item} className="flex items-start gap-3 text-body text-paper/70">
                  <CheckIcon />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button href="/projects/new" variant="light">
                Start a project
              </Button>
            </div>
          </div>

          {/* Contractor card */}
          <div className="rounded-2xl border border-lime/20 bg-lime/10 p-8">
            <p className="text-eyebrow text-lime">For contractors</p>
            <h3 className="mt-3 text-display-sm text-paper">Browse local jobs,<br />win work</h3>
            <ul className="mt-6 flex flex-col gap-3">
              {CONTRACTOR_FEATURES.map((item) => (
                <li key={item} className="flex items-start gap-3 text-body text-paper/70">
                  <CheckIcon />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 rounded-xl border border-paper/30 px-7 py-3.5 text-sm font-medium text-paper transition hover:border-paper/60"
              >
                Join as a contractor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
