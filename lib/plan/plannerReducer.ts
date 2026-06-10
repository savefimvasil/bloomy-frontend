import type { PlannerState, PlannerAction, PlanType, Vertex } from "./types";
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

export function createInitialState(planType: PlanType = "garden"): PlannerState {
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
    planType,
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

      // Find the longest edge
      let longestSq = -1, longestI = 0;
      for (let i = 0; i < n; i++) {
        const [ax, ay] = state.vertices[i];
        const [bx, by] = state.vertices[(i + 1) % n];
        const sq = (bx - ax) ** 2 + (by - ay) ** 2;
        if (sq > longestSq) { longestSq = sq; longestI = i; }
      }

      // Rotation angle that makes the longest edge horizontal
      const [ax, ay] = state.vertices[longestI];
      const [bx, by] = state.vertices[(longestI + 1) % n];
      const rotRad = -Math.atan2(by - ay, bx - ax);

      // Centroid — rotate around it so the shape stays centred
      let cx = 0, cy = 0;
      for (const [x, y] of state.vertices) { cx += x; cy += y; }
      cx /= n; cy /= n;

      const cosR = Math.cos(rotRad), sinR = Math.sin(rotRad);
      let verts: Vertex[] = state.vertices.map(([x, y]) => {
        const dx = x - cx, dy = y - cy;
        return [cx + dx * cosR - dy * sinR, cy + dx * sinR + dy * cosR];
      });

      // Ensure longest edge is at the visual bottom (higher Y in SVG = lower on screen)
      const edgeMidY = (verts[longestI][1] + verts[(longestI + 1) % n][1]) / 2;
      if (edgeMidY < cy) {
        // Edge ended up above the centroid — flip 180° around centroid
        verts = verts.map(([x, y]) => [2 * cx - x, 2 * cy - y]);
      }

      const newVertices: Vertex[] = verts.map(([x, y]) => [
        Math.round(x * 100) / 100,
        Math.round(y * 100) / 100,
      ]);
      return recompute({ ...state, vertices: newVertices });
    }
    case "SET_PLAN_TYPE":
      return { ...state, planType: action.planType };
    case "LOAD_PLAN": {
      const { plan } = action;
      const base: PlannerState = {
        ...createInitialState(plan.planType),
        planType: plan.planType,
        vertices: plan.shape.vertices as Vertex[],
        patioOffset: plan.shape.offset as Vertex,
        tileSize: plan.tiles.size,
        rotation: plan.tiles.rotation,
        chessMode: plan.tiles.chessMode,
        groutMm: plan.tiles.groutMm,
        brickOffset: plan.tiles.brickOffset,
        ...(plan.view ? { viewTransform: plan.view } : {}),
      };
      return recompute(base);
    }
    default:
      return state;
  }
}
