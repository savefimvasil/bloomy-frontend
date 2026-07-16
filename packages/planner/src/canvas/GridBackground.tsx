"use client";

interface Props {
  view: { x: number; y: number; scale: number };
  width: number;
  height: number;
  /** Unique prefix for SVG pattern IDs — must differ between concurrent instances. */
  id?: string;
}

export function GridBackground({ view, width, height, id = "grid" }: Props) {
  const { x, y, scale } = view;
  const minor = scale * 0.5;
  const major = scale;
  return (
    <g>
      <defs>
        <pattern id={`${id}-minor`} width={minor} height={minor} patternUnits="userSpaceOnUse" x={x % minor} y={y % minor}>
          <path d={`M ${minor} 0 L 0 0 0 ${minor}`} fill="none" stroke="#d8d3cc" strokeWidth="0.5" />
        </pattern>
        <pattern id={`${id}-major`} width={major} height={major} patternUnits="userSpaceOnUse" x={x % major} y={y % major}>
          <rect width={major} height={major} fill={`url(#${id}-minor)`} />
          <path d={`M ${major} 0 L 0 0 0 ${major}`} fill="none" stroke="#c8c3bb" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={width} height={height} fill="#f4f2ec" />
      <rect width={width} height={height} fill={`url(#${id}-major)`} />
    </g>
  );
}
