# eHPCC — 3D discrete element model

A live discrete element model of the eHPCC drawn in the assembly viewer: feed
enters the hopper, is nipped between the gyrating grinding element and the vessel
wall, fractures, and leaves through the annular outlet when it is finer than the
setting. Speed, gap, eccentricity, feed and ore strength are all live.

**One file, zero dependencies, zero build.** Physics, geometry, render and UI all
live in `ehpcc.html`; three.js and the two brand typefaces are inlined, so it
opens straight from disk and runs offline. It is also staged to `public/ehpcc/`
at build time and served at `/ehpcc`.

## The machine

Geometry follows the parts in the assembly viewer, in the drawing's own
dimensions:

| Part | In the model |
|---|---|
| Receptacle / inner wall (110/111) | Ø300 mm vessel, floor at y = 83 mm, rim at 168 mm |
| Grinding element (120) | Cone widening downward on the eccentric axis, with a distributor cap on top |
| Eccentric bush (161), drive pins (163) | Pure gyration: the element orbits without spinning, as the four pins constrain it |
| Grinding media (170) | 26 × Ø14 mm steel, retained in the chamber |
| Protector ring / outlet (166 / 167a) | Annular discharge: passes what fits the setting, holds the media |
| Feed chute (136) | Hopper delivering onto the distributor cap |

The element's bottom sits exactly on the discharge lip, so the narrowest annulus
is at the outlet — the arrangement of any gyratory. The cone taper is held well
inside `atan(μ)` so the nip grips the feed instead of spitting it back up.

## Physics

- **Sequential impulses**, not penalty springs. A stiff penalty contact on 6 mm
  rock needs a step near 3 × 10⁻⁵ s, which runs the model at a few per cent of
  real time; impulses stay stable at 1/240 s, so the machine turns at its actual
  rpm on screen. The header states the achieved fraction of real time.
- Coulomb friction clamped by the accumulated normal impulse, Baumgarte
  positional bias with a dead band, 8 iterations per substep, 4 substeps a frame.
- Neighbour lists rebuilt once a frame with a skin; breakage and discharge are
  deferred to frame boundaries so contact indices stay valid across substeps.
- **Breakage on absorbed specific energy.** A particle fractures once it has
  taken in Ecs (quoted at 30 mm and scaled with size, since fine particles are
  genuinely harder to break per unit mass). It is replaced by a mass-conserving
  progeny — one large fragment and a tail — placed inside the parent's footprint
  with a spall velocity. Fragments below the product cut leave as fines.

### Energy is conserved, and that matters

Absorbed energy is capped each step by what actually entered the machine: the
work the eccentric did against the charge, plus the potential energy the falling
charge gave up. Without that ceiling the chatter of a dense bed acts as an
unlimited energy supply — during development it ground the entire charge to the
cut size while the drive was delivering 10 W. Contact impulse on its own is not a
usable energy proxy either: most of it is Baumgarte correction, which is
bookkeeping rather than work.

## Response

Steady state at 400 rpm, 12 mm throw, 30 mm feed, Ecs 0.08 kWh/t:

| Gap | Product P80 | Throughput | Breakage | Power at element |
|---|---|---|---|---|
| 10 mm | 5.6 mm | 0.1 t/h | 48 /s | 52 W |
| 18 mm | 17.6 mm | ~0 t/h | 14 /s | 73 W |
| 30 mm | 28.3 mm | 0.7 t/h | 0 /s | 17 W |

Product size tracks the setting, power rises as the gap closes, throughput falls
with it, and at 30 mm the feed simply passes — all four are the response a
crusher should give, and none of them is scripted. They fall out of the contact
geometry.

## What this model is not

The chamber develops **tens of watts, not the tens of kilowatts** of a
full-size machine, because the bed here is shallow and unconfined while a real
eHPCC is choke-fed against a stiff drive. Since breakage is capped by real energy
input, the workable ore-strength range on the slider sits an order of magnitude
below a real ore Ecs. Treat Ecs as a relative hardness control: the *trends* in
gap, speed, throw and hardness are the deliverable, not the absolute duty.

Push the strength past roughly 0.3 kWh/t and the model chokes — the bed builds
and product stops. That is the right qualitative behaviour for an undersized
machine on hard ore, and it is worth seeing.

## Controls

| Control | Range | Default |
|---|---|---|
| Eccentric speed | 0–700 rpm | 400 |
| Gap (closed side) | 6–45 mm | 18 |
| Eccentricity (throw) | 2–20 mm | 12 |
| Feed rate | 0–60 particles/s | 12 |
| Feed top size | 10–45 mm | 30 |
| Grinding media | 0–60 × Ø14 mm | 26 |
| Ore strength Ecs | 0.02–1 kWh/t | 0.08 |
| Product cut size | 3–12 mm | 6 |

Feed rate is deliberately matched to the power the chamber develops. Push it well
past that and the machine chokes, exactly as it would on site.

Drag to orbit, scroll to zoom. **Cutaway section** clips the shells to show the
charge, **colour by stress** shades each particle green through amber to red as
it approaches its fracture energy, and the size-distribution plot is the mass
passing curve of everything discharged so far.

## Theme

CMD Consulting brand: indigo-to-violet header with the green rule, Nunito for
copy and Fira Code for figures — matching the assembly viewer, with both faces
inlined as woff2 so nothing is fetched at runtime.
