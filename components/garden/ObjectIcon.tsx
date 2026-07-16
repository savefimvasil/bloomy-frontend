import type { ObjectType } from "./types";

interface Props {
  type: ObjectType;
  cx: number;
  cy: number;
  selected: boolean;
  scale: number;          // pixels per metre (view.scale)
  size?: [number, number]; // [width, depth] in metres
}

export function ObjectIcon({ type, cx, cy, selected, scale, size }: Props) {
  const accent = selected ? "#234a2e" : "#5a9466";
  const bg = selected ? "#c5e8a3" : "white";

  switch (type) {
    case "tree":
      return (
        <g>
          <circle cx={cx} cy={cy - 4} r={10} fill="#c5e8a3" stroke={accent} strokeWidth={1.5} />
          <line x1={cx} y1={cy + 6} x2={cx} y2={cy + 14} stroke="#8b6914" strokeWidth={2} />
        </g>
      );
    case "shrub":
      return (
        <g>
          <circle cx={cx - 4} cy={cy + 2} r={6} fill="#c5e8a3" stroke={accent} strokeWidth={1.5} />
          <circle cx={cx + 4} cy={cy + 2} r={6} fill="#c5e8a3" stroke={accent} strokeWidth={1.5} />
          <circle cx={cx} cy={cy - 3} r={7} fill="#c5e8a3" stroke={accent} strokeWidth={1.5} />
        </g>
      );
    case "bench": {
      const hw = size ? (size[0] * scale) / 2 : 10;
      return (
        <g>
          <rect x={cx - hw} y={cy - 2} width={hw * 2} height={5} rx={1} fill={bg} stroke={accent} strokeWidth={1.5} />
          <line x1={cx - hw + 3} y1={cy + 3} x2={cx - hw + 3} y2={cy + 9} stroke={accent} strokeWidth={1.5} />
          <line x1={cx + hw - 3} y1={cy + 3} x2={cx + hw - 3} y2={cy + 9} stroke={accent} strokeWidth={1.5} />
        </g>
      );
    }
    case "pergola": {
      const hw = size ? (size[0] * scale) / 2 : 11;
      const hh = size ? (size[1] * scale) / 2 : 11;
      return (
        <g>
          <rect x={cx - hw} y={cy - hh} width={hw * 2} height={hh * 2} fill="none" stroke={accent} strokeWidth={1.5} strokeDasharray="4 2" />
          <circle cx={cx - hw} cy={cy - hh} r={2.5} fill={accent} />
          <circle cx={cx + hw} cy={cy - hh} r={2.5} fill={accent} />
          <circle cx={cx - hw} cy={cy + hh} r={2.5} fill={accent} />
          <circle cx={cx + hw} cy={cy + hh} r={2.5} fill={accent} />
        </g>
      );
    }
    case "shed": {
      const hw = size ? (size[0] * scale) / 2 : 9;
      const hh = size ? (size[1] * scale) / 2 : 7;
      const roofH = Math.min(hw, 14);
      return (
        <g>
          <rect x={cx - hw} y={cy - hh + roofH} width={hw * 2} height={hh * 2 - roofH} fill={bg} stroke={accent} strokeWidth={1.5} />
          <polygon points={`${cx - hw - 1},${cy - hh + roofH} ${cx},${cy - hh} ${cx + hw + 1},${cy - hh + roofH}`} fill={bg} stroke={accent} strokeWidth={1.5} />
        </g>
      );
    }
    case "pond": {
      const rx = size ? (size[0] * scale) / 2 : 12;
      const ry = size ? (size[1] * scale) / 2 : 8;
      return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#bde4f4" stroke="#4da4cc" strokeWidth={1.5} />;
    }
    case "compost":
      return <rect x={cx - 7} y={cy - 7} width={14} height={14} rx={2} fill="#d4b483" stroke="#8b6914" strokeWidth={1.5} />;
    case "bbq":
      return (
        <g>
          <path d={`M ${cx - 9} ${cy} A 9 9 0 0 1 ${cx + 9} ${cy} Z`} fill={bg} stroke={accent} strokeWidth={1.5} />
          <line x1={cx - 6} y1={cy + 1} x2={cx - 4} y2={cy + 12} stroke={accent} strokeWidth={1.5} />
          <line x1={cx + 6} y1={cy + 1} x2={cx + 4} y2={cy + 12} stroke={accent} strokeWidth={1.5} />
        </g>
      );
    case "water-feature":
      return (
        <g>
          <circle cx={cx} cy={cy} r={11} fill="#bde4f4" stroke="#4da4cc" strokeWidth={1.5} />
          <circle cx={cx} cy={cy} r={5} fill="none" stroke="#4da4cc" strokeWidth={1} />
          <circle cx={cx} cy={cy} r={1.5} fill="#4da4cc" />
        </g>
      );
    default:
      return <circle cx={cx} cy={cy} r={8} fill={bg} stroke={accent} strokeWidth={1.5} />;
  }
}
