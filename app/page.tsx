import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="grid min-h-[72vh] overflow-hidden border border-border bg-surface lg:grid-cols-[1.08fr_0.92fr]">
        <div
          className="relative min-h-[420px] border-b border-border bg-brand-strong lg:min-h-full lg:border-b-0 lg:border-r"
          style={{
            backgroundImage:
              "linear-gradient(rgba(24,31,20,0.18), rgba(24,31,20,0.42)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 flex flex-col justify-end p-8 text-white md:p-10">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/64">Landscape platform</p>
            <h1 className="mt-4 max-w-xl text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
              Create your dream garden.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-white/76 md:text-base">
              Start the client, create the owner, and open the first project in a calmer and more
              architectural interface.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between bg-surface px-8 py-8 md:px-10 md:py-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-brand-soft">Studio status</p>
              <p className="mt-3 text-5xl font-semibold tracking-tight text-brand">500+</p>
              <p className="mt-1 max-w-xs text-sm leading-6 text-ink-muted">
                Satisfied clients and ongoing project spaces shaped with long-term care in mind.
              </p>
            </div>
          </div>

          <div className="mt-12 border-t border-border pt-6">
            <p className="text-[11px] uppercase tracking-[0.2em] text-brand-soft">Platform purpose</p>
            <h2 className="mt-4 max-w-md text-4xl font-semibold leading-tight tracking-tight text-brand md:text-5xl">
              Project-first setup in a sharper visual system.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-ink-muted">
              No extra blocks. Just a more stylish split composition with flatter surfaces,
              restrained color, and clearer action hierarchy.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium">
              <Link href="/projects/new" className="bg-brand px-6 py-3 text-surface transition hover:bg-brand-strong">
                Create new project
              </Link>
              <Link href="/login" className="border border-border px-6 py-3 text-brand transition hover:bg-surface-muted">
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
