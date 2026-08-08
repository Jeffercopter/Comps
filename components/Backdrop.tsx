'use client'

import { useEffect, useRef } from 'react'

interface Gear {
  x: number
  y: number
  r: number
  teeth: number
  speed: number
  phase: number
}

/**
 * Ambient canvas: a meshing gear train with a film of drifting particles over
 * it. Deliberately low-contrast — it must read as depth behind the terminal,
 * never as content. Honours prefers-reduced-motion by drawing a single frame.
 */
export default function Backdrop() {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let w = 0
    let h = 0
    let gears: Gear[] = []
    let particles: { x: number; y: number; vx: number; vy: number; a: number }[] = []

    const phos = () => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue('--phos').trim()
      return raw || '255 178 66'
    }

    function layout() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas!.clientWidth
      h = canvas!.clientHeight
      canvas!.width = Math.floor(w * dpr)
      canvas!.height = Math.floor(h * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      // A meshing train: each gear counter-rotates relative to its neighbour,
      // with angular speed inversely proportional to radius, as a real train does.
      const base = Math.max(w, h) * 0.34
      gears = [
        { x: w * 0.82, y: h * 0.24, r: base * 0.62, teeth: 26, speed: 0.00016, phase: 0 },
        { x: w * 0.18, y: h * 0.78, r: base * 0.9, teeth: 36, speed: -0.00011, phase: 0.4 },
        { x: w * 0.52, y: h * 0.06, r: base * 0.34, teeth: 18, speed: 0.00029, phase: 1.1 },
        { x: w * 0.06, y: h * 0.2, r: base * 0.26, teeth: 14, speed: -0.00038, phase: 2.2 },
      ]

      const count = Math.min(90, Math.floor((w * h) / 24000))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.09,
        vy: -0.05 - Math.random() * 0.12,
        a: 0.06 + Math.random() * 0.16,
      }))
    }

    function drawGear(g: Gear, t: number, rgb: string) {
      const a = g.phase + t * g.speed
      const step = (Math.PI * 2) / g.teeth
      const outer = g.r
      const inner = g.r * 0.88
      ctx!.beginPath()
      for (let i = 0; i < g.teeth; i++) {
        const t0 = a + i * step
        // Square-ish tooth profile: land, flank, root, flank.
        ctx!.lineTo(g.x + Math.cos(t0) * outer, g.y + Math.sin(t0) * outer)
        ctx!.lineTo(g.x + Math.cos(t0 + step * 0.38) * outer, g.y + Math.sin(t0 + step * 0.38) * outer)
        ctx!.lineTo(g.x + Math.cos(t0 + step * 0.5) * inner, g.y + Math.sin(t0 + step * 0.5) * inner)
        ctx!.lineTo(g.x + Math.cos(t0 + step * 0.88) * inner, g.y + Math.sin(t0 + step * 0.88) * inner)
      }
      ctx!.closePath()
      ctx!.strokeStyle = `rgb(${rgb} / 0.10)`
      ctx!.lineWidth = 1
      ctx!.stroke()

      // Hub and a pair of spokes to give the rotation something to read against.
      ctx!.beginPath()
      ctx!.arc(g.x, g.y, g.r * 0.2, 0, Math.PI * 2)
      ctx!.strokeStyle = `rgb(${rgb} / 0.08)`
      ctx!.stroke()
      for (let i = 0; i < 6; i++) {
        const t0 = a + (i * Math.PI) / 3
        ctx!.beginPath()
        ctx!.moveTo(g.x + Math.cos(t0) * g.r * 0.22, g.y + Math.sin(t0) * g.r * 0.22)
        ctx!.lineTo(g.x + Math.cos(t0) * inner * 0.96, g.y + Math.sin(t0) * inner * 0.96)
        ctx!.strokeStyle = `rgb(${rgb} / 0.055)`
        ctx!.stroke()
      }
    }

    function frame(t: number) {
      const rgb = phos()
      ctx!.clearRect(0, 0, w, h)

      for (const g of gears) drawGear(g, reduced ? 0 : t, rgb)

      for (const p of particles) {
        if (!reduced) {
          p.x += p.vx
          p.y += p.vy
          if (p.y < -4) {
            p.y = h + 4
            p.x = Math.random() * w
          }
          if (p.x < -4) p.x = w + 4
          if (p.x > w + 4) p.x = -4
        }
        ctx!.fillStyle = `rgb(${rgb} / ${p.a})`
        ctx!.fillRect(p.x, p.y, 1.4, 1.4)
      }

      if (!reduced) raf = requestAnimationFrame(frame)
    }

    layout()
    raf = requestAnimationFrame(frame)

    const onResize = () => {
      layout()
      if (reduced) frame(0)
    }
    window.addEventListener('resize', onResize)

    // Repaint when the phosphor theme changes so the gears re-tint immediately.
    const observer = new MutationObserver(() => {
      if (reduced) frame(0)
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      observer.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  )
}
