export function RegisterSteps({ current, total = 4 }: { current: number; total?: number }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all ${
              i < current ? "w-8 bg-forest" : "w-4 bg-line"
            }`}
          />
        ))}
      </div>
      <span className="text-hint text-muted">
        Step {current} of {total}
      </span>
    </div>
  );
}
