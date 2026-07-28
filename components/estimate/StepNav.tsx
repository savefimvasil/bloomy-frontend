import { Button } from "@/components/ui/button";

interface StepNavProps {
  onBack?: () => void;
  backLabel?: string;
  backDisabled?: boolean;
  onNext?: () => void | Promise<void>;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  nextLoadingLabel?: string;
  /** Replaces the primary forward button with a custom right-side element */
  rightSlot?: React.ReactNode;
}

export function StepNav({
  onBack,
  backLabel = "Previous",
  backDisabled,
  onNext,
  nextLabel = "Save & continue →",
  nextDisabled,
  nextLoading,
  nextLoadingLabel = "Saving…",
  rightSlot,
}: StepNavProps) {
  return (
    <div className="mt-8 flex items-center justify-between">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        disabled={backDisabled || !onBack}
        className="gap-1 text-muted hover:text-ink"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
          <path d="M8 10L3 6l5-4" />
        </svg>
        {backLabel}
      </Button>

      {rightSlot ?? (onNext && (
        <Button onClick={() => void onNext()} disabled={nextDisabled}>
          {nextLoading ? nextLoadingLabel : nextLabel}
        </Button>
      ))}
    </div>
  );
}
