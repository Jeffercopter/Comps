'use client'

import { useEffect, useMemo, useState } from 'react'
import { Cmd, Dim, Meter } from '@/components/ui'
import { CATEGORY_LABELS } from '@/lib/data/products'
import type { Product } from '@/lib/types'

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-edge px-3 py-2">
      <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-phos-dim">{title}</div>
      {children}
    </section>
  )
}

/** Rolling sparkline rendered from block glyphs. */
function Sparkline({ values }: { values: number[] }) {
  const blocks = '▁▂▃▄▅▆▇█'
  const max = Math.max(...values, 1)
  const line = values
    .map((v) => blocks[Math.min(blocks.length - 1, Math.floor((v / max) * (blocks.length - 1)))])
    .join('')
  return <span className="text-phos-hot">{line}</span>
}

interface Props {
  products: Product[]
  catalogSource: string
  focus: Product | null
  commandCount: number
}

export default function Hud({ products, catalogSource, focus, commandCount }: Props) {
  const [clock, setClock] = useState<string | null>(null)
  const [series, setSeries] = useState<number[]>(() => Array.from({ length: 28 }, () => 3))

  useEffect(() => {
    const tick = () => {
      setClock(
        new Intl.DateTimeFormat('en-AU', {
          timeZone: 'Australia/Brisbane',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(new Date()),
      )
      // Random walk standing in for a live consumption telemetry feed.
      setSeries((s) => {
        const last = s[s.length - 1] ?? 3
        const next = Math.max(0.5, Math.min(8, last + (Math.random() - 0.48) * 1.6))
        return [...s.slice(1), next]
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const counts = useMemo(
    () =>
      Object.keys(CATEGORY_LABELS).map((key) => ({
        key,
        label: CATEGORY_LABELS[key],
        n: products.filter((p) => p.category === key).length,
      })),
    [products],
  )

  const live = catalogSource === 'supabase'

  return (
    <aside className="hidden h-full w-[330px] shrink-0 flex-col overflow-y-auto border-l border-edge bg-panel/70 backdrop-blur-sm scroll-thin xl:flex">
      <Panel title="link status">
        <div className="flex items-baseline justify-between">
          <span>catalogue</span>
          <span className={live ? 'text-phos-hot' : 'text-warn'}>
            {live ? '● supabase' : '○ local seed'}
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span>brisbane</span>
          <span className="tabular-nums text-phos-hot">{clock ?? '--:--:--'}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span>commands</span>
          <span className="tabular-nums">{commandCount}</span>
        </div>
      </Panel>

      <Panel title="applied volume · simulated">
        <div className="text-lg leading-none">
          <Sparkline values={series} />
        </div>
        <div className="mt-1 text-[11px]">
          <Dim>Illustrative feed. Real conversions are audited at 30/90/180 days.</Dim>
        </div>
      </Panel>

      <Panel title="range coverage">
        <div className="space-y-1">
          {counts.map((c) => (
            <div key={c.key}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[11px] text-phos-dim">{c.label}</span>
                <span className="tabular-nums text-[11px]">{c.n}</span>
              </div>
              <Meter value={c.n} max={Math.max(1, products.length)} width={26} />
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="focus">
        {focus ? (
          <div>
            <div className="text-phos-hot">{focus.name}</div>
            <div className="mt-0.5 text-[11px] text-phos-dim">{focus.tagline}</div>
            <div className="mt-1 space-y-0.5 text-[11px]">
              {focus.specs.slice(0, 4).map((s) => (
                <div key={s.label} className="flex justify-between gap-2">
                  <span className="text-phos-dim">{s.label}</span>
                  <span className="text-right">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Dim>No product selected. Run a spec.</Dim>
        )}
      </Panel>

      <Panel title="jump">
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[12px]">
          {['plan', 'compare', 'roi', 'dragline', 'au', 'stock', 'risk', 'contact', 'sources'].map((c) => (
            <Cmd key={c} cmd={c} />
          ))}
        </div>
      </Panel>

      <div className="mt-auto px-3 py-2 text-[10px] leading-relaxed text-phos-dim/70">
        Independent distributorship proposal. Product data compiled from public Whitmore technical
        literature; verify against current manufacturer data sheets before quoting.
      </div>
    </aside>
  )
}
