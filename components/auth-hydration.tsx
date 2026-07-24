"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

// Triggers Zustand persist rehydration after mount so the initial render
// (server + hydration) uses the same empty state, avoiding a mismatch.
export function AuthHydration() {
  useEffect(() => {
    void useAuthStore.persist.rehydrate();
  }, []);
  return null;
}
