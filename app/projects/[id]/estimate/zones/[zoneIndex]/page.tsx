"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEstimate, useEstimateZone } from "../../estimateContext";
import type {
  ZoneSpec,
  PatioParams,
  PavingSurface,
  LawnParams,
  FlowerBedParams,
  DeckParams,
  GravelPathParams,
  RaisedBedParams,
  ConcreteSlabParams,
  PergolaBaseParams,
} from "@bloomy/bloomy-planner";
import { ZONE_CONFIGS, polygonArea, BASEMENT_FOR_SURFACE } from "@bloomy/bloomy-planner";

// ─── Field helpers ────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-hint font-medium text-ink">{children}</label>;
}

function SliderRow({
  label, value, min, max, step = 10, unit,
  onChange,
}: {
  label: string; value: number; min: number; max: number; step?: number; unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <FieldLabel>{label}</FieldLabel>
        <span className="text-hint text-muted">{value} {unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-forest"
      />
    </div>
  );
}

function Toggle<T extends string>({
  label, value, options, onChange,
}: {
  label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex gap-1">
        {options.map(o => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`flex-1 rounded-lg border px-3 py-1.5 text-hint font-medium transition ${
              value === o.value
                ? "border-forest bg-forest/10 text-forest"
                : "border-line bg-paper text-muted hover:border-muted"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function NumberInput({ label, value, min = 0, onChange }: {
  label: string; value: number; min?: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <input
        type="number" min={min} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full rounded-lg border border-line bg-paper px-3 py-1.5 text-body text-ink focus:border-forest/40 focus:outline-none"
      />
    </div>
  );
}

// ─── Per-type forms ──────────────────────────────────────────────────────────

const SURFACE_OPTIONS: { value: PavingSurface; label: string }[] = [
  { value: "natural-stone", label: "Natural stone" },
  { value: "porcelain",     label: "Porcelain" },
  { value: "block-paving",  label: "Block paving" },
];

const BED_LABEL: Record<PatioParams["basement"], string> = {
  "sand-bed":     "Sand bed depth",
  "mortar-bed":   "Mortar bed depth",
  "concrete-bed": "Concrete bed depth",
};

function PatioForm({ params, onChange }: { params: PatioParams; onChange: (p: PatioParams) => void }) {
  const surfaceMaterial = params.surfaceMaterial ?? "natural-stone";
  const basement = params.basement ?? BASEMENT_FOR_SURFACE[surfaceMaterial];
  const bedDepthMm = params.bedDepthMm ?? 30;

  function handleSurface(surface: PavingSurface) {
    onChange({ ...params, surfaceMaterial: surface, basement: BASEMENT_FOR_SURFACE[surface] });
  }

  return (
    <>
      <Toggle
        label="Surface material"
        value={surfaceMaterial}
        options={SURFACE_OPTIONS}
        onChange={handleSurface}
      />
      {surfaceMaterial === "porcelain" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-hint text-amber-900">
          Porcelain requires a concrete bed + flexible tile adhesive for a lasting bond.
        </div>
      )}
      <SliderRow label="Sub-base depth" value={params.subBaseDepthMm ?? 100} min={50} max={200} unit="mm" onChange={v => onChange({ ...params, subBaseDepthMm: v })} />
      <SliderRow
        label={BED_LABEL[basement]}
        value={bedDepthMm}
        min={basement === "concrete-bed" ? 50 : 20}
        max={basement === "concrete-bed" ? 150 : 60}
        step={5}
        unit="mm"
        onChange={v => onChange({ ...params, bedDepthMm: v })}
      />
      <NumberInput label="Edging (linear metres)" value={params.edgingLm ?? 0} onChange={v => onChange({ ...params, edgingLm: v })} />
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange({ ...params, includeTiles: !params.includeTiles })}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
            params.includeTiles
              ? "border-forest bg-forest text-paper"
              : "border-line bg-canvas hover:border-forest/60"
          }`}
          aria-label={params.includeTiles ? "Exclude tile supply cost" : "Include tile supply cost"}
        >
          {params.includeTiles && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 4l3 3 5-6" />
            </svg>
          )}
        </button>
        <FieldLabel>Include tile supply cost in estimate</FieldLabel>
      </div>
    </>
  );
}

function LawnForm({ params, onChange }: { params: LawnParams; onChange: (p: LawnParams) => void }) {
  return (
    <>
      <SliderRow label="Topsoil depth" value={params.topsoilDepthMm} min={50} max={200} unit="mm" onChange={v => onChange({ ...params, topsoilDepthMm: v })} />
      <Toggle label="Lawn type" value={params.lawnType} options={[{ value: "turf", label: "Turf" }, { value: "seed", label: "Seed" }]} onChange={v => onChange({ ...params, lawnType: v })} />
    </>
  );
}

function FlowerBedForm({ params, onChange }: { params: FlowerBedParams; onChange: (p: FlowerBedParams) => void }) {
  return (
    <>
      <SliderRow label="Topsoil depth" value={params.topsoilDepthMm} min={50} max={400} unit="mm" onChange={v => onChange({ ...params, topsoilDepthMm: v })} />
      <SliderRow label="Mulch depth" value={params.mulchDepthMm} min={20} max={100} step={5} unit="mm" onChange={v => onChange({ ...params, mulchDepthMm: v })} />
      <NumberInput label="Edging (linear metres)" value={params.edgingLm} onChange={v => onChange({ ...params, edgingLm: v })} />
    </>
  );
}

function DeckForm({ params, onChange }: { params: DeckParams; onChange: (p: DeckParams) => void }) {
  return (
    <>
      <Toggle label="Decking material" value={params.deckType} options={[{ value: "composite", label: "Composite" }, { value: "timber", label: "Timber" }]} onChange={v => onChange({ ...params, deckType: v })} />
      <SliderRow label="Joist depth" value={params.joistDepthMm} min={100} max={250} unit="mm" onChange={v => onChange({ ...params, joistDepthMm: v })} />
      <Toggle label="Existing footings?" value={params.hasExistingFootings ? "yes" : "no"} options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes, I have them" }]} onChange={v => onChange({ ...params, hasExistingFootings: v === "yes" })} />
    </>
  );
}

function GravelPathForm({ params, onChange }: { params: GravelPathParams; onChange: (p: GravelPathParams) => void }) {
  return (
    <>
      <SliderRow label="Gravel depth" value={params.gravelDepthMm} min={30} max={100} step={5} unit="mm" onChange={v => onChange({ ...params, gravelDepthMm: v })} />
      <Toggle label="Weed membrane" value={params.weedMembrane ? "yes" : "no"} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} onChange={v => onChange({ ...params, weedMembrane: v === "yes" })} />
      <NumberInput label="Edging (linear metres)" value={params.edgingLm} onChange={v => onChange({ ...params, edgingLm: v })} />
    </>
  );
}

