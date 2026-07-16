/** A → Z, then AA → AZ, BA → BZ ... */
export function tileLetter(idx: number): string {
  if (idx < 26) return String.fromCharCode(65 + idx);
  return String.fromCharCode(64 + Math.ceil(idx / 26)) + String.fromCharCode(65 + idx % 26);
}

/** "A1", "A2", "B1" … */
export function pieceLabel(physicalTileIdx: number, pieceIdx: number): string {
  return `${tileLetter(physicalTileIdx)}${pieceIdx + 1}`;
}

/** Edge lengths in mm for any polygon, rotation-invariant. */
export function edgeLengthsMm(pts: [number, number][]): number[] {
  return pts.map((p, i) => {
    const q = pts[(i + 1) % pts.length];
    const dx = (q[0] - p[0]) * 1000;
    const dy = (q[1] - p[1]) * 1000;
    return Math.round(Math.sqrt(dx * dx + dy * dy));
  });
}

/** "600 × 420 mm" for rectangles, "600, 420, 735 mm" for other shapes. */
export function formatSides(pts: [number, number][]): string {
  const s = edgeLengthsMm(pts);
  if (s.length === 4 && s[0] === s[2] && s[1] === s[3]) return `${s[0]} × ${s[1]} mm`;
  return `${s.join(", ")} mm`;
}
