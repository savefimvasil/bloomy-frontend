"use client";

import { useEffect, useState } from "react";

const TOKEN_KEY = "bloomy_access_token";
const EMAIL_KEY = "bloomy_user_email";
const AUTH_EVENT = "bloomy-auth-changed";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getAuthEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(EMAIL_KEY);
}

export function setAuth(token: string, email: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EMAIL_KEY, email);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
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

export function useIsLoggedIn(): boolean {
  return useAuthValue(() => getAuthToken() !== null, false);
}
