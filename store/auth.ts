"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "homeowner" | "contractor";

interface AuthState {
  token: string | null;
  email: string | null;
  role: UserRole;
  _hasHydrated: boolean;
  setAuth: (token: string, email: string, role: UserRole) => void;
  clearAuth: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      role: "homeowner",
      _hasHydrated: false,
      setAuth: (token, email, role) => set({ token, email, role }),
      clearAuth: () => set({ token: null, email: null, role: "homeowner" }),
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: "bloomy-auth",
      // Don't read localStorage synchronously on module load — that would cause
      // a hydration mismatch (server has no token, client immediately has one).
      // We call persist.rehydrate() manually after mount instead.
      skipHydration: true,
      // Only persist the auth fields, not the runtime _hasHydrated flag.
      partialize: (s) => ({ token: s.token, email: s.email, role: s.role }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) console.error("[auth] rehydration error:", error);
        useAuthStore.setState({ _hasHydrated: true });
      },
    }
  )
);

export const getAuthToken = () => useAuthStore.getState().token;
export const getAuthEmail = () => useAuthStore.getState().email;
export const getAuthRole = () => useAuthStore.getState().role;
export const setAuth = (token: string, email: string, role: UserRole) =>
  useAuthStore.getState().setAuth(token, email, role);
export const clearAuth = () => useAuthStore.getState().clearAuth();
