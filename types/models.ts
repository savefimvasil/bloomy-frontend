export type GardenProject = {
  id: string;
  name: string | null;
  updatedAt: string;
  createdAt: string;
};

export type TilePlan = {
  id: string;
  name: string | null;
  planType: string;
  updatedAt: string;
  createdAt: string;
};
