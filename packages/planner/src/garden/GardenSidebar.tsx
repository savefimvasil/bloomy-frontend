"use client";

import { useState } from "react";
import { polygonArea } from "../lib/geometry";
import type { GardenBoundary, GardenZone, GardenObject, ZoneType, ObjectType } from "./types";
import { ZONE_CONFIGS, OBJECT_CONFIGS, ZONE_TYPES, OBJECT_TYPES } from "./zone-configs";
import { PlannerButton } from "../ui/button";

function ZoneSwatch({ type }: { type: ZoneType }) {
  const cfg = ZONE_CONFIGS[type];
  return (
    <span
      className="inline-block h-3 w-3 shrink-0 rounded-sm border"
      style={{ background: cfg.fill, borderColor: cfg.stroke }}
    />
  );
}

// ─── Zone type picker ─────────────────────────────────────────────────────────

function ZoneTypePicker({ onPick, onClose }: { onPick: (t: ZoneType) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-[340px] rounded-2xl border border-line bg-paper p-5 shadow-xl" onClick={e => e.stopPropagation()}>
        <p className="mb-4 text-eyebrow text-muted">Choose zone type</p>
        <div className="grid grid-cols-2 gap-2">
          {ZONE_TYPES.map(z => (
            <button key={z.id}
              onClick={() => { onPick(z.id); onClose(); }}
              className="flex items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-2.5 text-left transition hover:border-forest/30 hover:bg-forest/5"
            >
              <ZoneSwatch type={z.id} />
              <span className="text-sm font-medium text-ink">{z.label}</span>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 text-hint text-muted hover:text-ink">Cancel</button>
      </div>
    </div>
  );
}

// ─── Object type picker ───────────────────────────────────────────────────────

function ObjectTypePicker({ onPick, onClose }: { onPick: (t: ObjectType, size?: [number, number]) => void; onClose: () => void }) {
  const [sizing, setSizing] = useState<{ type: ObjectType; w: string; h: string } | null>(null);
  const categories = Array.from(new Set(OBJECT_TYPES.map(o => o.category)));

  if (sizing) {
    const cfg = OBJECT_CONFIGS[sizing.type];
    const confirm = () => {
      const w = parseFloat(sizing.w) || cfg.defaultSize![0];
      const h = parseFloat(sizing.h) || cfg.defaultSize![1];
      onPick(sizing.type, [w, h]);
      onClose();
    };
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm" onClick={onClose}>
        <div className="w-[300px] rounded-2xl border border-line bg-paper p-5 shadow-xl" onClick={e => e.stopPropagation()}>
          <p className="mb-1 text-eyebrow text-muted">Size</p>
          <p className="mb-4 text-body font-semibold text-ink">{cfg.label}</p>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-hint text-muted">Width (m)</label>
              <input
                type="number" min="0.1" step="0.1"
                value={sizing.w}
                onChange={e => setSizing(s => s && { ...s, w: e.target.value })}
                onKeyDown={e => e.key === "Enter" && confirm()}
                autoFocus
                className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-body text-ink focus:border-forest/40 focus:outline-none"
              />
            </div>
            <span className="mb-2 text-body text-muted">×</span>
            <div className="flex-1">
              <label className="mb-1 block text-hint text-muted">Depth (m)</label>
              <input
                type="number" min="0.1" step="0.1"
                value={sizing.h}
                onChange={e => setSizing(s => s && { ...s, h: e.target.value })}
                onKeyDown={e => e.key === "Enter" && confirm()}
                className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-body text-ink focus:border-forest/40 focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <PlannerButton onClick={() => setSizing(null)} variant="secondary" className="flex-1">Back</PlannerButton>
            <PlannerButton onClick={confirm} variant="default" className="flex-1">Add</PlannerButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-[360px] rounded-2xl border border-line bg-paper p-5 shadow-xl" onClick={e => e.stopPropagation()}>
        <p className="mb-4 text-eyebrow text-muted">Add object</p>
        {categories.map(cat => (
          <div key={cat} className="mb-3">
            <p className="mb-1.5 text-hint text-muted">{cat}</p>
            <div className="grid grid-cols-2 gap-1.5">
              {OBJECT_TYPES.filter(o => o.category === cat).map(o => {
                const hasSizing = !!OBJECT_CONFIGS[o.id].defaultSize;
                return (
                  <button key={o.id}
                    onClick={() => {
                      if (hasSizing) {
                        const [w, h] = OBJECT_CONFIGS[o.id].defaultSize!;
                        setSizing({ type: o.id, w: w.toString(), h: h.toString() });
                      } else {
                        onPick(o.id);
                        onClose();
                      }
                    }}
                    className="flex items-center justify-between rounded-lg border border-line bg-canvas px-3 py-2 text-left text-sm text-ink transition hover:border-forest/30 hover:bg-forest/5"
                  >
                    <span>{o.label}</span>
                    {hasSizing && <span className="text-xs text-muted">size →</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <button onClick={onClose} className="mt-2 text-hint text-muted hover:text-ink">Cancel</button>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface Props {
  boundary: GardenBoundary | undefined;
  zones: GardenZone[];
  objects: GardenObject[];
  selectedZone: GardenZone | null;
  selectedObject: GardenObject | null;
  editingZoneVertices: boolean;
  editingBoundary: boolean;
  projectName?: string;
  onBack?: () => void;
  onSelectZone: (id: string) => void;
  onSelectObject: (id: string) => void;
  onAddZone: (type: ZoneType) => void;
  onDeleteZone: (id: string) => void;
  onUpdateZoneLabel: (id: string, label: string) => void;
  onUpdateZoneType: (id: string, type: ZoneType) => void;
  onToggleEditZoneVertices: () => void;
  onToggleEditBoundary: () => void;
  onAddObject: (type: ObjectType, size?: [number, number]) => void;
  onDeleteObject: (id: string) => void;
  onUpdateObjectLabel: (id: string, label: string) => void;
  onGenerateImage?: () => void;
}

export function GardenSidebar({
  boundary, zones, objects,
  selectedZone, selectedObject,
  editingZoneVertices, editingBoundary,
  projectName, onBack,
  onSelectZone, onSelectObject,
  onAddZone, onDeleteZone, onUpdateZoneLabel, onUpdateZoneType, onToggleEditZoneVertices, onToggleEditBoundary,
  onAddObject, onDeleteObject, onUpdateObjectLabel,
  onGenerateImage,
}: Props) {
  const [showZonePicker, setShowZonePicker] = useState(false);
  const [showObjectPicker, setShowObjectPicker] = useState(false);

  const boundaryArea = boundary ? polygonArea(boundary.vertices) : 0;

  return (
    <>
      {showZonePicker && <ZoneTypePicker onPick={onAddZone} onClose={() => setShowZonePicker(false)} />}
      {showObjectPicker && <ObjectTypePicker onPick={onAddObject} onClose={() => setShowObjectPicker(false)} />}

      <aside className="flex w-full shrink-0 flex-col border-t border-line bg-paper md:w-[260px] md:border-l md:border-t-0">
        {onBack && (
          <div className="flex shrink-0 items-center gap-2 border-b border-line px-4 py-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-hint text-muted hover:text-ink"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 10 L3 6 L8 2" />
              </svg>
              Projects
            </button>
            {projectName && (
              <>
                <span className="text-hint text-line">/</span>
                <span className="truncate text-hint text-ink">{projectName}</span>
              </>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">

          <p className="mb-4 text-eyebrow text-muted">Garden</p>

          {/* Garden boundary */}
          {boundary && (
            <div className="mb-5 rounded-xl border border-line bg-canvas p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Dashed boundary indicator */}
                  <span className="inline-block h-3 w-3 rounded-sm border-2 border-dashed border-forest" />
                  <span className="text-body font-medium text-ink">Garden boundary</span>
                </div>
              </div>
              <div className="mb-2 flex items-center justify-between text-hint text-muted">
                <span>{boundaryArea.toFixed(1)} m² total</span>
                <span>{boundary.vertices.length} vertices</span>
              </div>
              <button
                onClick={onToggleEditBoundary}
                className={`w-full rounded-lg border px-3 py-1.5 text-hint font-medium transition ${
                  editingBoundary
                    ? "border-amber-400/60 bg-amber-50 text-amber-800"
                    : "border-line bg-paper text-muted hover:bg-mist hover:text-ink"
                }`}
              >
                {editingBoundary ? "Done editing boundary" : "Edit boundary shape"}
              </button>
            </div>
          )}

          {/* No boundary state */}
          {!boundary && (
            <div className="mb-5 rounded-xl border border-dashed border-line bg-canvas p-3 text-center">
              <p className="text-hint text-muted/70">No garden boundary defined.</p>
            </div>
          )}

          {/* Zones */}
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-hint font-semibold uppercase tracking-widest text-muted">
                Zones {zones.length > 0 && <span className="font-normal normal-case">({zones.length})</span>}
              </p>
              <button
                onClick={() => setShowZonePicker(true)}
                className="text-hint text-forest hover:text-moss"
              >
                + Add
              </button>
            </div>

            {zones.length === 0 ? (
              <p className="text-hint text-muted/70">
                {boundary ? "Add zones inside the boundary." : "Add zones to the canvas."}
              </p>
            ) : (
              <div className="flex flex-col gap-0.5">
                {zones.map(zone => {
                  const isSelected = zone.id === selectedZone?.id;
                  return (
                    <button key={zone.id}
                      onClick={() => onSelectZone(zone.id)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition ${
                        isSelected ? "bg-forest/8 text-ink" : "text-muted hover:bg-mist/60 hover:text-ink"
                      }`}
                    >
                      <ZoneSwatch type={zone.type} />
                      <span className="min-w-0 flex-1 truncate text-body">{zone.label}</span>
                      <span className="shrink-0 text-hint text-muted/60">
                        {polygonArea(zone.vertices).toFixed(1)}m²
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Objects */}
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-hint font-semibold uppercase tracking-widest text-muted">
                Objects {objects.length > 0 && <span className="font-normal normal-case">({objects.length})</span>}
              </p>
              <button onClick={() => setShowObjectPicker(true)} className="text-hint text-forest hover:text-moss">
                + Add
              </button>
            </div>

            {objects.length === 0 ? (
              <p className="text-hint text-muted/70">Trees, sheds, furniture&hellip;</p>
            ) : (
              <div className="flex flex-col gap-0.5">
                {objects.map(obj => {
                  const isSelected = obj.id === selectedObject?.id;
                  return (
                    <button key={obj.id}
                      onClick={() => onSelectObject(obj.id)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition ${
                        isSelected ? "bg-forest/8 text-ink" : "text-muted hover:bg-mist/60 hover:text-ink"
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate text-body">{obj.label}</span>
                      <span className="shrink-0 text-hint text-muted/60">
                        {OBJECT_CONFIGS[obj.type].category}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-line" />

          {/* Selected zone properties */}
          {selectedZone && !editingBoundary && (
            <div className="mt-4 flex flex-col gap-3">
              <p className="text-hint font-semibold uppercase tracking-widest text-muted">Zone</p>

              <div>
                <label className="mb-1 block text-hint text-muted">Label</label>
                <input
                  type="text"
                  value={selectedZone.label}
                  onChange={e => onUpdateZoneLabel(selectedZone.id, e.target.value)}
                  className="w-full rounded-lg border border-line bg-canvas px-3 py-1.5 text-body text-ink focus:border-forest/40 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-hint text-muted">Type</label>
                <select
                  value={selectedZone.type}
                  onChange={e => onUpdateZoneType(selectedZone.id, e.target.value as ZoneType)}
                  className="w-full rounded-lg border border-line bg-canvas px-3 py-1.5 text-body text-ink focus:border-forest/40 focus:outline-none"
                >
                  {ZONE_TYPES.map(z => <option key={z.id} value={z.id}>{z.label}</option>)}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-hint text-muted">Area</span>
                <span className="text-body font-semibold text-ink">
                  {polygonArea(selectedZone.vertices).toFixed(2)} m²
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={onToggleEditZoneVertices}
                  className={`rounded-lg border px-3 py-2 text-body font-medium transition ${
                    editingZoneVertices
                      ? "border-amber-400/60 bg-amber-50 text-amber-800"
                      : "border-line bg-canvas text-ink hover:bg-mist"
                  }`}
                >
                  {editingZoneVertices ? "Done editing" : "Edit shape"}
                </button>
                <PlannerButton onClick={() => onDeleteZone(selectedZone.id)} variant="danger" fullWidth>
                  Delete zone
                </PlannerButton>
              </div>
            </div>
          )}

          {/* Selected object properties */}
          {selectedObject && !selectedZone && (
            <div className="mt-4 flex flex-col gap-3">
              <p className="text-hint font-semibold uppercase tracking-widest text-muted">Object</p>

              <div>
                <label className="mb-1 block text-hint text-muted">Label</label>
                <input
                  type="text"
                  value={selectedObject.label}
                  onChange={e => onUpdateObjectLabel(selectedObject.id, e.target.value)}
                  className="w-full rounded-lg border border-line bg-canvas px-3 py-1.5 text-body text-ink focus:border-forest/40 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-hint text-muted">Type</span>
                <span className="text-body text-ink">{OBJECT_CONFIGS[selectedObject.type].label}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-hint text-muted">Position</span>
                <span className="font-mono text-hint text-muted">
                  {selectedObject.position[0].toFixed(1)}, {selectedObject.position[1].toFixed(1)} m
                </span>
              </div>

              <PlannerButton onClick={() => onDeleteObject(selectedObject.id)} variant="danger" fullWidth>
                Remove
              </PlannerButton>
            </div>
          )}

          {!selectedZone && !selectedObject && !editingBoundary && (zones.length > 0 || objects.length > 0) && (
            <p className="mt-4 text-hint text-muted/70">Click a zone or object on the canvas to select it.</p>
          )}
        </div>

        {/* Zone legend */}
        {zones.length > 0 && (
          <div className="border-t border-line p-4">
            <p className="mb-2 text-hint font-semibold uppercase tracking-widest text-muted">Legend</p>
            <div className="flex flex-col gap-1.5">
              {Array.from(new Set(zones.map(z => z.type))).map(type => (
                <div key={type} className="flex items-center gap-2">
                  <ZoneSwatch type={type} />
                  <span className="text-hint text-muted">{ZONE_CONFIGS[type].label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {onGenerateImage && (
          <div className="border-t border-line p-4">
            <button
              onClick={onGenerateImage}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-forest px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-moss active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="1" width="13" height="13" rx="2" />
                <path d="M1 10l3.5-3.5 2.5 2.5 2.5-3 3.5 4" />
                <circle cx="10.5" cy="4.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              Generate image
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
