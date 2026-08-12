/**
 * Mineral property table.
 *
 * A mineral is a mineral wherever it occurs, so density and hardness live here
 * and nothing else does. Everything that varies between deposits — how much of
 * it there is, how coarse the grains are, what it is locked to — belongs to the
 * ore, not to the mineral, and lives in ores.mjs.
 *
 * `rho`   kg/m³
 * `mohs`  Mohs hardness, the mid-point where a range is quoted
 * `hue`   suggested render colour, for anything that wants to draw phases
 *
 * `strength` is the fracture energy of the mineral relative to quartz. Where a
 * measured value is not to hand it is derived from hardness by
 * `strengthFromMohs`, which is an approximation and is flagged as one: hardness
 * is scratch resistance and comminution is fracture, and the two only correlate
 * loosely. It is good enough for the job it does here, which is to rank phases
 * as softer or harder than their gangue.
 */

/* Fracture energy relative to quartz, from hardness. Roughly quadratic in
   Mohs over the range that matters, normalised so quartz (7) is 1.0 and the
   sheet silicates and molybdenite land near 0.1 where they belong. */
export function strengthFromMohs(mohs) {
  return Math.max(0.05, Math.pow(Math.max(0.5, mohs) / 7, 1.9))
}

const M = (rho, mohs, hue, extra = {}) => ({
  rho, mohs, hue, strength: strengthFromMohs(mohs), ...extra,
})

export const MINERALS = {
  // ── sulphides ───────────────────────────────────────────────────────────
  chalcopyrite: M(4200, 3.75, '#c9a227'),
  bornite:      M(5090, 3.0,  '#8c5a3c'),
  chalcocite:   M(5600, 2.75, '#4a4a52'),
  molybdenite:  M(4700, 1.25, '#6e7276'),   // one of the softest of all
  pyrite:       M(5010, 6.25, '#d4c05a'),
  pyrrhotite:   M(4610, 4.0,  '#a97452'),
  pentlandite:  M(4800, 3.75, '#c3a878'),
  galena:       M(7580, 2.5,  '#7d8489'),
  sphalerite:   M(4050, 3.75, '#8a5a3b'),
  arsenopyrite: M(6100, 5.75, '#b9b3a6'),
  gold:         M(19300, 2.75, '#ffd34d'),
  pgm:          M(10000, 5.5, '#c0c6cc'),   // sperrylite / braggite group

  // ── oxides ──────────────────────────────────────────────────────────────
  hematite:     M(5260, 6.0,  '#7a2e22'),
  goethite:     M(4280, 5.25, '#8c5a1e'),
  magnetite:    M(5150, 6.0,  '#2f3336'),
  chromite:     M(4600, 5.5,  '#3a3436'),
  ilmenite:     M(4720, 5.5,  '#3d3a3f'),
  gibbsite:     M(2420, 3.0,  '#ddd6c6'),
  boehmite:     M(3010, 3.5,  '#cfc7b4'),
  diamond:      M(3520, 10,   '#e8f4ff'),

  // ── silicates and carbonates ────────────────────────────────────────────
  quartz:       M(2650, 7.0,  '#d9d4cb'),
  feldspar:     M(2600, 6.0,  '#e3d9c8'),
  plagioclase:  M(2680, 6.0,  '#e6ddd0'),
  biotite:      M(3000, 2.75, '#4d3b26'),
  sericite:     M(2820, 2.25, '#cfc9bb'),   // fine muscovite, alteration
  chlorite:     M(2650, 2.25, '#5f7358'),
  kaolinite:    M(2600, 2.25, '#e7e3dc'),
  talc:         M(2750, 1.0,  '#e9e7e0'),
  olivine:      M(3300, 6.75, '#7d9455'),
  serpentine:   M(2550, 3.5,  '#6d8a73'),
  pyroxene:     M(3250, 5.75, '#4f5a4a'),
  amphibole:    M(3100, 5.5,  '#41493d'),
  spodumene:    M(3150, 6.75, '#cbbfc9'),
  apatite:      M(3200, 5.0,  '#b9c8b6'),
  dolomite:     M(2850, 3.75, '#cdbfae'),
  calcite:      M(2710, 3.0,  '#ddd8cc'),
}

export const mineralNames = Object.keys(MINERALS)
