'use client'

import type { ReactNode } from 'react'
import { Box, Bullets, Chip, Cmd, Dim, Err, Head, Kv, Meter } from '@/components/ui'
import {
  CompareTable,
  PlanBlock,
  PlanIndex,
  ProductList,
  ProductSpec,
  StockPlan,
} from '@/components/renderers'
import Roi from '@/components/Roi'
import Enquiry from '@/components/Enquiry'
import { ASPHALTIC_COMPARISON, PLAN } from '@/lib/data/plan'
import { CATEGORY_LABELS, findProduct } from '@/lib/data/products'
import { DRAGLINE, LUBE_POINTS, MAP_AU } from '@/lib/terminal/art'
import type { Product } from '@/lib/types'

export type ThemeName = 'amber' | 'green' | 'ice'

export interface Ctx {
  products: Product[]
  catalogSource: string
  catalogNote?: string
  setTheme: (t: ThemeName) => void
  setCrt: (on: boolean) => void
  setHud: (on: boolean) => void
  setFocus: (slug: string | null) => void
  clear: () => void
  history: string[]
  glitch: () => void
}

export type Group = 'catalog' | 'business' | 'system'

export interface Command {
  name: string
  usage: string
  summary: string
  group: Group
  aliases?: string[]
  run: (args: string[], ctx: Ctx) => ReactNode
}

const CATEGORY_ALIASES: Record<string, string> = {
  ogl: 'open-gear',
  'open-gear': 'open-gear',
  opengear: 'open-gear',
  gearbox: 'gearbox-oil',
  'gearbox-oil': 'gearbox-oil',
  oils: 'gearbox-oil',
  grease: 'grease',
  greases: 'grease',
  rope: 'wire-rope',
  'wire-rope': 'wire-rope',
  specialty: 'specialty',
}

function byCategory(products: Product[], category: string) {
  return products.filter((p) => p.category === category)
}

