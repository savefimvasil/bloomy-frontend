import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 bg-forest pt-15" />
        <div
          className="relative overflow-hidden shadow-soft"
          style={{
            backgroundImage:
              "linear-gradient(rgba(16, 63, 27, 0.12), rgba(16, 63, 27, 0.12)), url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1800&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="container flex min-h-screen flex-col justify-end text-paper">
            <div className="max-w-5xl pb-10">
                <h1 className="text-5xl font-semibold tracking-tight md:text-7xl lg:text-8xl">
                  MAKE YOUR <span className="text-lime">DREAM</span>
                  <br />
                  <span className="text-lime">GARDEN</span> INTO A REALITY
                </h1>
                <p className="mt-6 max-w-2xl text-sm leading-7 text-paper/84 md:text-base">
                  A greener, fresher Bloomy front-end built around real client onboarding, login,
                  and project ownership without the boxed card-heavy feeling.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button href="/projects/new">Create new project</Button>
                  <Button href="/login" variant="secondary">
                    Login
                  </Button>
                </div>
            </div>
          </div>
        </div>
      </section>
  );
}
