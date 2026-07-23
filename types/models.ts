export type GardenProject = {
  id: string;
  name: string | null;
  updatedAt: string;
  createdAt: string;
  hasEstimate?: boolean;
  tilePlanIds?: string[];
};

export type TilePlan = {
  id: string;
  name: string | null;
  planType: string;
  updatedAt: string;
  createdAt: string;
};

export type RequestStatus = "open" | "awarded" | "closed";
export type ProposalStatus = "pending" | "accepted" | "rejected";

export type QuoteRequestSummary = {
  id: string;
  title: string;
  gardenProjectId: string;
  postcode: string;
  status: RequestStatus;
  startBy: string | null;
  proposalCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ProposalInRequest = {
  id: string;
  message: string;
  priceNote: string | null;
  timelineDays: number | null;
  status: ProposalStatus;
  createdAt: string;
  contractor: {
    id: string;
    name: string;
    surname: string;
    email?: string;
    businessName: string | null;
    verified: boolean;
    phone: string | null;
  };
};

export type QuoteRequestDetail = {
  id: string;
  title: string;
  gardenProjectId: string;
  postcode: string;
  status: RequestStatus;
  startBy: string | null;
  createdAt: string;
  updatedAt: string;
  calculationResult: import("@bloomy/bloomy-planner").CalculationResult | null;
  proposals: ProposalInRequest[];
};

export type NearbyRequest = {
  id: string;
  title: string;
  postcode: string;
  startBy: string | null;
  status: RequestStatus;
  hasProposed: boolean;
  createdAt: string;
};

export type NearbyRequestDetail = {
  id: string;
  title: string;
  postcode: string;
  startBy: string | null;
  status: RequestStatus;
  createdAt: string;
  projectSummary: { zoneCount: number; zoneSummary: string[] };
  planData: Record<string, unknown> | null;
  calculationResult: import("@bloomy/bloomy-planner").CalculationResult | null;
  myProposal: {
    id: string;
    message: string;
    priceNote: string | null;
    timelineDays: number | null;
    status: ProposalStatus;
  } | null;
};

export type MyProposal = {
  id: string;
  message: string;
  priceNote: string | null;
  timelineDays: number | null;
  status: ProposalStatus;
  createdAt: string;
  request: { id: string; title: string; postcode: string; status: RequestStatus } | null;
};

export type ContractorProfile = {
  id: string;
  userId: string;
  businessName: string;
  bio: string | null;
  postcode: string;
  radiusMiles: number;
  phone: string | null;
  website: string | null;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
};
