import type { PlannerConfig } from "./types";

export const indoorConfig: PlannerConfig = {
  materials: [
    {
      id: "tile",
      label: "Tiles",
      unitLabel: "tiles",
      defaultSize: { kind: "600x600" },
      showChess: true,
      showGrout: true,
      sizes: [
        { key: "300x300",  label: "300×300",  widthMm: 300,  heightMm: 300  },
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
          description: "Standard grid — most common, minimal waste",
        },
        {
          id: "brick",
          label: "Brick",
          description: "Running bond — rows offset by half a tile, popular for rectangular tiles",
        },
        {
          id: "diagonal",
          label: "Diagonal",
          description: "45° rotation — visually enlarges small rooms, ~15% more waste",
          disabledWhen: "notSquare",
        },
        {
          id: "herringbone",
          label: "Herringbone",
          description: "Classic V-pattern — decorative, works for any tile shape",
        },
      ],
    },
    {
      id: "laminate",
      label: "Laminate",
      unitLabel: "boards",
      defaultSize: { kind: "1285x192" },
      showChess: false,
      showGrout: false,
      sizes: [
        { key: "1285x192", label: "1285×192", widthMm: 1285, heightMm: 192 },
        { key: "1380x193", label: "1380×193", widthMm: 1380, heightMm: 193 },
        { key: "900x150",  label: "900×150",  widthMm: 900,  heightMm: 150 },
        { key: "2050x205", label: "2050×205", widthMm: 2050, heightMm: 205 },
      ],
      defaultPattern: "brick",
      patterns: [
        {
          id: "straight",
          label: "Straight",
          description: "Parallel rows, no offset — clean look but joints align",
        },
        {
          id: "brick",
          label: "Running bond",
          description: "1/2 offset — most popular for laminate, disguises expansion joints",
        },
        {
          id: "herringbone",
          label: "Herringbone",
          description: "Classic parquet V-pattern — premium look, more cuts required",
        },
        {
          id: "diagonal",
          label: "Diagonal",
          description: "45° layout — visually opens the room, ~15% more waste",
        },
      ],
    },
  ],
};
