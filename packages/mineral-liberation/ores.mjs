/**
 * Ore feed definitions — ten common feed types.
 *
 * Everything deposit-specific lives here. Per phase:
 *
 *   mineral    key into MINERALS
 *   vol        volume fraction of the ore (normalised on load)
 *   grain      characteristic grain diameter, m — the texture scale of THAT phase
 *   d95        size at which ~95% of that phase is liberated, m.
 *              Defaults to `grain` when omitted, which is the physical floor:
 *              a phase cannot be liberated in particles much coarser than its
 *              own grains, and is essentially liberated at or below them.
 *   valuable   counts toward payable grade
 *   assoc      phases this one is preferentially locked to. Drives the cell
 *              clustering, so a valuable phase locked to pyrite reports as
 *              binary with pyrite rather than with the silicates.
 *
 * Ore level:
 *
 *   texture    the coarse texture scale, m. Sets the geometric cell size used
 *              for fracture and weak-site placement. Roughly the spacing of
 *              compositional domains — vein/stringer spacing, band thickness,
 *              or the coarse grain size, whichever the fracture actually sees.
 *   bias       preferential-breakage strength, 0 to about 1.5. How strongly
 *              fracture follows soft mineralised zones rather than cutting
 *              indiscriminately across them. 0 gives random (transgranular)
 *              fracture and textbook random liberation; higher values give
 *              grain-boundary fracture and liberation better than random.
 *   ecs        A × b style reference: median specific breakage energy of the
 *              gangue at 30 mm, kWh/t. The library scales it by composition.
 *
 * The 200 µm liberation anchor the model is built around shows up here as
 * `d95` values clustering near it for the common sulphide and oxide ores. The
 * pegmatite liberates a decade coarser and the PGM reef a decade finer, which
 * is the whole reason liberation size is a per-phase datum and not a constant.
 */

