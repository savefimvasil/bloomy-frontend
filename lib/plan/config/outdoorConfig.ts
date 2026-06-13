import type { PlannerConfig } from "./types";

export const outdoorConfig: PlannerConfig = {
  materials: [
    {
      id: "tile",
      label: "Tiles",
      unitLabel: "tiles",
      defaultSize: { kind: "600x600" },
      showChess: true,
      showGrout: true,
      sizes: [
        { key: "600x300",  label: "600×300",  widthMm: 600,  heightMm: 300  },
        { key: "600x600",  label: "600×600",  widthMm: 600,  heightMm: 600  },
        { key: "900x600",  label: "900×600",  widthMm: 900,  heightMm: 600  },
        { key: "1200x600", label: "1200×600", widthMm: 1200, heightMm: 600  },
      ],
      defaultPattern: "straight",
      patterns: [
        {
          id: "straight",
          label: "Straight",
          description: "Standard grid — classic patio layout",
        },
        {
          id: "brick",
          label: "Brick",
          description: "Running bond — rows offset by half a tile",
        },
        {
          id: "diagonal",
          label: "Diagonal",
          description: "45° rotation — dynamic look, square tiles only",
          disabledWhen: "notSquare",
        },
      ],
    },
  ],
};