function RaisedBedForm({ params, onChange }: { params: RaisedBedParams; onChange: (p: RaisedBedParams) => void }) {
  return (
    <>
      <SliderRow label="Timber wall height" value={params.timberHeightMm} min={150} max={600} step={150} unit="mm" onChange={v => onChange({ ...params, timberHeightMm: v })} />
      <SliderRow label="Soil fill depth" value={params.fillDepthMm} min={100} max={550} step={50} unit="mm" onChange={v => onChange({ ...params, fillDepthMm: v })} />
      <Toggle label="Soil type" value={params.soilType} options={[{ value: "topsoil", label: "Topsoil" }, { value: "compost-mix", label: "Compost mix" }]} onChange={v => onChange({ ...params, soilType: v })} />
    </>
  );
}

function ConcreteSlabForm({ params, onChange }: { params: ConcreteSlabParams; onChange: (p: ConcreteSlabParams) => void }) {
  return (
    <>
      <SliderRow label="Concrete depth" value={params.concreteDepthMm} min={75} max={200} step={25} unit="mm" onChange={v => onChange({ ...params, concreteDepthMm: v })} />
      <Toggle label="Reinforced with rebar?" value={params.reinforced ? "yes" : "no"} options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]} onChange={v => onChange({ ...params, reinforced: v === "yes" })} />
      <Toggle label="Existing base present?" value={params.hasExistingBase ? "yes" : "no"} options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes, I have one" }]} onChange={v => onChange({ ...params, hasExistingBase: v === "yes" })} />
    </>
  );
}

