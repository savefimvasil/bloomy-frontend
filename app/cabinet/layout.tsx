"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const CABINET_NAV = [
  { href: "/cabinet/tile-plans", label: "Tile Plans" },
  { href: "/cabinet/projects", label: "Projects" },
];

export default function CabinetLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full bg-canvas">
      <aside className="hidden w-56 shrink-0 border-r border-line bg-paper pt-6 md:block">
        <p className="px-6 text-[11px] uppercase tracking-[0.2em] text-muted">Cabinet</p>
        <nav className="mt-4 flex flex-col">
          {CABINET_NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-6 py-2.5 text-sm transition ${
                  active
                    ? "bg-forest/8 font-medium text-forest"
                    : "text-muted hover:text-forest"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile top nav */}
      <div className="w-full">
        <div className="flex gap-1 border-b border-line bg-paper px-4 py-2 md:hidden">
          {CABINET_NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded px-3 py-1.5 text-sm transition ${
                  active ? "bg-forest text-paper" : "text-muted hover:text-forest"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
