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

export type RequestStatus = "open" | "awarded" | "in_progress" | "completed" | "closed";
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
  isDirectRequest: boolean;
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
    avgRating: number | null;
    reviewCount: number;
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
  photoUrls: string[];
  completionPhotoUrls: string[];
  calculationResult: import("@bloomy/garden-planner").CalculationResult | null;
  proposals: ProposalInRequest[];
  isDirectRequest: boolean;
  note: string | null;
};

export type NearbyRequest = {
  id: string;
  title: string;
  postcode: string;
  startBy: string | null;
  status: RequestStatus;
  hasProposed: boolean;
  distanceMiles: number | null;
  createdAt: string;
};

export type NearbyRequestDetail = {
  id: string;
  title: string;
  postcode: string;
  startBy: string | null;
  status: RequestStatus;
  createdAt: string;
  photoUrls: string[];
  completionPhotoUrls: string[];
  projectSummary: { zoneCount: number; zoneSummary: string[] };
  planData: Record<string, unknown> | null;
  calculationResult: import("@bloomy/garden-planner").CalculationResult | null;
  isDirectRequest: boolean;
  note: string | null;
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

export type ChatRoomSummary = {
  id: string;
  jobId: string;
  jobTitle: string;
  otherPartyId: string;
  otherPartyName: string;
  lastMessageAt: string;
  createdAt: string;
  unreadCount: number;
};

export type ChatMessage = {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
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

export type NearbyContractor = {
  id: string;
  userId: string;
  businessName: string;
  bio: string | null;
  postcode: string;
  verified: boolean;
  distanceMiles: number;
};

export type JobReview = {
  id: string;
  jobId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export type JobQuestion = {
  id: string;
  jobId: string;
  contractorId: string;
  contractorName: string;
  question: string;
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
};

export type DocType = "insurance" | "dbs" | "trade-membership" | "id";
export type DocStatus = "pending" | "approved" | "rejected";

export type VerificationDocument = {
  id: string;
  type: DocType;
  description: string;
  status: DocStatus;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
};
