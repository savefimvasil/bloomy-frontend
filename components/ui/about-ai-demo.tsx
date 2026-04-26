"use client";

import { useState } from "react";

type GenerateResponse = {
  source: string;
  plannerUrl: string;
  model: string;
  output_text: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

export function AboutAiDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/ai/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt:
            "Create a short planting idea for a small front garden with sun in the morning and shade in the afternoon.",
          systemPrompt: "You are a concise garden planning assistant for Bloomy.",
          model: "gpt-5-mini",
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = (await response.json()) as GenerateResponse;
      setResult(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unknown error while calling the backend.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-[1.75rem] border border-[#123524]/12 bg-[#f4f0e8] p-6 md:p-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#5f7a65]">
          AI demo
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#123524]">
          Trigger frontend to backend to Python AI planner
        </h2>
        <p className="mt-3 text-sm leading-6 text-black/70">
          Click the button and watch the browser network panel. The request goes from this Next.js
          page to NestJS, and then NestJS forwards it to the FastAPI AI planner.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleClick}
            disabled={isLoading}
            className="rounded-full bg-[#123524] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#1d4f37] disabled:cursor-not-allowed disabled:bg-[#7a8f82]"
          >
            {isLoading ? "Sending request..." : "Test AI request"}
          </button>
          <span className="text-xs uppercase tracking-[0.18em] text-black/45">
            Target: {apiBaseUrl}/ai/generate
          </span>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-[#b44343]/20 bg-[#fff1ef] p-4 text-sm text-[#8f2f2f]">
            {error}
          </div>
        ) : null}

        {result ? (
          <div className="mt-5 space-y-3 rounded-2xl border border-black/10 bg-white p-5">
            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-black/45">
              <span>Source: {result.source}</span>
              <span>Model: {result.model}</span>
            </div>
            <p className="text-sm leading-6 text-black/75">
              Forwarded to planner at <span className="font-medium text-[#123524]">{result.plannerUrl}</span>
            </p>
            <p className="text-base leading-7 text-[#123524]">{result.output_text}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
