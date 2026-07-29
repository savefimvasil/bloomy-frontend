// Cabinet nav icons — extracted here so layout.tsx and other files can share them.

export function DashboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <rect x="1" y="1" width="6" height="6" rx="1.5" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" />
    </svg>
  );
}

export function TilePlansIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" />
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" />
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" />
      <rect x="9" y="9" width="5.5" height="5.5" rx="1" />
    </svg>
  );
}

export function ProjectsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 4.5C2 3.67 2.67 3 3.5 3H6L7.5 4.5H12.5C13.33 4.5 14 5.17 14 6V11.5C14 12.33 13.33 13 12.5 13H3.5C2.67 13 2 12.33 2 11.5V4.5Z" />
    </svg>
  );
}

export function EstimatesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="12" height="12" rx="2" />
      <line x1="5" y1="5.5" x2="11" y2="5.5" />
      <line x1="5" y1="8" x2="9" y2="8" />
      <line x1="5" y1="10.5" x2="10" y2="10.5" />
    </svg>
  );
}

export function JobsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="5" width="12" height="9" rx="1.5" />
      <path d="M5 5V4C5 2.9 5.9 2 7 2H9C10.1 2 11 2.9 11 4V5" />
      <line x1="8" y1="8" x2="8" y2="11" />
      <line x1="6.5" y1="9.5" x2="9.5" y2="9.5" />
    </svg>
  );
}

export function BrowseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="7" cy="7" r="4.5" />
      <path d="M12.5 12.5L10.5 10.5" />
    </svg>
  );
}

export function QuotesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 2H14V11H9L6 14V11H2V2Z" />
      <line x1="5" y1="5.5" x2="11" y2="5.5" />
      <line x1="5" y1="8" x2="9" y2="8" />
    </svg>
  );
}

export function ProfileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <circle cx="8" cy="5.5" r="2.5" />
      <path d="M2 13.5C2 11.3 4.7 9.5 8 9.5s6 1.8 6 4" />
    </svg>
  );
}

export function ReviewsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 2L9.5 5.5H13.5L10.3 7.7L11.5 11.5L8 9L4.5 11.5L5.7 7.7L2.5 5.5H6.5L8 2Z" />
    </svg>
  );
}

export function SavedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 12L3 7.5C3 5.5 4.5 4 6.5 4C7.4 4 8 4.5 8 4.5C8 4.5 8.6 4 9.5 4C11.5 4 13 5.5 13 7.5L8 12Z" />
    </svg>
  );
}

export function BellNavIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 1a5 5 0 0 0-5 5v2.5L1.5 10v1h13v-1L13 8.5V6a5 5 0 0 0-5-5zm0 14a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2z" />
    </svg>
  );
}

export function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 2.5H11.5C12.33 2.5 13 3.17 13 4V11C13 11.83 12.33 12.5 11.5 12.5H9" />
      <polyline points="6,5 9,7.5 6,10" />
      <line x1="1.5" y1="7.5" x2="9" y2="7.5" />
    </svg>
  );
}

export function UserIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
      <circle cx="6.5" cy="4.5" r="2.5" />
      <path d="M1.5 11.5C1.5 9.29 3.74 7.5 6.5 7.5s5 1.79 5 4" />
    </svg>
  );
}

export function CabinetIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
      <rect x="0" y="0" width="5" height="5" rx="1.5" />
      <rect x="7" y="0" width="5" height="5" rx="1.5" />
      <rect x="0" y="7" width="5" height="5" rx="1.5" />
      <rect x="7" y="7" width="5" height="5" rx="1.5" />
    </svg>
  );
}

export function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 1a5 5 0 0 0-5 5v2.5L1.5 10v1h13v-1L13 8.5V6a5 5 0 0 0-5-5zm0 14a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2z" />
    </svg>
  );
}

export function DirectRequestsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 2H10V9H7L5 11V9H2V2Z" />
      <path d="M10 5H13.5C13.78 5 14 5.22 14 5.5V11L12 9.5H10V5Z" />
    </svg>
  );
}
