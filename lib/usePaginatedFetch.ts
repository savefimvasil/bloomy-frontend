"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getAuthToken } from "@/store/auth";

export interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface PaginatedState<T> {
  items: T[];
  total: number;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
}

export function usePaginatedFetch<T>(endpoint: string, limit = 20) {
  const pageRef = useRef(1);
  const [state, setState] = useState<PaginatedState<T>>({
    items: [],
    total: 0,
    loading: true,
    loadingMore: false,
    error: null,
    hasMore: false,
  });

  const load = useCallback(
    async (pageNum: number, append: boolean) => {
      if (!getAuthToken()) return;
      setState((s) => ({
        ...s,
        loading: !append,
        loadingMore: append,
        error: null,
      }));
      try {
        const res = await apiFetch(`${endpoint}?page=${pageNum}&limit=${limit}`);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const json = (await res.json()) as PagedResponse<T>;
        setState((s) => {
          const nextItems = append ? [...s.items, ...json.data] : json.data;
          return {
            items: nextItems,
            total: json.total,
            loading: false,
            loadingMore: false,
            error: null,
            hasMore: nextItems.length < json.total,
          };
        });
        pageRef.current = json.page;
      } catch (e) {
        setState((s) => ({
          ...s,
          loading: false,
          loadingMore: false,
          error: e instanceof Error ? e.message : "Unknown error",
        }));
      }
    },
    [endpoint, limit],
  );

  useEffect(() => {
    void load(1, false);
  }, [load]);

  const loadMore = useCallback(() => {
    void load(pageRef.current + 1, true);
  }, [load]);

  const reload = useCallback(() => {
    pageRef.current = 1;
    void load(1, false);
  }, [load]);

  return { ...state, loadMore, reload };
}