export const ORES = {
  'porphyry-cu-mo': {
    name: 'Porphyry copper–molybdenum',
    note: 'Disseminated chalcopyrite with a sericite-altered halo. The alteration is the soft phase and it is pervasive, so fracture finds it readily.',
    texture: 900e-6, bias: 0.55, ecs: 0.62,
    phases: [
      { mineral: 'chalcopyrite', vol: 0.018, grain: 120e-6, d95: 180e-6, valuable: true, assoc: ['pyrite', 'sericite'] },
      { mineral: 'molybdenite',  vol: 0.002, grain:  40e-6, d95:  70e-6, valuable: true, assoc: ['quartz'] },
      { mineral: 'pyrite',       vol: 0.030, grain: 200e-6 },
      { mineral: 'quartz',       vol: 0.360, grain: 500e-6 },
      { mineral: 'feldspar',     vol: 0.430, grain: 800e-6 },
      { mineral: 'biotite',      vol: 0.060, grain: 300e-6 },
      { mineral: 'sericite',     vol: 0.100, grain:  80e-6 },
    ],
  },

  'orogenic-gold-quartz': {
    name: 'Orogenic gold, quartz vein hosted',
    note: 'Free-milling gold on sulphide grain boundaries. Gold is malleable rather than brittle — it smears rather than breaking, so it liberates by exposure and its d95 is set by grain size alone.',
    texture: 1500e-6, bias: 0.7, ecs: 0.78,
    phases: [
      { mineral: 'gold',         vol: 0.0002, grain:  35e-6, d95:  60e-6, valuable: true, assoc: ['pyrite', 'arsenopyrite'] },
      { mineral: 'pyrite',       vol: 0.035,  grain: 250e-6, assoc: ['arsenopyrite'] },
      { mineral: 'arsenopyrite', vol: 0.010,  grain: 150e-6 },
      { mineral: 'quartz',       vol: 0.760,  grain: 1200e-6 },
      { mineral: 'sericite',     vol: 0.120,  grain:  60e-6 },
      { mineral: 'chlorite',     vol: 0.075,  grain: 100e-6 },
    ],
  },

  'bif-hematite': {
    name: 'Banded iron formation, hematite',
    note: 'Millimetre banding of iron oxide against chert. The bands are the texture, so fracture follows them and liberation is far better than random — the classic case for preferential breakage.',
    texture: 2500e-6, bias: 1.1, ecs: 0.48,
    phases: [
      { mineral: 'hematite',  vol: 0.480, grain: 300e-6, d95: 400e-6, valuable: true, assoc: ['goethite'] },
      { mineral: 'goethite',  vol: 0.110, grain: 200e-6, d95: 300e-6, valuable: true },
      { mineral: 'quartz',    vol: 0.340, grain: 400e-6 },
      { mineral: 'kaolinite', vol: 0.070, grain:  50e-6 },
    ],
  },

  'magnetite-taconite': {
    name: 'Magnetite taconite',
    note: 'Fine magnetite disseminated through a silicate matrix. Little hardness contrast and no soft alteration to guide the crack, so breakage is close to random and the grind has to be fine.',
    texture: 600e-6, bias: 0.2, ecs: 0.85,
    phases: [
      { mineral: 'magnetite', vol: 0.330, grain:  60e-6, d95: 100e-6, valuable: true },
      { mineral: 'quartz',    vol: 0.450, grain: 250e-6 },
      { mineral: 'amphibole', vol: 0.180, grain: 300e-6 },
      { mineral: 'pyrite',    vol: 0.040, grain: 100e-6 },
    ],
  },

  'vms-pb-zn': {
    name: 'Massive sulphide, lead–zinc–copper',
    note: 'Fine sulphide intergrowths in a pyrite mass. Galena is very soft and smears; sphalerite and chalcopyrite are locked at tens of microns, which is why these ores overgrind.',
    texture: 400e-6, bias: 0.65, ecs: 0.52,
    phases: [
      { mineral: 'galena',       vol: 0.060, grain:  50e-6, d95:  80e-6, valuable: true, assoc: ['sphalerite'] },
      { mineral: 'sphalerite',   vol: 0.120, grain:  70e-6, d95: 110e-6, valuable: true, assoc: ['galena', 'chalcopyrite'] },
      { mineral: 'chalcopyrite', vol: 0.025, grain:  25e-6, d95:  40e-6, valuable: true, assoc: ['sphalerite'] },
      { mineral: 'pyrite',       vol: 0.520, grain: 150e-6 },
      { mineral: 'quartz',       vol: 0.180, grain: 200e-6 },
      { mineral: 'dolomite',     vol: 0.095, grain: 250e-6 },
    ],
  },

  'ni-sulphide': {
    name: 'Nickel sulphide, komatiite hosted',
    note: 'Pentlandite exsolved as flames within pyrrhotite. The two are effectively one grain until very fine sizes, and serpentinised matrix is soft and slimes readily.',
    texture: 800e-6, bias: 0.5, ecs: 0.58,
    phases: [
      { mineral: 'pentlandite',  vol: 0.040, grain:  30e-6, d95:  50e-6, valuable: true, assoc: ['pyrrhotite'] },
      { mineral: 'pyrrhotite',   vol: 0.110, grain: 200e-6, assoc: ['pentlandite'] },
      { mineral: 'chalcopyrite', vol: 0.012, grain:  60e-6, d95: 100e-6, valuable: true, assoc: ['pyrrhotite'] },
      { mineral: 'olivine',      vol: 0.380, grain: 600e-6 },
      { mineral: 'serpentine',   vol: 0.400, grain: 150e-6 },
      { mineral: 'magnetite',    vol: 0.058, grain:  80e-6 },
    ],
  },

  'pgm-ug2': {
    name: 'PGM reef, chromitite (UG2 style)',
    note: 'Platinum group minerals a few microns across in a chromite seam. Nothing liberates the PGM by grinding alone — the model shows this, which is the point of including it.',
    texture: 500e-6, bias: 0.4, ecs: 0.72,
    phases: [
      { mineral: 'pgm',         vol: 0.0008, grain: 8e-6,  d95: 12e-6, valuable: true, assoc: ['chromite', 'pyrrhotite'] },
      { mineral: 'chromite',    vol: 0.620,  grain: 150e-6 },
      { mineral: 'pyroxene',    vol: 0.230,  grain: 400e-6 },
      { mineral: 'plagioclase', vol: 0.130,  grain: 500e-6 },
      { mineral: 'pyrrhotite',  vol: 0.019,  grain:  40e-6, assoc: ['pgm'] },
    ],
  },

  'bauxite': {
    name: 'Bauxite, gibbsitic',
    note: 'Soft throughout, with pisolitic gibbsite in a clay matrix. Everything is weak, so hardness contrast is small and the bias is low despite the low absolute strength.',
    texture: 3000e-6, bias: 0.35, ecs: 0.21,
    phases: [
      { mineral: 'gibbsite',  vol: 0.520, grain: 800e-6, d95: 1000e-6, valuable: true, assoc: ['boehmite'] },
      { mineral: 'boehmite',  vol: 0.080, grain: 300e-6, d95:  400e-6, valuable: true },
      { mineral: 'kaolinite', vol: 0.220, grain: 100e-6 },
      { mineral: 'hematite',  vol: 0.130, grain: 150e-6 },
      { mineral: 'quartz',    vol: 0.050, grain: 500e-6 },
    ],
  },

  'spodumene-pegmatite': {
    name: 'Spodumene pegmatite',
    note: 'Centimetre crystals. Liberation is achieved at coarse crush sizes, which is why these plants sort and dense-medium separate rather than grind.',
    texture: 6000e-6, bias: 0.8, ecs: 0.66,
    phases: [
      { mineral: 'spodumene', vol: 0.250, grain: 4000e-6, d95: 5000e-6, valuable: true },
      { mineral: 'quartz',    vol: 0.300, grain: 3000e-6 },
      { mineral: 'feldspar',  vol: 0.380, grain: 5000e-6 },
      { mineral: 'sericite',  vol: 0.070, grain:  200e-6 },
    ],
  },

  'kimberlite-diamond': {
    name: 'Kimberlite, diamond bearing',
    note: 'The inverse of every other feed here: the valuable phase is the hardest thing present and must survive intact. Bias is high because the serpentinised matrix is weak, which is what makes autogenous and attrition milling the right choice.',
    texture: 4000e-6, bias: 1.2, ecs: 0.30,
    phases: [
      { mineral: 'diamond',    vol: 0.0000005, grain: 2000e-6, d95: 2000e-6, valuable: true, indestructible: true },
      { mineral: 'serpentine', vol: 0.480,     grain:  400e-6 },
      { mineral: 'olivine',    vol: 0.300,     grain: 1500e-6 },
      { mineral: 'calcite',    vol: 0.120,     grain:  600e-6 },
      { mineral: 'biotite',    vol: 0.100,     grain:  500e-6 },   // stands in for phlogopite
    ],
  },
}

export const oreNames = Object.keys(ORES)
