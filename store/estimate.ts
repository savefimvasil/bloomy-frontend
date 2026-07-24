"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { usePathname } from "next/navigation";
import type {
  GardenPlan,
  GardenZone,
  ConstructionData,
  ZoneSpec,
  ExistingStructure,
  ZoneType,
} from "@bloomy/bloomy-planner";
import { DEFAULT_PARAMS } from "@bloomy/bloomy-planner";
import { apiFetch } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ProjectWithConstruction {
  id: string;
  name: string | null;
  planData: Record<string, unknown> | null;
  constructionData: Record<string, unknown> | null;
}

export type WizardStepKind = "zone" | "tile-plans" | "existing" | "tools" | "summary";

export interface WizardStep {
  kind: WizardStepKind;
  label: string;
  href: string;
  zoneIndex?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const EMPTY_PLAN: GardenPlan = {
  version: 2, plannerType: "garden-plan", exportedAt: "",
  zones: [], objects: [], view: { scale: 60, x: 80, y: 60 },
};

function emptyConstructionData(zones: GardenZone[]): ConstructionData {
  const zoneSpecs: Record<string, ZoneSpec> = {};
  for (const zone of zones) {
    zoneSpecs[zone.id] = {
      zoneId: zone.id,
      type: zone.type as ZoneType,
      params: DEFAULT_PARAMS[zone.type as ZoneType] as ZoneSpec["params"],
    } as ZoneSpec;
  }
  return { version: 1, zoneSpecs, tilePlanAssignments: {}, existingStructures: {}, toolRentals: {}, calculations: null };
}

function parseConstructionData(raw: Record<string, unknown> | null, zones: GardenZone[]): ConstructionData {
  if (!raw || raw.version !== 1) return emptyConstructionData(zones);
  const cd = raw as unknown as ConstructionData;
  if (!cd.toolRentals) cd.toolRentals = {};
  for (const zone of zones) {
    if (!cd.zoneSpecs[zone.id]) {
      cd.zoneSpecs[zone.id] = {
        zoneId: zone.id,
        type: zone.type as ZoneType,
        params: DEFAULT_PARAMS[zone.type as ZoneType] as ZoneSpec["params"],
      } as ZoneSpec;
    }
    const spec = cd.zoneSpecs[zone.id];
    if (spec?.type === "tile-patio") {
      const p = spec.params as unknown as Record<string, unknown>;
      if (p.bedDepthMm === undefined) p.bedDepthMm = p.sandBedDepthMm ?? 30;
      if (p.surfaceMaterial === undefined) p.surfaceMaterial = "natural-stone";
      if (p.basement === undefined) p.basement = "mortar-bed";
      if (p.includeTiles === undefined) p.includeTiles = false;
    }
  }
  return cd;
}

function buildWizardSteps(id: string, plan: GardenPlan): WizardStep[] {
  const steps: WizardStep[] = [];
  plan.zones.forEach((zone, i) => {
    steps.push({ kind: "zone", label: zone.label, href: `/projects/${id}/estimate/zones/${i}`, zoneIndex: i });
  });
  if (plan.zones.some(z => z.type === "tile-patio")) {
    steps.push({ kind: "tile-plans", label: "Tile plans", href: `/projects/${id}/estimate/tile-plans` });
  }
  steps.push({ kind: "existing", label: "Existing materials", href: `/projects/${id}/estimate/existing` });
  steps.push({ kind: "tools", label: "Tools to rent", href: `/projects/${id}/estimate/tools` });
  steps.push({ kind: "summary", label: "Summary", href: `/projects/${id}/estimate/summary` });
  return steps;
}

// ─── Store ───────────────────────────────────────────────────────────────────

interface EstimateState {
  projectId: string | null;
  project: ProjectWithConstruction | null;
  constructionData: ConstructionData | null;
  loading: boolean;
  saving: boolean;

