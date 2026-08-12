# Multi-mineral liberation for DEM

Standalone. Zero dependencies, no I/O, no DOM, no globals, deterministic given
a seed. Written to be lifted into any discrete element model that wants to know
what its particles are made of and not merely how big they are.

```js
import { OreFeed } from './liberation.mjs'

const ore = OreFeed.load('porphyry-cu-mo', { seed: 42 })

const p = ore.particle(0.030)              // a 30 mm feed particle
ore.grade(p, 'chalcopyrite')               // volume fraction
ore.strengthFactor(p)                      // multiply your Ecs by this
ore.weakSites(p)                           // soft zones, in the unit sphere

const kids = ore.fracture(p, { dir: contactNormal, fragments: 4 })
ore.assay(kids)                            // grade and liberation of the stream
ore.liberationOf(150e-6, 'chalcopyrite')   // liberation at a grind size
```

SI units. Sizes in metres — 200 µm is `200e-6`.

## What it models

An ore particle is a piece of texture: domains of different minerals, at a
characteristic spacing, with different strengths. Three things follow.

**Liberation emerges from size.** A particle far coarser than the mineral grains
holds many domains and assays near the head grade. As it breaks down it holds
fewer, until below the grain size it is a single mineral. For the common
sulphide and oxide feeds that happens around 200 µm — but as a *consequence* of
grain size, not as a constant, which is why the pegmatite here liberates at
2 mm and the PGM reef does not liberate at 25 µm.

**Soft mineralised zones are weak sites.** Sulphides and alteration are usually
softer than the silicate gangue around them. Stress concentrates there and
cracks nucleate there, so a particle carrying them breaks easier than its bulk
mineralogy suggests. That is `strengthFactor`.

**Those weak sites control the progeny.** `fracture` scores candidate planes
against the weak sites and splits on the weakest, so the crack runs *through*
the mineralised zones rather than across them. Progeny separate along mineral
boundaries, and liberation comes out better than random fracture would give —
the `bias` term per ore. This is a consequence of the geometry, not a curve
applied afterwards.

## Cost

A particle is `{ d, seed, comp }` — a diameter, a 32-bit seed, and one short
array of volume fractions. Nothing else is stored. Cells, weak sites and
fracture planes are regenerated from the seed when needed and thrown away, so
ten thousand particles cost ten thousand short arrays rather than ten thousand
meshes.

Measured here: **~25,000 particle creations plus fractures per second** on one
core, four progeny each. That is comfortably inside a DEM frame budget.

## The ten feeds

| Key | Ore | Liberation of the primary phase |
|---|---|---|
| `porphyry-cu-mo` | Porphyry copper–molybdenum | 96% at 200 µm |
| `orogenic-gold-quartz` | Orogenic gold, quartz vein | 86% at 100 µm |
| `bif-hematite` | Banded iron formation | 99% at 500 µm |
| `magnetite-taconite` | Magnetite taconite | 92% at 100 µm |
| `vms-pb-zn` | Massive sulphide Pb–Zn–Cu | 97% at 100 µm |
| `ni-sulphide` | Nickel sulphide, komatiite | 98% at 50 µm |
| `pgm-ug2` | PGM reef, chromitite | 41% at 25 µm |
| `bauxite` | Gibbsitic bauxite | 97% at 1 mm |
| `spodumene-pegmatite` | Spodumene pegmatite | 100% at 2 mm |
| `kimberlite-diamond` | Diamondiferous kimberlite | exposed at 2 mm |

Run `node self-test.mjs --curves` for the full table.

## Two liberation numbers, and which one to believe

The table above is the **sampled** curve: what `liberationOf` says a particle of
that size looks like. It is close to a restatement of the `d95` values you fed
in, so it is a specification, not a prediction. Quoting it alone would be
marking my own homework.

`node self-test.mjs --grind` reports the **mechanistic** number instead —
liberation measured on progeny that actually came out of repeated `fracture`.
This is what a DEM embedding the library will see, so it is the one that
matters:

