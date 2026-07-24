"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export function useRedirectIfAuthenticated(to = "/cabinet"): boolean {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    if (hasHydrated && token) {
      void router.replace(to);
    }
  }, [hasHydrated, token, router, to]);

  // Before hydration, treat as "not authenticated" so login/register pages render
  // consistently with the server render (server also has no token).
  return !hasHydrated || token === null;
}
