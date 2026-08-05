'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import Backdrop from '@/components/Backdrop'
import Hud from '@/components/Hud'
import { Chip, Cmd, Dim, RunContext } from '@/components/ui'
import { commonPrefix, complete, execute, type Ctx, type ThemeName } from '@/lib/terminal/commands'
import { LOGO } from '@/lib/terminal/art'
import type { Product } from '@/lib/types'

interface Entry {
  id: number
  input: string | null
  node: ReactNode
}

interface Props {
  products: Product[]
  catalogSource: string
  catalogNote?: string
}

const PROMPT = 'whitmore@au:~$'
const THEMES: ThemeName[] = ['amber', 'green', 'ice']

export default function Console({ products, catalogSource, catalogNote }: Props) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histCursor, setHistCursor] = useState(-1)
  const [theme, setTheme] = useState<ThemeName>('amber')
  const [crt, setCrt] = useState(true)
  const [hudOn, setHudOn] = useState(true)
  const [focusSlug, setFocusSlug] = useState<string | null>(null)
  const [glitching, setGlitching] = useState(false)
  const [bootStep, setBootStep] = useState(0)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const streamRef = useRef<HTMLDivElement | null>(null)
  const idRef = useRef(0)
  const clearedRef = useRef(false)
  const historyRef = useRef<string[]>([])

  const bootLines = useMemo(
    () => [
      { text: 'WHITMORE//AU distributorship console — cold start', tone: 'dim' as const },
      { text: '[  OK  ] phosphor tube warm', tone: 'ok' as const },
      {
        text: `[  OK  ] catalogue link · ${catalogSource === 'supabase' ? 'supabase (live)' : 'bundled seed (local)'}`,
        tone: catalogSource === 'supabase' ? ('ok' as const) : ('warn' as const),
      },
      { text: `[  OK  ] ${products.length} products indexed`, tone: 'ok' as const },
      { text: '[  OK  ] business plan mounted · 8 sections', tone: 'ok' as const },
      { text: '[ WARN ] incumbent chemistry on site: ASPHALTIC', tone: 'warn' as const },
      { text: '[ WARN ] applied volume ~2× modelled requirement', tone: 'warn' as const },
      { text: '[ WARN ] shut clean-down on critical path', tone: 'warn' as const },
      { text: '[ INFO ] remediation available — run `compare`', tone: 'ok' as const },
      { text: 'ready.', tone: 'dim' as const },
    ],
    [catalogSource, products.length],
  )

  // ── boot sequence ───────────────────────────────────────────────────────
  useEffect(() => {
    if (bootStep >= bootLines.length) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const delay = reduced ? 0 : bootStep === 0 ? 260 : 130
    const t = setTimeout(() => setBootStep((s) => s + 1), delay)
    return () => clearTimeout(t)
  }, [bootStep, bootLines.length])

  const booted = bootStep >= bootLines.length

  // ── persisted preferences ───────────────────────────────────────────────
  useEffect(() => {
    try {
      const t = localStorage.getItem('wm.theme') as ThemeName | null
      if (t && THEMES.includes(t)) setTheme(t)
      const c = localStorage.getItem('wm.crt')
      if (c !== null) setCrt(c === '1')
      const h = localStorage.getItem('wm.hud')
      if (h !== null) setHudOn(h === '1')
    } catch {
      /* storage unavailable — defaults are fine */
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('wm.theme', theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  useEffect(() => {
    try {
      localStorage.setItem('wm.crt', crt ? '1' : '0')
      localStorage.setItem('wm.hud', hudOn ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [crt, hudOn])

  // ── command execution ───────────────────────────────────────────────────
  const glitch = useCallback(() => {
    setGlitching(true)
    setTimeout(() => setGlitching(false), 900)
  }, [])

  const run = useCallback(
    (line: string) => {
      const trimmed = line.trim()
      if (!trimmed) {
        setEntries((e) => [...e, { id: idRef.current++, input: '', node: null }])
        return
      }

      historyRef.current = [...historyRef.current, trimmed]
      setHistory(historyRef.current)
      setHistCursor(-1)

      const ctx: Ctx = {
        products,
        catalogSource,
        catalogNote,
        setTheme,
        setCrt,
        setHud: setHudOn,
        setFocus: setFocusSlug,
        clear: () => {
          clearedRef.current = true
        },
        history: historyRef.current,
        glitch,
      }

      let node: ReactNode
      try {
        node = execute(trimmed, ctx)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        node = <span className="text-crit">internal error: {message}</span>
      }

      if (clearedRef.current) {
        clearedRef.current = false
        setEntries([])
        return
      }
      setEntries((e) => [...e, { id: idRef.current++, input: trimmed, node }])
    },
    [products, catalogSource, catalogNote, glitch],
  )

  // ── deep link: ?cmd=compare ─────────────────────────────────────────────
  const deepLinkDone = useRef(false)
  useEffect(() => {
    if (!booted || deepLinkDone.current) return
    deepLinkDone.current = true
    const params = new URLSearchParams(window.location.search)
    const cmd = params.get('cmd')
    if (cmd) run(cmd)
  }, [booted, run])

  // ── autoscroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    const el = streamRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [entries, bootStep])

  // ── global keys ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault()
        setEntries([])
        return
      }
      // Any bare typing focuses the prompt, the way a real terminal behaves.
      const target = e.target as HTMLElement | null
      const typingElsewhere =
        target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      if (!typingElsewhere && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const suggestions = useMemo(
    () => (input.trim() ? complete(input, products) : []),
    [input, products],
  )
  const ghost = useMemo(() => {
    const shared = commonPrefix(suggestions)
    if (!shared || !shared.startsWith(input) || shared === input) return ''
    return shared.slice(input.length)
  }, [suggestions, input])

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      run(input)
      setInput('')
      return
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      if (suggestions.length === 1) setInput(suggestions[0] + ' ')
      else if (suggestions.length > 1) {
        if (ghost) setInput(input + ghost)
        else
          setEntries((en) => [
            ...en,
            {
              id: idRef.current++,
              input: null,
              node: (
                <div className="flex flex-wrap gap-x-4">
                  {suggestions.slice(0, 40).map((s) => (
                    <span key={s} className="text-phos-dim">
                      {s}
                    </span>
                  ))}
                </div>
              ),
            },
          ])
      }
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const h = historyRef.current
      if (h.length === 0) return
      const next = histCursor < 0 ? h.length - 1 : Math.max(0, histCursor - 1)
      setHistCursor(next)
      setInput(h[next])
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const h = historyRef.current
      if (histCursor < 0) return
      const next = histCursor + 1
      if (next >= h.length) {
        setHistCursor(-1)
        setInput('')
      } else {
        setHistCursor(next)
        setInput(h[next])
      }
      return
    }
    if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault()
      setEntries((en) => [
        ...en,
        { id: idRef.current++, input: input, node: <Dim>^C</Dim> },
      ])
      setInput('')
    }
  }

  const focusProduct = useMemo(
    () => products.find((p) => p.slug === focusSlug) ?? null,
    [products, focusSlug],
  )

  const toneClass = (tone: 'ok' | 'warn' | 'dim') =>
    tone === 'warn' ? 'text-warn' : tone === 'ok' ? 'text-phos' : 'text-phos-dim'

  return (
    <RunContext.Provider value={run}>
      <Backdrop />
      {crt ? <div className="crt-vignette" /> : null}
      <div
        className={`relative z-10 flex h-screen w-screen flex-col ${crt ? 'crt crt-scanlines' : ''} ${
          glitching ? 'glitching' : ''
        }`}
      >
        {/* ── title bar ────────────────────────────────────────────────── */}
        <header className="flex shrink-0 items-center gap-3 border-b border-edge bg-panel/80 px-3 py-1.5 backdrop-blur-sm">
          <span className="text-phos-hot tracking-[0.22em] text-[11px]">WHITMORE//AU</span>
          <span className="hidden text-[11px] text-phos-dim sm:inline">
            distributorship console
          </span>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:inline">
              <Chip hot>{catalogSource === 'supabase' ? 'supabase' : 'local seed'}</Chip>
            </span>
            <button
              type="button"
              onClick={() => setTheme(THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length])}
              className="chip hover:bg-phos/15"
              title="Cycle phosphor"
            >
              {theme}
            </button>
            <button
              type="button"
              onClick={() => setCrt((c) => !c)}
              className="chip hover:bg-phos/15"
              title="Toggle CRT emulation"
            >
              crt {crt ? 'on' : 'off'}
            </button>
            <button
              type="button"
              onClick={() => setHudOn((h) => !h)}
              className="chip hidden hover:bg-phos/15 xl:inline-block"
              title="Toggle telemetry panel"
            >
              hud {hudOn ? 'on' : 'off'}
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          {/* ── stream ─────────────────────────────────────────────────── */}
          <main
            ref={streamRef}
            className="scroll-thin min-w-0 flex-1 overflow-y-auto px-3 py-2 sm:px-5"
            onClick={(e) => {
              // Don't steal focus from clickable output or form fields.
              const t = e.target as HTMLElement
              if (['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT', 'LABEL'].includes(t.tagName)) return
              inputRef.current?.focus()
            }}
          >
            {/* boot */}
            <div className="space-y-0" aria-live="polite">
              {bootLines.slice(0, bootStep).map((l, i) => (
                <div key={i} className={`reveal ${toneClass(l.tone)}`}>
                  {l.text}
                </div>
              ))}
            </div>

            {booted ? (
              <div className="reveal mt-3">
                <pre className="overflow-x-auto scroll-thin text-[7px] leading-[1.15] text-phos-hot sm:text-[9px] md:text-[11px]">
                  {LOGO}
                </pre>
                <div className="mt-2 max-w-[86ch]">
                  <p>
                    Whitmore has manufactured lubricants for gears, bearings, chains and wire ropes
                    for more than a century, and its products run on a majority of the world&apos;s
                    draglines. This console is the case for an Australian distributorship built
                    around one movement:{' '}
                    <span className="text-phos-hot">off asphaltics, onto synthetics</span>.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Chip hot>asphaltics → synthetics</Chip>
                    <Chip>open gear</Chip>
                    <Chip>gearbox oils</Chip>
                    <Chip>EP greases</Chip>
                    <Chip>draglines</Chip>
                  </div>
                  <div className="mt-2">
                    <Dim>start here:</Dim>{' '}
                    <Cmd cmd="help" /> · <Cmd cmd="compare" /> · <Cmd cmd="products" /> ·{' '}
                    <Cmd cmd="dragline" /> · <Cmd cmd="plan" /> · <Cmd cmd="roi" />
                  </div>
                </div>
              </div>
            ) : null}

            {/* history */}
            <div className="mt-2 space-y-2">
              {entries.map((en) => (
                <div key={en.id} className="reveal">
                  {en.input !== null ? (
                    <div className="flex gap-2">
                      <span className="shrink-0 text-phos-dim">{PROMPT}</span>
                      <span className="text-phos-hot break-all">{en.input}</span>
                    </div>
                  ) : null}
                  {en.node ? <div className="mt-1">{en.node}</div> : null}
                </div>
              ))}
            </div>

            {/* prompt */}
            {booted ? (
              <div className="mt-2 flex items-baseline gap-2 pb-6">
                <label htmlFor="wm-input" className="shrink-0 text-phos-dim">
                  {PROMPT}
                </label>
                <div className="relative min-w-0 flex-1">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 whitespace-pre overflow-hidden"
                  >
                    <span className="invisible">{input}</span>
                    <span className="text-phos-dim/55">{ghost}</span>
                  </div>
                  <input
                    id="wm-input"
                    ref={inputRef}
                    autoFocus
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    aria-label="Command input"
                    className="relative w-full bg-transparent text-phos-hot outline-none"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                  />
                </div>
              </div>
            ) : null}
          </main>

          {hudOn ? (
            <Hud
              products={products}
              catalogSource={catalogSource}
              focus={focusProduct}
              commandCount={history.length}
            />
          ) : null}
        </div>

        {/* ── status bar ───────────────────────────────────────────────── */}
        <footer className="flex shrink-0 items-center gap-3 border-t border-edge bg-panel/80 px-3 py-1 text-[11px] text-phos-dim backdrop-blur-sm">
          <span className="hidden sm:inline">TAB complete</span>
          <span className="hidden sm:inline">↑↓ history</span>
          <span className="hidden md:inline">CTRL+L clear</span>
          <span className="ml-auto truncate">
            {catalogNote ?? 'catalogue served from Supabase'}
          </span>
        </footer>
      </div>
    </RunContext.Provider>
  )
}
