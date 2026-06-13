"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BloomyLogo } from "@/components/ui/bloomy-logo";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigation = [
    { href: "/tile-plan", label: "Tile Planner" },
    ...(isLoggedIn ? [{ href: "/cabinet", label: "Cabinet" }] : []),
  ];

  useEffect(() => {
    function syncAuthState() {
      setIsLoggedIn(Boolean(localStorage.getItem("bloomy_access_token")));
    }
    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("bloomy-auth-changed", syncAuthState);
    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("bloomy-auth-changed", syncAuthState);
    };
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  function handleLogout() {
    localStorage.removeItem("bloomy_access_token");
    localStorage.removeItem("bloomy_user_email");
    window.dispatchEvent(new Event("bloomy-auth-changed"));
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="fixed top-0 z-40 w-full bg-paper/72 backdrop-blur-md">
      <div className="container h-[60px]">
        <div className="flex h-full items-center justify-between">
          <Link href="/" className="inline-flex h-full items-center text-forest">
            <BloomyLogo className="h-auto w-[140px] sm:w-[160px]" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex h-full items-center gap-6 text-sm uppercase tracking-[0.18em] text-muted">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-forest">
                {item.label}
              </Link>
            ))}
            {!isLoggedIn && (
              <Link href="/login" className="transition hover:text-forest">
                Login
              </Link>
            )}
            {isLoggedIn && pathname.startsWith("/cabinet") && (
              <Button type="button" variant="ghost" className="px-0 py-0 text-[12px] uppercase tracking-[0.18em]" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="flex sm:hidden h-10 w-10 items-center justify-center rounded text-ink"
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <span className="text-lg">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden absolute left-0 right-0 top-[60px] border-t border-line bg-paper/95 px-4 py-3 shadow-soft backdrop-blur-md flex flex-col gap-3">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-1.5 text-sm uppercase tracking-[0.18em] text-muted transition hover:text-forest"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {!isLoggedIn && (
            <Link
              href="/login"
              className="py-1.5 text-sm uppercase tracking-[0.18em] text-muted transition hover:text-forest"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          )}
          {isLoggedIn && (
            <button
              onClick={() => { setMenuOpen(false); handleLogout(); }}
              className="py-1.5 text-left text-sm uppercase tracking-[0.18em] text-muted transition hover:text-forest"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
}
