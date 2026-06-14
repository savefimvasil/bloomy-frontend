// Client-only — only import from "use client" components
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { PlannerState, TileResult } from "./types";
import { resolveTileSize } from "./geometry";
import { TILE_PRESETS } from "./constants";
import { tileLetter, pieceLabel, formatSides } from "./labels";

export function exportPdf(state: PlannerState): void {
  const { tileSize, tiles, stats, rotation, chessMode } = state;
  const { width: tileW, height: tileH } = resolveTileSize(tileSize, TILE_PRESETS);
  const tileWmm = Math.round(tileW * 1000);
  const tileHmm = Math.round(tileH * 1000);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentW = pageW - margin * 2;

  function getY(): number {
    return (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 0;
  }

  function checkPageBreak(needed: number, current: number): number {
    if (current + needed > pageH - 15) {
      doc.addPage();
      return 15;
    }
    return current;
  }

  function heading(text: string, y: number, size: 16 | 12 | 10 = 12): void {
    doc.setFontSize(size);
    doc.setFont("helvetica", "bold");
    doc.text(text, margin, y);
  }

  function body(text: string, y: number, size: 9 | 10 = 9): void {
    doc.setFontSize(size);
    doc.setFont("helvetica", "normal");
    doc.text(text, margin, y);
  }

  heading("Patio Tile Layout Plan", 18, 16);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 25);
  doc.setTextColor(0, 0, 0);

  heading("Summary", 34);

  const tileSizeLabel =
    tileSize.kind === "custom"
      ? `${tileWmm} × ${tileHmm} mm (custom)`
      : `${tileSize.kind} mm`;

  const summaryRows: string[][] = [
    ["Patio area", `${stats.areaSqM.toFixed(2)} m²`],
    ["Tile size", tileSizeLabel],
    ["Layout", rotation === 45 ? "Diagonal 45°" : "Straight"],
    ["Pattern", chessMode ? "Chess (checkerboard)" : "Plain"],
    ["Full tiles", String(stats.fullTiles)],
    ["Cut pieces", String(stats.cutPieces)],
    ["Physical cut tiles", String(stats.physicalCutTiles)],
    ["Tiles saved by reuse", String(stats.savedTiles)],
    ["Total tiles needed", String(stats.totalTiles)],
    ["+10% waste allowance", String(stats.plus10)],
    ["+15% waste allowance", String(stats.plus15)],
  ];

  autoTable(doc, {
    startY: 37,
    margin: { left: margin, right: margin },
    head: [["Parameter", "Value"]],
    body: summaryRows,
    theme: "striped",
    headStyles: { fillColor: [31, 77, 44], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: contentW * 0.65 },
      1: { cellWidth: contentW * 0.35, halign: "right" },
    },
    styles: { fontSize: 9 },
  });

  let y = getY() + 12;

  y = checkPageBreak(20, y);
  heading("Full Tiles", y);
  y += 5;
  body(
    `${stats.fullTiles} tile${stats.fullTiles !== 1 ? "s" : ""} require no cutting — standard ${tileWmm} × ${tileHmm} mm.`,
    y
  );
  y += 12;

  const cutTiles = tiles.filter((t) => t.isCut);

  y = checkPageBreak(20, y);
  heading("Cut Tiles", y);
  y += 4;

  if (cutTiles.length === 0) {
    body("No cut tiles.", y + 4);
  } else {
    // physicalTileIdx is globally unique (chess-mode parity-1 indices are offset in geometry)
    const groups = new Map<number, TileResult[]>();
    for (const tile of cutTiles) {
      if (!groups.has(tile.physicalTileIdx)) groups.set(tile.physicalTileIdx, []);
      groups.get(tile.physicalTileIdx)!.push(tile);
    }
    const sortedKeys = [...groups.keys()].sort((a, b) => a - b);

    for (const key of sortedKeys) {
      const pieces = [...groups.get(key)!].sort((a, b) => a.pieceIdx - b.pieceIdx);
      const letter = tileLetter(key);
      const chessLabel = chessMode
        ? `  [${(pieces[0].gridCol + pieces[0].gridRow) % 2 === 1 ? "dark" : "light"}]`
        : "";

      y = checkPageBreak(22, y);
      heading(`Tile ${letter}${chessLabel}  —  ${pieces.length} piece${pieces.length !== 1 ? "s" : ""}`, y, 10);
      y += 3;

      const rows = pieces.map(piece => [
        pieceLabel(piece.physicalTileIdx, piece.pieceIdx),
        formatSides(piece.points),
        `${(piece.cutArea * 10000).toFixed(1)} cm²`,
      ]);

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [["Piece", "Sides", "Area"]],
        body: rows,
        theme: "grid",
        headStyles: { fillColor: [70, 120, 70], textColor: [255, 255, 255], fontSize: 8, fontStyle: "bold" },
        styles: { fontSize: 8, cellPadding: { top: 2, right: 3, bottom: 2, left: 3 } },
        columnStyles: {
          0: { cellWidth: 14, halign: "center" },
          1: { cellWidth: "auto" },
          2: { cellWidth: 22, halign: "right" },
        },
      });

      y = getY() + 6;
    }
  }

  doc.save("patio-tile-plan.pdf");
}
