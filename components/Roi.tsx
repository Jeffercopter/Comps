'use client'

import { useMemo, useState } from 'react'
import { Box, Dim, Head, Meter } from '@/components/ui'

const AUD = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 0,
})

interface Field {
  key: keyof Inputs
  label: string
  min: number
  max: number
  step: number
  unit: string
  hint: string
}

interface Inputs {
  machines: number
  tonnesPerMachine: number
  asphalticPrice: number
  syntheticPrice: number
  reduction: number
  cleandownHours: number
  downtimeCost: number
}

const FIELDS: Field[] = [
  {
    key: 'machines',
    label: 'Machines in scope',
    min: 1,
    max: 24,
    step: 1,
    unit: '',
    hint: 'draglines / shovels / mills being converted',
  },
  {
    key: 'tonnesPerMachine',
    label: 'Current OGL draw',
    min: 2,
    max: 80,
    step: 1,
    unit: ' t/machine/yr',
    hint: 'measured baseline on the incumbent asphaltic product',
  },
  {
    key: 'asphalticPrice',
    label: 'Asphaltic price',
    min: 2,
    max: 20,
    step: 0.5,
    unit: ' $/kg',
    hint: 'delivered, incl. freight and drum handling',
  },
  {
    key: 'syntheticPrice',
    label: 'Synthetic price',
    min: 4,
    max: 40,
    step: 0.5,
    unit: ' $/kg',
    hint: 'higher per kilogram — that is the point of the exercise',
  },
  {
    key: 'reduction',
    label: 'Consumption reduction',
    min: 0,
    max: 70,
    step: 1,
    unit: '%',
    hint: 'Surtac 2000 is quoted at ~50% vs asphaltic fluids',
  },
  {
    key: 'cleandownHours',
    label: 'Clean-down removed',
    min: 0,
    max: 60,
    step: 1,
    unit: ' h/machine/yr',
    hint: 'shut hours no longer spent chipping hardened residue',
  },
  {
    key: 'downtimeCost',
    label: 'Cost of a shut hour',
    min: 0,
    max: 60000,
    step: 1000,
    unit: ' $/h',
    hint: 'set to zero to see the product-only case',
  },
]

const DEFAULTS: Inputs = {
  machines: 3,
  tonnesPerMachine: 24,
  asphalticPrice: 6,
  syntheticPrice: 11,
  reduction: 50,
  cleandownHours: 18,
  downtimeCost: 18000,
}

/**
 * Interactive conversion model. Every figure the user can move is an
 * assumption, and the panel says so — the point is to let a customer argue with
 * the inputs rather than the conclusion.
 */
export default function Roi() {
  const [v, setV] = useState<Inputs>(DEFAULTS)

  const m = useMemo(() => {
    const kgNow = v.tonnesPerMachine * 1000 * v.machines
    const kgAfter = kgNow * (1 - v.reduction / 100)
    const spendNow = kgNow * v.asphalticPrice
    const spendAfter = kgAfter * v.syntheticPrice
    const productSaving = spendNow - spendAfter
    const downtimeSaving = v.cleandownHours * v.machines * v.downtimeCost
    const total = productSaving + downtimeSaving
    const pct = spendNow === 0 ? 0 : (productSaving / spendNow) * 100
    return { kgNow, kgAfter, spendNow, spendAfter, productSaving, downtimeSaving, total, pct }
  }, [v])

  const worse = m.productSaving < 0
  const peak = Math.max(m.spendNow, m.spendAfter, 1)

  return (
    <div className="my-1 max-w-[72ch]">
      <Head>conversion model — annual, all machines in scope</Head>

      <div className="space-y-2 border border-edge p-2">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor={`roi-${f.key}`} className="text-phos-dim">
                {f.label}
              </label>
              <span className="text-phos-hot tabular-nums">
                {f.key === 'downtimeCost'
                  ? AUD.format(v[f.key])
                  : `${v[f.key]}${f.unit}`}
                {f.key === 'downtimeCost' ? '/h' : ''}
              </span>
            </div>
            {/* The 2px track needs its own padding so the 15px thumb does not
                collide with the hint line below it. */}
            <div className="py-2">
              <input
                id={`roi-${f.key}`}
                type="range"
                className="block w-full"
                min={f.min}
                max={f.max}
                step={f.step}
                value={v[f.key]}
                aria-label={f.label}
                onChange={(e) => setV((s) => ({ ...s, [f.key]: Number(e.target.value) }))}
              />
            </div>
            <div className="text-[11px] text-phos-dim/80">{f.hint}</div>
          </div>
        ))}
      </div>

      <Head>result</Head>
      <Box>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-[18ch] shrink-0 text-phos-dim">asphaltic spend</span>
            <Meter value={m.spendNow} max={peak} width={20} />
            <span className="tabular-nums">{AUD.format(m.spendNow)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-[18ch] shrink-0 text-phos-dim">converted spend</span>
            <Meter value={m.spendAfter} max={peak} width={20} />
            <span className="tabular-nums">{AUD.format(m.spendAfter)}</span>
          </div>
        </div>

        <div className="mt-2 border-t border-edge pt-2 space-y-0.5">
          <div className="flex justify-between gap-3">
            <span className="text-phos-dim">applied volume</span>
            <span className="tabular-nums">
              {(m.kgNow / 1000).toFixed(1)} t → {(m.kgAfter / 1000).toFixed(1)} t
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-phos-dim">product saving</span>
            <span className={`tabular-nums ${worse ? 'text-crit' : 'text-phos-hot'}`}>
              {AUD.format(m.productSaving)} ({m.pct.toFixed(0)}%)
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-phos-dim">shut-hour saving</span>
            <span className="tabular-nums">{AUD.format(m.downtimeSaving)}</span>
          </div>
          <div className="mt-1 flex justify-between gap-3 border-t border-edge pt-1 text-phos-hot">
            <span className="uppercase tracking-widest text-[11px]">total annual benefit</span>
            <span className="tabular-nums text-base">{AUD.format(m.total)}</span>
          </div>
        </div>
      </Box>

      {worse ? (
        <div className="mt-1 text-warn">
          ! At this reduction and price pair the product line alone goes backwards. That is the
          honest answer — the case then rests entirely on shut hours and gear life, and should be
          argued there rather than on consumption.
        </div>
      ) : null}

      <div className="mt-1 text-[11px] text-phos-dim/80">
        <Dim>
          Model, not a quotation. Gear life extension is excluded entirely — a girth gear or swing
          rack replacement is a capital event that dwarfs every figure above, and is deliberately
          left out so the result stays defensible.
        </Dim>
      </div>
    </div>
  )
}