export const COMMANDS: Command[] = [
  // ── catalog ───────────────────────────────────────────────────────────
  {
    name: 'products',
    usage: 'products [category]',
    summary: 'List the range. Optional category filter.',
    group: 'catalog',
    aliases: ['ls', 'catalog'],
    run: (args, ctx) => {
      const raw = args[0]?.toLowerCase()
      if (!raw) return <ProductList products={ctx.products} title="whitmore range · australian scope" />
      const cat = CATEGORY_ALIASES[raw]
      if (!cat) {
        return (
          <Err>
            Unknown category &quot;{raw}&quot;. Valid: {Object.keys(CATEGORY_LABELS).join(', ')}
          </Err>
        )
      }
      return <ProductList products={byCategory(ctx.products, cat)} title={CATEGORY_LABELS[cat]} />
    },
  },
  {
    name: 'spec',
    usage: 'spec <product>',
    summary: 'Full technical sheet for one product.',
    group: 'catalog',
    aliases: ['cat', 'show'],
    run: (args, ctx) => {
      const q = args.join(' ')
      if (!q) return <Err>Usage: spec &lt;product&gt; — try <Cmd cmd="spec surtac-2000" /></Err>
      const local = ctx.products.find((p) => p.slug === q.toLowerCase())
      const p = local ?? findProduct(q)
      if (!p) {
        return (
          <Err>
            No product matched &quot;{q}&quot;. Run <Cmd cmd="products" /> for the list.
          </Err>
        )
      }
      ctx.setFocus(p.slug)
      return <ProductSpec p={p} />
    },
  },
  {
    name: 'ogl',
    usage: 'ogl',
    summary: 'Open gear lubricants — the conversion range.',
    group: 'catalog',
    run: (_a, ctx) => (
      <ProductList products={byCategory(ctx.products, 'open-gear')} title={CATEGORY_LABELS['open-gear']} />
    ),
  },
  {
    name: 'gearbox',
    usage: 'gearbox',
    summary: 'Enclosed gearbox oils.',
    group: 'catalog',
    run: (_a, ctx) => (
      <ProductList products={byCategory(ctx.products, 'gearbox-oil')} title={CATEGORY_LABELS['gearbox-oil']} />
    ),
  },
  {
    name: 'grease',
    usage: 'grease',
    summary: 'Extreme pressure greases.',
    group: 'catalog',
    run: (_a, ctx) => (
      <ProductList products={byCategory(ctx.products, 'grease')} title={CATEGORY_LABELS['grease']} />
    ),
  },
  {
    name: 'dragline',
    usage: 'dragline',
    summary: 'The dragline package, point by point.',
    group: 'catalog',
    aliases: ['shovel'],
    run: (_a, ctx) => (
      <div className="max-w-[100ch]">
        <pre className="overflow-x-auto scroll-thin text-[10px] leading-[1.2] text-phos sm:text-[12px] md:text-[13px]">
          {DRAGLINE}
        </pre>
        <Head>lubrication points · one machine, four product lines</Head>
        <div className="space-y-0.5">
          {LUBE_POINTS.map((lp) => (
            <div key={lp.point + lp.slug} className="flex flex-wrap gap-2 items-baseline">
              <span className="w-[30ch] shrink-0 text-phos-dim">{lp.point}</span>
              <Cmd cmd={`spec ${lp.slug}`}>{lp.product}</Cmd>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <Box title="why this matters commercially">
            A dragline conversion is not a product substitution. One technical engagement carries
            open gear lubricant, enclosed gear oil, automatic-lube grease and rope dressing — four
            revenue lines from a single survey. That is the whole argument for a technical-service
            distributorship rather than a freight-forwarding one.
          </Box>
        </div>
        <div className="mt-1">
          <Dim>
            Whitmore product is in use on a majority of the world&apos;s draglines. Next:{' '}
            <Cmd cmd="compare" /> · <Cmd cmd="roi" />
          </Dim>
        </div>
        <span className="hidden">{ctx.products.length}</span>
      </div>
    ),
  },
  {
    name: 'search',
    usage: 'search <term>',
    summary: 'Free-text search across the catalogue.',
    group: 'catalog',
    aliases: ['grep', 'find'],
    run: (args, ctx) => {
      const q = args.join(' ').toLowerCase().trim()
      if (!q) return <Err>Usage: search &lt;term&gt; — e.g. <Cmd cmd="search asphalt" /></Err>
      const hits = ctx.products.filter((p) =>
        [
          p.name,
          p.slug,
          p.family,
          p.tagline,
          p.description,
          p.auNote,
          ...p.grades,
          ...p.applications,
          ...p.approvals,
          ...p.replaces,
          ...p.specs.map((s) => `${s.label} ${s.value}`),
        ]
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
      return <ProductList products={hits} title={`search · "${q}" · ${hits.length} hit(s)`} />
    },
  },
  {
    name: 'stock',
    usage: 'stock',
    summary: 'Australian stocking plan by launch priority.',
    group: 'catalog',
    run: (_a, ctx) => <StockPlan products={ctx.products} />,
  },

  // ── business ──────────────────────────────────────────────────────────
  {
    name: 'plan',
    usage: 'plan [section|all]',
    summary: 'The business plan. No argument lists sections.',
    group: 'business',
    run: (args) => {
      const arg = args[0]?.toLowerCase()
      if (!arg) return <PlanIndex sections={PLAN} />
      if (arg === 'all') {
        return (
          <div className="space-y-4">
            {PLAN.map((s) => (
              <PlanBlock key={s.id} s={s} />
            ))}
          </div>
        )
      }
      const s = PLAN.find((x) => x.id === arg) ?? PLAN.find((x) => x.id.startsWith(arg))
      if (!s) {
        return (
          <Err>
            No section &quot;{arg}&quot;. Run <Cmd cmd="plan" /> for the index.
          </Err>
        )
      }
      return <PlanBlock s={s} />
    },
  },
  {
    name: 'compare',
    usage: 'compare',
    summary: 'Asphaltic vs synthetic, dimension by dimension.',
    group: 'business',
    aliases: ['asphaltic', 'synthetics'],
    run: () => <CompareTable columns={ASPHALTIC_COMPARISON.columns} rows={ASPHALTIC_COMPARISON.rows} />,
  },
  {
    name: 'roi',
    usage: 'roi',
    summary: 'Interactive conversion model. Move the assumptions.',
    group: 'business',
    aliases: ['model', 'calc'],
    run: () => <Roi />,
  },
  {
    name: 'au',
    usage: 'au',
    summary: 'Australian distributorship — structure and coverage.',
    group: 'business',
    aliases: ['australia'],
    run: () => {
      const s = PLAN.find((x) => x.id === 'distributorship')!
      return (
        <div className="max-w-[100ch]">
          <pre className="overflow-x-auto scroll-thin text-[10px] leading-[1.2] text-phos sm:text-[12px]">
            {MAP_AU}
          </pre>
          <PlanBlock s={s} />
          <div className="mt-2">
            <Dim>
              Related: <Cmd cmd="plan market" /> · <Cmd cmd="stock" /> · <Cmd cmd="contact" />
            </Dim>
          </div>
        </div>
      )
    },
  },
  {
    name: 'risk',
    usage: 'risk',
    summary: 'Risk register, stated plainly.',
    group: 'business',
    run: () => <PlanBlock s={PLAN.find((x) => x.id === 'risk')!} />,
  },
  {
    name: 'contact',
    usage: 'contact',
    summary: 'Lodge an enquiry.',
    group: 'business',
    aliases: ['enquiry', 'enquire'],
    run: () => <Enquiry />,
  },

  // ── system ────────────────────────────────────────────────────────────
  {
    name: 'help',
    usage: 'help [command]',
    summary: 'This screen.',
    group: 'system',
    aliases: ['?', 'man'],
    run: (args) => {
      const target = args[0]?.toLowerCase()
      if (target) {
        const c = resolve(target)
        if (!c) return <Err>No manual entry for &quot;{target}&quot;.</Err>
        return (
          <div>
            <Head>{c.name}</Head>
            <Kv k="usage" v={<span className="text-phos-hot">{c.usage}</span>} width={12} />
            <Kv k="group" v={c.group} width={12} />
            <Kv k="aliases" v={c.aliases?.join(', ') || '—'} width={12} />
            <div className="mt-1">{c.summary}</div>
          </div>
        )
      }
      const groups: { key: Group; label: string }[] = [
        { key: 'catalog', label: 'catalogue' },
        { key: 'business', label: 'business case' },
        { key: 'system', label: 'system' },
      ]
      return (
        <div className="max-w-[92ch]">
          {groups.map((g) => (
            <div key={g.key}>
              <Head>{g.label}</Head>
              {COMMANDS.filter((c) => c.group === g.key).map((c) => (
                <div key={c.name} className="flex gap-3 items-baseline">
                  <Cmd cmd={c.name}>
                    <span className="inline-block w-[22ch] text-left">{c.usage}</span>
                  </Cmd>
                  <span className="flex-1 min-w-0">{c.summary}</span>
                </div>
              ))}
            </div>
          ))}
          <div className="mt-2 text-[11px]">
            <Dim>
              TAB completes · ↑/↓ recalls history · CTRL+L clears · click any highlighted token to
              run it
            </Dim>
          </div>
        </div>
      )
    },
  },
  {
    name: 'clear',
    usage: 'clear',
    summary: 'Clear the screen.',
    group: 'system',
    aliases: ['cls'],
    run: (_a, ctx) => {
      ctx.clear()
      return null
    },
  },
  {
    name: 'theme',
    usage: 'theme [amber|green|ice]',
    summary: 'Switch the phosphor.',
    group: 'system',
    run: (args, ctx) => {
      const t = args[0]?.toLowerCase() as ThemeName | undefined
      if (!t) return <Dim>Themes: amber · green · ice. Usage: theme green</Dim>
      if (!['amber', 'green', 'ice'].includes(t)) return <Err>Unknown theme &quot;{t}&quot;.</Err>
      ctx.setTheme(t)
      return <span className="text-phos-hot">Phosphor set to {t}.</span>
    },
  },
  {
    name: 'crt',
    usage: 'crt [on|off]',
    summary: 'Toggle scanlines and glow.',
    group: 'system',
    run: (args, ctx) => {
      const on = args[0]?.toLowerCase() !== 'off'
      ctx.setCrt(on)
      return <span className="text-phos-hot">CRT emulation {on ? 'engaged' : 'disengaged'}.</span>
    },
  },
  {
    name: 'hud',
    usage: 'hud [on|off]',
    summary: 'Toggle the telemetry panel.',
    group: 'system',
    run: (args, ctx) => {
      const on = args[0]?.toLowerCase() !== 'off'
      ctx.setHud(on)
      return <span className="text-phos-hot">Telemetry panel {on ? 'shown' : 'hidden'}.</span>
    },
  },
  {
    name: 'status',
    usage: 'status',
    summary: 'Session and data-source diagnostics.',
    group: 'system',
    aliases: ['whoami', 'about'],
    run: (_a, ctx) => (
      <div className="max-w-[84ch]">
        <Head>session</Head>
        <Kv k="console" v="WHITMORE//AU distributorship console" width={18} />
        <Kv
          k="catalogue source"
          v={
            ctx.catalogSource === 'supabase' ? (
              <span className="text-phos-hot">supabase (live)</span>
            ) : (
              <span className="text-warn">bundled seed (local)</span>
            )
          }
          width={18}
        />
        {ctx.catalogNote ? <Kv k="note" v={<Dim>{ctx.catalogNote}</Dim>} width={18} /> : null}
        <Kv k="products loaded" v={String(ctx.products.length)} width={18} />
        <Kv k="plan sections" v={String(PLAN.length)} width={18} />
        <Kv k="commands run" v={String(ctx.history.length)} width={18} />
        <Head>range coverage</Head>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
          const n = byCategory(ctx.products, key).length
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="w-[28ch] shrink-0 text-phos-dim">{label}</span>
              <Meter value={n} max={Math.max(1, ctx.products.length)} width={16} />
              <span className="tabular-nums">{n}</span>
            </div>
          )
        })}
      </div>
    ),
  },
  {
    name: 'history',
    usage: 'history',
    summary: 'Commands run this session.',
    group: 'system',
    run: (_a, ctx) =>
      ctx.history.length === 0 ? (
        <Dim>No history yet.</Dim>
      ) : (
        <div>
          {ctx.history.map((h, i) => (
            <div key={i} className="flex gap-3">
              <span className="w-[4ch] text-right text-phos-dim">{i + 1}</span>
              <Cmd cmd={h}>{h}</Cmd>
            </div>
          ))}
        </div>
      ),
  },
  {
    name: 'sources',
    usage: 'sources',
    summary: 'Where the product data came from, and what it is not.',
    group: 'system',
    run: () => (
      <div className="max-w-[92ch]">
        <Head tone="warn">provenance</Head>
        <p className="max-w-[86ch]">
          Product data in this console was assembled from publicly indexed Whitmore product pages,
          technical data sheets and authorised distributor listings. Direct access to whitmores.com
          was not available from the build environment, so figures should be verified against the
          current manufacturer technical data sheet before they are quoted to a customer.
        </p>
        <Head>primary references</Head>
        <Bullets
          items={[
            'whitmores.com/lubricants/open-gear-lubricants — OGL range',
            'whitmores.com/applications/draglines-shovels — dragline and shovel package',
            'whitmores.com/products/surtac-2000 — non-asphaltic multiservice lubricant',
            'whitmores.com/products/envirolube-xe-extreme — asphalt-free OGL',
            'whitmores.com/products/decathlon-extreme — synthetic enclosed gear oil',
            'whitmores.com/lubricants/extreme-pressure-greases — Caliber and Matrix lines',
            'docs.jetlube.com — Whitmore technical data sheet repository',
          ]}
          marker="·"
        />
        <Head tone="crit">what this is not</Head>
        <Bullets
          items={[
            'Not a manufacturer publication and not endorsed by Whitmore or CSW Industrials.',
            'Australian launch positioning, priorities and commercial framing are our own commercial interpretation, not manufacturer claims.',
            'The ROI model is a model. Every input is an assumption the customer should be invited to argue with.',
          ]}
          marker="×"
        />
      </div>
    ),
  },
  {
    name: 'matrix',
    usage: 'matrix',
    summary: 'Do not run this.',
    group: 'system',
    run: (_a, ctx) => {
      ctx.glitch()
      return (
        <div>
          <span className="text-phos-hot">Signal degradation detected. Re-seating the tube…</span>
          <div className="mt-1">
            <Dim>(It settles. It always settles.)</Dim>
          </div>
        </div>
      )
    },
  },
]

