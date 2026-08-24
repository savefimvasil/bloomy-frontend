import type { TilePlannerCoreProps } from "@tily/tile-planner";
import type { GardenPlannerCoreProps } from "@bloomy/garden-planner";
import type { PlannerTheme } from "@tily/tile-planner";

interface BloomyTileHandle {
  unmount: () => void;
  update: (partial: Partial<TilePlannerCoreProps>) => void;
}

interface BloomyGardenHandle {
  unmount: () => void;
}

declare global {
  interface Window {
    BloomyPlanner?: {
      mount: (
        target: string | HTMLElement,
        config: TilePlannerCoreProps & { token: string; theme?: PlannerTheme },
      ) => BloomyTileHandle;
    };
    BloomyGardenPlanner?: {
      mount: (
        target: string | HTMLElement,
        config: GardenPlannerCoreProps & { token: string; theme?: PlannerTheme },
      ) => BloomyGardenHandle;
    };
  }
}