```
ore                   phase              ~1mm   ~400µm   ~150µm    ~60µm    ~25µm
porphyry-cu-mo        chalcopyrite      –@892   40@359   65@134    96@51   100@23
orogenic-gold-quartz  gold              0@892    6@360   17@133    26@54    89@25
bif-hematite          hematite          8@888   64@358   96@133   100@54   100@22
magnetite-taconite    magnetite         0@881    8@358   59@134    95@53   100@23
vms-pb-zn             galena            0@896    4@354   56@135    85@52    99@22
ni-sulphide           pentlandite       0@856    0@359    1@135    51@57    95@22
pgm-ug2               pgm               0@886    0@358    0@134    10@55    37@22
bauxite               gibbsite         42@889   90@359   99@132   100@55   100@22
spodumene-pegmatite   spodumene        99@895  100@356  100@134   100@54   100@22
kimberlite-diamond    diamond           –@883    –@357    –@134     –@54     –@22
                                   liberation% @ actual d50, µm
```

The two agree on ordering and on the regimes — pegmatite coarse, the sulphides
and oxides through the fines, PGM never — but the mechanism reaches a given
liberation roughly **half a decade finer** than the sampled curve claims. The
sampled curve is an equilibrium statement about a particle at a size; the
mechanism carries the lineage that produced it, and progeny take several splits
to shed inherited gangue. Size your grind off the `--grind` numbers.

A dash means the model refuses to answer. The whole kimberlite feed contains
diamond equal to a single 43 µm sphere, so its liberation is one grain's luck,
not a measurement — the reporter checks the effective sample size and prints
nothing rather than a number that would look like data.

Two of those are in the set precisely because they misbehave. **PGM** never
liberates by grinding — the model says so rather than politely converging, and
that is the correct answer for 8 µm minerals. **Kimberlite** inverts every other
assumption here: the valuable phase is the hardest thing present and must
survive intact, which is why `diamond` is flagged `indestructible` and why the
weak-site logic must not treat a hard inclusion as a crack nucleus. If you
change the strength model, that check is the one that will catch you.

## Adding an ore

Add an entry to `ores.mjs`. Per phase you need a mineral key, a volume
fraction, and a grain size; everything else has a defensible default.

```js
'my-ore': {
  name: 'Whatever it is',
  texture: 800e-6,     // domain spacing the fracture actually sees
  bias: 0.5,           // 0 = random fracture, ~1 = follows mineral boundaries
  ecs: 0.6,            // gangue breakage energy at 30 mm, kWh/t
  phases: [
    { mineral: 'chalcopyrite', vol: 0.02, grain: 120e-6, d95: 180e-6,
      valuable: true, assoc: ['pyrite'] },
    { mineral: 'quartz', vol: 0.98, grain: 500e-6 },
  ],
},
```

`d95` is the size at which ~95% of that phase is liberated; it defaults to the
grain size, which is the physical floor. `assoc` lists phases it is locked to,
so a valuable phase locked to pyrite reports as binary with pyrite rather than
with the silicates.

Minerals themselves live in `minerals.mjs` — density and hardness only, because
a mineral is a mineral wherever it occurs. Everything deposit-specific belongs
to the ore.

## Embedding in a DEM

Three integration points, and you can take any subset.

**Breakage criterion.** Replace a constant specific energy with
`ore.breakageEnergy(p)`, or keep yours and multiply by `ore.strengthFactor(p)`.
A particle carrying soft mineralised zones will then break sooner than a barren
one of the same size, which is the behaviour that makes selective breakage show
up in the product.

**Progeny.** Where your model currently splits a particle into fragments, call
`ore.fracture(p, { dir, fragments })` with the contact normal and use the
diameters and compositions it returns. Mass and every phase are conserved
exactly — see below.

**Reporting.** `ore.assay(streamOfParticles)` gives grade and liberation per
phase, which is what a flotation or magnetic-separation model needs downstream.

## Conservation

`fracture` is book-kept in phase *volumes*, not in compositions. Each cell gets
a share of each phase's volume, the shares go to whichever fragment holds the
cell, and the sum over fragments is the parent's volume of that phase
identically.

This matters more than it sounds. The obvious implementation — average the cell
compositions, then correct the total mass afterwards — passes a mass-balance
check while losing individual phases at **tens of percent**, because the
correction is one scalar and the error is per phase. The first version of this
library did exactly that and the self-test caught it: total mass closed to
1 part in 10¹⁵ while chalcopyrite was out by 87%. If you port this, port the
volume book-keeping, and keep the per-phase check.

## Segregation below the texture scale

Once a fragment is a single texture domain the cell partition has nothing left
to cut, so `_segregate` takes over: it splits one fragment in two and decides
how each phase divides between them. Almost all liberation happens here, in the
size range that matters, and it is the part that is easiest to get wrong.

