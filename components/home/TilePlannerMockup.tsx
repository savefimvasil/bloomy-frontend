const STATS = [
  { label: "Whole tiles", value: "84" },
  { label: "Cut tiles", value: "22" },
  { label: "Area", value: "13.0 m²" },
];

export function TilePlannerMockup() {
  return (
    <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-paper shadow-soft">
      <div className="bg-forest/8 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-muted">
        Garden plan · 4.2 × 3.1 m
      </div>

      <div className="p-6">
        <svg viewBox="0 0 320 220" className="w-full" aria-hidden="true">
          <rect width="320" height="220" fill="#fbfdf7" />
          {Array.from({ length: 8 }, (_, row) =>
            Array.from({ length: 9 }, (_, col) => {
              const isChess = (row + col) % 2 === 0;
              const x = col * 36 + (row % 2 === 0 ? 0 : 18);
              const y = row * 28 + 4;
              if (x > 320) return null;
              return (
                <rect
                  key={`${row}-${col}`}
                  x={x + 1}
                  y={y + 1}
                  width={34}
                  height={26}
                  rx={1}
                  fill={isChess ? "#d4e2c4" : "#e5edd9"}
                  stroke="#c8d8b4"
                  strokeWidth={0.5}
                />
              );
            })
          )}
          <polygon
            points="20,20 280,20 280,180 180,180 180,120 20,120"
            fill="none"
            stroke="#1f4d2c"
            strokeWidth={2.5}
            strokeDasharray="6 3"
          />
        </svg>
      </div>

      <div className="grid grid-cols-3 divide-x divide-line border-t border-line">
        {STATS.map((stat) => (
          <div key={stat.label} className="px-3 py-3 text-center">
            <p className="text-lg font-semibold text-forest">{stat.value}</p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
