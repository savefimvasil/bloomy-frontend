const FEATURES = [
  { icon: "⬡", title: "Precise material count",     body: "Full tiles, cut pieces and offcut reuse calculated automatically. Order exactly what you need." },
  { icon: "✂", title: "Cut-piece optimisation",     body: "Offcuts are reused using a First Fit Decreasing algorithm — fewer tiles purchased, less waste." },
  { icon: "⊞", title: "Flexible tile sizes",        body: "Five preset formats from compact 300×300 to large-format 1200×600, plus a fully custom size option." },
  { icon: "↗", title: "PDF, PNG & JSON export",     body: "Share a visual plan, print it, or re-import the JSON to continue later." },
  { icon: "⊟", title: "Grout gap control",          body: "Set the exact grout width in mm and see it reflected live on the canvas." },
  { icon: "∅", title: "Free, no account needed",    body: "Start planning immediately. Register only if you want to save and manage multiple plans." },
];

export function PromoFeaturesGrid() {
  return (
    <section className="bg-canvas py-24">
      <div className="container">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">What&apos;s included</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Everything a tiler or designer needs
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(f => (
            <div key={f.title} className="flex gap-4">
              <span className="mt-0.5 shrink-0 text-xl text-leaf">{f.icon}</span>
              <div>
                <p className="font-medium text-ink">{f.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
