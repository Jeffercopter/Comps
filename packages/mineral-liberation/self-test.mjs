#!/usr/bin/env node
/**
 * Self-test for the liberation library.
 *
 * Everything here is a property that has to hold for the model to be worth
 * embedding, not a regression snapshot. If one of these fails the library is
 * wrong, not merely different.
 *
 *   node self-test.mjs            run every check
 *   node self-test.mjs --curves   also print the sampled liberation curves
 *   node self-test.mjs --grind    also print liberation measured on real progeny
 */
import { OreFeed, ORES, oreKeys, purityAt } from './liberation.mjs'

let pass = 0, fail = 0
const results = []

function check(name, ok, detail = '') {
  if (ok) { pass++ } else { fail++ }
  results.push(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`)
}
const near = (a, b, tol) => Math.abs(a - b) <= tol

/* ── every ore loads and is internally consistent ─────────────────────────── */

for (const key of oreKeys) {
  const ore = OreFeed.load(key, { seed: 7 })
  const sum = ore.bulkVol.reduce((a, b) => a + b, 0)
  check(`${key}: volumes normalise`, near(sum, 1, 1e-9), `Σ=${sum}`)
  check(`${key}: has a valuable phase`, ore.phases.some(p => p.valuable))
  check(`${key}: density plausible`, ore.rho > 1500 && ore.rho < 8000, `${ore.rho.toFixed(0)} kg/m³`)
}

/* ── determinism ──────────────────────────────────────────────────────────── */
{
  const a = OreFeed.load('porphyry-cu-mo', { seed: 42 })
  const b = OreFeed.load('porphyry-cu-mo', { seed: 42 })
  const p1 = a.particle(0.02, 1234)
  const p2 = b.particle(0.02, 1234)
  let same = true
  for (let i = 0; i < p1.comp.length; i++) if (p1.comp[i] !== p2.comp[i]) same = false
  check('same seed gives the same particle', same)

  const f1 = a.fracture(p1, { seed: 99, fragments: 5 })
  const f2 = b.fracture(p2, { seed: 99, fragments: 5 })
  let fSame = f1.length === f2.length
  for (let k = 0; fSame && k < f1.length; k++) if (f1[k].d !== f2[k].d) fSame = false
  check('same seed gives the same fracture', fSame)
}

/* ── conservation: the property that makes it safe to embed ───────────────── */

for (const key of oreKeys) {
  const ore = OreFeed.load(key, { seed: 3 })
  let worstMass = 0, worstPhase = 0
  for (let trial = 0; trial < 60; trial++) {
    const d = 0.002 * Math.pow(30, (trial % 10) / 9)      // 2 mm → 60 mm
    const p = ore.particle(d, 1000 + trial)
    const kids = ore.fracture(p, { fragments: 2 + (trial % 5), dir: [0, 1, 0], seed: trial })

    const mIn = ore.massOf(p)
    let mOut = 0
    for (const k of kids) mOut += ore.massOf(k)
    worstMass = Math.max(worstMass, Math.abs(mOut - mIn) / mIn)

    // Each phase individually, not just the total.
    for (let i = 0; i < ore.n; i++) {
      const inI = mIn * p.comp[i] * ore.phases[i].rho / ore.densityOf(p.comp)
      let outI = 0
      for (const k of kids) outI += ore.massOf(k) * k.comp[i] * ore.phases[i].rho / ore.densityOf(k.comp)
      if (inI > 1e-9) worstPhase = Math.max(worstPhase, Math.abs(outI - inI) / inI)
    }
  }
  check(`${key}: mass conserved through fracture`, worstMass < 1e-9,
    `worst ${(worstMass * 100).toExponential(1)}%`)
  check(`${key}: each phase conserved through fracture`, worstPhase < 0.02,
    `worst ${(worstPhase * 100).toFixed(2)}%`)
}

/* ── liberation rises as size falls, and reaches full liberation ──────────── */

for (const key of oreKeys) {
  const ore = OreFeed.load(key, { seed: 11 })
  const val = ore.phases.filter(p => p.valuable)
  const sizes = [0.05, 0.01, 0.002, 400e-6, 100e-6, 25e-6]
  const curve = ore.liberationCurve(sizes, 250)

  for (const ph of val) {
    const series = curve.map(row => row[ph.mineral])
    let monotone = true
    for (let i = 1; i < series.length; i++) if (series[i] < series[i - 1] - 0.02) monotone = false
    check(`${key}/${ph.mineral}: liberation rises as size falls`, monotone,
      series.map(v => v.toFixed(2)).join(' → '))

    // A phase should be essentially liberated once the particle is well below
    // its own grain size. That is the physical claim the whole model rests on.
    const fine = ore.liberationCurve([ph.d95 / 4], 250)[0][ph.mineral]
    check(`${key}/${ph.mineral}: liberated below its grain size`, fine > 0.85,
      `${(fine * 100).toFixed(0)}% at ${(ph.d95 / 4 * 1e6).toFixed(0)} µm`)
  }
}

/* ── the 200 µm anchor ────────────────────────────────────────────────────── */
{
  // The common sulphide and oxide feeds should be largely liberated at 200 µm;
  // the pegmatite should be liberated long before it, and the PGM reef not at
  // all. If those three do not separate, the model is a constant in disguise.
  const at200 = key => {
    const ore = OreFeed.load(key, { seed: 5 })
    const v = ore.phases.find(p => p.valuable)
    return ore.liberationCurve([200e-6], 400)[0][v.mineral]
  }
  const porphyry = at200('porphyry-cu-mo')
  const pegmatite = at200('spodumene-pegmatite')
  const pgm = at200('pgm-ug2')

  check('porphyry Cu largely liberated at 200 µm', porphyry > 0.8, `${(porphyry * 100).toFixed(0)}%`)
  check('pegmatite already liberated at 200 µm', pegmatite > 0.95, `${(pegmatite * 100).toFixed(0)}%`)
  check('PGM still locked at 200 µm', pgm < 0.25, `${(pgm * 100).toFixed(0)}%`)
}

/* ── soft mineralised zones weaken the particle ───────────────────────────── */
{
  const ore = OreFeed.load('porphyry-cu-mo', { seed: 21 })
  // Compare a particle carrying soft alteration and sulphide against one that
  // is all quartz and feldspar.
  const soft = { d: 0.02, seed: 1, comp: new Float64Array(ore.n), ore: ore.key }
  const hard = { d: 0.02, seed: 2, comp: new Float64Array(ore.n), ore: ore.key }
  soft.comp[ore.index.sericite] = 0.35
  soft.comp[ore.index.chalcopyrite] = 0.10
  soft.comp[ore.index.quartz] = 0.55
  hard.comp[ore.index.quartz] = 0.5
  hard.comp[ore.index.feldspar] = 0.5

  const fs = ore.strengthFactor(soft), fh = ore.strengthFactor(hard)
  check('soft mineralised particle is weaker than barren gangue', fs < fh,
    `${fs.toFixed(2)} vs ${fh.toFixed(2)}`)
  check('weak sites are found in the mineralised particle',
    ore.weakSites(soft).length > 0, `${ore.weakSites(soft).length} sites`)
  check('no weak sites in barren quartz–feldspar',
    ore.weakSites(hard).length === 0)
}

/* ── preferential breakage beats random ───────────────────────────────────── */
{
  const random = OreFeed.load('bif-hematite', { seed: 31, bias: 0 })
  const preferential = OreFeed.load('bif-hematite', { seed: 31 })   // bias 1.1
  const d = 600e-6
  const lr = random.liberationCurve([d], 400)[0].hematite
  const lp = preferential.liberationCurve([d], 400)[0].hematite
  check('preferential breakage liberates better than random', lp > lr + 0.05,
    `${(lp * 100).toFixed(0)}% vs ${(lr * 100).toFixed(0)}% at ${(d * 1e6).toFixed(0)} µm`)
}

/* ── fracture actually separates phases ───────────────────────────────────── */
{
  // Progeny should scatter in grade. If every fragment inherited the parent's
  // average the model would be doing nothing useful, and this is the check
  // that would catch it.
  const ore = OreFeed.load('vms-pb-zn', { seed: 17 })
  let spread = 0, n = 0
  for (let t = 0; t < 200; t++) {
    const p = ore.particle(0.004, 500 + t)
    const kids = ore.fracture(p, { fragments: 4, dir: [1, 0, 0], seed: t })
    const g = kids.map(k => ore.grade(k, 'sphalerite'))
    const mean = g.reduce((a, b) => a + b, 0) / g.length
    if (mean > 1e-6) {
      spread += Math.sqrt(g.reduce((s, v) => s + (v - mean) ** 2, 0) / g.length) / mean
      n++
    }
  }
  const cv = n ? spread / n : 0
  check('fracture separates phases between progeny', cv > 0.1,
    `progeny grade CV ${(cv * 100).toFixed(0)}%`)
}

/* ── sub-texture breakage: the model must not stall at the domain scale ───── */
{
  // A particle finer than the ore's texture has no cell partition left to cut.
  // If fracture hands it back unchanged, a DEM grinding toward liberation size
  // stalls exactly where liberation starts to matter — so this is checked
  // separately from the coarse case.
  for (const key of oreKeys) {
    const ore = OreFeed.load(key, { seed: 23 })
    const d = ore.texture * 0.4
    const p = ore.particle(d, 77)
    const kids = ore.fracture(p, { fragments: 4, dir: [0, 0, 1], seed: 5 })
    check(`${key}: sub-texture particle still breaks`,
      kids.length > 1 && Math.max(...kids.map(k => k.d)) < p.d,
      `${kids.length} progeny, largest ${(Math.max(...kids.map(k => k.d)) / p.d).toFixed(2)}× parent`)

    // and conserves while doing it — segregation must move phases between
    // children, never create or destroy them
    let worst = 0
    const mIn = ore.massOf(p)
    for (let i = 0; i < ore.n; i++) {
      const inI = mIn * p.comp[i] * ore.phases[i].rho / ore.densityOf(p.comp)
      let outI = 0
      for (const k of kids) outI += ore.massOf(k) * k.comp[i] * ore.phases[i].rho / ore.densityOf(k.comp)
      if (inI > 1e-12) worst = Math.max(worst, Math.abs(outI - inI) / inI)
    }
    check(`${key}: sub-texture split conserves every phase`, worst < 1e-9,
      `worst ${worst.toExponential(1)}`)
  }
}

/* ── grinding actually liberates ──────────────────────────────────────────── */
{
  /* The end-to-end claim, and the one the rest of the library exists to make:
     break a coarse particle repeatedly and the valuable phase comes free.

     Asserted as properties, deliberately, not as a percentage at a size. A
     stored number here would be a number I had tuned the model to hit, and the
     first version of this block was exactly that — it asserted >30% and failed
     at 0%, which is how the frozen-grade defect in `_segregate` was found. What
     has to hold is that liberation RISES as the grind gets finer, that it does
     not stall, and that grade is untouched throughout. A model that manufactured
     mineral could pass a liberation target; it cannot pass all three. */
  const ore = OreFeed.load('porphyry-cu-mo', { seed: 29 })
  let pop = [ore.particle(0.005, 3), ore.particle(0.005, 9), ore.particle(0.005, 17)]
  const grade0 = ore.assay(pop).phases.chalcopyrite.grade
  const track = []
  for (const floor of [1e-3, 400e-6, 150e-6]) {
    let guard = 0
    while (pop.some(p => p.d > floor) && guard++ < 40 && pop.length < 60000) {
      const next = []
      for (const p of pop) {
        if (p.d <= floor) { next.push(p); continue }
        next.push(...ore.fracture(p, { fragments: 2, dir: [1, 0, 0], seed: guard * 131 + next.length }))
      }
      pop = next
    }
    const a = ore.assay(pop)
    const ds = pop.map(p => p.d).sort((x, y) => x - y)
    track.push({ d50: ds[ds.length >> 1], lib: a.phases.chalcopyrite.liberation, grade: a.phases.chalcopyrite.grade })
  }

  const rising = track.every((t, k) => k === 0 || t.lib > track[k - 1].lib + 0.02)
  check('liberation rises as the grind gets finer', rising,
    track.map(t => `${(t.lib * 100).toFixed(0)}%@${(t.d50 * 1e6).toFixed(0)}µm`).join(' → '))
  check('grinding frees a substantial part of the valuable phase',
    track[track.length - 1].lib > 0.25,
    `${(track[track.length - 1].lib * 100).toFixed(0)}% at d50 ${(track[track.length - 1].d50 * 1e6).toFixed(0)} µm`)
  check('head grade holds through grinding',
    track.every(t => near(t.grade, grade0, grade0 * 0.01)),
    `${(grade0 * 100).toFixed(3)}% → ${(track[track.length - 1].grade * 100).toFixed(3)}%`)
}

/* ── preferential breakage sharpens segregation ───────────────────────────── */
{
  /* `_segregate` originally MULTIPLIED its concentration by (1 + bias), which
     made a strongly preferential ore separate its phases less cleanly — the
     opposite of what preferential breakage means. Every other bias check in
     this file exercises `purityAt`, where the sign was always right, so none
     of them saw it.

     This drives `_segregate` directly at a fixed size, because the whole-ore
     grind below does NOT isolate it: bias also reaches the mechanism through
     the purity curve and through plane selection, and those alone are enough
     to keep the grind pointing the right way with the sign inverted. A guard
     that still passes on the reverted defect is not a guard. */
  const sharpness = (bias) => {
    const ore = OreFeed.load('porphyry-cu-mo', { seed: 7, bias })
    const ci = ore.index.chalcopyrite
    const d = 700e-6, v = Math.PI / 6 * d * d * d
    let s = 12345 >>> 0
    const r = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
    let acc = 0, n = 0
    for (let k = 0; k < 2000; k++) {
      const pv = new Float64Array(ore.n)
      for (let i = 0; i < ore.n; i++) pv[i] = v * ore.bulkVol[i]
      const [a, b] = ore._segregate(pv, d * Math.cbrt(0.5), r)
      if (!a) continue
      acc += Math.abs(a.pv[ci] / (a.pv[ci] + b.pv[ci]) - 0.5)
      n++
    }
    return acc / n * 2      // 0 = always splits evenly, 1 = always goes one way
  }
  const s0 = sharpness(0), s1 = sharpness(1.5)
  check('preferential breakage sharpens phase segregation', s1 > s0 + 0.1,
    `bias 0 → ${s0.toFixed(3)}   bias 1.5 → ${s1.toFixed(3)}`)
}

/* ── and it shows up in a whole-ore grind ─────────────────────────────────── */
{
  const grind = (bias) => {
    const ore = OreFeed.load('magnetite-taconite', { seed: 5, bias })
    let pop = [ore.particle(0.004, 3), ore.particle(0.004, 11)]
    let guard = 0
    while (pop.some(p => p.d > 200e-6) && guard++ < 40 && pop.length < 40000) {
      const next = []
      for (const p of pop) {
        if (p.d <= 200e-6) { next.push(p); continue }
        next.push(...ore.fracture(p, { fragments: 2, dir: [0, 1, 0], seed: guard * 97 + next.length }))
      }
      pop = next
    }
    return ore.assay(pop).phases.magnetite.liberation
  }
  const lo = grind(0.05), hi = grind(1.2)
  check('preferential breakage liberates better through fracture', hi > lo,
    `bias 1.2 → ${(hi * 100).toFixed(0)}%   vs   bias 0.05 → ${(lo * 100).toFixed(0)}%`)
}

/* ── the diamond case: the hard phase must not be treated as weak ─────────── */
{
  const ore = OreFeed.load('kimberlite-diamond', { seed: 13 })
  const diamond = ore.phases.find(p => p.mineral === 'diamond')
  check('diamond is flagged indestructible', diamond.indestructible)
  check('diamond is not a weak site', diamond.strength > ore.gangueStrength,
    `${diamond.strength.toFixed(2)} vs gangue ${ore.gangueStrength.toFixed(2)}`)
}

/* ── purity curve behaves at the limits ───────────────────────────────────── */
{
  check('purity → 1 well below the grain size', purityAt(10e-6, 200e-6) > 0.99)
  check('purity ≈ 0.95 at d95', near(purityAt(200e-6, 200e-6), 0.95, 0.01),
    purityAt(200e-6, 200e-6).toFixed(3))
  check('purity → 0 well above the grain size', purityAt(50e-3, 200e-6) < 0.01)
  check('bias shifts liberation coarser',
    purityAt(1e-3, 200e-6, 0.8) > purityAt(1e-3, 200e-6, 0))
}

/* ── cost ─────────────────────────────────────────────────────────────────── */
{
  const ore = OreFeed.load('porphyry-cu-mo', { seed: 1 })
  const t0 = performance.now()
  let kids = 0
  for (let i = 0; i < 20000; i++) {
    const p = ore.particle(0.01, i)
    kids += ore.fracture(p, { fragments: 4, dir: [0, 1, 0], seed: i }).length
  }
  const ms = performance.now() - t0
  check('20k create+fracture under 4 s', ms < 4000,
    `${ms.toFixed(0)} ms, ${(20000 / ms * 1000).toFixed(0)} particles/s, ${kids} progeny`)
}

/* ── report ───────────────────────────────────────────────────────────────── */

for (const line of results) console.log(line)
console.log(`\n${pass} passed, ${fail} failed`)

if (process.argv.includes('--curves')) {
  console.log('\nLiberation of the primary valuable phase, % by mass:\n')
  const sizes = [50e-3, 10e-3, 2e-3, 1e-3, 500e-6, 200e-6, 100e-6, 50e-6, 25e-6]
  const head = ['ore'.padEnd(22), ...sizes.map(s => (s * 1e6 >= 1000
    ? (s * 1e3).toFixed(0) + 'mm' : (s * 1e6).toFixed(0) + 'µm').padStart(7))]
  console.log(head.join(''))
  for (const key of oreKeys) {
    const ore = OreFeed.load(key, { seed: 5 })
    const v = ore.phases.find(p => p.valuable)
    const curve = ore.liberationCurve(sizes, 300)
    const row = [`${key}`.padEnd(22)]
    for (const r of curve) row.push((r[v.mineral] * 100).toFixed(0).padStart(7))
    console.log(row.join(''))
  }
}

/* Mechanistic liberation: not sampled from the curve, but measured on progeny
   that came out of repeated `fracture`. This is what a DEM actually sees, and
   it is deliberately reported next to `--curves` because the two differ. */
if (process.argv.includes('--grind')) {
  console.log('\nLiberation measured on real fracture progeny, % by mass:\n')
  console.log('ore'.padEnd(22) + 'phase'.padEnd(14) +
    ['~1mm', '~400µm', '~150µm', '~60µm', '~25µm'].map(s => s.padStart(9)).join(''))
  for (const key of oreKeys) {
    const ore = OreFeed.load(key, { seed: 29 })
    const v = ore.phases.find(p => p.valuable)
    let pop = [ore.particle(0.005, 3), ore.particle(0.005, 9), ore.particle(0.005, 17)]
    for (const p of pop) p.w = 1
    const row = [key.padEnd(22), v.mineral.padEnd(14)]
    const vi = ore.index[v.mineral]
    /* Keeping the sweep affordable without biasing what it reports.

       Barren particles are thinned hard and phase-bearing ones only once there
       are plenty of them, because a trace phase thinned uniformly lands on a
       coin toss — gold read 17% → 6% → 97% and diamond 100% → 0% → 100%.

       Every survivor then carries a weight, 1/(probability it survived). That
       matters for more than tidiness: liberation is a ratio over the phase's
       own volume and would survive unweighted thinning untouched, but the size
       distribution would NOT, and the printed d50 came out at 38 µm against a
       150 µm target before the weights went in. Weighted, every column is an
       unbiased estimate of the same population. */
    let s = 987654321 >>> 0
    const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
    for (const floor of [1e-3, 400e-6, 150e-6, 60e-6, 25e-6]) {
      let guard = 0
      while (pop.some(p => p.d > floor) && guard++ < 60) {
        const next = []
        for (const p of pop) {
          if (p.d <= floor) { next.push(p); continue }
          for (const k of ore.fracture(p, { fragments: 2, dir: [1, 0, 0], seed: guard * 131 + next.length })) {
            k.w = p.w
            next.push(k)
          }
        }
        if (next.length > 9000) {
          let bearing = 0
          for (const p of next) if (p.comp[vi] > 1e-12) bearing++
          const keepB = bearing > 4000 ? 4000 / bearing : 1, keepR = 0.08
          pop = []
          for (const p of next) {
            const q = p.comp[vi] > 1e-12 ? keepB : keepR
            if (rnd() < q) { p.w /= q; pop.push(p) }
          }
        } else pop = next
      }

      // Mass-weighted median size, and liberation as a phase-volume ratio.
      const sorted = pop.map(p => ({ d: p.d, m: p.w * p.d ** 3 })).sort((x, y) => x.d - y.d)
      const half = sorted.reduce((t, e) => t + e.m, 0) / 2
      let acc = 0, d50 = 0
      for (const e of sorted) { acc += e.m; if (acc >= half) { d50 = e.d; break } }

      let tot = 0, free = 0, sw = 0, sw2 = 0
      for (const p of pop) {
        const pv = p.w * p.d ** 3 * p.comp[vi]
        tot += pv
        if (p.comp[vi] >= 0.9) free += pv
        sw += pv; sw2 += pv * pv
      }
      /* Kish effective sample size on the phase-volume weights. A phase whose
         entire mass in the feed is one grain — kimberlite holds diamond equal
         to a single 43 µm sphere — cannot be measured by grinding it, and this
         prints nothing rather than a number that looks like a measurement. */
      const ess = sw2 > 0 ? (sw * sw) / sw2 : 0
      const dTxt = (d50 * 1e6).toFixed(0)
      row.push((ess < 20 ? `–@${dTxt}`
        : `${(free / tot * 100).toFixed(0)}@${dTxt}`).padStart(9))
    }
    console.log(row.join(''))
  }
  console.log('\n  cell is  liberation% @ actual d50 in µm;  – = too few grains in the feed to measure')
}

process.exit(fail ? 1 : 0)
