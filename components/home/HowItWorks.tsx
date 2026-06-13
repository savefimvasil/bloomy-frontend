import { SectionLabel } from "@/components/ui/section-label";

const STEPS = [
  {
    step: "1",
    title: "Draw your space",
    body: "Click to add vertices and shape any polygon — a rectangular patio, an L-shaped hallway, or a complex pool surround.",
  },
  {
    step: "2",
    title: "Choose tile & pattern",
    body: "Pick a size, select straight, brick, diagonal, or herringbone, set the grout gap, and preview instantly at any zoom.",
  },
  {
    step: "3",
    title: "Export or save",
    body: "Download a print-ready PDF with tile counts, export PNG for sharing, or save the plan to your account to revisit later.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-paper">
      <div className="container py-20 md:py-28">
        <SectionLabel>Process</SectionLabel>
        <h2 className="mt-4 max-w-md text-4xl font-semibold tracking-tight text-forest md:text-5xl">
          From blank canvas to bill of materials
        </h2>

        <div className="mt-14 grid gap-0 md:grid-cols-3">
          {STEPS.map((item, i) => (
            <div
              key={item.step}
              className={`relative border-line p-8 ${i < STEPS.length - 1 ? "md:border-r" : ""}`}
            >
              <span className="block text-6xl font-semibold leading-none text-mist md:text-7xl">
                {item.step}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
