/**
 * Multi-mineral liberation for discrete element models.
 *
 * Drop-in, zero dependencies, no I/O, no DOM, no globals. Everything is pure
 * and deterministic given a seed, which matters more than it sounds: a DEM run
 * has to be reproducible, and a liberation model that quietly consumes
 * Math.random destroys that.
 *
 * ── What it models ───────────────────────────────────────────────────────
 *
 * An ore particle is not a lump of one substance. It is a piece of texture:
 * domains of different minerals, at a characteristic spacing, with different
 * strengths. Three things follow, and this library exists to give a DEM all
 * three.
 *
 * 1. LIBERATION EMERGES FROM SIZE. A particle far coarser than the mineral
 *    grains contains many domains and assays close to the bulk. As it breaks
 *    down it contains fewer, until below the grain size it is a single mineral
 *    and fully liberated. For most sulphide and oxide ores here that happens
 *    around 200 µm — but it is a consequence of the grain size, not a constant,
 *    which is why a pegmatite liberates at 5 mm and a PGM reef never does.
 *
 * 2. SOFT MINERALISED ZONES ARE WEAK SITES. Sulphides and alteration are
 *    usually softer than the silicate gangue around them. Stress concentrates
 *    there, cracks nucleate there, and a particle carrying them is weaker than
 *    its bulk mineralogy suggests. `strengthFactor` returns that multiplier for
 *    the host DEM's breakage criterion.
 *
 * 3. THOSE WEAK SITES CONTROL THE PROGENY. Because the crack runs through the
 *    mineralised zones rather than across them, fracture surfaces follow
 *    mineral boundaries. Progeny are separated more cleanly than random
 *    fracture would separate them, so liberation at a given size is better than
 *    random — the `bias` term per ore. `fracture()` picks the plane by scoring
 *    candidates against the weak sites, so this is a consequence of the
 *    geometry rather than a curve applied afterwards.
 *
 * ── Cost, which is the reason it is shaped this way ──────────────────────
 *
 * A particle stores its diameter, a seed, and one small array of volume
 * fractions. Nothing else. The interior texture — cells, weak sites, fracture
 * planes — is regenerated from the seed whenever it is needed and thrown away.
 * Ten thousand particles cost ten thousand short arrays, not ten thousand
 * meshes.
 *
 * ── Units ────────────────────────────────────────────────────────────────
 *
 * SI throughout. Sizes in metres (200 µm is 200e-6), density kg/m³, mass kg,
 * specific energy kWh/t where quoted as Ecs and J/kg internally.
 *
 * ── Porting ──────────────────────────────────────────────────────────────
 *
 * Nothing here uses a JavaScript-only idiom. The port surface is: a 32-bit
 * PRNG, flat arrays, and the six functions marked PORT below. See README.md.
 */

import { MINERALS, strengthFromMohs } from './minerals.mjs'
import { ORES } from './ores.mjs'

/* Sharpness of the liberation transition. 2 puts the 95% liberation point at
   d95 and the 50% point at 4.36 × d95, which is about what a linear-intercept
   measurement on a disseminated ore gives. */
const LIB_M = 2
const LIB_D50 = Math.pow(19, 1 / LIB_M)     // d50 / d95

/* Cells are a sample of the texture, not the whole of it. Above this count the
   particle's composition is drawn from the true grain count while the geometry
   uses a representative subset — the alternative is a mesh per particle, which
   is exactly what this library exists to avoid. */
const MAX_CELLS = 48

/* Candidate fracture planes scored against the weak sites. More is slower and
   makes almost no difference above about a dozen. */
const PLANE_CANDIDATES = 12

