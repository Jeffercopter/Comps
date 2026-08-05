# DEM Simulator — SAG Mill (CMD Edition)

Interactive Discrete Element Method (DEM) simulator of the cross-section of an
8 m diameter SAG mill. Built as a visual tool for explaining grinding phenomena:
cascading, cataracting, centrifuging, the effect of the lifters, the shoulder and
toe of the charge, and the power curve.

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
- **Lifters** modelled as radial capsules that rotate with the shell.
- **Archard-type lifter wear** (abrasion from friction + impacts, with steel
  balls wearing them faster), which can be accelerated up to ×500 to see it in
  ~1–2 minutes. With a worn profile the shoulder drops and the cataract
  shortens, but the power does not fall: worse grinding at the same energy cost.
- Two species: ore (ρ = 2700 kg/m³) and steel balls (ρ = 7800 kg/m³, ~1.45× the
  radius).
- Real SI units; particles are at ~10× scale so the simulation runs at 60 fps in
  the browser (up to ~2600 particles).

## Interactive variables

- Speed (% of critical, Nc = 42.3/√D ≈ 15 rpm), live
- Charge filling Jc (10–45%)
- Ball filling Jb (0–30% of the mill)
- Particle size
- Number and height of lifters, live
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
- Colour modes: type, speed, recent impact energy
- Trajectories and velocity vectors

## Presets

`Slipping` (38% Nc) · `Cascading` (62%) · `Cataracting` (80%) · `Centrifuging` (115%)

## Differences from the original

- All text in English (UI, regime descriptions, teaching notes, code comments).
- Command-prompt colour scheme and monospace typography throughout, including
  the canvas render.
- The original's Google Analytics tag and its event-tracking calls were removed,
  along with the `canonical` / `og:url` tags and the sitemap pointing at the
  original deployment.
- One behaviour fix: clicking a regime preset now refreshes the rpm / % critical
  speed readout in the HUD (in the original those two tiles kept the previous
  value until a slider was moved). The physics is otherwise byte-for-byte the
  original model.

## Credits

Original simulator and physics model: **Luis Plaza A.**
([@luchoplaza](https://github.com/luchoplaza) ·
[LinkedIn](https://www.linkedin.com/in/lplazaalvarez/)).
