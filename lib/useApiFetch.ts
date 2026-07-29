"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getAuthToken } from "@/store/auth";

type State<T> =
  | { data: null; loading: true; error: null }
  | { data: T; loading: false; error: null }
  | { data: null; loading: false; error: string };

export function useApiFetch<T>(endpoint: string): State<T> {
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: null });

  useEffect(() => {
    if (!getAuthToken()) return;

    const controller = new AbortController();
    let cancelled = false;

    apiFetch(endpoint, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json() as Promise<T>;
      })
      .then((data) => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch((e: unknown) => {
        if (cancelled) return;
        const msg = e instanceof Error && e.name !== "AbortError"
          ? e.message
          : "Unknown error";
        if (e instanceof Error && e.name === "AbortError") return;
        setState({ data: null, loading: false, error: msg });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [endpoint]);

  return state;
}
