import type { PlannerState, PlannerAction, Vertex } from "./types";
import { computeTiles, computeStats, resolveTileSize } from "./geometry";
import { INITIAL_POLYGON, INITIAL_TILE_SIZE, INITIAL_SCALE, TILE_PRESETS } from "./constants";

function recompute(state: PlannerState): PlannerState {
  const { width, height } = resolveTileSize(state.tileSize, TILE_PRESETS);
  const { tiles, tooMany } = computeTiles(
    state.vertices,
    state.patioOffset,
    width,
    height,
    state.rotation,
    state.chessMode
  );
  const stats = computeStats(tiles, state.vertices, state.patioOffset, state.chessMode);
  return { ...state, tiles, stats, tooManyTiles: tooMany };
}

export function createInitialState(): PlannerState {
  const base: PlannerState = {
    vertices: INITIAL_POLYGON,
    tileSize: INITIAL_TILE_SIZE,
    rotation: 0,
    patioOffset: [0, 0],
    viewTransform: { x: 60, y: 60, scale: INITIAL_SCALE },
    tiles: [],
    stats: { areaSqM: 0, fullTiles: 0, cutPieces: 0, physicalCutTiles: 0, savedTiles: 0, totalTiles: 0, plus10: 0, plus15: 0, fullBlack: 0, fullWhite: 0, physCutBlack: 0, physCutWhite: 0, hasSmallPieces: false },
    tooManyTiles: false,
    chessMode: false,
  };
  return recompute(base);
}

export function plannerReducer(state: PlannerState, action: PlannerAction): PlannerState {
  switch (action.type) {
    case "SET_VERTEX": {
      const updated: Vertex[] = state.vertices.map((v, i) =>
        i === action.index
          ? (action.axis === "x" ? [action.value, v[1]] : [v[0], action.value])
          : v
      );
      return recompute({ ...state, vertices: updated });
    }
    case "MOVE_VERTEX": {
      return recompute({
        ...state,
        vertices: state.vertices.map((v, i) => (i === action.index ? action.vertex : v)),
      });
    }
    case "INSERT_VERTEX": {
      const verts = [...state.vertices];
      verts.splice(action.afterIndex + 1, 0, action.vertex);
      return recompute({ ...state, vertices: verts });
    }
    case "REMOVE_VERTEX": {
      if (state.vertices.length <= 3) return state;
      return recompute({ ...state, vertices: state.vertices.filter((_, i) => i !== action.index) });
    }
    case "SET_TILE_SIZE": {
      const { width, height } = resolveTileSize(action.size, TILE_PRESETS);
      const isSquare = Math.abs(width - height) < 1e-6;
      const rotation = isSquare ? state.rotation : 0;
      return recompute({ ...state, tileSize: action.size, rotation });
    }
    case "SET_ROTATION":
      return recompute({ ...state, rotation: action.rotation });
    case "SET_PATIO_OFFSET":
      return recompute({ ...state, patioOffset: action.offset });
    case "SET_VIEW_TRANSFORM":
      return { ...state, viewTransform: action.transform };
    case "SET_CHESS_MODE":
      return recompute({ ...state, chessMode: action.chessMode });
    default:
      return state;
  }
}
