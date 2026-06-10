// Client-only — only import from "use client" components
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { PlannerState, TileResult } from "./types";
import { resolveTileSize } from "./geometry";
import { TILE_PRESETS } from "./constants";

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
    return (doc as any).lastAutoTable?.finalY ?? 0;
  }

  function checkPageBreak(needed: number, current: number): number {
    if (current + needed > pageH - 15) {
      doc.addPage();
      return 15;
    }
    return current;
  }

  // ── Title ──────────────────────────────────────────────────────
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Patio Tile Layout Plan", margin, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 25);
  doc.setTextColor(0, 0, 0);

  // ── Summary ────────────────────────────────────────────────────
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", margin, 34);

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

  // ── Full tiles note ────────────────────────────────────────────
  y = checkPageBreak(20, y);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Full Tiles", margin, y);
  y += 5;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${stats.fullTiles} tile${stats.fullTiles !== 1 ? "s" : ""} require no cutting — standard ${tileWmm} × ${tileHmm} mm.`,
    margin,
    y
  );
  y += 12;

  // ── Cut tiles ─────────────────────────────────────────────────
  const cutTiles = tiles.filter((t) => t.isCut);

  y = checkPageBreak(20, y);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Cut Tiles", margin, y);
  y += 4;

  if (cutTiles.length === 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("No cut tiles.", margin, y + 4);
  } else {
    // Group pieces by physical tile.
    // In chess mode, physicalTileIdx restarts per parity, so key = parity_idx.
    const groups = new Map<string, TileResult[]>();
    for (const tile of cutTiles) {
      const parity = (tile.gridCol + tile.gridRow) % 2;
      const key = chessMode
        ? `${parity}_${tile.physicalTileIdx}`
        : String(tile.physicalTileIdx);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(tile);
    }

    const sortedKeys = [...groups.keys()].sort((a, b) => {
      if (chessMode) {
        const [pa, ia] = a.split("_").map(Number);
        const [pb, ib] = b.split("_").map(Number);
        return pa !== pb ? pa - pb : ia - ib;
      }
      return Number(a) - Number(b);
    });

    let tileNumber = 1;
    for (const key of sortedKeys) {
      const pieces = groups.get(key)!;
      const parity = chessMode ? Number(key.split("_")[0]) : -1;
      const chessLabel = chessMode
        ? `  [${parity === 1 ? "dark position" : "light position"}]`
        : "";

      y = checkPageBreak(22, y);

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Physical Tile #${tileNumber}${chessLabel}  —  ${pieces.length} piece${pieces.length !== 1 ? "s" : ""}`,
        margin,
        y
      );
      tileNumber++;
      y += 3;

      const rows = pieces.map((piece, i) => {
        const xs = piece.points.map((p) => p[0]);
        const ys = piece.points.map((p) => p[1]);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        // Bounding box of cut piece
        const bboxW = Math.round((maxX - minX) * 1000);
        const bboxH = Math.round((maxY - minY) * 1000);
        // Area
        const areaCm2 = (piece.cutArea * 10000).toFixed(1);
        // Centroid: patio position
        const cx = (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(2);
        const cy = (ys.reduce((a, b) => a + b, 0) / ys.length).toFixed(2);
        // Tile-relative cut vertices: snap tile origin from bounding box
        const tileOriginX = Math.round(minX / tileW) * tileW;
        const tileOriginY = Math.round(minY / tileH) * tileH;
        const relVertices = piece.points
          .map(([px, py]) => {
            const rx = Math.round((px - tileOriginX) * 1000);
            const ry = Math.round((py - tileOriginY) * 1000);
            return `(${rx},${ry})`;
          })
          .join(" → ");

        return [
          String.fromCharCode(65 + i),
          `${bboxW} × ${bboxH}`,
          `${areaCm2} cm²`,
          `(${cx}, ${cy}) m`,
          relVertices,
        ];
      });

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [["Piece", "Bbox (mm)", "Area", "Patio centre", "Cut vertices (mm, tile-relative)"]],
        body: rows,
        theme: "grid",
        headStyles: {
          fillColor: [70, 120, 70],
          textColor: [255, 255, 255],
          fontSize: 7.5,
          fontStyle: "bold",
        },
        styles: { fontSize: 7.5, cellPadding: { top: 1.5, right: 2, bottom: 1.5, left: 2 } },
        columnStyles: {
          0: { cellWidth: 8,  halign: "center" },
          1: { cellWidth: 22 },
          2: { cellWidth: 16 },
          3: { cellWidth: 26 },
          4: { cellWidth: "auto", overflow: "linebreak" },
        },
      });

      y = getY() + 6;
    }
  }

  doc.save("patio-tile-plan.pdf");
}
