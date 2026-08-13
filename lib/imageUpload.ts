/** Reads an image file as a base-64 data URL and calls onResult with it. */
export function readImageAsDataUrl(
  file: File,
  onResult: (dataUrl: string) => void,
): void {
  if (!file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result;
    if (typeof result === "string") onResult(result);
  };
  reader.readAsDataURL(file);
}
