"use client";

import { useEffect, useState } from "react";

const TOKEN_KEY = "bloomy_access_token";
const EMAIL_KEY = "bloomy_user_email";
const ROLE_KEY = "bloomy_user_role";
const AUTH_EVENT = "bloomy-auth-changed";

export type UserRole = "homeowner" | "contractor";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getAuthEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(EMAIL_KEY);
}

export function getAuthRole(): UserRole {
  if (typeof window === "undefined") return "homeowner";
  return (localStorage.getItem(ROLE_KEY) as UserRole | null) ?? "homeowner";
}

export function setAuth(token: string, email: string, role: UserRole): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EMAIL_KEY, email);
  localStorage.setItem(ROLE_KEY, role);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(ROLE_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

function useAuthValue<T>(read: () => T, fallback: T): T {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    function sync() {
      setValue(read());
    }
    void Promise.resolve().then(sync);
    window.addEventListener("storage", sync);
    window.addEventListener(AUTH_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(AUTH_EVENT, sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}

export function useAuthToken(): string | null {
  return useAuthValue(getAuthToken, null);
}

export function useAuthEmail(): string | null {
  return useAuthValue(getAuthEmail, null);
}

export function useAuthRole(): UserRole {
  return useAuthValue(getAuthRole, "homeowner");
}

export function useIsLoggedIn(): boolean {
  return useAuthValue(() => getAuthToken() !== null, false);
}
