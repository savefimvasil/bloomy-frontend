// Client-only — import from "use client" components only
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { CalculationResult } from "@bloomy/bloomy-planner";
import { fmtGBP } from "./currency";

export function generateGardenPdf(result: CalculationResult, title = "Garden Project"): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;

  function needsNewPage(y: number, needed = 20): number {
    if (y + needed > pageH - 15) { doc.addPage(); return 15; }
    return y;
  }

  // ── Title ──────────────────────────────────────────────────────────────────
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(`Materials estimate · Generated ${new Date().toLocaleDateString("en-GB")}`, margin, 25);
  doc.text("Prices are indicative estimates based on typical UK market rates. Excl. labour & delivery.", margin, 30);
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Estimated total: ${fmtGBP(result.grandTotal)}`, margin, 40);

  let y = 48;

  // ── Per-zone material tables ───────────────────────────────────────────────
  for (const zone of result.byZone) {
    y = needsNewPage(y, 28);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${zone.zoneLabel}`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`  ${fmtGBP(zone.subtotal)}`, margin + doc.getTextWidth(zone.zoneLabel), y);
    doc.setTextColor(0, 0, 0);
    y += 3;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Material", "Qty", "Cost (est.)"]],
      body: zone.materials.map(m => [
        m.name,
        `${m.qty} ${m.unit}`,
        m.cost !== null ? fmtGBP(m.cost) : "—",
      ]),
      theme: "striped",
      headStyles: { fillColor: [31, 77, 44], textColor: [255, 255, 255] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 35, halign: "right" },
        2: { cellWidth: 32, halign: "right" },
      },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  // ── Tool rentals ───────────────────────────────────────────────────────────
  if (result.toolRentals?.length > 0) {
    y = needsNewPage(y, 28);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Tool Rentals  —  ${fmtGBP(result.toolRentalTotal ?? 0)}`, margin, y);
    y += 3;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Tool", "Days", "Rate", "Cost"]],
      body: result.toolRentals.map(r => [
        r.name,
        `${r.days}d`,
        `${fmtGBP(r.pricePerDay)}/day`,
        fmtGBP(r.cost),
      ]),
      theme: "striped",
      headStyles: { fillColor: [31, 77, 44], textColor: [255, 255, 255] },
      styles: { fontSize: 8 },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  // ── Grand total footer ─────────────────────────────────────────────────────
  y = needsNewPage(y, 14);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Grand total: ${fmtGBP(result.grandTotal)}`, margin, y + 6);

  doc.save(`${title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-materials.pdf`);
}
