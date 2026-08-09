'use client'

import { Box, Bullets, Chip, Cmd, Dim, Head, Kv, Meter } from '@/components/ui'
import { CATEGORY_LABELS, CHEMISTRY_LABELS } from '@/lib/data/products'
import type { PlanSection, Product } from '@/lib/types'

const PRIORITY_LABEL: Record<number, string> = {
  1: 'P1 · launch',
  2: 'P2 · phase 2',
  3: 'P3 · range',
}

export function ProductLine({ p }: { p: Product }) {
  return (
    <div className="flex gap-2 items-baseline">
      <span className="shrink-0 text-phos-dim w-[3ch] text-right">P{p.auPriority}</span>
      <Cmd cmd={`spec ${p.slug}`}>
        <span className="inline-block w-[26ch] text-left">{p.slug}</span>
      </Cmd>
      <span className="flex-1 min-w-0 truncate">{p.tagline}</span>
    </div>
  )
}

export function ProductList({ products, title }: { products: Product[]; title: string }) {
  if (products.length === 0) {
    return <Dim>No products matched.</Dim>
  }
  const byCategory = products.reduce<Record<string, Product[]>>((acc, p) => {
    ;(acc[p.category] ??= []).push(p)
    return acc
  }, {})

  return (
    <div className="max-w-[96ch]">
      <Head>{title}</Head>
      {Object.entries(byCategory).map(([cat, items]) => (
        <div key={cat} className="mb-2">
          <div className="text-phos-hot">{CATEGORY_LABELS[cat] ?? cat}</div>
          <div className="mt-0.5">
            {items
              .slice()
              .sort((a, b) => a.auPriority - b.auPriority || a.name.localeCompare(b.name))
              .map((p) => (
                <ProductLine key={p.slug} p={p} />
              ))}
          </div>
        </div>
      ))}
      <Dim>
        {products.length} product{products.length === 1 ? '' : 's'} · run{' '}
        <Cmd cmd="spec surtac-2000">spec &lt;name&gt;</Cmd> for the full sheet
      </Dim>
    </div>
  )
}

