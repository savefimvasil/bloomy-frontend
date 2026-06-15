import { apiFetch } from "../api";
import type { Vertex } from "./types";

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function isAcceptedFloorplanFile(file: File): boolean {
  return ACCEPTED_TYPES.has(file.type);
}

export const FLOORPLAN_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export async function extractShapeFromFloorplan(file: File): Promise<Vertex[]> {
  if (!isAcceptedFloorplanFile(file)) {
    throw new Error(
      "Only image files are supported (PNG, JPG, WebP). Please convert your PDF to an image first.",
    );
  }

  const form = new FormData();
  form.append("file", file);

  const res = await apiFetch("/ai/extract-shape", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    let message = `Upload failed (${res.status})`;
    try {
      const err = (await res.json()) as { message?: string };
      if (err.message) message = err.message;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  const data = (await res.json()) as { vertices: [number, number][] };

  if (!Array.isArray(data.vertices) || data.vertices.length < 3) {
    throw new Error("AI returned an invalid shape — try a clearer image.");
  }

  return data.vertices as Vertex[];
}
