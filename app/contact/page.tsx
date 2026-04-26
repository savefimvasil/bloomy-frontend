import { PageHero } from "@/components/ui/page-hero";

export default function ContactPage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Contact"
        title="A dedicated contact route for enquiries and project intake."
        description="Use this page later for a real form, calendaring, or contact details. Right now it provides a proper route and keeps the app structure clean."
      />

      <section className="grid gap-5 md:grid-cols-2">
        <article className="rounded-[1.5rem] border border-black/10 bg-white p-6">
          <h2 className="text-xl font-semibold text-[#123524]">Email</h2>
          <p className="mt-3 text-sm text-black/70">hello@bloomy.garden</p>
        </article>

        <article className="rounded-[1.5rem] border border-black/10 bg-white p-6">
          <h2 className="text-xl font-semibold text-[#123524]">Location</h2>
          <p className="mt-3 text-sm text-black/70">Remote-first studio with on-site project visits.</p>
        </article>
      </section>
    </div>
  );
}
