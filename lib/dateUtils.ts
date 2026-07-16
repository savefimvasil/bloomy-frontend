export function relativeTime(dateStr: string, verb = "Updated"): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return `${verb} today`;
  if (days === 1) return `${verb} yesterday`;
  if (days < 30) return `${verb} ${days} days ago`;
  return `${verb} ${new Date(dateStr).toLocaleDateString(undefined, { day: "numeric", month: "short" })}`;
}