function PergolaBaseForm({ params, onChange }: { params: PergolaBaseParams; onChange: (p: PergolaBaseParams) => void }) {
  return (
    <>
      <SliderRow label="Post footing depth" value={params.postFootingsDepthMm} min={300} max={900} step={100} unit="mm" onChange={v => onChange({ ...params, postFootingsDepthMm: v })} />
      <NumberInput label="Number of posts" value={params.postCount} min={2} onChange={v => onChange({ ...params, postCount: Math.max(2, v) })} />
      <Toggle label="Base finish" value={params.baseMaterial} options={[{ value: "concrete", label: "Concrete slab" }, { value: "spike-anchor", label: "Spike anchors" }]} onChange={v => onChange({ ...params, baseMaterial: v })} />
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ZoneStepPage() {
  const { zoneIndex: rawIdx } = useParams() as { zoneIndex: string };
  const zoneIndex = Number(rawIdx);
  const router = useRouter();

  const { steps, currentStepIndex, save, saving } = useEstimate();
  const { zone, spec, updateZoneSpec } = useEstimateZone(zoneIndex);

  // Context only renders children once loaded, so spec is available at mount
  const [localParams, setLocalParams] = useState<ZoneSpec["params"] | null>(() => spec?.params ?? null);

  if (!zone || !spec || !localParams) {
    return (
      <div className="flex h-40 items-center justify-center text-hint text-muted">
        Zone not found.
      </div>
    );
  }

  const cfg = ZONE_CONFIGS[zone.type];
  const areaSqm = polygonArea(zone.vertices);

  function handleChange(params: ZoneSpec["params"]) {
    setLocalParams(params);
    updateZoneSpec({ ...spec!, params } as ZoneSpec);
  }

  async function handleNext() {
    await save();
    const next = steps[currentStepIndex + 1];
    if (next) router.push(next.href);
  }

  function handlePrev() {
    const prev = steps[currentStepIndex - 1];
    if (prev) router.push(prev.href);
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      {/* Zone header */}
      <div className="mb-8 flex items-center gap-3">
        <span className="h-4 w-4 shrink-0 rounded-sm border" style={{ background: cfg.fill, borderColor: cfg.stroke }} />
        <div>
          <p className="text-hint text-muted">{cfg.label}</p>
          <h1 className="text-display-sm text-ink">{zone.label}</h1>
          <p className="mt-0.5 text-hint text-muted">{areaSqm.toFixed(1)} m²</p>
        </div>
      </div>

      {/* Description */}
      <p className="mb-6 text-body text-muted">{cfg.description}</p>

      {/* Form */}
      <div className="flex flex-col gap-5 rounded-2xl border border-line bg-paper p-6">
        <p className="text-hint font-semibold uppercase tracking-widest text-muted">Construction parameters</p>

        {zone.type === "tile-patio"    && <PatioForm      params={localParams as PatioParams}       onChange={handleChange} />}
        {zone.type === "lawn"          && <LawnForm       params={localParams as LawnParams}        onChange={handleChange} />}
        {zone.type === "flower-bed"    && <FlowerBedForm  params={localParams as FlowerBedParams}   onChange={handleChange} />}
        {zone.type === "deck"          && <DeckForm       params={localParams as DeckParams}        onChange={handleChange} />}
        {zone.type === "gravel-path"   && <GravelPathForm params={localParams as GravelPathParams}  onChange={handleChange} />}
        {zone.type === "raised-bed"    && <RaisedBedForm  params={localParams as RaisedBedParams}   onChange={handleChange} />}
        {zone.type === "concrete-slab" && <ConcreteSlabForm params={localParams as ConcreteSlabParams} onChange={handleChange} />}
        {zone.type === "pergola-base"  && <PergolaBaseForm params={localParams as PergolaBaseParams} onChange={handleChange} />}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          className="flex items-center gap-1 text-hint text-muted hover:text-ink disabled:opacity-30"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 10L3 6l5-4"/></svg>
          Previous
        </button>

        <button
          onClick={() => void handleNext()}
          disabled={saving}
          className="rounded-xl bg-forest px-7 py-3 text-sm font-medium text-paper transition hover:bg-moss disabled:opacity-50"
        >
          {saving ? "Saving…" : currentStepIndex === steps.length - 2 ? "Save & view summary" : "Save & continue →"}
        </button>
      </div>
    </div>
  );
}
