import type Konva from "konva";

export function exportCanvas(stage: Konva.Stage): void {
  const uri = stage.toDataURL({ mimeType: "image/png", pixelRatio: 2 });
  const a = document.createElement("a");
  a.href = uri;
  a.download = "patio-plan.png";
  a.click();
}
