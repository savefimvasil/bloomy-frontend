/** Thumbnail SVG placeholders used in cabinet list rows. */

export function TileThumbnail() {
  const tileW = 28, tileH = 18, gap = 3;
  const cols = 3, rows = 4;
  const cells = [];
  for (let r = 0; r < rows; r++) {
    const xOffset = r % 2 === 0 ? 0 : (tileW + gap) / 2;
    for (let c = 0; c < cols; c++) {
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={4 + c * (tileW + gap) + xOffset}
          y={4 + r * (tileH + gap)}
          width={tileW}
          height={tileH}
          rx={2}
          fill="#e8e3db"
          stroke="#d0c9bf"
          strokeWidth={1}
        />
      );
    }
  }
  return (
    <svg viewBox="0 0 96 96" className="h-full w-full" aria-hidden>
      <rect width="96" height="96" fill="#f0ede8" rx="8" />
      {cells}
    </svg>
  );
}

export function ProjectThumbnail() {
  return (
    <svg viewBox="0 0 72 72" className="h-full w-full" aria-hidden>
      <rect width="72" height="72" fill="#f0ede8" rx="6" />
      <line x1="0" y1="24" x2="72" y2="24" stroke="#d8d3cc" strokeWidth="0.5" />
      <line x1="0" y1="48" x2="72" y2="48" stroke="#d8d3cc" strokeWidth="0.5" />
      <line x1="24" y1="0" x2="24" y2="72" stroke="#d8d3cc" strokeWidth="0.5" />
      <line x1="48" y1="0" x2="48" y2="72" stroke="#d8d3cc" strokeWidth="0.5" />
      <polygon
        points="14,20 42,20 42,50 14,50"
        fill="rgba(232,227,219,0.8)"
        stroke="#9c9587"
        strokeWidth="1.5"
      />
      <polygon
        points="44,22 60,22 60,52 44,52"
        fill="rgba(193,224,157,0.8)"
        stroke="#4aaa2d"
        strokeWidth="1.5"
      />
      <circle cx="52" cy="35" r="4" fill="#c5e8a3" stroke="#4aaa2d" strokeWidth="1" />
    </svg>
  );
}
