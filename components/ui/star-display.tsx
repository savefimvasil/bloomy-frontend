export function StarDisplay({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="text-amber-500">
      {"★".repeat(rating)}{"☆".repeat(max - rating)}
    </span>
  );
}
