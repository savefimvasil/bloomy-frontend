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

export function proposalStatusLabel(s: ProposalStatus): string {
  if (s === "accepted") return "Accepted";
  if (s === "pending") return "Pending";
  return "Rejected";
}

export function requestStatusLabel(s: RequestStatus): string {
  if (s === "open") return "Open";
  if (s === "awarded") return "Awarded";
  return "Closed";
}
