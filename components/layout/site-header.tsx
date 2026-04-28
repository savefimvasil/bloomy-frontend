"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigation = [
    { href: "/", label: "Home" },
    ...(isLoggedIn ? [{ href: "/projects", label: "Projects" }] : [])
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

  function handleLogout() {
    localStorage.removeItem("bloomy_access_token");
    localStorage.removeItem("bloomy_user_email");
    window.dispatchEvent(new Event("bloomy-auth-changed"));
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="fixed top-0 z-40 w-full bg-paper/72 backdrop-blur-md">
      <div className="container">
        <div className="flex items-center justify-between py-5">
          <Link href="/" className="text-md font-medium uppercase tracking-[0.24em] text-forest">
            Bloomy Garden
          </Link>

          <nav className="flex items-center gap-6 text-sm uppercase tracking-[0.18em] text-muted">
            {navigation.map((item) => (
                <Link key={item.href} href={item.href} className="transition hover:text-forest">
                  {item.label}
                </Link>
            ))}

            {!isLoggedIn ? (
                <Link href="/login" className="transition hover:text-forest">
                  Login
                </Link>
            ) : null}

            {isLoggedIn && pathname === "/projects" ? (
                <Button type="button" variant="ghost" className="px-0 py-0 text-[12px] uppercase tracking-[0.18em]" onClick={handleLogout}>
                  Logout
                </Button>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  );
}
