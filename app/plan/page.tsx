import type { Metadata } from "next";
import { PlannerEntry } from "@/components/plan/PlannerEntry";

export const metadata: Metadata = {
  title: "Tile Planner — Bloomy Garden",
  description: "Design your patio tile layout with accurate cut tile calculations.",
};

export default function PlanRoute() {
  return <PlannerEntry />;
}
