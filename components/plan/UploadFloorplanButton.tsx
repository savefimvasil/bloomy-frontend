"use client";

import { useRef, useState } from "react";
import type { PlannerAction } from "@/lib/plan/types";
import {
  extractShapeFromFloorplan,
  FLOORPLAN_ACCEPT,
} from "@/lib/plan/floorplan-import";
import { useIsLoggedIn } from "@/lib/auth";

interface Props {
  dispatch: React.Dispatch<PlannerAction>;
}

export function UploadFloorplanButton({ dispatch }: Props) {
  const isLoggedIn = useIsLoggedIn();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <div>
        <button
          type="button"
          disabled
          className="w-full rounded border border-line bg-paper px-3 py-1.5 text-xs font-medium text-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          Upload floor plan
        </button>
        <p className="mt-1 text-[11px] text-muted">
          <a href="/login" className="underline hover:text-forest">
            Sign in
          </a>{" "}
          to upload a floor plan
        </p>
      </div>
    );
  }

  async function handleFile(file: File) {
    setStatus("loading");
    setErrorMsg(null);
    try {
      const vertices = await extractShapeFromFloorplan(file);
      dispatch({ type: "SET_SHAPE", vertices });
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = "";
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={FLOORPLAN_ACCEPT}
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        disabled={status === "loading"}
        onClick={() => {
          setStatus("idle");
          setErrorMsg(null);
          inputRef.current?.click();
        }}
        className="w-full rounded border border-line bg-paper px-3 py-1.5 text-xs font-medium text-muted transition hover:border-leaf/50 hover:text-forest disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "loading" ? "Analysing…" : "Upload floor plan"}
      </button>
      {status === "error" && errorMsg && (
        <p className="mt-1 text-[11px] text-danger">{errorMsg}</p>
      )}
    </div>
  );
}