// ── PORT: 32-bit PRNG (mulberry32). Any equivalent will do; results change. ──
export function rng(seed) {
  let a = (seed >>> 0) || 1
  return function () {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const hash2 = (a, b) => {
  let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x165667b1, 0xc2b2ae35)
  h ^= h >>> 13
  return (Math.imul(h, 0x27d4eb2f) >>> 0)
}

// ── PORT: liberation curve. The one imposed function in the model. ──────────
/**
 * Fraction of phase `p` that is free of other phases, in a domain of size `d`.
 * Rises to 1 below the phase's own grain size and falls away above it.
 * `bias` shifts the curve coarser: preferential breakage along mineralised
 * zones liberates at a larger size than random fracture would.
 */
export function purityAt(d, d95, bias = 0, grainScale = 1) {
  const dEff = d / (1 + bias)
  const d50 = d95 * grainScale * LIB_D50
  return 1 / (1 + Math.pow(dEff / d50, LIB_M))
}

/**
 * Grain size is a distribution, not a number. Every particle gets its own
 * draw, log-normal about the quoted grain size, which is both what a
 * micrograph shows and what stops the liberation curve behaving like a step
 * when the ≥90% threshold is applied to it.
 */
function grainScale(r, sigma = 0.35) {
  // Box–Muller, one of the pair.
  const u = Math.max(1e-12, r()), v = r()
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  return Math.exp(sigma * z - sigma * sigma / 2)          // median-preserving
}

/* ═══════════════════════════════════════════════════════════════════════════
   Ore feed
   ═══════════════════════════════════════════════════════════════════════════ */

export class OreFeed {
  /**
   * @param {object} def  ore definition (see ores.mjs), or a key into ORES
   * @param {object} [opt]
   * @param {number} [opt.seed]   base seed; particles derive from it
   * @param {number} [opt.bias]   override the ore's preferential-breakage bias
   */
  constructor(def, opt = {}) {
    const src = typeof def === 'string' ? ORES[def] : def
    if (!src) throw new Error(`unknown ore "${def}" — one of: ${Object.keys(ORES).join(', ')}`)

    this.key = typeof def === 'string' ? def : (src.key || src.name)
    this.name = src.name
    this.note = src.note || ''
    this.texture = src.texture
    this.bias = opt.bias ?? src.bias ?? 0
    this.ecs = src.ecs ?? 0.6
    this.baseSeed = (opt.seed ?? 1) >>> 0

    // Phases, normalised. A zero-volume phase is dropped rather than carried
    // as a column of zeros through every particle in the simulation.
    const phases = src.phases.filter(p => p.vol > 0)
    const total = phases.reduce((s, p) => s + p.vol, 0)
    if (!(total > 0)) throw new Error(`ore "${this.key}" has no phases with volume`)

    this.phases = phases.map((p, i) => {
      const m = MINERALS[p.mineral]
      if (!m) throw new Error(`ore "${this.key}": unknown mineral "${p.mineral}"`)
      if (!(p.grain > 0)) throw new Error(`ore "${this.key}": phase "${p.mineral}" needs a grain size`)
      return {
        index: i,
        mineral: p.mineral,
        vol: p.vol / total,
        grain: p.grain,
        d95: p.d95 ?? p.grain,
        valuable: !!p.valuable,
        indestructible: !!p.indestructible,
        assoc: p.assoc || [],
        rho: m.rho,
        hue: m.hue,
        strength: p.strength ?? m.strength ?? strengthFromMohs(m.mohs),
      }
    })

    this.n = this.phases.length
    this.index = Object.fromEntries(this.phases.map(p => [p.mineral, p.index]))

    // Association matrix, resolved once. Row i lists indices phase i clusters
    // with, so cell assignment can stay a couple of array reads.
    this.assocIdx = this.phases.map(p =>
      p.assoc.map(a => this.index[a]).filter(j => j !== undefined))

    // Bulk properties.
    this.bulkVol = Float64Array.from(this.phases, p => p.vol)
    this.rho = this.phases.reduce((s, p) => s + p.vol * p.rho, 0)

    // Gangue strength: the volume-weighted strength of everything that is not
    // payable. Hardness contrast is measured against this, because it is what
    // a mineralised zone has to be softer *than*.
    let gv = 0, gs = 0
    for (const p of this.phases) if (!p.valuable) { gv += p.vol; gs += p.vol * p.strength }
    this.gangueStrength = gv > 0 ? gs / gv : 1

    // Cumulative volume for sampling.
    this._cum = new Float64Array(this.n)
    let c = 0
    for (let i = 0; i < this.n; i++) { c += this.bulkVol[i]; this._cum[i] = c }
    this._cum[this.n - 1] = 1
  }

  static load(key, opt) { return new OreFeed(key, opt) }

  /** Volume-to-mass conversion for a composition vector. */
  densityOf(comp) {
    let r = 0
    for (let i = 0; i < this.n; i++) r += comp[i] * this.phases[i].rho
    return r
  }

  massOf(p) {
    const v = Math.PI / 6 * p.d * p.d * p.d
    return v * this.densityOf(p.comp)
  }

  /* ── texture ────────────────────────────────────────────────────────────
     How many texture domains a particle of size d contains, and how big each
     one is. Below one cell the particle is inside a single domain and its
     composition collapses toward a single mineral — which is liberation. */
  cellCount(d) {
    const raw = Math.pow(d / this.texture, 3)
    return { true: raw, geo: Math.max(1, Math.min(MAX_CELLS, Math.round(raw))) }
  }

  cellSize(d) {
    const { true: raw } = this.cellCount(d)
    return raw <= 1 ? d : this.texture
  }

  /* ── particle creation ──────────────────────────────────────────────────── */

  /**
   * A feed particle of diameter `d`. Composition is sampled from the bulk with
   * the variance the grain count implies, so coarse particles assay near the
   * head grade and fine ones scatter — which is the whole reason a fine feed
   * can be upgraded and a coarse one cannot.
   */
  particle(d, seed) {
    const s = (seed ?? hash2(this.baseSeed, Math.round(d * 1e9))) >>> 0
    const comp = this._sampleComposition(d, s)
    return { d, seed: s, comp, ore: this.key }
  }

  _sampleComposition(d, seed, forcePhase = -1) {
    const r = rng(seed)
    const { true: nTrue, geo } = this.cellCount(d)
    const comp = new Float64Array(this.n)
    const g = grainScale(r)

    if (nTrue <= 1) {
      // One domain: the particle is a single mineral, diluted by whatever is
      // intergrown with it below the domain scale.
      const i = forcePhase >= 0 ? forcePhase : this._pick(r())
      const u = purityAt(d, this.phases[i].d95, this.bias, g)
      comp[i] = u
      this._spreadMatrix(comp, i, 1 - u)
      return comp
    }

    // Many domains: draw `geo` of them and treat that as a sample of the
    // particle's texture, then pull the result toward the bulk by the extra
    // averaging the untracked domains would have done.
    const counts = new Float64Array(this.n)
    let prev = -1
    for (let k = 0; k < geo; k++) {
      const i = (k === 0 && forcePhase >= 0) ? forcePhase : this._pickClustered(r, prev)
      counts[i] += 1
      prev = i
    }
    const cs = this.cellSize(d)
    for (let i = 0; i < this.n; i++) {
      if (counts[i] === 0) continue
      const f = counts[i] / geo
      const u = purityAt(cs, this.phases[i].d95, this.bias, g)
      comp[i] += f * u
      this._spreadMatrix(comp, i, f * (1 - u))
    }

    // Shrink the sampling scatter toward the bulk when the real grain count is
    // far above the tracked one. Without this a 50 mm particle would assay as
    // erratically as a 1 mm one, which is wrong and would let a DEM "upgrade"
    // an ore purely by being coarse.
    if (nTrue > geo) {
      const k = Math.sqrt(geo / nTrue)
      for (let i = 0; i < this.n; i++) {
        comp[i] = this.bulkVol[i] + (comp[i] - this.bulkVol[i]) * k
        if (comp[i] < 0) comp[i] = 0
      }
    }
    normalise(comp)
    return comp
  }

  /* Whatever is intergrown below the resolved scale, in bulk proportion. */
  _spreadMatrix(comp, exclude, amount) {
    if (amount <= 0) return
    let rest = 1 - this.bulkVol[exclude]
    if (rest <= 1e-9) { comp[exclude] += amount; return }
    for (let j = 0; j < this.n; j++) {
      if (j === exclude) continue
      comp[j] += amount * this.bulkVol[j] / rest
    }
  }

  _pick(u) {
    for (let i = 0; i < this.n; i++) if (u <= this._cum[i]) return i
    return this.n - 1
  }

  /* Cells cluster: a mineral is more likely to sit beside itself or beside a
     phase it is associated with. Without this, textures come out as salt and
     pepper and nothing ever locks the way real ores lock. */
  _pickClustered(r, prev) {
    if (prev >= 0) {
      const u = r()
      if (u < 0.35) return prev
      const a = this.assocIdx[prev]
      if (a.length && u < 0.55) return a[Math.floor(r() * a.length) % a.length]
    }
    return this._pick(r())
  }

  /* ── texture geometry, regenerated on demand ────────────────────────────── */

  /**
   * PORT: the interior of a particle — cell centres in the unit sphere, and
   * the mineral in each. Deterministic in the particle's seed, so it costs
   * nothing to store and is identical every time it is asked for.
   */
  cells(p) {
    const { geo } = this.cellCount(p.d)
    const r = rng(hash2(p.seed, 0x51ed))
    const out = []
    // Composition of the particle, resampled into whole cells so the cell set
    // and the stored composition agree.
    const quota = new Float64Array(this.n)
    for (let i = 0; i < this.n; i++) quota[i] = p.comp[i] * geo
    let prev = -1
    for (let k = 0; k < geo; k++) {
      let i = -1, best = -1
      for (let j = 0; j < this.n; j++) if (quota[j] > best) { best = quota[j]; i = j }
      if (prev >= 0 && this.assocIdx[prev].length && r() < 0.3) {
        const a = this.assocIdx[prev]
        const cand = a[Math.floor(r() * a.length) % a.length]
        if (quota[cand] > 0.25) i = cand
      }
      quota[i] -= 1
      prev = i
      // Cell centres: rejection-free point in the unit ball.
      const u = r(), v = r(), w = r()
      const rad = Math.cbrt(u) * 0.92
      const ct = 2 * v - 1, st = Math.sqrt(Math.max(0, 1 - ct * ct)), ph = 2 * Math.PI * w
      out.push({
        i,
        x: rad * st * Math.cos(ph),
        y: rad * ct,
        z: rad * st * Math.sin(ph),
      })
    }
    return out
  }

  /**
   * PORT: weak sites — the soft mineralised zones a crack will find.
   *
   * A site is a cell whose mineral is softer than the gangue around it. Its
   * `weakness` is the hardness contrast, 0 to 1. These are what
   * `strengthFactor` integrates and what `fracture` steers toward.
   */
  weakSites(p, cells = this.cells(p)) {
    const sites = []
    const cs = this.cellSize(p.d) / p.d
    for (const c of cells) {
      const ph = this.phases[c.i]
      const w = 1 - ph.strength / this.gangueStrength
      if (w <= 0.02) continue
      sites.push({
        x: c.x, y: c.y, z: c.z,
        r: Math.min(0.5, cs * 0.6),
        weakness: Math.min(1, w),
        phase: ph.mineral,
        index: c.i,
        valuable: ph.valuable,
      })
    }
    return sites
  }

  /**
   * PORT: multiplier on the host DEM's breakage energy for this particle.
   *
   * Below 1 when soft mineralised zones are present — the particle breaks
   * easier than its bulk hardness implies, because the crack only has to find
   * the weak path. Above 1 for a particle that happens to be all hard gangue.
   * Feed it straight into whatever Ecs or bond strength the DEM uses.
   */
  strengthFactor(p) {
    // Volume-weighted strength of what the particle actually contains.
    let s = 0
    for (let i = 0; i < this.n; i++) s += p.comp[i] * this.phases[i].strength
    let f = s / this.gangueStrength

    // Weak-path discount. A connected network of soft zones lets the crack
    // avoid the hard phases entirely, so the discount saturates once the soft
    // fraction is past the percolation-ish threshold rather than scaling with
    // it forever.
    let soft = 0, contrast = 0
    for (let i = 0; i < this.n; i++) {
      const w = 1 - this.phases[i].strength / this.gangueStrength
      if (w > 0.02) { soft += p.comp[i]; contrast = Math.max(contrast, w) }
    }
    const connected = Math.min(1, soft / 0.25)
    f *= 1 - 0.45 * contrast * connected * (1 + this.bias) / (1 + this.bias * 0.5)

    // A single-domain particle has no interior boundary left to exploit, which
    // is the well-known reason fines resist breakage out of proportion to size.
    if (this.cellCount(p.d).true <= 1) f *= 1.35

    return Math.max(0.15, f)
  }

  /** Absolute breakage energy for this particle, J/kg. */
  breakageEnergy(p) {
    return this.ecs * 3600 * this.strengthFactor(p) * Math.pow(0.030 / Math.max(p.d, 1e-6), 0.5)
  }

  /* ── fracture ───────────────────────────────────────────────────────────── */

  /**
   * PORT: break a particle.
   *
   * @param {object} p          the particle
   * @param {object} [opt]
   * @param {number[]} [opt.dir]      stress direction from the DEM contact
   * @param {number} [opt.fragments]  how many pieces, default 4
   * @param {number} [opt.seed]       override, for repeatability
   * @returns {object[]} progeny — mass and every phase conserved exactly
   *
   * The fracture plane is chosen by scoring candidates against the weak sites,
   * so the crack runs through the soft mineralised zones. That is what makes
   * the progeny compositions separate rather than each inheriting the parent's
   * average, and it is the mechanism behind liberation-better-than-random.
   */
  fracture(p, opt = {}) {
    const nWant = Math.max(2, Math.min(12, opt.fragments ?? 4))
    const seed = (opt.seed ?? hash2(p.seed, 0xf7a5)) >>> 0
    const r = rng(seed)
    const cells = this.cells(p)
    const sites = this.weakSites(p, cells)

    const vTotal = Math.PI / 6 * p.d * p.d * p.d

    // Groups of cells. Split the largest group repeatedly, each time on the
    // plane that finds the most weakness.
    let groups = [cells.map((_, k) => k)]
    while (groups.length < nWant) {
      let gi = 0
      for (let k = 1; k < groups.length; k++) if (groups[k].length > groups[gi].length) gi = k
      if (groups[gi].length < 2) break
      const [a, b] = this._split(groups[gi], cells, sites, opt.dir, r)
      groups.splice(gi, 1, a, b)
    }
    groups = groups.filter(g => g.length)

    /* Book-keeping is in phase VOLUMES, not in compositions, and that is the
       whole trick. Give every cell a share of each phase's volume, hand the
       shares to whichever fragment holds the cell, and the sum over fragments
       is the parent's volume of that phase identically — no rescaling, no
       drift, and it holds for every phase separately rather than only for the
       total. Compositions and diameters are then read back out at the end.

       Doing it the obvious way round — average the cell compositions, then fix
       the mass afterwards — loses phases at the tens of percent level, because
       the correction is a single scalar and the error is per phase. */
    const cs = this.cellSize(p.d)
    const cellComp = cells.map(c => {
      const v = new Float64Array(this.n)
      const u = purityAt(cs, this.phases[c.i].d95, this.bias)
      v[c.i] = u
      this._spreadMatrix(v, c.i, 1 - u)
      return v
    })

    const agg = new Float64Array(this.n)
    for (const v of cellComp) for (let i = 0; i < this.n; i++) agg[i] += v[i]

    const out = []
    for (const g of groups) {
      const pv = new Float64Array(this.n)      // phase volumes in this fragment
      for (let i = 0; i < this.n; i++) {
        const want = vTotal * p.comp[i]
        if (want <= 0) continue
        if (agg[i] > 0) {
          let w = 0
          for (const k of g) w += cellComp[k][i]
          pv[i] = want * w / agg[i]
        } else {
          // Phase present in the parent but in no cell — split it by volume so
          // it is not quietly dropped.
          pv[i] = want * g.length / cells.length
        }
      }
      let vf = 0
      for (let i = 0; i < this.n; i++) vf += pv[i]
      if (vf <= 0) continue
      out.push({ pv, vf })
    }

    /* Sub-cell splitting. Once a fragment is a single texture domain the cell
       partition has nothing left to cut, and without this the model simply
       hands the particle back unchanged — a DEM grinding toward liberation
       size would stall at the texture scale, which is precisely the size range
       that matters.

       Below the domain the phases segregate rather than average: one child
       takes more of a mineral, the other less, and the finer the children the
       more completely they separate. Totals are untouched, so the mean grade
       is conserved and it is the variance that grows. That variance IS
       liberation — which is why it has to be modelled this way round and not
       by letting purity climb, which would quietly manufacture mineral. */
    let guard = 0
    while (out.length < nWant && guard++ < 64) {
      let bi = 0
      for (let k = 1; k < out.length; k++) if (out[k].vf > out[bi].vf) bi = k
      const parent = out[bi]
      if (parent.vf <= 0) break
      const childD = Math.cbrt(6 * parent.vf / Math.PI) * Math.cbrt(0.5)
      const [a, b] = this._segregate(parent.pv, childD, r)
      if (!a || !b) break
      out.splice(bi, 1, a, b)
    }

    return out.map((f, k) => {
      const comp = new Float64Array(this.n)
      for (let i = 0; i < this.n; i++) comp[i] = f.pv[i] / f.vf
      return {
        d: Math.cbrt(6 * f.vf / Math.PI),
        seed: hash2(seed, k + 1) >>> 0,
        comp,
        ore: this.key,
      }
    })
  }

  /**
   * Split one fragment's phase volumes in two, segregating by phase.
   *
   * The concentration is the phase's GRAIN COUNT in the child, not a length
   * ratio. A phase present as many grains cannot help but be shared, and
   * splits near evenly; a phase down to its last grain or two has to go one
   * way or the other, because a grain does not divide. So
   *
   *     α ≈ (volume of that phase in the child) / (volume of one grain)
   *
   * which is a count, falls as the cube of size, and reaches unity exactly
   * where the phase runs out of grains to share. That is the point of the
   * model: liberation is grains-per-particle crossing one, and it emerges here
   * rather than being imposed.
   *
   * Calibrating on a length ratio instead — which this did at first — puts
   * α near 6 at the liberation size, which splits 50/50. Grades then freeze
   * while size keeps falling, and the phase never comes free however long the
   * DEM grinds. The self-test's end-to-end grind is what caught it.
   *
   * Preferential breakage DIVIDES α: following mineral boundaries sharpens the
   * separation. Multiplying by (1 + bias) — the original — made a strongly
   * preferential ore liberate worse than a random-fracture one, backwards.
   */
  _segregate(pv, childD, r) {
    let vf = 0
    for (let i = 0; i < this.n; i++) vf += pv[i]
    if (vf <= 0) return [null, null]

    /* Where the split falls by VOLUME is fracture's business, not
       segregation's, so it is drawn first and independently. Letting the phase
       weights set the volumes — which they did at first — couples the two, and
       a strongly segregating ore then throws off slivers: the mechanistic
       grind collapsed to a 3 µm d50 while chasing a 150 µm target. */
    const t = 0.2 + 0.6 * (r() + r()) / 2

    /* Which phase prefers which side is segregation's business. Concentration
       is the phase's grain count in the child (see above), so a phase with
       many grains splits near evenly and one down to its last grain goes one
       way or the other. */
    const f = new Float64Array(this.n)
    for (let i = 0; i < this.n; i++) {
      if (pv[i] <= 0) continue
      const g = this.phases[i].d95
      const n = (pv[i] * 0.5) / (Math.PI / 6 * g * g * g)
      const alpha = Math.max(0.04, n) / (1 + this.bias)
      const w1 = Math.pow(Math.max(1e-12, r()), 1 / alpha)
      const w2 = Math.pow(Math.max(1e-12, r()), 1 / alpha)
      f[i] = w1 / (w1 + w2)
    }

    /* Reconcile the two: tilt every phase by one common odds factor e^λ until
       the volumes land on `t`. A common tilt shifts all phases the same way in
       odds, so it moves the total without disturbing which phase prefers which
       side — the segregation ordering survives. Each phase's volume is still
       split as a[i] + b[i] = pv[i] identically, so conservation is exact for
       every phase whatever λ comes out as. */
    const totalAt = (lam) => {
      const e = Math.exp(lam)
      let s = 0
      for (let i = 0; i < this.n; i++) {
        if (pv[i] <= 0) continue
        s += pv[i] * (f[i] * e) / (f[i] * e + (1 - f[i]))
      }
      return s
    }
    const want = t * vf
    let lo = -40, hi = 40
    if (totalAt(lo) < want && totalAt(hi) > want) {
      for (let k = 0; k < 40; k++) {
        const mid = (lo + hi) / 2
        if (totalAt(mid) < want) lo = mid; else hi = mid
      }
    }
    const e = Math.exp((lo + hi) / 2)

    const a = new Float64Array(this.n), b = new Float64Array(this.n)
    let va = 0, vb = 0
    for (let i = 0; i < this.n; i++) {
      if (pv[i] <= 0) continue
      const fi = (f[i] * e) / (f[i] * e + (1 - f[i]))
      a[i] = pv[i] * fi
      b[i] = pv[i] - a[i]
      va += a[i]; vb += b[i]
    }
    if (va <= 0 || vb <= 0) return [null, null]
    return [{ pv: a, vf: va }, { pv: b, vf: vb }]
  }

  /* Split one group of cells on the weakest available plane. Candidates are
     perpendicular to the stress direction where one is given, spread around it
     otherwise, and each is scored by the weakness it passes through. */
  _split(group, cells, sites, dir, r) {
    let bestScore = -Infinity, bestN = null, bestOff = 0

    for (let t = 0; t < PLANE_CANDIDATES; t++) {
      let nx, ny, nz
      if (dir && t < PLANE_CANDIDATES * 0.6) {
        // Perpendicular to the load: a compressed particle splits along the
        // loading direction, not across it.
        const [dx, dy, dz] = normVec(dir)
        const [ux, uy, uz] = perp(dx, dy, dz)
        const [vx, vy, vz] = cross(dx, dy, dz, ux, uy, uz)
        const a = 2 * Math.PI * r()
        nx = ux * Math.cos(a) + vx * Math.sin(a)
        ny = uy * Math.cos(a) + vy * Math.sin(a)
        nz = uz * Math.cos(a) + vz * Math.sin(a)
      } else {
        const ct = 2 * r() - 1, st = Math.sqrt(Math.max(0, 1 - ct * ct)), ph = 2 * Math.PI * r()
        nx = st * Math.cos(ph); ny = ct; nz = st * Math.sin(ph)
      }

      // Offer the plane through a weak site when there is one, otherwise
      // through the group's centroid.
      let off
      if (sites.length && r() < 0.75) {
        const s = sites[Math.floor(r() * sites.length) % sites.length]
        off = s.x * nx + s.y * ny + s.z * nz
      } else {
        let cx = 0, cy = 0, cz = 0
        for (const k of group) { cx += cells[k].x; cy += cells[k].y; cz += cells[k].z }
        const inv = 1 / group.length
        off = (cx * nx + cy * ny + cz * nz) * inv
      }

      // Score: weakness the plane passes near, less a penalty for lopsided
      // splits, which are geometrically possible but energetically unlikely.
      let score = 0
      for (const s of sites) {
        const dist = Math.abs(s.x * nx + s.y * ny + s.z * nz - off)
        if (dist < s.r) score += s.weakness * (1 - dist / s.r)
      }
      let above = 0
      for (const k of group) if (cells[k].x * nx + cells[k].y * ny + cells[k].z * nz > off) above++
      const balance = Math.min(above, group.length - above) / group.length
      if (above === 0 || above === group.length) continue
      score += balance * 0.6

      if (score > bestScore) { bestScore = score; bestN = [nx, ny, nz]; bestOff = off }
    }

    if (!bestN) {                       // no valid plane found — halve it
      const mid = Math.max(1, group.length >> 1)
      return [group.slice(0, mid), group.slice(mid)]
    }
    const [nx, ny, nz] = bestN
    const a = [], b = []
    for (const k of group) {
      const c = cells[k]
      ;(c.x * nx + c.y * ny + c.z * nz > bestOff ? a : b).push(k)
    }
    return [a, b]
  }

  /* ── reporting ──────────────────────────────────────────────────────────── */

  /** Volume fraction of `mineral` in a particle. */
  grade(p, mineral) {
    const i = this.index[mineral]
    return i === undefined ? 0 : p.comp[i]
  }

  /**
   * Is this particle liberated in `mineral`? The conventional definition —
   * a particle is liberated when it is essentially one mineral.
   */
  isLiberated(p, mineral, threshold = 0.9) {
    return this.grade(p, mineral) >= threshold
  }

  /**
   * Liberation of every valuable phase across a population: the fraction of
   * each phase's mass that sits in liberated particles. This is the number a
   * flotation or magnetic-separation model actually needs.
   */
  assay(particles, threshold = 0.9) {
    const lib = new Float64Array(this.n), tot = new Float64Array(this.n)
    let mass = 0
    for (const p of particles) {
      const m = this.massOf(p)
      mass += m
      for (let i = 0; i < this.n; i++) {
        const mi = m * p.comp[i] * this.phases[i].rho / this.densityOf(p.comp)
        tot[i] += mi
        if (p.comp[i] >= threshold) lib[i] += mi
      }
    }
    const phases = {}
    for (let i = 0; i < this.n; i++) {
      phases[this.phases[i].mineral] = {
        mass: tot[i],
        grade: mass > 0 ? tot[i] / mass : 0,
        liberation: tot[i] > 0 ? lib[i] / tot[i] : 0,
        valuable: this.phases[i].valuable,
      }
    }
    return { mass, count: particles.length, phases }
  }

  /**
   * Liberation of one mineral at one particle size: the fraction of that
   * mineral's mass sitting in liberated particles, measured across the
   * particles that carry it.
   *
   * Measured on the mineral, deliberately. Draw particles from the ore at
   * random and a phase at 200 ppm turns up in one particle in five thousand,
   * so a plain Monte-Carlo reports gold and PGM as zero per cent liberated at
   * every size — not because they are locked but because the sample never saw
   * them. Conditioning on the phase being present is what a mineralogist does
   * at the microscope, and it is the only way the trace phases mean anything.
   */
  liberationOf(d, mineral, nSamples = 400, threshold = 0.9) {
    const i = this.index[mineral]
    if (i === undefined) return 0
    let lib = 0, tot = 0
    for (let k = 0; k < nSamples; k++) {
      const seed = hash2(this.baseSeed ^ 0x9d3f, Math.round(d * 1e9) + k * 7919 + i * 131)
      const comp = this._sampleComposition(d, seed, i)
      const vol = comp[i]
      if (vol <= 0) continue
      const m = vol * this.phases[i].rho
      tot += m
      if (comp[i] >= threshold) lib += m
    }
    return tot > 0 ? lib / tot : 0
  }

  /**
   * Liberation against size, for every valuable phase. This is the curve that
   * sets a grind target, and the one that shows what a change of ore does to
   * it.
   *
   * @param {number[]} sizes  particle diameters, m
   * @param {number} [nPer]   samples per phase per size
   */
  liberationCurve(sizes, nPer = 400) {
    return sizes.map(d => {
      const row = { d }
      for (const ph of this.phases) {
        if (!ph.valuable) continue
        row[ph.mineral] = this.liberationOf(d, ph.mineral, nPer)
      }
      return row
    })
  }
}

/* ── small vector helpers ─────────────────────────────────────────────────── */

function normalise(v) {
  let s = 0
  for (let i = 0; i < v.length; i++) s += v[i]
  if (s > 0) for (let i = 0; i < v.length; i++) v[i] /= s
  return v
}

function normVec(d) {
  const m = Math.hypot(d[0], d[1], d[2]) || 1
  return [d[0] / m, d[1] / m, d[2] / m]
}

function perp(x, y, z) {
  // Any unit vector orthogonal to (x,y,z); pick the axis it leans on least.
  const ax = Math.abs(x), ay = Math.abs(y), az = Math.abs(z)
  let ux, uy, uz
  if (ax <= ay && ax <= az) { ux = 0; uy = -z; uz = y }
  else if (ay <= az) { ux = -z; uy = 0; uz = x }
  else { ux = -y; uy = x; uz = 0 }
  const m = Math.hypot(ux, uy, uz) || 1
  return [ux / m, uy / m, uz / m]
}

function cross(ax, ay, az, bx, by, bz) {
  return [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx]
}

export { MINERALS, ORES }
export const oreKeys = Object.keys(ORES)
