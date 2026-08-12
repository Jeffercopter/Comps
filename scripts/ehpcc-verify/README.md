# eHPCC DEM — verification harness

Reproduces the numbers in [`docs/ehpcc-dem.md`](../../docs/ehpcc-dem.md), and
checks that the model is in a physically sensible state while it produces them.

```bash
npm i -D playwright && npx playwright install chromium
cd scripts/ehpcc-verify

node verify.mjs soak                      # parameter response matrix
node verify.mjs trace                     # time series to steady state
node verify.mjs probe                     # contact and region diagnostics
node verify.mjs shot                      # live render, readouts, screenshots

node verify.mjs trace '{"sGap":20}' 12    # slider overrides, seconds of machine time
```

Slider ids are the ones in `ehpcc.html`: `sRpm`, `sGap`, `sEcc` (offset D),
`sAir`, `sFeed`, `sTop`, `sMedia`, `sEcs`.

Everything except `shot` pauses rendering and steps the physics directly, so a
20-second soak takes seconds of wall clock rather than a minute of watching an
animation. `shot` is the only command that runs the real loop, and it is the one
that proves the page loads clean and the inlined fonts resolve.

## Why `probe` exists

`soak` and `trace` report throughput, product size and power. **A DEM can report
all three perfectly plausibly while its charge is in a state that means
nothing.** Every serious bug in this model's history produced believable numbers:

| Symptom in `probe` | What it means |
|---|---|
| `hist["-1"]` or `hist["-2"]` at zero | No receptacle or element contacts reach the solver. The charge is not being driven, centrifuged or ground — and nothing errors. Usually the contact buffer is full. |
| `nPairs` far above ~10 × `N` | The neighbour search is returning duplicates, or the bed has collapsed. |
| `maxDeg` in the hundreds | One grain is in hundreds of contacts. A sphere can touch about twelve. The charge has collapsed into a mass the solver cannot separate. |
| `deepContacts` ≈ `nC` | Contacts are not grazing, they are interpenetrating. Same conclusion, measured directly. |
| `inElem` or `outside` above zero | Containment is leaking — grains are inside the grinding element or outside the vessel. |
| `yb` concentrated in one band | The bed is packed into a corner rather than distributed up the wall. |
| `realtime` well under 1 | The model cannot keep up with the machine it is simulating. |

`penMean` / `penMax` are overlap as a fraction of the smaller grain's radius. A
healthy dense bed sits in the low hundredths. Anything approaching 0.2 is a
solver that has given up.

## Known defect, found by this harness

At the default settings the charge **degenerates after roughly eight seconds of
machine time**:

```
node verify.mjs probe '{}' 2      inAnnulus 70,  nPairs  38,740,  maxDeg 258
node verify.mjs probe '{}' 8      inAnnulus 20,  nPairs 182,472,  maxDeg 602
                                  deepContacts 182,106 of 182,408
```

Contacts are not merely numerous, they are deep — essentially the whole charge
is interpenetrating — and the annulus population swings between 676 and 20
across otherwise identical runs. Meanwhile `soak` and `trace` continue to report
a steady ~0.11 t/h at a 6.1 mm P80, because none of those readouts can see it.

The response table in the documentation was measured over 20-second soaks and is
therefore **measured on a charge that is partly in this state**. Treat the
trends in that table as indicative and the absolute figures as unverified until
this is fixed.

Two candidate causes, neither yet confirmed:

- **Breakage rate outruns separation.** Progeny are placed inside the parent's
  footprint and must be pushed apart over several steps. At the default four
  breaks per frame in a confined bed, new clusters may be created faster than
  the solver opens the old ones.
- **Impulse solver headroom.** Eight iterations at 1/360 s may be too few for a
  bed confined at 22 g once the size range widens, so penetration accumulates
  instead of resolving.

The diagnostic to distinguish them is in place: run `probe` at increasing
durations with `sFeed` and `sEcs` set so breakage is rare. If the bed stays
clean, breakage is the cause; if it still collapses, the solver is.
