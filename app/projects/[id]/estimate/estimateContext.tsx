"use client";
// Re-exports for backward compatibility — logic moved to store/estimate.ts
export { useEstimate, useEstimateZone } from "@/store/estimate";
export type { ProjectWithConstruction, WizardStep, WizardStepKind } from "@/store/estimate";
export { defaultExistingStructure } from "@bloomy/bloomy-planner";
