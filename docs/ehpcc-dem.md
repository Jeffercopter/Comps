# eHPCC — 3D discrete element model

A live discrete element model of the eHPCC — Eccentric High Pressure Centrifugal
Comminution — after US 10,421,075, *Grinding apparatus having a rotating
receptacle and grinding element*. Feed enters the chute, lands on the
distributor cap, is thrown into the annulus, worked in the compression zone,
fractures, and leaves in the air stream when it is fine enough to be carried.
Speed, gap, offset, process air, feed and ore strength are all live.

**One file, zero dependencies, zero build.** Physics, geometry, render and UI all
live in `ehpcc.html`; three.js and the two brand typefaces are inlined, so it
opens straight from disk and runs offline. It is also staged to `public/ehpcc/`
at build time and served at `/ehpcc`.

## The kinematics, which are the whole machine

This is **not** a gyratory crusher and nothing in it orbits. The receptacle
(110) rotates about its own stationary axis A. The grinding element (120)
rotates about its own axis B. Both turn **at the same speed, in the same
direction, about parallel axes that never move**. The only asymmetry is that
axis B is displaced from axis A by an adjustable offset D.

That single displacement is what does the grinding. The annulus between the two
bodies is not uniform: at azimuth φ measured from the offset direction its width
is

```
clearance(φ) = gap + D·(1 − cos φ)
```

so it is narrowest — exactly `gap` — along one line, and widest at
`gap + 2D` opposite it. Because both axes are fixed, **that convergence stands
still in the laboratory frame** while the rotating charge is carried through it
once per revolution. It is an eccentric *zone*, not an eccentric *motion*.

Two consequences follow, and everything else in the model comes out of them:

- **The surfaces slip past each other.** A point on the receptacle wall at
  radius r<sub>A</sub> moves at ω·r<sub>A</sub>; the element surface facing it
  sits at r<sub>B</sub> from its own axis and moves at ω·r<sub>B</sub>. In the
  compression zone that difference is the rolling penetration of the element
  into the bed, reported live as the **ω × D slip**.

  Worth being exact about what D = 0 does, because it is not nothing. Set the
  offset to zero and the annulus becomes uniform, but the two surfaces still
  shear past each other — they sit at different radii, so they move at
  different speeds, and the gap is a Couette cell. What disappears is the
  *compression*: nothing converges, so the duty falls back to attrition.
  The model shows exactly that — breakage drops by about a third and
  throughput with it, rather than stopping.
- **The charge is confined centrifugally, not by its own weight.** At the
  default 420 rpm the wall carries the bed at about 22 g. That, not gravity, is
  what makes a bed dense enough to break autogenously in a chamber this small.

Both bodies are drawn turning, the receptacle with ribs and the element with a
green key, so the synchronous rotation and the standing zone read on screen.

## The rest of the machine

| Part | In the model |
|---|---|
| Receptacle (110/111) | Ø220 mm bowl, floor at y = 96 mm, rim at 156 mm, driven |
| Grinding element (120) | Coaxial body on axis B, offset by D, driven at the same ω |
| Distributor cap | Cone on the element crown — throws the feed from the axis out to the wall |
| Grinding media (170) | 26 × Ø6 mm steel, retained; never break, never discharge |
| Feed chute (136) | Pipe stopping clear of the crown |
| Classifier | No screen and no grate: product leaves when the air can carry it |

Two deliberate departures from the drawing, both documented in the source where
they are made:

- **Ø220 rather than Ø300.** A DEM that runs live in a browser has a particle
  budget of a few hundred grains, and the bed must be thicker than the working
  clearance or the element never touches it. At Ø300 the same budget gives a bed
  a few millimetres deep in a 16 mm annulus — geometrically faithful and
  functionally dead.
- **A near-vertical chamber wall** (about 1° of taper). At 22 g the wall
  reaction is twenty-odd times the charge weight, so even a few degrees of taper
  overwhelms gravity: tip it inward and the bed is driven into the bottom corner
  and packs solid, tip it outward and the bed climbs the wall and goes over the
  lip. Near-vertical is the only stable choice, and it leaves gravity free to do
  what the patent describes — settle the coarse to the outer and lower limits.

## Physics

- **Sequential impulses**, not penalty springs, at 1/360 s with six substeps a
  frame, eight iterations a substep. Coulomb friction is clamped by the
  accumulated normal impulse and the friction tangent is locked on the first
  iteration, so the accumulated tangential impulse is a meaningful quantity —
  the energy accounting below depends on it.
- **Boundary contacts are built before particle contacts.** They are the
  machine: if the contact buffer ever runs short it is a rock-on-rock contact
  that goes, never a driven wall.
- **Containment.** Surfaces move at metres per second and a substep is
  milliseconds, so a grain can cross a wall between two solves. Anything more
  than half a radius past a surface is reseated just inside it, still
  overlapping so the solver keeps the contact.
- **Breakage on dissipated energy.** A grain fractures once it has absorbed
  E<sub>cs</sub> (quoted at 30 mm, scaled with size). What counts as absorbed is
  the energy the contact actually *dissipated* — frictional slip work plus the
  inelastic loss of an impact — with a floor: a contact carrying only the
  confining load is the bed standing still, not comminution.
