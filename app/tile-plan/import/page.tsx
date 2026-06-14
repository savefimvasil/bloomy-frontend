"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlanExportSchema } from "@/lib/plan/schema";

export default function ImportPlanPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setText((ev.target?.result as string) ?? "");
      setError(null);
    };
    reader.readAsText(file);
  }

  function loadPlan() {
    setError(null);
    setLoading(true);

    let raw: unknown;
    try {
      raw = JSON.parse(text.trim());
    } catch {
      setError("Invalid JSON — could not parse the file.");
      setLoading(false);
      return;
    }

    const result = PlanExportSchema.safeParse(raw);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `• ${i.path.join(".") || "root"}: ${i.message}`)
        .join("\n");
      setError(`Validation failed:\n${issues}`);
      setLoading(false);
      return;
    }

    localStorage.setItem("bloomy_plan_import", JSON.stringify(result.data));
    router.push(`/tile-plan/edit?type=${result.data.planType}`);
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-canvas px-4 py-16">
      <div className="w-full max-w-lg">
        <Link
          href="/tile-plan"
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-muted transition hover:text-forest"
        >
          ← Back
        </Link>

        <h1 className="text-display-sm text-ink">Import plan</h1>
        <p className="mt-1 text-sm text-muted">
          Upload a <code className="rounded bg-mist px-1 text-xs">.json</code> file exported from
          Bloomy, or paste the JSON below.
        </p>

        <div className="mt-6 space-y-4">
          {/* File picker */}
          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded border border-line bg-paper px-4 py-2 text-sm font-medium text-ink transition hover:border-leaf/50 hover:bg-mist"
            >
              Choose .json file
            </button>
            {text && (
              <span className="ml-3 text-xs text-muted">
                {text.length.toLocaleString()} chars loaded
              </span>
            )}
          </div>

          {/* Textarea */}
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setError(null); }}
            placeholder='Paste JSON here — {"version":1,"planType":"garden",...}'
            rows={10}
            className="w-full rounded border border-line bg-paper px-3 py-2 font-mono text-xs text-ink outline-none focus:border-leaf"
          />

          {/* Error */}
          {error && (
            <pre className="rounded border border-danger/30 bg-danger/5 px-3 py-2 text-xs text-danger whitespace-pre-wrap">
              {error}
            </pre>
          )}

          <button
            onClick={loadPlan}
            disabled={!text.trim() || loading}
            className="w-full rounded border border-leaf bg-leaf/10 px-4 py-2.5 text-sm font-semibold text-forest transition hover:bg-leaf/20 disabled:opacity-40"
          >
            {loading ? "Loading…" : "Load plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
