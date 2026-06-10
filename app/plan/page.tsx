"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

const PLAN_TYPES = [
  {
    type: "garden",
    label: "Garden / Outdoor",
    description: "Patios, terraces, garden paths, pool surrounds",
    icon: "🌿",
    tileHint: "Standard sizes: 600×600, 900×600 mm",
    disabled: false,
  },
  {
    type: "indoor",
    label: "Indoor",
    description: "Bathrooms, kitchens, hallways, living rooms",
    icon: "🏠",
    tileHint: "Standard sizes: 300×300, 600×300 mm — coming soon",
    disabled: true,
  },
] as const;

export default function PlanSelectionPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-canvas px-4 py-16">
      <div className="w-full max-w-xl">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-ink">
          Create a new plan
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          Choose the type of space you are planning
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PLAN_TYPES.map(({ type, label, description, icon, tileHint, disabled }) => (
            <button
              key={type}
              onClick={() => !disabled && router.push(`/plan/edit?type=${type}`)}
              disabled={disabled}
              className={`
                group flex flex-col items-start gap-3 rounded-lg border p-6 text-left transition
                ${disabled
                  ? "cursor-not-allowed border-line bg-paper opacity-50"
                  : "cursor-pointer border-line bg-paper hover:border-leaf hover:shadow-soft"
                }
              `}
            >
              <span className="text-3xl">{icon}</span>
              <div>
                <p className="font-semibold text-ink">{label}</p>
                <p className="mt-0.5 text-xs text-muted">{description}</p>
              </div>
              <p className="text-xs text-muted/70">{tileHint}</p>
            </button>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted">
          Have a saved plan?{" "}
          <Link href="/plan/import" className="text-forest underline underline-offset-2 hover:text-leaf">
            Import from JSON
          </Link>
        </p>
      </div>
    </div>
  );
}
