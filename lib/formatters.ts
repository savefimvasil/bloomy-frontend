export const CURRENCY_SYMBOL = "£";

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatPrice(amount: number): string {
  return amount.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCurrency(amount: number): string {
  return `${CURRENCY_SYMBOL}${formatPrice(amount)}`;
}

export function formatPriceNote(note: string | null | undefined): string | null {
  if (!note) return null;
  const n = parseFloat(note.replace(/[^0-9.]/g, ""));
  if (!isNaN(n) && String(n) === note.trim().replace(/[^0-9.]/g, "")) {
    return formatCurrency(n);
  }
  return note;
}

export function relativeTime(dateStr: string, verb = "Updated"): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return `${verb} today`;
  if (days === 1) return `${verb} yesterday`;
  if (days < 30) return `${verb} ${days} days ago`;
  return `${verb} ${formatDate(dateStr)}`;
}
