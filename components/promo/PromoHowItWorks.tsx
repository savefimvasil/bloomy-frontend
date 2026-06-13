const STEPS = [
  {
    n: "01",
    title: "Draw your space",
    body: "Drag vertices to shape any polygon — rectangles, L-shapes, irregular rooms. Snap to the grid for precision.",
  },
  {
    n: "02",
    title: "Choose tile & pattern",
    body: "Pick a size preset, then choose straight, brick, or diagonal layout. Preview updates instantly.",
  },
  {
    n: "03",
    title: "Export your plan",
    body: "Download a PDF with measurements, a PNG for your builder, or a JSON to revisit later.",
  },
];

export function PromoHowItWorks() {
  return (
    <section id="how-it-works" className="bg-paper py-24">
      <div className="container">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">How it works</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          From blank room to export in minutes
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map(step => (
            <div key={step.n} className="flex flex-col gap-4">
              <span className="text-4xl font-semibold tracking-tight text-leaf">{step.n}</span>
              <div>
                <h3 className="font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
