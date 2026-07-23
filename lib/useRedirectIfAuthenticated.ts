"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export function useRedirectIfAuthenticated(to = "/cabinet"): boolean {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) {
      void router.replace(to);
    }
  }, [token, router, to]);

  return token === null;
}
