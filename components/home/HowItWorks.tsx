import { SectionLabel } from "@/components/ui/section-label";

const STEPS = [
  {
    step: "1",
    title: "Plan your space",
    body: "Draw your garden layout or tile shape. Add zones, place objects, configure tile sizes and patterns — all in a live visual editor.",
  },
  {
    step: "2",
    title: "Get your materials estimate",
    body: "Run the build estimate to see exact tile counts, offcut sizes, and a full materials list ready to share or download as a PDF.",
  },
  {
    step: "3",
    title: "Connect with professionals",
    body: "Post your project and receive proposals from verified local contractors. Compare, accept, and get the job booked.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-paper">
      <div className="container py-20 md:py-28">
        <SectionLabel>How it works</SectionLabel>
        <h2 className="mt-4 max-w-md text-display-lg text-forest normal-case tracking-normal leading-tight">
          From blank canvas<br />to booked contractor
        </h2>

        <div className="mt-14 grid gap-0 md:grid-cols-3">
          {STEPS.map((item, i) => (
            <div
              key={item.step}
              className={`relative border-line p-8 ${i < STEPS.length - 1 ? "md:border-r" : ""}`}
            >
              <span className="block text-[5rem] font-bold leading-none text-mist">
                {item.step}
              </span>
              <h3 className="mt-5 text-body font-semibold text-ink">{item.title}</h3>
              <p className="mt-3 text-body text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
