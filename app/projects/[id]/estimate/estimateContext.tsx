"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams, usePathname } from "next/navigation";
import type {
  GardenPlan,
  GardenZone,
  ConstructionData,
  ZoneSpec,
  ExistingStructure,
  ZoneType,
} from "@bloomy/bloomy-planner";
import { DEFAULT_PARAMS, defaultExistingStructure } from "@bloomy/bloomy-planner";
import { apiFetch } from "@/lib/api";
import { getAuthToken } from "@/store/auth";
import { Spinner } from "@/components/ui/spinner";

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface EstimateContextValue {
  project: ProjectWithConstruction;
  plan: GardenPlan;
  constructionData: ConstructionData;
  loading: boolean;
  saving: boolean;
  steps: WizardStep[];
  currentStepIndex: number;
  updateZoneSpec: (spec: ZoneSpec) => void;
  updateTilePlanAssignment: (zoneId: string, tilePlanId: string | null) => void;
  updateExistingStructure: (structure: ExistingStructure) => void;
  updateToolRentals: (toolId: string, days: number) => void;
  save: () => Promise<void>;
}

const EstimateContext = createContext<EstimateContextValue | null>(null);

// ─── Empty construction data ──────────────────────────────────────────────────

function emptyConstructionData(zones: GardenZone[]): ConstructionData {
  const zoneSpecs: Record<string, ZoneSpec> = {};
  for (const zone of zones) {
    zoneSpecs[zone.id] = {
      zoneId: zone.id,
      type: zone.type as ZoneType,
      params: DEFAULT_PARAMS[zone.type as ZoneType] as ZoneSpec["params"],
    } as ZoneSpec;
  }
  return {
    version: 1,
    zoneSpecs,
    tilePlanAssignments: {},
    existingStructures: {},
    toolRentals: {},
    calculations: null,
  };
}

function parseConstructionData(raw: Record<string, unknown> | null, zones: GardenZone[]): ConstructionData {
  if (!raw || raw.version !== 1) return emptyConstructionData(zones);
  const cd = raw as unknown as ConstructionData;
  // Backfill missing fields from older saves
  if (!cd.toolRentals) cd.toolRentals = {};
  for (const zone of zones) {
    if (!cd.zoneSpecs[zone.id]) {
      cd.zoneSpecs[zone.id] = {
        zoneId: zone.id,
        type: zone.type as ZoneType,
        params: DEFAULT_PARAMS[zone.type as ZoneType] as ZoneSpec["params"],
      } as ZoneSpec;
    }
    // Migrate old tile-patio params
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
  steps.push({ kind: "existing",  label: "Existing materials", href: `/projects/${id}/estimate/existing` });
  steps.push({ kind: "tools",     label: "Tools to rent",      href: `/projects/${id}/estimate/tools` });
  steps.push({ kind: "summary",   label: "Summary",             href: `/projects/${id}/estimate/summary` });
  return steps;
}

const EMPTY_PLAN: GardenPlan = {
  version: 2,
  plannerType: "garden-plan",
  exportedAt: "",
  zones: [],
  objects: [],
  view: { scale: 60, x: 80, y: 60 },
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export function EstimateProvider({ children }: { children: React.ReactNode }) {
  const { id } = useParams() as { id: string };
  const pathname = usePathname();

  const [project, setProject] = useState<ProjectWithConstruction | null>(null);
  const [constructionData, setConstructionData] = useState<ConstructionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) return;
    void apiFetch(`/garden-projects/${id}`)
      .then(res => res.json() as Promise<ProjectWithConstruction>)
      .then(data => {
        setProject(data);
        const plan = (data.planData as unknown as GardenPlan) ?? EMPTY_PLAN;
        setConstructionData(parseConstructionData(data.constructionData, plan.zones ?? []));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const plan = useMemo(
    () => project?.planData ? (project.planData as unknown as GardenPlan) : EMPTY_PLAN,
    [project],
  );

  const steps = useMemo(() => buildWizardSteps(id, plan), [id, plan]);

  const currentStepIndex = useMemo(() => {
    const idx = steps.findIndex(s => pathname.startsWith(s.href));
    return idx === -1 ? 0 : idx;
  }, [steps, pathname]);

  const updateZoneSpec = useCallback((spec: ZoneSpec) => {
    setConstructionData(prev => prev ? { ...prev, zoneSpecs: { ...prev.zoneSpecs, [spec.zoneId]: spec } } : prev);
  }, []);

  const updateTilePlanAssignment = useCallback((zoneId: string, tilePlanId: string | null) => {
    setConstructionData(prev => {
      if (!prev) return prev;
      const assignments = { ...prev.tilePlanAssignments };
      if (tilePlanId) assignments[zoneId] = tilePlanId;
      else delete assignments[zoneId];
      return { ...prev, tilePlanAssignments: assignments };
    });
  }, []);

  const updateExistingStructure = useCallback((structure: ExistingStructure) => {
    setConstructionData(prev => prev ? {
      ...prev,
      existingStructures: { ...prev.existingStructures, [structure.zoneId]: structure },
    } : prev);
  }, []);

  const updateToolRentals = useCallback((toolId: string, days: number) => {
    setConstructionData(prev => {
      if (!prev) return prev;
      const rentals = { ...prev.toolRentals };
      if (days > 0) rentals[toolId] = days;
      else delete rentals[toolId];
      return { ...prev, toolRentals: rentals };
    });
  }, []);

  const save = useCallback(async () => {
    if (!project || !constructionData) return;
    setSaving(true);
    try {
      await apiFetch(`/garden-projects/${id}/construction`, {
        method: "PUT",
        body: { constructionData: constructionData as unknown as Record<string, unknown> },
      });
    } finally {
      setSaving(false);
    }
  }, [id, project, constructionData]);

  if (loading || !project || !constructionData) {
    return <div className="flex h-full items-center justify-center bg-canvas"><Spinner /></div>;
  }

  return (
    <EstimateContext.Provider value={{
      project, plan, constructionData, loading, saving,
      steps, currentStepIndex,
      updateZoneSpec, updateTilePlanAssignment, updateExistingStructure, updateToolRentals, save,
    }}>
      {children}
    </EstimateContext.Provider>
  );
}

export function useEstimate() {
  const ctx = useContext(EstimateContext);
  if (!ctx) throw new Error("useEstimate must be used within EstimateProvider");
  return ctx;
}

export function useEstimateZone(zoneIndex: number) {
  const { plan, constructionData, updateZoneSpec } = useEstimate();
  const zone = plan.zones[zoneIndex];
  const spec = zone ? constructionData.zoneSpecs[zone.id] : undefined;
  return { zone, spec, updateZoneSpec };
}

export { defaultExistingStructure };
