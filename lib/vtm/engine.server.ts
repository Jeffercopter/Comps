// ── CMD VTM tower mill power model — server-side calculation engine ──────────
// All proprietary maths lives here and in data.server.ts. Import only from
// route handlers. The browser receives numbers, never formulas.

import {
  BENCHMARK_STATS,
  COEFFICIENTS,
  FRAMES,
  INSTALLATIONS,
  SHAFT_FRACTION,
  type Frame,
  type MillFamily,
  type ModelCoefficients,
} from '@/lib/vtm/data.server'

export interface GeometryInput {
  family: MillFamily
  D: number
  H: number
  S: number
  rpm: number
}

export interface EvaluateRequest {
  mode: 'frame' | 'custom'
  family: MillFamily
  model?: string // frame mode
  D?: number // custom mode, m
  H?: number
  S?: number
  rpm?: number
  units?: number
  tph?: number // optional duty
  seKwht?: number // optional duty, specific energy kWh/t
}

export interface FrameOption {
  model: string
  units: number
  ratedKWPerUnit: number
  totalRatedKW: number
  utilisationPct: number
}

export interface EvaluateResult {
  family: MillFamily
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
    options: FrameOption[]
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

const LIMITS = {
  D: { min: 0.5, max: 8 },
  H: { min: 2.5, max: 13 },
  S: { min: 0.15, max: 2.5 },
  rpm: { min: 8, max: 90 },
  units: { min: 1, max: 12 },
  tph: { min: 0.1, max: 5000 },
  seKwht: { min: 0.5, max: 60 },
}

function powerLaw(c: ModelCoefficients, g: GeometryInput): number {
  return c.k * g.D ** c.aD * g.H ** c.aH * g.S ** c.aS * g.rpm ** c.aN
}

function round1(x: number): number {
  return Math.round(x * 10) / 10
}

function bad(msg: string): never {
  const err = new Error(msg) as Error & { statusCode: number }
  err.statusCode = 400
  throw err
}

function checkRange(name: keyof typeof LIMITS, value: number): number {
  const { min, max } = LIMITS[name]
  if (!Number.isFinite(value) || value < min || value > max) {
    bad(`${name} must be a number between ${min} and ${max}`)
  }
  return value
}

/** Public frame catalogue — geometry and motor size only, no model output. */
export function listFrames(): Frame[] {
  return FRAMES
}

export function evaluate(req: EvaluateRequest): EvaluateResult {
  const family: MillFamily = req.family === 'JETM' ? 'JETM' : 'VTM'
  const units = checkRange('units', Math.round(req.units ?? 1))

  let geometry: GeometryInput
  let model: string | null = null
  let frame: Frame | undefined

  if (req.mode === 'frame') {
    frame = FRAMES.find((f) => f.type === family && f.model === req.model)
    if (!frame) bad(`unknown ${family} frame: ${String(req.model)}`)
    model = frame.model
    geometry = { family, D: frame.D, H: frame.H, S: frame.S, rpm: frame.rpm }
  } else {
    geometry = {
      family,
      D: checkRange('D', Number(req.D)),
      H: checkRange('H', Number(req.H)),
      S: checkRange('S', Number(req.S)),
      rpm: checkRange('rpm', Number(req.rpm)),
    }
  }

  const c = COEFFICIENTS[family]
  const pNitta = powerLaw(c.nitta, geometry)
  const pMJ = powerLaw(c.mj, geometry)
  const pRadz = powerLaw(c.radz, geometry)
  const pAvg = (pNitta + pMJ + pRadz) / 3

  // The benchmark records diff = (P_avg − shaft) / shaft per installation, so
  // shaft ≈ P_avg / (1 + diff). Bias-correct with the fleet mean and band the
  // estimate with the fleet p10/p90 spread.
  const stats = BENCHMARK_STATS[family]
  const expectedShaft = pAvg / (1 + stats.meanDiffPct / 100)
  const shaftLow = pAvg / (1 + stats.p90DiffPct / 100)
  const shaftHigh = pAvg / (1 + stats.p10DiffPct / 100)

  // Smallest standard motor in the family that covers the expected shaft draw.
  const motor = FRAMES.filter((f) => f.type === family)
    .map((f) => f.ratedKW)
    .sort((a, b) => a - b)
    .find((kw) => kw * SHAFT_FRACTION >= expectedShaft)

  let duty: EvaluateResult['duty'] = null
  if (req.tph != null || req.seKwht != null) {
    const tph = checkRange('tph', Number(req.tph))
    const seKwht = checkRange('seKwht', Number(req.seKwht))
    const requiredShaftKW = tph * seKwht
    const options: FrameOption[] = FRAMES.filter((f) => f.type === family)
      .map((f) => {
        const n = Math.max(1, Math.ceil(requiredShaftKW / (f.ratedKW * SHAFT_FRACTION)))
        return {
          model: f.model,
          units: n,
          ratedKWPerUnit: f.ratedKW,
          totalRatedKW: round1(n * f.ratedKW),
          utilisationPct: round1((requiredShaftKW / (n * f.ratedKW * SHAFT_FRACTION)) * 100),
        }
      })
      .filter((o) => o.units <= 6)
      .sort((a, b) => a.totalRatedKW - b.totalRatedKW || a.units - b.units)
      .slice(0, 3)
    duty = {
      tph,
      seKwht,
      requiredShaftKW: round1(requiredShaftKW),
      utilisationPct: round1((requiredShaftKW / (units * expectedShaft)) * 100),
      options,
    }
  }

  const nearest = INSTALLATIONS.filter((i) => i.type === family)
    .map((i) => ({ i, d: Math.abs(i.pAvg / i.units - pAvg) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 5)
    .map(({ i }) => ({
      site: i.site,
      model: i.model,
      units: i.units,
      application: i.application,
      ratedKW: i.ratedKW,
      shaftKW: i.shaftKW,
      pAvgKW: i.pAvg,
    }))

  const meanErr = (c.nitta.meanErrPct + c.mj.meanErrPct + c.radz.meanErrPct) / 3
  const maxErr = Math.max(c.nitta.maxErrPct, c.mj.maxErrPct, c.radz.maxErrPct)

  return {
    family,
    model,
    units,
    geometry: { D: geometry.D, H: geometry.H, S: geometry.S, rpm: geometry.rpm },
    perUnit: {
      pNittaKW: round1(pNitta),
      pMJKW: round1(pMJ),
      pRadzKW: round1(pRadz),
      pAvgKW: round1(pAvg),
      expectedShaftKW: round1(expectedShaft),
      shaftLowKW: round1(shaftLow),
      shaftHighKW: round1(shaftHigh),
    },
    total: {
      pAvgKW: round1(pAvg * units),
      expectedShaftKW: round1(expectedShaft * units),
      shaftLowKW: round1(shaftLow * units),
      shaftHighKW: round1(shaftHigh * units),
      recommendedMotorKW: motor != null ? round1(motor) : null,
    },
    duty,
    benchmark: {
      n: stats.n,
      meanDiffPct: stats.meanDiffPct,
      p10DiffPct: stats.p10DiffPct,
      p90DiffPct: stats.p90DiffPct,
      nearest,
    },
    calibration: {
      basisInstallations: INSTALLATIONS.length,
      meanErrPct: round1(meanErr),
      maxErrPct: round1(maxErr),
    },
  }
}
