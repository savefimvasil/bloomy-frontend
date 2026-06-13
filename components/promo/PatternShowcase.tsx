function PatternStraight() {
  const cols = 4, rows = 4, gap = 3, size = 17;
  const cells = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      cells.push(<rect key={`${r}-${c}`} x={2 + c * (size + gap)} y={2 + r * (size + gap)} width={size} height={size} rx={1} />);
  return <svg viewBox="0 0 82 82" className="h-full w-full" fill="currentColor">{cells}</svg>;
}

function PatternBrick() {
  const w = 36, h = 16, gap = 3;
  const rows = [
    [{ x: 2 }, { x: 2 + w + gap }],
    [{ x: 2 - (w + gap) / 2 }, { x: 2 + (w + gap) / 2 }, { x: 2 + (w + gap) * 1.5 }],
    [{ x: 2 }, { x: 2 + w + gap }],
    [{ x: 2 - (w + gap) / 2 }, { x: 2 + (w + gap) / 2 }, { x: 2 + (w + gap) * 1.5 }],
  ];
  return (
    <svg viewBox="0 0 82 82" className="h-full w-full" fill="currentColor">
      <clipPath id="bp"><rect x="0" y="0" width="82" height="82" /></clipPath>
      <g clipPath="url(#bp)">
        {rows.map((row, ri) => row.map((cell, ci) => (
          <rect key={`${ri}-${ci}`} x={cell.x} y={2 + ri * (h + gap)} width={w} height={h} rx={1} />
        )))}
      </g>
    </svg>
  );
}

function PatternDiagonal() {
  const size = 18, gap = 3;
  const cells = [];
  for (let r = -1; r < 5; r++)
    for (let c = -1; c < 5; c++) {
      const cx = 41 + (c - r) * (size + gap) * 0.707;
      const cy = 41 + (c + r) * (size + gap) * 0.707;
      cells.push(<rect key={`${r}-${c}`} x={cx - size / 2} y={cy - size / 2} width={size} height={size} rx={1} transform={`rotate(45 ${cx} ${cy})`} />);
    }
  return (
    <svg viewBox="0 0 82 82" className="h-full w-full" fill="currentColor">
      <clipPath id="dp"><rect x="0" y="0" width="82" height="82" /></clipPath>
      <g clipPath="url(#dp)">{cells}</g>
    </svg>
  );
}

const PATTERNS = [
  { id: "straight", label: "Straight", description: "Classic grid — minimal waste, maximum clarity.", preview: <PatternStraight /> },
  { id: "brick",    label: "Running bond", description: "Offset rows — the most popular choice for rectangular tiles.", preview: <PatternBrick /> },
  { id: "diagonal", label: "Diagonal", description: "45° rotation — visually enlarges small spaces. Square tiles only.", preview: <PatternDiagonal /> },
];

export function PatternShowcase() {
  return (
    <section className="bg-canvas py-24">
      <div className="container">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">Installation patterns</p>
        <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Three ways to lay your floor
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
          Every pattern is visualised live on the canvas and calculated automatically — switch between them in one click.
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {PATTERNS.map(p => (
            <div key={p.id} className="flex flex-col gap-4 overflow-hidden rounded-xl border border-line bg-paper p-5 text-ink transition hover:border-leaf/50 hover:shadow-soft">
              <div className="h-20 w-20 rounded-lg bg-canvas p-2 text-leaf">{p.preview}</div>
              <div>
                <p className="font-semibold text-ink">{p.label}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
