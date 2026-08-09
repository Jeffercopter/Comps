'use client'

import { createContext, useContext, type ReactNode } from 'react'

/** Lets any rendered output emit a clickable command back into the shell. */
export const RunContext = createContext<(cmd: string) => void>(() => {})

export function useRun() {
  return useContext(RunContext)
}

/** A clickable command token embedded in output. */
export function Cmd({ children, cmd }: { children?: ReactNode; cmd: string }) {
  const run = useRun()
  return (
    <button className="link-cmd" onClick={() => run(cmd)} type="button">
      {children ?? cmd}
    </button>
  )
}

export function Chip({ children, hot }: { children: ReactNode; hot?: boolean }) {
  return <span className={`chip${hot ? ' chip-hot' : ''}`}>{children}</span>
}

/** Section heading rendered as a box-drawing rule that fills the width. */
export function Head({ children, tone = 'phos' }: { children: ReactNode; tone?: 'phos' | 'warn' | 'crit' }) {
  const color = tone === 'warn' ? 'text-warn' : tone === 'crit' ? 'text-crit' : 'text-phos-hot'
  return (
    <div className={`flex items-center gap-2 mt-3 mb-1 ${color}`}>
      <span className="shrink-0 tracking-widest text-[11px] uppercase">{children}</span>
      <span className="h-px flex-1 bg-edge" />
    </div>
  )
}

/** Aligned key/value row — the workhorse of every spec readout. */
export function Kv({ k, v, width = 22 }: { k: string; v: ReactNode; width?: number }) {
  return (
    <div className="flex gap-3 items-baseline">
      <span className="shrink-0 text-phos-dim" style={{ width: `${width}ch` }}>
        {k.padEnd(width, '·')}
      </span>
      <span className="flex-1 min-w-0">{v}</span>
    </div>
  )
}

export function Bullets({ items, marker = '›' }: { items: string[]; marker?: string }) {
  return (
    <ul className="space-y-0.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-phos-dim shrink-0">{marker}</span>
          <span className="flex-1">{it}</span>
        </li>
      ))}
    </ul>
  )
}

export function Err({ children }: { children: ReactNode }) {
  return <div className="text-crit">{children}</div>
}

export function Dim({ children }: { children: ReactNode }) {
  return <span className="text-phos-dim">{children}</span>
}

/** Horizontal meter used for priorities, savings and confidence bars. */
export function Meter({ value, max = 100, width = 24 }: { value: number; max?: number; width?: number }) {
  const ratio = Math.max(0, Math.min(1, max === 0 ? 0 : value / max))
  const filled = Math.round(ratio * width)
  return (
    <span className="whitespace-pre">
      <span className="text-phos-hot">{'█'.repeat(filled)}</span>
      <span className="text-edge">{'░'.repeat(Math.max(0, width - filled))}</span>
    </span>
  )
}

/** Bordered block used for tables and callouts. */
export function Box({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="border border-edge">
      {title ? (
        <div className="border-b border-edge px-2 py-0.5 text-[11px] uppercase tracking-widest text-phos-dim">
          {title}
        </div>
      ) : null}
      <div className="p-2">{children}</div>
    </div>
  )
}
