# Syama — SAG Pebble (Scat) Ore Sorting Assessment

Assessment of ore sorting on the SAG scat stream at Syama (Resolute Mining, Mali),
built by re-parameterising a 2024 African gold mine pebble sorting business-case model.

Where Syama site data was unavailable, that study's **ratios and unit rates are carried
across** rather than assumed independently. Syama's own measured and disclosed values are
retained. The reference operation is anonymised as "African gold mine study (2024)"
throughout the client-facing documents.

**Key client input:** the Syama pebble scats assay **2.0 g/t Au**.

## Headline

| | |
|---|---|
| Recommendation | **Conditional GO — fund test work, not the plant** |
| CAPEX | US$4.1 M (1 × 50 t/h sorter) |
| NPV @8%, full capacity capture | **+US$55.2 M**, payback 5.3 months |
| NPV if freed SAG capacity is *not* refilled | **−US$36.9 M** |
| NPV breakeven | 40% capacity capture |

The entire case is a **throughput debottlenecking** case, not a recovery case — scats
already recirculate, so no gold is currently being lost. Value therefore exists only if
(a) comminution is the binding constraint on the converted line post-SSCP and (b) there is
ore to fill the capacity that sorting frees.

## Why the 2 g/t scat grade matters

Back-solving the deportment on the reference study's dilution gives a waste-to-ore contrast
to scats of **2.23×**, against **8.91×** in the reference case.

| | Reference study | Syama |
|---|---|---|
| ROM / scat grade (g/t Au) | 1.57 / 0.55 | 2.40 / 2.00 |
| Scat grade as % of ROM | 35% | 83% |
| Heterogeneity contrast | 8.91× | 2.23× |
| Barren mass available in scats | ~69% | ~27% |
| Reject grade at 90/90 duty (g/t) | 0.151 | 0.782 |
| Mass pull achieved | 54% | 27% |

At 0.78 g/t the reject stream holds US$75/t of recoverable gold against the US$7.69/t of
mining, dumping and G&A it avoids — nearly ten dollars of gold discarded per dollar saved.
More than half the reference-style prize is lost to the ore's own character before a sorter
is even specified, and no sorter tuning recovers it.

## Contents

```
brief/
  Syama_Ore_Sorting_Brief.docx    two-page decision brief (deliverable)
  Syama_Ore_Sorting_Brief.pdf     rendered, verified at two pages
  build_brief.js                  docx-js source
  Syama_Ore_Sorting_Letter.pdf    two-page covering letter, CMD house style (deliverable)
  Syama_Ore_Sorting_Letter.docx   editable source
  build_letter.js                 docx-js source, built on the CMD style kit
  styles/cmd_docx_styles_final.js CMD Consulting DOCX style kit
  styles/cmd_logo.jpg             CMD logo (JPEG RGB — the kit rejects RGBA PNG)
tool/
  syama_pebble_sorting.html       live interactive model, CMD HTML house style
model/
  Syama_Pebble_Sorting_Simulation.xlsx   the updated case
  build_workbook.py               generates the workbook
  engine.py                       mass-balance engine (mirrors the workbook formulas)
  sensitivity.py                  generates the Sensitivity sheet data
  sensitivity_results.json        cached sensitivity output
```

### Workbook sheets

| Sheet | Contents |
|---|---|
| `Dashboard` | all inputs, base-vs-sorting outputs, economics, calibration check |
| `MB Base` | circuit mass balance, no sorting (all scats crushed and returned) |
| `MB Sort` | circuit mass balance with the sorter, freed capacity refilled |
| `NPV` | monthly cash flow, NPV / IRR / payback |
| `Sensitivity` | capacity capture, incremental feed grade, scat grade, sorter performance, dilution, gold price |

Both mass-balance sheets model the recirculating scat load as six sequential SAG passes and
aggregate them in a `CIRCUIT TOTAL` block, following the reference model.

## Reproducing

```bash
pip install openpyxl
python model/sensitivity.py                                    # writes sensitivity_results.json
python model/build_workbook.py Syama_Pebble_Sorting_Simulation.xlsx
npm install docx && node brief/build_brief.js && node brief/build_letter.js
soffice --headless --convert-to pdf brief/*.docx        # render
```

The covering letter uses the CMD Consulting DOCX style kit (`brief/styles/`) — its palette,
Trebuchet/Calibri pairing, logo header and page footer. Two deviations from the kit defaults,
both to hold the letter to two pages: body line spacing 1.08 rather than 1.15, and a 0.75"
bottom margin rather than 1". One colour outside the kit palette, a soft red on the negative
NPV cell, since the kit carries no semantic accent for a downside figure.

`styles/cmd_docx_styles_final.js` differs from the kit as supplied in one respect:
`buildHeader()` now right-aligns the company name on the same tab stop the footer uses for
the page number, with the logo staying left. This was made in the kit rather than overridden
locally so it applies as the house default to future CMD documents.

The letter is addressed to Daniel Millar, Principal Metallurgist, Resolute Mining Limited
(London), and signed by Mike Daniel, CMD Consulting Pty Ltd. No placeholder fields remain.

The workbook has been verified two ways: recalculated in LibreOffice Calc, and evaluated
cell-by-cell with the `formulas` package. Both agree with `engine.py` to three decimals.

## Interactive tool

