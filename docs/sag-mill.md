# DEM Simulator — SAG Mill (CMD Edition)

Interactive Discrete Element Method (DEM) simulator of the cross-section of a SAG
mill. Built as a visual tool for explaining grinding phenomena: cascading,
cataracting, centrifuging, the effect of the lifters, the shoulder and toe of the
charge, and the power curve.

The mill geometry is dynamic — shell diameter and grinding length are live
controls, and everything downstream derives from them.

This is an English translation and re-skin of
[luchoplaza/DEM_SAG](https://github.com/luchoplaza/DEM_SAG) by Luis Plaza A.
All the interface text, in-canvas labels and source comments are in English, and
the whole app is rendered in the classic Windows command-prompt colour scheme —
the 16 legacy console colours on a black background, in a monospace face, with
square borders and inverse-video selected states.

**One file, zero dependencies, zero build.** Everything (physics, render, UI)
lives in `index.html`.

## How to run it

Either of these:

```bash
# 1. Open it directly (double-click works too)
xdg-open index.html

# 2. Local server
python3 -m http.server 8000   # → http://localhost:8000
```

## The palette

Every colour in the app — panels, sliders, particles, charts, the mill itself —
comes from the 16-colour console palette:

| # | Name | Hex | Used for |
|---|---|---|---|
| 0 | Black | `#000000` | background, mill interior |
| 7 | White | `#c0c0c0` | body text, shell, steel balls |
| 8 | Gray | `#808080` | borders, muted text, cold particles |
| A | Light green | `#00ff00` | centre of mass, shoulder marker |
| B | Light aqua | `#00ffff` | headings, power curve, toe marker |
| C | Light red | `#ff0000` | critical impacts, fully worn lifters |
| E | Light yellow | `#ffff00` | accent, ore particles, rotation arrow |

Continuous gradients from the original (speed ramp, impact histogram, particle
heat) are quantised into steps of this palette, so the render reads like a
text-mode screen.

## Deployment

Being a static file with no dependencies, it deploys in seconds:

| Platform | How |
|---|---|
| **GitHub Pages** | Push the repo → Settings → Pages → main branch |
| **Netlify / Vercel** | Drag the folder onto the dashboard |
| **Intranet / SharePoint** | Copy `index.html` to any file server |
| **Offline** | Email the file; it opens offline in any browser |

## Physics implemented

- **Linear spring-dashpot contact** (kn = 3×10⁶ N/m) with damping derived from
  the coefficient of restitution.
- **Coulomb friction** (tangential viscous, capped at μ·Fn).
- **Semi-implicit Euler integration** with 10 substeps per frame
  (Δt ≈ 1.7 ms), in real time.
- **Spatial hashing** for O(N) neighbour search.
- **Lifters** modelled as trapezoidal bars that rotate with the shell: the base
  sits on the shell and is the wider edge, and both faces lean back by the face
  angle, so the base half-width is `top/2 + height × tan(face)`. Contact is
  circle-versus-convex-polygon (closest point plus outward normal, with an
  inside case that pushes out through the shallowest face), so the face angle
  genuinely sets where the charge is released rather than scaling a bar.
- **Archard-type lifter wear** (abrasion from friction + impacts, with steel
  balls wearing them faster), which can be accelerated up to ×500 to see it in
  ~1–2 minutes. With a worn profile the shoulder drops and the cataract
  shortens, but the power does not fall: worse grinding at the same energy cost.
- Two species: ore (ρ = 2700 kg/m³) and steel balls (ρ = 7800 kg/m³, ~1.45× the
  radius).
- Real SI units; particles are at ~10× scale (and scale with the mill diameter) so
  the simulation runs at 60 fps in the browser (up to ~2600 particles).

## Dynamic geometry

Diameter D (3–14 m) and grinding length L (1.5–14 m) are live sliders rather than
hard-coded constants. Changing them re-derives:

| Quantity | How it follows the geometry |
|---|---|
| Critical speed | Nc = 42.3/√D — a 14 m mill turns at 11.3 rpm, a 3 m mill at 24.4 rpm |
| Charge | Rebuilt for the new mill area; Jc and Jb stay volumetric fractions |
| Particle size | Scales with D, so the particle count — and the frame rate — stay constant |
| View | Reframed to the new radius |
| Power | The 2D slice gives kW per metre; L scales it to a whole-mill total in kW |

Power follows D^2.5 as theory predicts (charge mass ∝ D², lever arm ∝ D, speed
∝ D^−0.5): the default 8 m × 4 m mill at 72% Nc draws ~4.2 MW, and going to 14 m
at the same relative speed and filling takes it to ~17 MW.

Two caveats the model makes no attempt to hide: L is a pure scale factor, since
the simulated cross-section is identical at any length (no end effects, no axial
transport), and critical impacts are reported per metre of slice rather than
scaled up.

## Interactive variables

- Shell diameter D and grinding length L, live
- Speed (% of critical, Nc = 42.3/√D), live
- Charge filling Jc (10–45%)
- Ball filling Jb (0–30% of the mill)
- Particle size
- Number, height, face angle (0–35°) and top width of lifters, live
- Accelerated liner wear (×0–500) with a reline button
- Friction μ and restitution e, live

## Outputs that explain the phenomena

- **Regime badge** with an explanation of the current phenomenon
- **Power draw** (P = τ·ω from the reaction torque on the shell) — shows the
  maximum around 80% Nc and the drop when centrifuging
- **Impact energy spectrum** (log histogram) — separates abrasion from impact
- **Shoulder and toe** of the charge, detected automatically
- **Wear profile per lifter** (bars of remaining height) with a teaching note
  based on the level
- Ore drawn as grey faceted rock — a dodecahedron reads in silhouette as a
  ten-sided outline, so each particle is a jittered decagon with its pentagonal
  face suggested inside it, tumbling at a rate that scales with its speed.
  Steel balls stay round, so the two species read apart at a glance. The facets
  are render-only: contact still uses the circumscribed disc.
- Colour modes: type, speed, recent impact energy
- Trajectories and velocity vectors

## Empirical power check

The DEM power comes from the reaction torque on the shell, which is only as good
as the contact model. So the panel also evaluates two published empirical models
on the same mill — same D, L, % critical, Jc, Jb and densities — as an
independent reference:

| Case | DEM | Morrell (1993) | Δ |
|---|---|---|---|
| 8 m × 4 m, 72% Nc, Jc 30 / Jb 15, dry | 4406 kW | 4521 kW | −3% |
| 12 m × 6 m, 78% Nc, Jc 25 / Jb 15, dry | 19 739 kW | 19 229 kW | +3% |
| 12 m × 6 m, as above, 60% solids | 18 121 kW | 17 470 kW | +4% |

Morrell tracks the DEM to within a few per cent across the range, which is a
genuine cross-check: two unrelated routes to the same number.

Ported from the Mill Power Calculator, with **two corrections** without which
the reference is wrong:

1. **Solids by volume divides by SG, it does not multiply by it.** The source has
   `(s·SGo)/(s·SGo + (1−s)·SGl)`, which returns 0.80 for 60% solids by weight at
   SG 2.65; the correct volume fraction is 0.36.
2. **Fraction/percent mixing.** `solidsByVolume` is computed as a fraction but
   then fed to slurry-SG and mass formulas written for percent, so slurry SG came
   out as 1.005 instead of 1.60.

Two caveats stated in the panel rather than hidden:

- **Austin (1990)**, with the constant as supplied, sits about 1.7× Morrell
  across the whole range. It is carried as-ported but should be treated as
  uncalibrated, not as a second opinion.
- **Overflow discharge** applies a fixed-toe correction in Morrell and drops the
  prediction sharply. The DEM has no slurry pool and cannot reproduce that, so
  the comparison is only meaningful on grate.

The comparison is cylinder-only (no cone ends) and defaults to dry, both matching
what the simulation models. A slurry-solids slider shows what the empirical
models predict once slurry is carried.

Model source: Morrell, S. (1993), *The prediction of power draw in wet tumbling
mills*, PhD thesis, University of Queensland.

## Lifter face angle

The face angle is measured from the radial and is the parameter that sets the
release point, so it is the one worth playing with. At 80% of critical speed,
with everything else held constant:

| Face angle | Shoulder | Critical impacts | What you see |
|---|---|---|---|
| 0° (square) | ~85° | ~16–24 /s·m | The bar carries the charge to a high shoulder and throws it past the toe onto bare liner |
| 35° (relieved) | ~60° | ~0 /s·m | The charge rolls off the face early and lands back inside the charge |

Power barely moves between the two (~4.4 vs ~4.5 MW): the face angle changes
*where* the energy is delivered, not how much is drawn. That is the whole liner
design argument in one slider.

Wear relieves the face as well as lowering the bar — up to 20° of extra relief
at full wear — so a worn liner releases earlier and shortens the cataract even
before the height is gone.

## Presets

`Slipping` (38% Nc, 35° face) · `Cascading` (62%, 25°) · `Cataracting` (80%, 8°) ·
`Centrifuging` (115%, 25°) — each preset carries the liner that suits the regime.

## Differences from the original

- All text in English (UI, regime descriptions, teaching notes, code comments).
- Command-prompt colour scheme and monospace typography throughout, including
  the canvas render.
- The original's Google Analytics tag and its event-tracking calls were removed,
  along with the `canonical` / `og:url` tags and the sitemap pointing at the
  original deployment.
- One behaviour fix: clicking a regime preset now refreshes the rpm / % critical
  speed readout in the HUD (in the original those two tiles kept the previous
  value until a slider was moved).
- Dynamic geometry: the original was fixed at D = 8 m with power reported per
  metre of mill length. Diameter and grinding length are now live controls and
  the HUD reports whole-mill kW. The contact law, integrator, spatial hash and
  wear model are unchanged — the geometry is parametrised around them, not
  reformulated.

## Credits

Original simulator and physics model: **Luis Plaza A.**
([@luchoplaza](https://github.com/luchoplaza) ·
[LinkedIn](https://www.linkedin.com/in/lplazaalvarez/)).
