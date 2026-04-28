import Link from "next/link";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/login", label: "Login" },
  { href: "/projects", label: "Projects" },
];

export function SiteHeader() {
  return (
    <header className="fixed top-0 z-40 w-full bg-paper/72 backdrop-blur-md">
      <div className="container flex items-center justify-between py-5">
        <Link href="/" className="text-sm font-medium uppercase tracking-[0.24em] text-forest">
          Bloomy Garden
        </Link>

        <nav className="flex items-center gap-6 text-[11px] uppercase tracking-[0.18em] text-muted">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-forest">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