const INDEX = new Map<string, Command>()
for (const c of COMMANDS) {
  INDEX.set(c.name, c)
  for (const a of c.aliases ?? []) INDEX.set(a, c)
}

export function resolve(name: string): Command | undefined {
  return INDEX.get(name.toLowerCase())
}

export const ALL_NAMES: string[] = Array.from(INDEX.keys()).sort()

/** Tab-completion: command names first, then product slugs for `spec`. */
export function complete(line: string, products: Product[]): string[] {
  const parts = line.split(/\s+/)
  if (parts.length <= 1) {
    const q = (parts[0] ?? '').toLowerCase()
    return COMMANDS.map((c) => c.name)
      .filter((n) => n.startsWith(q))
      .sort()
  }
  const cmd = resolve(parts[0])
  const arg = parts[parts.length - 1].toLowerCase()
  const prefix = parts.slice(0, -1).join(' ')

  let pool: string[] = []
  if (cmd?.name === 'spec' || cmd?.name === 'search') pool = products.map((p) => p.slug)
  else if (cmd?.name === 'plan') pool = [...PLAN.map((s) => s.id), 'all']
  else if (cmd?.name === 'products') pool = Object.keys(CATEGORY_LABELS)
  else if (cmd?.name === 'theme') pool = ['amber', 'green', 'ice']
  else if (cmd?.name === 'crt' || cmd?.name === 'hud') pool = ['on', 'off']
  else if (cmd?.name === 'help') pool = COMMANDS.map((c) => c.name)

  return pool.filter((p) => p.startsWith(arg)).map((p) => `${prefix} ${p}`)
}

