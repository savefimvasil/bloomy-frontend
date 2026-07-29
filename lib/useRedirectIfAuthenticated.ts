"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export function useRedirectIfAuthenticated(to = "/cabinet"): { isReady: boolean; isAuthenticated: boolean } {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    if (hasHydrated && token) {
      void router.replace(to);
    }
  }, [hasHydrated, token, router, to]);

  return { isReady: hasHydrated, isAuthenticated: token !== null };
}
