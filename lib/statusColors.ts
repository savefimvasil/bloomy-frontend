import type { ProposalStatus, RequestStatus } from "@/types/models";

export function proposalStatusColor(s: ProposalStatus): "green" | "sage" | "danger" {
  if (s === "accepted") return "green";
  if (s === "pending") return "sage";
  return "danger";
}

export function requestStatusColor(s: RequestStatus): "green" | "sage" | "danger" {
  if (s === "open") return "green";
  if (s === "awarded") return "sage";
  return "danger";
}
