import { apiFetch } from "./api";
import type { Vertex } from "@bloomy/bloomy-planner";

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
      `Unsupported file type: ${file.type}. Please upload a JPEG, PNG, WebP, or GIF.`
    );
  }

  const formData = new FormData();
  formData.append("file", file);

  const res = await apiFetch("/ai/extract-shape", {
    method: "POST",
    body: formData,
    rawBody: true,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "Unknown error");
    throw new Error(`Shape extraction failed: ${err}`);
  }

  const data = (await res.json()) as { vertices?: unknown };
  const verts = data.vertices;

  if (
    !Array.isArray(verts) ||
    verts.length < 3 ||
    !verts.every(
      (v) =>
        Array.isArray(v) &&
        v.length === 2 &&
        typeof v[0] === "number" &&
        typeof v[1] === "number"
    )
  ) {
    throw new Error("AI returned an invalid shape — please try a clearer image.");
  }

  return verts as Vertex[];
}