- **The nip.** Nothing can occupy a space narrower than itself, so a grain
  carried into the converging side is either reduced to fit or, if it is a steel
  medium, floated round to the open side. This is the one hard geometric
  constraint and it is not energy-capped — the limit on it is transport.

### Why breakage localises to the compression zone by itself

Nothing in the code tells a particle to break near φ = 0. It falls out of
charging damage to slip work rather than to surface work: a grain riding with
the wall slips at nothing and takes no damage, while one squeezed in the
converging annulus carries the full normal load across the ω × D slip and takes
the lot.

### Two ways this model was wrong, and how it showed

Both are worth keeping in mind when reading any DEM output:

- **Manufactured energy.** Charging damage by contact impulse grinds the whole
  charge on energy the drive never supplied — most of that impulse is Baumgarte
  positional correction, which is bookkeeping, not work. Absorbed energy is
  therefore capped each step by what actually entered the machine.
- **Manufactured particles.** Progeny are placed inside the parent's own
  footprint, and their volumes add up to the parent's, so they cannot all fit.
  Break into forty fragments and the solver is handed a cluster it can never
  separate; one such break seeds the next, and within two seconds the charge is
  a heap in the bottom corner with every reading fiction. Fragments are capped
  at four, a nip may take only about a third off the diameter in one event, and
  no more than four breaks are processed per frame.

## Response

Twenty seconds of machine time from the seeded charge. Base case is 420 rpm,
D = 10 mm, gap 8 mm, air 20 m/s, 18 mm feed, E<sub>cs</sub> 0.25 kWh/t; each row
changes one thing.

| | Product P80 | Throughput | Breakage | Dissipated | |
|---|---|---|---|---|---|
| **Base** | 6.10 mm | 0.11 t/h | 71 /s | 42 W | |
| D = 0 | 6.17 mm | 0.08 t/h | 45 /s | 65 W | uniform annulus — shear, no compression |
| D = 4 mm | 6.15 mm | 0.16 t/h | 81 /s | 48 W | |
| D = 18 mm | 6.11 mm | 0.12 t/h | 64 /s | 48 W | |
| Gap 6 mm | 6.01 mm | 0.14 t/h | 83 /s | — | tight zone, chamber runs clear |
| Gap 20 mm | — | 0 | 0 | 231 W | **choked** — zone too open to break the feed |
| 150 rpm | — | 0 | 0 | 25 W | **choked** — 3 g, no confinement |
| 800 rpm | 6.15 mm | 0.15 t/h | 77 /s | 33 W | 79 g at the wall |
| Air 12 m/s | 2.87 mm | 0 | 0 | 70 W | **choked** reaching a 1.9 mm cut |
| Air 30 m/s | 12.97 mm | 0.12 t/h | 3 /s | — | 14 mm cut, feed passes near-unbroken |

Three things worth reading off that table. **Product size follows the air**, and
only the air: 2.9 mm at 12 m/s to 13.0 mm at 30 m/s, tracking the
terminal-velocity cut across the whole range, which is what a machine with no
screen must do. **The offset earns its keep** — removing it costs a quarter of
the throughput and a third of the breakage rate, and that residue is the Couette
shear, not the compression zone. And **the machine chokes from three different
directions** — too open a gap, too slow a rotation, too fine a cut demanded —
each of which is a real way to stall a comminution circuit. None of this is
scripted; it falls out of the contact geometry and the energy accounting.

## What this model is not

The chamber develops **tens of watts, not the tens of kilowatts** of a
full-size machine, so the workable E<sub>cs</sub> range sits below a real ore.
Treat E<sub>cs</sub> as a relative hardness control: the *trends* in speed, gap,
offset, air and hardness are the deliverable, not the absolute duty.

**The chamber runs lean at the default feed**, and that is worth saying plainly
rather than hiding. At 8 particles a second the annulus carries a few hundred
grains — of order 7% by volume, a scattering rather than the packed bed a real
eHPCC works. Wind the feed up and the bed thickens and the grinding element
engages properly; wind it up far enough and the model runs out of particle
budget and says so in the header. That window — lean enough to run at 60 fps,
loaded enough to compress a bed — is the binding constraint on this model, and
every geometric compromise above exists to widen it.

## Controls

| Control | Range | Default |
|---|---|---|
| Rotation speed (both bodies) | 0–900 rpm | 420 |
| Gap | 5–28 mm | 8 |
| Offset D | 0–20 mm | 10 |
| Process air | 0–34 m/s | 20 (6.4 mm cut) |
| Feed rate | 0–40 particles/s | 8 |
| Feed top size | 8–36 mm | 18 |
| Grinding media | 0–60 × Ø6 mm | 26 |
| Ore strength E<sub>cs</sub> | 0.05–1.5 kWh/t | 0.25 |

Drag to orbit, scroll to zoom. **Cutaway section** clips the shells to show the
charge, **colour by stress** shades each particle green through amber to red as
it approaches its fracture energy, and the size-distribution plot is the mass
passing curve of everything discharged so far. The header reports the achieved
fraction of real time.

## Theme

CMD Consulting brand: indigo-to-violet header with the green rule, Nunito for
copy and Fira Code for figures — matching the assembly viewer, with both faces
inlined as woff2 so nothing is fetched at runtime.
