"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { apiFetch } from "@/lib/api";
import { API } from "@/lib/endpoints";
import type { GardenProject, TilePlan, QuoteRequestSummary } from "@/types/models";

interface Slice<T> {
  items: T[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  loaded: boolean;
  total: number;
  currentPage: number;
}

const empty = <T>(): Slice<T> => ({ items: [], loading: false, loadingMore: false, error: null, loaded: false, total: 0, currentPage: 1 });

interface CabinetState {
  projects: Slice<GardenProject>;
  tilePlans: Slice<TilePlan>;
  quoteRequests: Slice<QuoteRequestSummary>;

  fetchProjects: () => Promise<void>;
  fetchTilePlans: () => Promise<void>;
  fetchQuoteRequests: () => Promise<void>;
  loadMoreQuoteRequests: () => Promise<void>;

  removeProject: (id: string) => void;
  removeTilePlan: (id: string) => void;
  removeQuoteRequest: (id: string) => void;

  invalidateProjects: () => void;
  invalidateTilePlans: () => void;

  clearAll: () => void;
}

export const useCabinetStore = create<CabinetState>()((set, get) => ({
  projects: empty(),
  tilePlans: empty(),
  quoteRequests: empty(),

  fetchProjects: async () => {
    if (get().projects.loaded) return;
    set(s => ({ projects: { ...s.projects, loading: true, error: null } }));
    try {
      const res = await apiFetch(API.gardenProjects.list);
      if (!res.ok) {
        set(s => ({ projects: { ...s.projects, loading: false, error: "Failed to load projects" } }));
        return;
      }
      const projects = (await res.json()) as GardenProject[];
      set(s => ({ projects: { ...s.projects, items: projects, loading: false, error: null, loaded: true } }));
    } catch (e) {
      set(s => ({ projects: { ...s.projects, loading: false, error: e instanceof Error ? e.message : "Unknown error" } }));
    }
  },

  fetchTilePlans: async () => {
    if (get().tilePlans.loaded) return;
    set(s => ({ tilePlans: { ...s.tilePlans, loading: true, error: null } }));
    try {
      const res = await apiFetch(API.tilePlans.list);
      if (!res.ok) {
        set(s => ({ tilePlans: { ...s.tilePlans, loading: false, error: "Failed to load plans" } }));
        return;
      }
      const tilePlans = (await res.json()) as TilePlan[];
      set(s => ({ tilePlans: { ...s.tilePlans, items: tilePlans, loading: false, error: null, loaded: true } }));
    } catch (e) {
      set(s => ({ tilePlans: { ...s.tilePlans, loading: false, error: e instanceof Error ? e.message : "Unknown error" } }));
    }
  },

  fetchQuoteRequests: async () => {
    if (get().quoteRequests.loaded) return;
    set(s => ({ quoteRequests: { ...s.quoteRequests, loading: true, error: null } }));
    try {
      const res = await apiFetch(`${API.quoteRequests.mine}?page=1&limit=20`);
      if (!res.ok) {
        set(s => ({ quoteRequests: { ...s.quoteRequests, loading: false, error: "Failed to load requests" } }));
        return;
      }
      const { data, total } = (await res.json()) as { data: QuoteRequestSummary[]; total: number; page: number; limit: number };
      set(s => ({ quoteRequests: { ...s.quoteRequests, items: data, total, currentPage: 1, loading: false, error: null, loaded: true } }));
    } catch (e) {
      set(s => ({ quoteRequests: { ...s.quoteRequests, loading: false, error: e instanceof Error ? e.message : "Unknown error" } }));
    }
  },

  loadMoreQuoteRequests: async () => {
    const { quoteRequests } = get();
    if (quoteRequests.loadingMore || quoteRequests.items.length >= quoteRequests.total) return;
    const nextPage = quoteRequests.currentPage + 1;
    set(s => ({ quoteRequests: { ...s.quoteRequests, loadingMore: true } }));
    try {
      const res = await apiFetch(`${API.quoteRequests.mine}?page=${nextPage}&limit=20`);
      if (!res.ok) { set(s => ({ quoteRequests: { ...s.quoteRequests, loadingMore: false } })); return; }
      const { data, total } = (await res.json()) as { data: QuoteRequestSummary[]; total: number; page: number; limit: number };
      set(s => ({ quoteRequests: { ...s.quoteRequests, items: [...s.quoteRequests.items, ...data], total, currentPage: nextPage, loadingMore: false } }));
    } catch {
      set(s => ({ quoteRequests: { ...s.quoteRequests, loadingMore: false } }));
    }
  },

  removeProject: (id) => set(s => ({ projects: { ...s.projects, items: s.projects.items.filter(p => p.id !== id) } })),
  removeTilePlan: (id) => set(s => ({ tilePlans: { ...s.tilePlans, items: s.tilePlans.items.filter(p => p.id !== id) } })),
  removeQuoteRequest: (id) => set(s => ({ quoteRequests: { ...s.quoteRequests, items: s.quoteRequests.items.filter(r => r.id !== id) } })),

  invalidateProjects: () => set(s => ({ projects: { ...s.projects, loaded: false } })),
  invalidateTilePlans: () => set(s => ({ tilePlans: { ...s.tilePlans, loaded: false } })),

  clearAll: () => set({ projects: empty(), tilePlans: empty(), quoteRequests: empty() }),
}));

export function useProjects() {
  const slice = useCabinetStore(useShallow(s => s.projects));
  const fetch = useCabinetStore(s => s.fetchProjects);
  const remove = useCabinetStore(s => s.removeProject);
  const invalidate = useCabinetStore(s => s.invalidateProjects);
  return { ...slice, fetch, remove, invalidate };
}

export function useTilePlans() {
  const slice = useCabinetStore(useShallow(s => s.tilePlans));
  const fetch = useCabinetStore(s => s.fetchTilePlans);
  const remove = useCabinetStore(s => s.removeTilePlan);
  const invalidate = useCabinetStore(s => s.invalidateTilePlans);
  return { ...slice, fetch, remove, invalidate };
}

export function useQuoteRequests() {
  const slice = useCabinetStore(useShallow(s => s.quoteRequests));
  const fetch = useCabinetStore(s => s.fetchQuoteRequests);
  const loadMore = useCabinetStore(s => s.loadMoreQuoteRequests);
  const remove = useCabinetStore(s => s.removeQuoteRequest);
  const hasMore = slice.items.length < slice.total;
  return { ...slice, fetch, loadMore, remove, hasMore };
}
