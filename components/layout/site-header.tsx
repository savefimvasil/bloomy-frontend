import Link from "next/link";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/login", label: "Login" },
  { href: "/projects", label: "Projects" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/94 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-medium uppercase tracking-[0.22em] text-brand">
          Bloomy Garden
        </Link>

        <nav className="flex items-center gap-6 text-[11px] uppercase tracking-[0.18em] text-ink-muted">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-brand">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