/**
 * Longest string every candidate starts with — what a real shell fills in on
 * TAB when several completions remain. `spec dec` becomes `spec decathlon-`
 * rather than jumping to whichever variant happens to sort first.
 */
export function commonPrefix(candidates: string[]): string {
  if (candidates.length === 0) return ''
  let prefix = candidates[0]
  for (const c of candidates.slice(1)) {
    let i = 0
    while (i < prefix.length && i < c.length && prefix[i] === c[i]) i++
    prefix = prefix.slice(0, i)
    if (!prefix) break
  }
  return prefix
}

export function execute(line: string, ctx: Ctx): ReactNode {
  const trimmed = line.trim()
  if (!trimmed) return null
  const [name, ...args] = trimmed.split(/\s+/)
  const cmd = resolve(name)
  if (!cmd) {
    const near = COMMANDS.map((c) => c.name).filter((n) => n.startsWith(name.toLowerCase().slice(0, 2)))
    return (
      <Err>
        {name}: command not found.{' '}
        {near.length ? (
          <>
            Did you mean <Cmd cmd={near[0]} />?
          </>
        ) : (
          <>
            Run <Cmd cmd="help" />.
          </>
        )}
      </Err>
    )
  }
  return cmd.run(args, ctx)
}

export function bootChips(): ReactNode {
  return (
    <div className="flex flex-wrap gap-1">
      <Chip hot>asphaltics → synthetics</Chip>
      <Chip>open gear</Chip>
      <Chip>gearbox oils</Chip>
      <Chip>EP greases</Chip>
      <Chip>draglines</Chip>
    </div>
  )
}
