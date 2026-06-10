"use client";

import type { Stats } from "@/lib/plan/types";

interface Props {
  stats: Stats;
  tooManyTiles: boolean;
  chessMode: boolean;
  onExport: () => void;
  onExportPdf: () => void;
}

function Swatch({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-sm"
      style={{ background: color }}
    />
  );
}

function Row({
  label,
  value,
  swatch,
  accent,
  sub,
  green,
}: {
  label: string;
  value: string | number;
  swatch?: string;
  accent?: boolean;
  sub?: boolean;
  green?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-1.5 text-sm ${
        accent ? "font-semibold text-forest" : sub ? "text-muted" : "text-ink"
      }`}
    >
      <span className="flex items-center gap-1.5 text-muted">
        {swatch && <Swatch color={swatch} />}
        {label}
      </span>
      <span className={green ? "font-medium text-leaf" : ""}>{value}</span>
    </div>
  );
}

export function StatsPanel({ stats, tooManyTiles, chessMode, onExport, onExportPdf }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">Calculations</p>

      {tooManyTiles ? (
        <p className="rounded border border-danger/30 bg-danger/5 px-3 py-2 text-xs text-danger">
          Too many tiles to calculate. Zoom in or use a larger tile size.
        </p>
      ) : (
        <div className="divide-y divide-line rounded border border-line bg-paper px-3">
          <Row label="Patio area" value={`${stats.areaSqM.toFixed(2)} m²`} />
          <Row label="Full tiles" value={stats.fullTiles} swatch="#4da162" />
          {chessMode && stats.fullTiles > 0 && (
            <>
              <Row label="  Dark positions" value={stats.fullBlack} swatch="rgba(40,40,40,0.7)" sub />
              <Row label="  Light positions" value={stats.fullWhite} swatch="rgba(230,225,190,0.9)" sub />
            </>
          )}
          <Row label="Cut pieces" value={stats.cutPieces} swatch="#aaa" />
          {stats.savedTiles > 0 && (
            <Row
              label="Reused offcuts"
              value={`−${stats.savedTiles} tile${stats.savedTiles > 1 ? "s" : ""}`}
              sub
              green
            />
          )}
          <Row
            label="Physical cut tiles"
            value={stats.physicalCutTiles}
            swatch="#e8a838"
          />
          {chessMode && stats.physicalCutTiles > 0 && (
            <>
              <Row label="  Cut dark tiles" value={stats.physCutBlack} swatch="rgba(40,40,40,0.7)" sub />
              <Row label="  Cut light tiles" value={stats.physCutWhite} swatch="rgba(230,225,190,0.9)" sub />
            </>
          )}
          <Row label="Total tiles needed" value={stats.totalTiles} accent />
          <Row label="+10% waste" value={stats.plus10} />
          <Row label="+15% waste" value={stats.plus15} />
        </div>
      )}

      {stats.hasSmallPieces && (
        <p className="rounded border border-red-400/40 bg-red-50 px-3 py-2 text-xs text-red-700">
          Some cut pieces have edges &lt; 30 mm — difficult to cut accurately.
        </p>
      )}

      <div className="mt-2 flex gap-2">
        <button
          onClick={onExport}
          className="flex-1 rounded border border-leaf bg-leaf/10 px-3 py-2 text-sm font-medium text-forest transition hover:bg-leaf/20"
        >
          Export PNG
        </button>
        <button
          onClick={onExportPdf}
          className="flex-1 rounded border border-leaf bg-leaf/10 px-3 py-2 text-sm font-medium text-forest transition hover:bg-leaf/20"
        >
          Export PDF
        </button>
      </div>
    </div>
  );
}