  init: (id: string) => Promise<void>;
  reset: () => void;
  updateZoneSpec: (spec: ZoneSpec) => void;
  updateTilePlanAssignment: (zoneId: string, tilePlanId: string | null) => void;
  updateExistingStructure: (structure: ExistingStructure) => void;
  updateToolRentals: (toolId: string, days: number) => void;
  save: () => Promise<void>;
}

export const useEstimateStore = create<EstimateState>()((set, get) => ({
  projectId: null,
  project: null,
  constructionData: null,
  loading: false,
  saving: false,

  init: async (id) => {
    if (get().projectId === id && get().project !== null) return;
    set({ projectId: id, loading: true, project: null, constructionData: null });
    const res = await apiFetch(`/garden-projects/${id}`);
    const data = (await res.json()) as ProjectWithConstruction;
    const plan = (data.planData as unknown as GardenPlan) ?? EMPTY_PLAN;
    set({ project: data, constructionData: parseConstructionData(data.constructionData, plan.zones ?? []), loading: false });
  },

  reset: () => set({ projectId: null, project: null, constructionData: null, loading: false, saving: false }),

  updateZoneSpec: (spec) => set(s => s.constructionData
    ? { constructionData: { ...s.constructionData, zoneSpecs: { ...s.constructionData.zoneSpecs, [spec.zoneId]: spec } } }
    : {}
  ),

  updateTilePlanAssignment: (zoneId, tilePlanId) => set(s => {
    if (!s.constructionData) return {};
    const assignments = { ...s.constructionData.tilePlanAssignments };
    if (tilePlanId) assignments[zoneId] = tilePlanId;
    else delete assignments[zoneId];
    return { constructionData: { ...s.constructionData, tilePlanAssignments: assignments } };
  }),

  updateExistingStructure: (structure) => set(s => s.constructionData
    ? { constructionData: { ...s.constructionData, existingStructures: { ...s.constructionData.existingStructures, [structure.zoneId]: structure } } }
    : {}
  ),

  updateToolRentals: (toolId, days) => set(s => {
    if (!s.constructionData) return {};
    const rentals = { ...s.constructionData.toolRentals };
    if (days > 0) rentals[toolId] = days;
    else delete rentals[toolId];
    return { constructionData: { ...s.constructionData, toolRentals: rentals } };
  }),

  save: async () => {
    const { projectId, project, constructionData } = get();
    if (!projectId || !project || !constructionData) return;
    set({ saving: true });
    try {
      await apiFetch(`/garden-projects/${projectId}/construction`, {
        method: "PUT",
        body: { constructionData: constructionData as unknown as Record<string, unknown> },
      });
    } finally {
      set({ saving: false });
    }
  },
}));

// ─── Convenience hooks (same API as old useEstimate / useEstimateZone) ───────

export function useEstimate() {
  const pathname = usePathname();
  const store = useEstimateStore();

  const plan = useMemo(
    () => store.project?.planData ? (store.project.planData as unknown as GardenPlan) : EMPTY_PLAN,
    [store.project],
  );

  const steps = useMemo(
    () => store.projectId ? buildWizardSteps(store.projectId, plan) : [],
    [store.projectId, plan],
  );

  const currentStepIndex = useMemo(() => {
    const idx = steps.findIndex(s => pathname.startsWith(s.href));
    return idx === -1 ? 0 : idx;
  }, [steps, pathname]);

  return {
    project: store.project!,
    plan,
    constructionData: store.constructionData!,
    loading: store.loading,
    saving: store.saving,
    steps,
    currentStepIndex,
    updateZoneSpec: store.updateZoneSpec,
    updateTilePlanAssignment: store.updateTilePlanAssignment,
    updateExistingStructure: store.updateExistingStructure,
    updateToolRentals: store.updateToolRentals,
    save: store.save,
  };
}

export function useEstimateZone(zoneIndex: number) {
  const { plan, constructionData, updateZoneSpec } = useEstimate();
  const zone = plan.zones[zoneIndex];
  const spec = zone ? constructionData.zoneSpecs[zone.id] : undefined;
  return { zone, spec, updateZoneSpec };
}