`tool/syama_pebble_sorting.html` is the same model as a single self-contained page, built on the
CMD Consulting HTML Styles Kit v2.0 — its palette, Nunito/Fira Code pairing, gradient navbar,
section cards, sliders, hero result card and pill badges. Fourteen live inputs drive the NPV,
mass balance, comparison cards and two sensitivity charts.

Two departures from the kit, both forced by the artifact sandbox's content security policy,
which blocks external hosts:

- The kit's Google Fonts `<link>` cannot load, so Nunito and Fira Code are inlined as woff2
  data URIs (~75 KB total). Both are variable fonts, so one file per family covers every weight.
- The PptxGenJS export button (kit §6.11) is omitted rather than shipped broken — the library
  cannot be fetched from a CDN and was not vendored.

The navbar mark is a drawn SVG globe in CMD blue and green; the kit specifies an SVG logo and
only a raster JPEG was supplied, which would have shown as a white box on the gradient.

The page solves the deportment and the Goal Seek uplift in closed form rather than by iteration,
so it recalculates instantly. Verified against `engine.py` to within 0.03% on thirteen metrics,
and checked in Chromium for console errors, horizontal overflow and the impossible-input guard
(a scat grade at or above the undiluted ore grade cannot arise from preferential waste
reporting, and the page says so instead of drawing nonsense).

## Calibration and Goal Seek

`Dashboard` holds the two mass yields (ore → scats, waste → scats) as *inputs*, calibrated so
the model reproduces the measured scat stream (32.8 t/h at 2.00 g/t). The calibration check
block reports modelled vs measured; adjust the yields if the plant survey changes.

`Dashboard!C34` (ROM feed uplift) is solved by Goal Seek — set the ball-mill/leach feed DIFF
(`L17`) to zero by changing `C34`, so downstream tonnage is held constant and the benefit
reports as higher feed grade. This follows the reference model, where the same cell carried
the note *"change with Goal Seek"*.

## Basis of each input

**Retained from Syama** — ROM grade 2.40 g/t, recovery 75%, gold price US$4,000/oz (Resolute
disclosure), and the measured scat grade of 2.00 g/t (client sampling).

**Carried from the reference study** (flagged `Reference study` on the Dashboard) — waste
dilution 11.9%, circulating scat load 16.4% of new feed, sorter duty 90/90, US$7.69/t
mining-dump-G&A on rejects, US$0.45/t sorting, 7,370 h/a, 8% discount, 12-month build,
120-month life, and the CAPEX build-up.

**Still Syama-specific and unconfirmed** — SAG line new feed **200 t/h** (1.58 Mtpa, the SSCP
increment), flagged `Syama - CONFIRM`.

The one carry-over worth challenging is the **11.9% dilution**: a sublevel cave typically runs
higher, and dilution drives the back-solved contrast. Sensitivity table E spans 10–25%.
Sorter duty stays flagged `TEST WORK REQUIRED` — a 2.23× mass contrast is not evidence of a
detectable sensor contrast.

## Conformance with the STARK / CMD mill pebble deck (SR261704 D17-001 Rev00)

Checked against the STARK Resources / CMD Consulting *Mill Optimisation Through Ore Sorting*
deck. Conforms on method and positioning:

- Sorter sits on the pebble / recirculating-waste stream (deck slide 7)
- Value framed as mill capacity release, not recovery ("free up to 15% mill capacity")
- US$0.45/t sorting OPEX matches the deck exactly
- The three sensitivity levers (ore grade, dilution/heterogeneity, sorter recovery) are the
  deck's own
- Coarse-ROM dilution rejection, recommended here as the adjacent target, is one of the
  deck's three sorter positions

Corrections made after reviewing the deck:

- The vendor is **STARK Resources**, which is explicitly **OEM-agnostic** (sensor and vendor
  selection is its stated IP). Earlier drafts wrongly named STEINERT and presumed XRT; the
  documents now leave sensor selection open across colour, NIR, XRT, XRF and EM.
- Next steps realigned to STARK's four-phase approach. **Phase 3 — a scan-only online
  analyser in circuit, no ejection** — was missing and has been added; it is the right
  de-risking step for a case this sensitive to reject grade, since no gold is at risk.

Benchmark cross-check against the deck's published gold case (570 t/h, 1.5 g/t, 15% dilution,
84% recovery, NPV US$79 M, CAPEX US$8 M): Syama matches it on NPV per tonne of throughput only
because it is run at US$4,000/oz — on the benchmark's own price basis it sits well below. Syama
frees ~4.3% of mill feed against the deck's "up to 15%" headline, about a quarter of the
available prize. Both are the contrast problem showing through.

Note the deck's gold benchmark carries **15% dilution** against the 11.9% carried into this
model, reinforcing that 11.9% is the assumption most worth revisiting.

## Public sources used for Syama parameters

- Syama plant configuration and Sulphide Conversion Project scope (secondary crusher, pebble
  crusher for scats, secondary ball mill, column flotation, roaster/ESP upgrade; 2.4 → 4.0 Mtpa)
- 2026 guidance: 195–210 koz at AISC US$1,950–2,150/oz; UG plan 2.6 Mt at 2.4–2.5 g/t Au
- Sulphide recovery 75% (FY25), 76% (Q2-25); gold price assumption US$4,000/oz

Company disclosure is summary-level; nothing here substitutes for site metallurgical data.
