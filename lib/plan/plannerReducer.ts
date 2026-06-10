import type { PlannerState, PlannerAction, Vertex } from "./types";
import { computeTiles, computeStats, resolveTileSize } from "./geometry";
import { INITIAL_POLYGON, INITIAL_TILE_SIZE, INITIAL_SCALE, TILE_PRESETS } from "./constants";

function recompute(state: PlannerState): PlannerState {
  const { width, height } = resolveTileSize(state.tileSize, TILE_PRESETS);
  const grout = state.groutMm / 1000;
  const { tiles, tooMany } = computeTiles(
    state.vertices,
    state.patioOffset,
    width,
    height,
    state.rotation,
    state.chessMode,
    grout,
    state.brickOffset
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
    stats: {
      areaSqM: 0, fullTiles: 0, cutPieces: 0, physicalCutTiles: 0, savedTiles: 0,
      totalTiles: 0, plus10: 0, plus15: 0, fullBlack: 0, fullWhite: 0,
      physCutBlack: 0, physCutWhite: 0, hasSmallPieces: false,
    },
    tooManyTiles: false,
    chessMode: false,
    groutMm: 2,
    brickOffset: false,
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
    case "MOVE_VERTEX":
      return recompute({
        ...state,
        vertices: state.vertices.map((v, i) => (i === action.index ? action.vertex : v)),
      });
    case "INSERT_VERTEX": {
      const verts = [...state.vertices];
      verts.splice(action.afterIndex + 1, 0, action.vertex);
      return recompute({ ...state, vertices: verts });
    }
    case "REMOVE_VERTEX":
      if (state.vertices.length <= 3) return state;
      return recompute({ ...state, vertices: state.vertices.filter((_, i) => i !== action.index) });
    case "SET_TILE_SIZE": {
      const { width, height } = resolveTileSize(action.size, TILE_PRESETS);
      const isSquare = Math.abs(width - height) < 1e-6;
      const rotation = isSquare ? state.rotation : 0;
      const brickOffset = rotation === 45 ? false : state.brickOffset;
      return recompute({ ...state, tileSize: action.size, rotation, brickOffset });
    }
    case "SET_ROTATION":
      return recompute({ ...state, rotation: action.rotation, brickOffset: action.rotation === 45 ? false : state.brickOffset });
    case "SET_PATIO_OFFSET":
      return recompute({ ...state, patioOffset: action.offset });
    case "SET_VIEW_TRANSFORM":
      return { ...state, viewTransform: action.transform };
    case "SET_CHESS_MODE":
      return recompute({ ...state, chessMode: action.chessMode });
    case "SET_GROUT":
      return recompute({ ...state, groutMm: Math.max(0, Math.min(6, action.groutMm)) });
    case "SET_BRICK_OFFSET":
      return recompute({ ...state, brickOffset: action.enabled, rotation: action.enabled ? 0 : state.rotation });
    case "SNAP_SHAPE_TO_GRID": {
      const n = state.vertices.length;
      // Find the edge whose angle is farthest from a 90° multiple, then compute rotation to align it
      let minDiff = Infinity;
      let rotationNeeded = 0;
      for (let i = 0; i < n; i++) {
        const [ax, ay] = state.vertices[i];
        const [bx, by] = state.vertices[(i + 1) % n];
        const edgeDeg = Math.atan2(by - ay, bx - ax) * (180 / Math.PI);
        const nearest90 = Math.round(edgeDeg / 90) * 90;
        const diff = Math.abs(edgeDeg - nearest90);
        if (diff < minDiff) { minDiff = diff; rotationNeeded = nearest90 - edgeDeg; }
      }
      if (Math.abs(rotationNeeded) < 0.01) return state;
      let cx = 0, cy = 0;
      for (const [x, y] of state.vertices) { cx += x; cy += y; }
      cx /= n; cy /= n;
      const rad = rotationNeeded * Math.PI / 180;
      const cosA = Math.cos(rad), sinA = Math.sin(rad);
      const newVertices: Vertex[] = state.vertices.map(([x, y]) => {
        const dx = x - cx, dy = y - cy;
        return [
          Math.round((cx + dx * cosA - dy * sinA) * 100) / 100,
          Math.round((cy + dx * sinA + dy * cosA) * 100) / 100,
        ];
      });
      return recompute({ ...state, vertices: newVertices });
    }
    default:
      return state;
  }
}
