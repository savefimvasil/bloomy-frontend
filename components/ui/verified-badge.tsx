export function VerifiedBadge({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-leaf/10 px-2 py-0.5 text-hint text-leaf">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf/10 px-3 py-1 text-sm font-medium text-leaf">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Verified contractor
    </span>
  );
}