export function ProductSpec({ p }: { p: Product }) {
  return (
    <div className="max-w-[92ch]">
      <div className="mt-1 flex flex-wrap items-baseline gap-2">
        <span className="text-lg text-phos-hot">{p.name}</span>
        <Chip hot>{CHEMISTRY_LABELS[p.chemistry]}</Chip>
        <Chip>{CATEGORY_LABELS[p.category]}</Chip>
        <Chip>{PRIORITY_LABEL[p.auPriority]}</Chip>
      </div>
      <div className="mt-0.5 text-phos-dim">{p.tagline}</div>

      <Head>description</Head>
      <p className="max-w-[84ch]">{p.description}</p>

      <Head>technical</Head>
      <div className="space-y-0.5">
        {p.specs.map((s) => (
          <Kv key={s.label} k={s.label} v={s.value} width={26} />
        ))}
      </div>

      <Head>grades</Head>
      <Bullets items={p.grades} marker="·" />

      <Head>applications</Head>
      <Bullets items={p.applications} />

      <Head>specifications met</Head>
      <Bullets items={p.approvals} marker="✓" />

      <Head tone="warn">displaces</Head>
      <Bullets items={p.replaces} marker="×" />

      <Head>australian launch note</Head>
      <p className="max-w-[84ch] text-phos-hot/90">{p.auNote}</p>

      <div className="mt-2 text-[11px] text-phos-dim/80">
        source:{' '}
        {p.sources.map((s, i) => (
          <span key={s}>
            {i > 0 ? ' · ' : ''}
            <a href={s} target="_blank" rel="noopener noreferrer" className="underline">
              {new URL(s).pathname.replace(/^\//, '') || new URL(s).host}
            </a>
          </span>
        ))}
      </div>

      <div className="mt-2">
        <Dim>
          next: <Cmd cmd="roi" /> · <Cmd cmd="compare" /> · <Cmd cmd="products" />
        </Dim>
      </div>
    </div>
  )
}

export function CompareTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <div className="max-w-[110ch] overflow-x-auto scroll-thin">
      <Head tone="warn">asphaltic → synthetic · dimension by dimension</Head>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-edge">
            {columns.map((c, i) => (
              <th
                key={c}
                className={`px-2 py-1 align-bottom text-[11px] uppercase tracking-widest ${
                  i === 1 ? 'text-crit' : i === 2 ? 'text-phos-hot' : 'text-phos-dim'
                }`}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className="border-b border-edge/50 align-top">
              {r.map((cell, ci) => (
                <td
                  key={ci}
                  className={`px-2 py-1 ${
                    ci === 0
                      ? 'text-phos-dim whitespace-nowrap'
                      : ci === 1
                        ? 'text-crit/85'
                        : 'text-phos-hot/90'
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-1">
        <Dim>
          Model the money: <Cmd cmd="roi" />
        </Dim>
      </div>
    </div>
  )
}

export function PlanBlock({ s }: { s: PlanSection }) {
  return (
    <div className="max-w-[92ch]">
      <div className="mt-1 flex flex-wrap items-baseline gap-2">
        <span className="text-lg text-phos-hot">{s.title}</span>
        <Chip>{s.id}</Chip>
      </div>
      <div className="mt-0.5 text-phos-dim">{s.summary}</div>

      {s.metrics?.length ? (
        <div className="mt-2 grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
          {s.metrics.map((mt) => (
            <div key={mt.label} className="border border-edge px-2 py-1">
              <div className="text-[10px] uppercase tracking-widest text-phos-dim">{mt.label}</div>
              <div className="text-base text-phos-hot leading-tight">{mt.value}</div>
              {mt.note ? <div className="text-[11px] text-phos-dim/80">{mt.note}</div> : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-2 space-y-2">
        {s.body.map((para, i) => (
          <p key={i} className="max-w-[86ch]">
            {para}
          </p>
        ))}
      </div>
    </div>
  )
}

export function PlanIndex({ sections }: { sections: PlanSection[] }) {
  return (
    <div className="max-w-[92ch]">
      <Head>business plan · whitmore australia distributorship</Head>
      <div className="space-y-0.5">
        {sections.map((s, i) => (
          <div key={s.id} className="flex gap-2 items-baseline">
            <span className="w-[3ch] shrink-0 text-right text-phos-dim">{String(i + 1).padStart(2, '0')}</span>
            <Cmd cmd={`plan ${s.id}`}>
              <span className="inline-block w-[20ch] text-left">{s.id}</span>
            </Cmd>
            <span className="flex-1 min-w-0 truncate">{s.summary}</span>
          </div>
        ))}
      </div>
      <div className="mt-2">
        <Dim>
          <Cmd cmd="plan all">plan all</Cmd> reads the document end to end.
        </Dim>
      </div>
    </div>
  )
}

/** Priority distribution readout used by `stock`. */
export function StockPlan({ products }: { products: Product[] }) {
  const tiers = [1, 2, 3] as const
  return (
    <div className="max-w-[92ch]">
      <Head>australian stocking plan</Head>
      {tiers.map((t) => {
        const items = products.filter((p) => p.auPriority === t)
        return (
          <div key={t} className="mb-2">
            <div className="flex items-center gap-2">
              <span className="text-phos-hot">{PRIORITY_LABEL[t]}</span>
              <Meter value={items.length} max={products.length} width={18} />
              <Dim>
                {items.length} SKU line{items.length === 1 ? '' : 's'}
              </Dim>
            </div>
            <div className="mt-0.5 pl-2">
              {items.map((p) => (
                <div key={p.slug} className="flex gap-2 items-baseline">
                  <Cmd cmd={`spec ${p.slug}`}>
                    <span className="inline-block w-[26ch] text-left">{p.slug}</span>
                  </Cmd>
                  <span className="flex-1 min-w-0 truncate text-phos-dim">{p.auNote}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
      <Box title="stocking policy">
        P1 held locally against forecast, not against order. Product ships from the United States;
        a machine down waiting on a container is an account lost permanently, so the stock position
        is funded as a cost of market entry rather than minimised as working capital.
      </Box>
    </div>
  )
}
