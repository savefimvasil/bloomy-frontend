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

  const navigation = [
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
    <header className="fixed top-0 z-40 h-[60px] w-full bg-paper/72 backdrop-blur-md">
      <div className="container h-full">
        <div className="flex h-full items-center justify-between">
          <Link href="/" className="inline-flex h-full items-center text-forest">
            <BloomyLogo className="h-auto w-[160px]" />
          </Link>

          <nav className="flex h-full items-center gap-6 text-sm uppercase tracking-[0.18em] text-muted">
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
