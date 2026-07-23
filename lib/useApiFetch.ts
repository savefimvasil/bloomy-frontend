"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

type State<T> =
  | { data: null; loading: true; error: null }
  | { data: T; loading: false; error: null }
  | { data: null; loading: false; error: string };

export function useApiFetch<T>(endpoint: string): State<T> {
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: null });

  useEffect(() => {
    if (!getAuthToken()) return;
    void apiFetch(endpoint)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json() as Promise<T>;
      })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((e: unknown) =>
        setState({ data: null, loading: false, error: e instanceof Error ? e.message : "Unknown error" }),
      );
  }, [endpoint]);

  return state;
}