Two rules, both learned the hard way.

**Concentration is a grain count, not a length ratio.** A phase present as many
grains cannot help but be shared between the two halves; a phase down to its
last grain has to go one way or the other, because a grain does not divide. So

```
α ≈ (volume of that phase in the child) / (volume of one grain)
```

which falls as the cube of size and passes through unity exactly where the
phase runs out of grains to share. Liberation is then grains-per-particle
crossing one, and it *emerges* rather than being imposed.

The first version used a length ratio, `α = 0.25 + 3.5·(d/d95)²`. That puts
α ≈ 6 at the liberation size, which splits 50/50 — so grades froze while size
kept falling, and no amount of grinding ever freed anything. It looked fine:
mass conserved, every phase conserved, the sampled curve textbook. Only an
end-to-end grind showed liberation pinned at 0% through four halvings.

**Fragment volumes are fracture's business, not segregation's.** Let the phase
weights set the volumes and the two couple: a strongly segregating ore starts
throwing off slivers, and the grind collapsed to a 3 µm d50 while chasing a
150 µm target. Draw the volume split first and independently, then tilt all
phases by one common odds factor until they add up to it. A common tilt moves
the total without disturbing which phase prefers which side, and since each
phase is still split `a[i] + b[i] = pv[i]`, conservation is exact whatever the
tilt turns out to be.

Preferential breakage **divides** α — following mineral boundaries separates
phases more cleanly. Multiplying, as this first did, makes a strongly
preferential ore liberate worse than a random-fracture one.

## Verification

```
node self-test.mjs
```

124 checks. They are properties that must hold, not stored snapshots:

- every ore loads, normalises and has a plausible density
- the same seed gives the same particle and the same fracture
- mass conserved through fracture, to 1 part in 10¹⁵
- **every phase** conserved through fracture, independently
- liberation rises monotonically as size falls, for every valuable phase
- every phase essentially liberated below its own grain size
- the 200 µm anchor separates the three regimes — porphyry largely liberated,
  pegmatite long since liberated, PGM still locked
- soft mineralised particles measure weaker than barren gangue, and barren
  quartz–feldspar has no weak sites at all
- preferential breakage liberates better than random at the same size
- progeny grades actually scatter — if fracture just handed every fragment the
  parent's average, this catches it
- diamond is not treated as a weak site
- an actual grind liberates: liberation rises pass on pass while the head grade
  does not move, which a model that manufactured mineral could not do
- preferential breakage sharpens segregation *inside `_segregate`*, tested
  there directly rather than through a whole-ore grind
- 20,000 create-and-fracture cycles inside 4 s

Two of those last ones exist because the first version passed everything else
while being badly wrong; see below.

## Porting

Nothing here uses a JavaScript-only idiom. Six functions carry the model and
are marked `PORT` in the source:

| Function | What it is |
|---|---|
| `rng` | mulberry32, a 32-bit PRNG. Any equivalent works; results change. |
| `purityAt` | the liberation curve — the one imposed function in the model |
| `cells` | particle interior, regenerated from the seed |
| `weakSites` | soft zones, from the cells |
| `strengthFactor` | multiplier on breakage energy |
| `fracture` | the split, and the phase-volume book-keeping |

Everything else is data or reporting. `ores.json` is the ore and mineral
database in a language-neutral form for C++, Python or Fortran hosts — it is
generated from `ores.mjs`, which stays the source of truth.

For a column-major host (LIGGGHTS, Yade, a GPU kernel), store `comp` as an
`nParticles × nPhases` array of floats and the seed as a parallel integer
array; the model never needs a particle to be an object.

## What this is not

Liberation is modelled at the level a comminution circuit cares about: how much
of each phase is free, at what size, and how the texture steers the crack. It
is not a mineral-liberation analyser. There is no grain-boundary mesh, no
stereological correction, no distinction between binary and ternary locking
beyond composition. If you need locked-particle classes for a detailed
flotation model, this gives you the composition to build them from, not the
classes themselves.

The strength values are derived from hardness where a measured fracture energy
was not to hand. Hardness is scratch resistance and comminution is fracture, and
the two correlate only loosely — good enough to rank a phase as softer or harder
than its gangue, which is all the weak-site logic needs, and not good enough to
quote as a breakage parameter.
