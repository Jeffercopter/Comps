'use client'

// VTM//TOWER — UI shell for the CMD tower mill power model.
//
// This component collects inputs and renders numbers returned by /api/vtm.
// It contains no model maths: view-source and the JS bundle reveal layout
// only. See docs/vtm-tower-model.md.

import { useMemo, useState } from 'react'
import { Box, Dim, Err, Head, Kv, Meter } from '@/components/ui'

interface Frame {
  model: string
  type: 'VTM' | 'JETM'
  D: number
  H: number
  S: number
  rpm: number
  ratedKW: number
}

interface EvaluateResult {
  family: 'VTM' | 'JETM'
  model: string | null
  units: number
  geometry: { D: number; H: number; S: number; rpm: number }
  perUnit: {
    pNittaKW: number
    pMJKW: number
    pRadzKW: number
    pAvgKW: number
    expectedShaftKW: number
    shaftLowKW: number
    shaftHighKW: number
  }
  total: {
    pAvgKW: number
    expectedShaftKW: number
    shaftLowKW: number
    shaftHighKW: number
    recommendedMotorKW: number | null
  }
  duty: {
    tph: number
    seKwht: number
    requiredShaftKW: number
    utilisationPct: number
    options: Array<{
      model: string
      units: number
      ratedKWPerUnit: number
      totalRatedKW: number
      utilisationPct: number
    }>
  } | null
  benchmark: {
    n: number
    meanDiffPct: number
    p10DiffPct: number
    p90DiffPct: number
    nearest: Array<{
      site: string
      model: string
      units: number
      application: string
      ratedKW: number
      shaftKW: number
      pAvgKW: number
    }>
  }
  calibration: { basisInstallations: number; meanErrPct: number; maxErrPct: number }
}

const KW = new Intl.NumberFormat('en-AU', { maximumFractionDigits: 0 })

interface NumFieldProps {
  label: string
  unit: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}

function NumField({ label, unit, value, min, max, step, onChange }: NumFieldProps) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-phos-dim text-[11px] uppercase tracking-widest">{label}</span>
        <span className="text-phos-hot">
          {value}
          <Dim>{unit}</Dim>
        </span>
      </div>
      <input
        type="range"
        className="w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="flex justify-between text-[10px] text-phos-dim">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </label>
  )
}

function Toggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ key: T; label: string }>
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-1">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={`border px-2 py-0.5 text-[11px] uppercase tracking-widest ${
            value === o.key
              ? 'border-phos/60 text-phos-hot bg-phos/10'
              : 'border-edge text-phos-dim hover:text-phos'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function VtmTool({ frames }: { frames: Frame[] }) {
  const [family, setFamily] = useState<'VTM' | 'JETM'>('VTM')
  const [mode, setMode] = useState<'frame' | 'custom'>('frame')
  const familyFrames = useMemo(() => frames.filter((f) => f.type === family), [frames, family])
  const [model, setModel] = useState<string>('VTM-1250')
  const [units, setUnits] = useState(1)
  const [D, setD] = useState(3.9)
  const [H, setH] = useState(5.6)
  const [S, setS] = useState(1.35)
  const [rpm, setRpm] = useState(20)
  const [withDuty, setWithDuty] = useState(false)
  const [tph, setTph] = useState(100)
  const [seKwht, setSeKwht] = useState(8)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<EvaluateResult | null>(null)

  const selectedFrame = familyFrames.find((f) => f.model === model) ?? familyFrames[0]

  function pickFamily(next: 'VTM' | 'JETM') {
    setFamily(next)
    const first = frames.find((f) => f.type === next)
    if (first) setModel(first.model)
  }

  async function run() {
    setBusy(true)
    setError(null)
    try {
      const body: Record<string, unknown> = { mode, family, units }
      if (mode === 'frame') body.model = selectedFrame?.model
      else Object.assign(body, { D, H, S, rpm })
      if (withDuty) Object.assign(body, { tph, seKwht })
      const res = await fetch('/api/vtm', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = (await res.json()) as EvaluateResult & { error?: string }
      if (!res.ok) throw new Error(data.error ?? `request failed (${res.status})`)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  const maxModel = result
    ? Math.max(result.perUnit.pNittaKW, result.perUnit.pMJKW, result.perUnit.pRadzKW)
    : 0

  return (
    <main className="h-screen overflow-y-auto scroll-thin crt">
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
        <header>
          <div className="text-phos-hot text-lg tracking-widest">VTM//TOWER</div>
          <div className="text-phos-dim text-[12px]">
            CMD tower mill power model · Eco-Comminution® · calibrated against{' '}
            {result ? result.calibration.basisInstallations : 82} installations
          </div>
          <div className="text-phos-dim text-[11px] mt-1">
            Predictions are computed server-side. The page you are reading contains no model
            formulas — <span className="text-phos">numbers out, nothing in</span>.
          </div>
        </header>

        <Box title="Configuration">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-4">
              <Toggle
                options={[
                  { key: 'VTM', label: 'VTM (Vertimill)' },
                  { key: 'JETM', label: 'JETM (Tower)' },
                ]}
                value={family}
                onChange={pickFamily}
              />
              <Toggle
                options={[
                  { key: 'frame', label: 'Standard frame' },
                  { key: 'custom', label: 'Custom geometry' },
                ]}
                value={mode}
                onChange={setMode}
              />
            </div>

            {mode === 'frame' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-phos-dim text-[11px] uppercase tracking-widest">Frame</span>
                  <select
                    className="mt-1 w-full border border-edge bg-panel px-2 py-1 text-phos"
                    value={selectedFrame?.model}
                    onChange={(e) => setModel(e.target.value)}
                  >
                    {familyFrames.map((f) => (
                      <option key={f.model} value={f.model}>
                        {f.model} — {KW.format(f.ratedKW)} kW motor
                      </option>
                    ))}
                  </select>
                </label>
                {selectedFrame ? (
                  <div className="text-[12px] self-end">
                    <Kv k="body Ø × height" width={16} v={`${selectedFrame.D} m × ${selectedFrame.H} m`} />
                    <Kv k="screw pitch" width={16} v={`${selectedFrame.S} m`} />
                    <Kv k="screw speed" width={16} v={`${selectedFrame.rpm} rpm`} />
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                <NumField label="Body diameter" unit=" m" value={D} min={0.6} max={7} step={0.05} onChange={setD} />
                <NumField label="Body height" unit=" m" value={H} min={3} max={12} step={0.05} onChange={setH} />
                <NumField label="Screw pitch" unit=" m" value={S} min={0.2} max={2.2} step={0.01} onChange={setS} />
                <NumField label="Screw speed" unit=" rpm" value={rpm} min={10} max={80} step={0.5} onChange={setRpm} />
              </div>
            )}

            <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
              <NumField label="Units installed" unit="" value={units} min={1} max={8} step={1} onChange={setUnits} />
              <label className="flex items-center gap-2 self-end pb-1">
                <input type="checkbox" checked={withDuty} onChange={(e) => setWithDuty(e.target.checked)} />
                <span className="text-phos-dim text-[11px] uppercase tracking-widest">
                  Size against a duty
                </span>
              </label>
            </div>

            {withDuty ? (
              <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                <NumField label="Throughput" unit=" tph" value={tph} min={1} max={1200} step={1} onChange={setTph} />
                <NumField
                  label="Specific energy"
                  unit=" kWh/t"
                  value={seKwht}
                  min={1}
                  max={40}
                  step={0.5}
                  onChange={setSeKwht}
                />
              </div>
            ) : null}

            <button
              type="button"
              onClick={run}
              disabled={busy}
              className="border border-phos/60 px-4 py-1 text-phos-hot uppercase tracking-widest hover:bg-phos/10 disabled:opacity-50"
            >
              {busy ? 'Computing…' : 'Run model'}
            </button>
            {error ? <Err>ERR: {error}</Err> : null}
          </div>
        </Box>

        {result ? (
          <>
            <Box title={`Predicted power — ${result.model ?? 'custom geometry'} × ${result.units}`}>
              <div className="space-y-1 text-[13px]">
                {(
                  [
                    ['Model A (Nitta-type)', result.perUnit.pNittaKW],
                    ['Model B (M&J-type)', result.perUnit.pMJKW],
                    ['Model C (Radziszewski-type)', result.perUnit.pRadzKW],
                  ] as const
                ).map(([label, kw]) => (
                  <Kv
                    key={label}
                    k={label}
                    width={28}
                    v={
                      <span>
                        <Meter value={kw} max={maxModel} width={18} /> {KW.format(kw)} kW/unit
                      </span>
                    }
                  />
                ))}
                <Kv
                  k="Three-model average"
                  width={28}
                  v={<span className="text-phos-hot">{KW.format(result.perUnit.pAvgKW)} kW/unit</span>}
                />
                <div className="h-px bg-edge my-2" />
                <Kv
                  k="Expected shaft power"
                  width={28}
                  v={
                    <span>
                      <span className="text-phos-hot">{KW.format(result.total.expectedShaftKW)} kW</span>{' '}
                      <Dim>
                        total · band {KW.format(result.total.shaftLowKW)}–{KW.format(result.total.shaftHighKW)} kW
                        (fleet p10–p90)
                      </Dim>
                    </span>
                  }
                />
                {result.total.recommendedMotorKW != null ? (
                  <Kv
                    k="Suggested motor frame"
                    width={28}
                    v={`${KW.format(result.total.recommendedMotorKW)} kW installed per unit`}
                  />
                ) : null}
                <div className="text-[11px] text-phos-dim mt-1">
                  Calibration: mean {result.calibration.meanErrPct}% / max {result.calibration.maxErrPct}% deviation
                  from the reference model set · benchmark bias {result.benchmark.meanDiffPct}% vs measured shaft
                  power over {result.benchmark.n} {result.family} installations.
                </div>
              </div>
            </Box>

            {result.duty ? (
              <Box title="Duty sizing">
                <div className="space-y-1 text-[13px]">
                  <Kv
                    k="Required shaft power"
                    width={28}
                    v={`${KW.format(result.duty.requiredShaftKW)} kW (${result.duty.tph} tph × ${result.duty.seKwht} kWh/t)`}
                  />
                  <Kv k="Duty vs predicted draw" width={28} v={`${result.duty.utilisationPct}%`} />
                  <div className="overflow-x-auto">
                    <table className="mt-2 w-full text-left text-[12px]">
                      <thead className="text-phos-dim uppercase text-[10px] tracking-widest">
                        <tr>
                          <th className="pr-3 py-0.5">Option</th>
                          <th className="pr-3">Units</th>
                          <th className="pr-3">Motor / unit</th>
                          <th className="pr-3">Total installed</th>
                          <th>Utilisation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.duty.options.map((o) => (
                          <tr key={o.model} className="border-t border-edge">
                            <td className="pr-3 py-0.5 text-phos-hot">{o.model}</td>
                            <td className="pr-3">{o.units}</td>
                            <td className="pr-3">{KW.format(o.ratedKWPerUnit)} kW</td>
                            <td className="pr-3">{KW.format(o.totalRatedKW)} kW</td>
                            <td>{o.utilisationPct}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Box>
            ) : null}

            <Box title="Nearest benchmark installations">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead className="text-phos-dim uppercase text-[10px] tracking-widest">
                    <tr>
                      <th className="pr-3 py-0.5">Site</th>
                      <th className="pr-3">Model</th>
                      <th className="pr-3">Units</th>
                      <th className="pr-3">Application</th>
                      <th className="pr-3">Rated</th>
                      <th className="pr-3">Shaft</th>
                      <th>Model avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.benchmark.nearest.map((b) => (
                      <tr key={`${b.site}-${b.model}`} className="border-t border-edge">
                        <td className="pr-3 py-0.5 text-phos-hot">{b.site}</td>
                        <td className="pr-3">{b.model}</td>
                        <td className="pr-3">{b.units}</td>
                        <td className="pr-3">{b.application}</td>
                        <td className="pr-3">{KW.format(b.ratedKW)} kW</td>
                        <td className="pr-3">{KW.format(b.shaftKW)} kW</td>
                        <td>{KW.format(b.pAvgKW)} kW</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Box>

            <div className="text-[11px] text-phos-dim">
              Estimates are screening-level: three independent power correlations calibrated to the CMD
              installation benchmark, bias-corrected against measured shaft power. Verify against vendor
              data before committing a flowsheet.
            </div>
          </>
        ) : null}

        <footer className="pt-2 text-[11px] text-phos-dim border-t border-edge">
          CMD Consulting · Eco-Comminution® · <a className="link-cmd" href="/">WHITMORE//AU console</a> ·{' '}
          <a className="link-cmd" href="/mill">DEM SAG mill</a>
        </footer>
      </div>
    </main>
  )
}
