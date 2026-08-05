# Syama — SAG Pebble (Scat) Ore Sorting Assessment

Assessment of ore sorting on the SAG scat stream at Syama (Resolute Mining, Mali),
built by re-parameterising the STEINERT Sukari business-case model
(`SR241558 Sukari Gold Pebble Sorting Simulation.xlsx`, F. Riedel, Oct 2024).

**Key client input:** the Syama pebble scats assay **2.0 g/t Au**.

## Headline

| | |
|---|---|
| Recommendation | **Conditional GO — fund test work, not the plant** |
| CAPEX | US$4.1 M (1 × 50 t/h sorter) |
| NPV @10%, full capacity capture | **+US$33.6 M**, payback 6.5 months |
| NPV if freed SAG capacity is *not* refilled | **−US$13.9 M** |
| NPV breakeven | 29% capacity capture |

The entire case is a **throughput debottlenecking** case, not a recovery case — scats
already recirculate, so no gold is currently being lost. Value therefore exists only if
(a) comminution is the binding constraint on the converted line post-SSCP and (b) there is
ore to fill the capacity that sorting frees.

## Why the 2 g/t scat grade matters

Back-solving the deportment against 20% sublevel-cave dilution gives a waste-to-ore
contrast to scats of **1.8×**, against **8.9×** at Sukari.

| | Sukari | Syama |
|---|---|---|
| ROM / scat grade (g/t Au) | 1.57 / 0.56 | 2.40 / 2.00 |
| Scat grade as % of ROM | 35% | 83% |
| Heterogeneity contrast | 8.9× | 1.8× |
| Barren mass available in scats | ~69% | ~33% |
| Reject grade achieved (g/t) | 0.148 | 0.429 |

At 0.43 g/t the reject stream holds US$41/t of recoverable gold against US$10.50/t of cost
avoided. Roughly 60% of the Sukari-style prize is lost to the ore's own character before a
sorter is even specified, and no sorter tuning recovers it.

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
aggregate them in a `CIRCUIT TOTAL` block, following the Sukari original.

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

## Calibration and Goal Seek

`Dashboard` holds the two mass yields (ore → scats, waste → scats) as *inputs*, calibrated so
the model reproduces the measured scat stream (30 t/h at 2.00 g/t). The calibration check
block reports modelled vs measured; adjust the yields if the plant survey changes.

`Dashboard!C35` (ROM feed uplift) is solved by Goal Seek — set the ball-mill/leach feed DIFF
(`L17`) to zero by changing `C35`, so downstream tonnage is held constant and the benefit
reports as higher feed grade. This follows the Sukari original, where the same cell carried
the note *"change with Goal Seek"*.

## Assumptions requiring site confirmation

Flagged `Assumption - CONFIRM` on the Dashboard. These are placeholders, not site data:

- SAG line new feed **200 t/h** (1.58 Mtpa, the SSCP increment)
- Sublevel-cave dilution **20%** — drives the back-solved contrast (see Sensitivity table E)
- Circulating scat load **30 t/h** (15% of new feed)
- Milling cost avoided **US$8.00/t**
- Incremental UG mining cost **US$53.00/t** — derived from AISC, not from site costing

Sorter ore recovery (95%) and waste rejection (70%) are flagged `TEST WORK REQUIRED`. A 1.8×
mass contrast is not evidence of a detectable sensor contrast.

## Public sources used for Syama parameters

- Syama plant configuration and Sulphide Conversion Project scope (secondary crusher, pebble
  crusher for scats, secondary ball mill, column flotation, roaster/ESP upgrade; 2.4 → 4.0 Mtpa)
- 2026 guidance: 195–210 koz at AISC US$1,950–2,150/oz; UG plan 2.6 Mt at 2.4–2.5 g/t Au
- Sulphide recovery 75% (FY25), 76% (Q2-25); gold price assumption US$4,000/oz

Company disclosure is summary-level; nothing here substitutes for site metallurgical data.
