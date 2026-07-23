"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "homeowner" | "contractor";

interface AuthState {
  token: string | null;
  email: string | null;
  role: UserRole;
  setAuth: (token: string, email: string, role: UserRole) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      role: "homeowner",
      setAuth: (token, email, role) => set({ token, email, role }),
      clearAuth: () => set({ token: null, email: null, role: "homeowner" }),
    }),
    { name: "bloomy-auth" }
  )
);

export const getAuthToken = () => useAuthStore.getState().token;
export const getAuthEmail = () => useAuthStore.getState().email;
export const getAuthRole = () => useAuthStore.getState().role;
export const setAuth = (token: string, email: string, role: UserRole) =>
  useAuthStore.getState().setAuth(token, email, role);
export const clearAuth = () => useAuthStore.getState().clearAuth();
