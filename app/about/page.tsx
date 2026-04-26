import { PageHero } from "@/components/ui/page-hero";
import { AboutAiDemo } from "@/components/ui/about-ai-demo";

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="About"
        title="A small studio approach with practical delivery."
        description="This page can hold your company story, process, team, and proof points. For now it gives the project a clear route structure instead of a single placeholder screen."
      />

      <section className="grid gap-5 md:grid-cols-2">
        <article className="rounded-[1.5rem] border border-black/10 bg-white p-6">
          <h2 className="text-xl font-semibold text-[#123524]">How we work</h2>
          <p className="mt-3 text-sm leading-6 text-black/70">
            Discovery, concept planning, installation, and seasonal maintenance are treated as one continuous system rather than disconnected tasks.
          </p>
        </article>

        <article className="rounded-[1.5rem] border border-black/10 bg-white p-6">
          <h2 className="text-xl font-semibold text-[#123524]">What this route is for</h2>
          <p className="mt-3 text-sm leading-6 text-black/70">
            This page exists to establish a scalable page layout for the Next app, so future content can slot into a stable information architecture.
          </p>
        </article>
      </section>

      <AboutAiDemo />
    </div>
  );
}
