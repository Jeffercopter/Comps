# CMD Consulting Pty Ltd — HTML Styles Kit v2.0

Reference implementation: `morrell-calculator.html`

---

## 1. Fonts

| Token | Value | Usage |
|-------|-------|-------|
| `--fb` | `'Nunito', sans-serif` | Body text, labels, headings, buttons |
| `--fm` | `'Fira Code', monospace` | Numeric values, units, inputs, code-like data |

**Google Fonts import:**
```
https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Fira+Code:wght@400;500;600&display=swap
```

**Weight scale used:** 400 (body), 500 (sub-labels, descriptions), 600 (labels, buttons, values), 700 (headings, section titles), 800 (h1, hero numbers)

---

## 2. Color Palette

### Brand Blues
| Token | Hex | Usage |
|-------|-----|-------|
| `--blue` | `#4e57a6` | Primary accent, focus rings, slider fills, identity color |
| `--blue-dark` | `#3b4280` | Gradient midpoint, heading color |
| `--blue-deeper` | `#2d3366` | Tooltip backgrounds |
| `--blue-light` | `#6670b8` | Unit badge text, chart segment secondary |
| `--blue-pale` | `#e8eaf5` | Unit badge bg, readonly input bg |

### Brand Greens
| Token | Hex | Usage |
|-------|-----|-------|
| `--green` | `#62bb43` | CTA buttons, success accents, dot indicators, navbar stripe |
| `--green-dark` | `#4a9e30` | CTA gradient endpoint, recommendation text |
| `--green-light` | `#7dd462` | Accent text on dark bg, secondary result value |
| `--green-pale` | `#e6f5e0` | Badge background, recommendation box bg |

### Brand Purples
| Token | Hex | Usage |
|-------|-----|-------|
| `--purple` | `#4c2566` | Circuit identity, gradient endpoint |
| `--purple-light` | `#6b3d8a` | Secondary purple accent, chart bars |
| `--purple-pale` | `#f0e6f5` | Light purple surface |

### Neutrals & Surfaces
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#f4f6fb` | Page background, input backgrounds |
| `--bgw` | `#ffffff` | Card/section backgrounds |
| `--border` | `#d8dce8` | Input borders, dividers |
| `--border-l` | `#e8ecf4` | Card borders, table row borders, chart canvas borders |
| `--text` | `#2c2f45` | Primary text |
| `--tm` | `#6b7094` | Muted text (labels, descriptions) |
| `--td` | `#9498b4` | Disabled/dimmed text, footer |
| `--danger` | `#d45a5a` | Warning states, negative comparisons |

---

## 3. Gradients

```css
/* Primary brand gradient (navbar, hero result card) */
linear-gradient(135deg, #4e57a6, #3b4280 60%, #4c2566)

/* CTA button gradient */
linear-gradient(135deg, #62bb43, #4a9e30)

/* Text gradient (h1 highlight) */
background: linear-gradient(135deg, #62bb43, #4a9e30);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;

/* Bar chart fills */
/* SABC bar:  */ linear-gradient(90deg, var(--blue), var(--blue-dark))
/* HPGR bar:  */ linear-gradient(90deg, var(--purple-light), var(--purple))
/* Crush bar: */ linear-gradient(90deg, var(--green), var(--green-dark))
```

---

## 4. Spacing & Radii

| Token | Value | Usage |
|-------|-------|-------|
| `--r` | `14px` | Card/section border-radius |
| `--rs` | `8px` | Input/small element border-radius |
| Container max-width | `1260px` | `.ctr` layout wrapper |
| Container padding | `24px 28px 60px` | Page gutters (top right bottom) |
| Section padding | `26px 30px` | Card inner padding |
| Section margin-bottom | `18px` | Vertical rhythm between cards |
| Grid gap (2-col) | `20px` | `.g2` |
| Grid gap (3-col) | `16px` | `.g3` |

---

## 5. Typography Scale

| Element | Size | Weight | Color | Extra |
|---------|------|--------|-------|-------|
| Navbar brand | `18px` | 700 | `#fff` | `letter-spacing: .02em`, lowercase |
| Navbar subtitle | `12px` | 500 | `rgba(255,255,255,.6)` | mono, `margin-left: auto` |
| h1 | `clamp(26px, 3.5vw, 38px)` | 800 | `--blue-dark` | lowercase |
| Subtitle `.sub` | `14.5px` | 500 | `--tm` | max-width: 640px, centered |
| Header badge `.hb` | `10.5px` | 600 | `--green-dark` | mono, uppercase, letter-spacing: .1em |
| Section title `.st2` | `12px` | 700 | `--blue` | `letter-spacing: .12em`, uppercase |
| Label | `12px` | 600 | `--tm` | flex with gap: 6px |
| Input/value | `13.5px` | — | `--text` | `font-family: var(--fm)` |
| Numeric value `.sv` | `13px` | 600 | `--blue` | mono, centered |
| Unit badge `.unit` | `10px` | 500 | `--blue-light` | mono, pill bg |
| Table header | `10.5px` | 700 | `--tm` | `letter-spacing: .06em`, uppercase |
| Table cell | `12.5px` | — | `--text` | mono |
| Hero result `.bnum` | `52px` | 800 | `#fff` | — |
| Hero label `.lt` | `13px` | 600 | `rgba(255,255,255,.7)` | uppercase, letter-spacing: .08em |
| Hero sub-unit `.bu` | `13px` | 500 | `rgba(255,255,255,.5)` | mono |
| Hero secondary `.bs` | `20px` | 700 | `--green-light` | mono |
| Tab text | `13px` | 600 | `--tm` | active: `#fff` on `--blue` bg |
| Confidence card value | `24px` | 800 | `--blue` | — |
| Comparison card name | `16px` | 700 | `--blue-dark` | — |
| Comparison card value | `32px` | 800 | `--blue` | — |
| Footer | `11.5px` | 500 | `--td` | centered |

---

## 6. Component Catalog

### 6.1 Navbar `.bb`
- Full-width gradient bar with `::after` 4px green bottom stripe
- Inner: `.bbi` — flex, center-aligned, `max-width: 1260px`, padding `14px 28px`
- Logo SVG (36×36) + `.brand-text` + `.brand-sub` (auto-margin-left)

```html
<div class="bb">
  <div class="bbi">
    <svg><!-- logo --></svg>
    <span class="brand-text">cmd consulting</span>
    <span class="brand-sub">tool name v1.0</span>
  </div>
</div>
```

### 6.2 Header Badge `.hb`
```css
font-family: var(--fm); font-size: 10.5px; font-weight: 600;
letter-spacing: .1em; text-transform: uppercase;
color: var(--green-dark); background: var(--green-pale);
border: 1px solid rgba(98,187,67,.3);
padding: 5px 14px; border-radius: 20px; margin-top: 10px;
```

### 6.3 Section Card `.sec`
```css
background: #fff; border: 1px solid var(--border-l);
border-radius: 14px; padding: 26px 30px; margin-bottom: 18px;
box-shadow: 0 1px 3px rgba(78,87,166,.06);
animation: fadeIn .5s ease backwards; /* staggered with nth-child delays */
```
Color-coded top borders: `.sg` (green 3px), `.sb` (blue 3px), `.sp` (purple 3px)

### 6.4 Section Title `.st2`
Uppercase label with colored dot indicator (`.dot` — 8px circle, default green)

```html
<div class="st2">
  <span class="dot"></span>Section Title
</div>
<!-- blue variant -->
<div class="st2">
  <span class="dot" style="background:var(--blue)"></span>Blue Section
</div>
```

### 6.5 Slider Field `.fd` (Label + Value + Range)
Two-row layout: header row with label left and numeric input right, range slider below.

```html
<div class="fd">
  <div class="fd-hd">
    <label>Parameter Name <span class="unit">unit</span></label>
    <input type="number" class="sv" id="param_v">
  </div>
  <input type="range" class="sr gs" id="param" min="0" max="100" step="1" value="50">
</div>
```

**Header row `.fd-hd`:** flex, space-between, gap 10px, margin-bottom 8px.

**Numeric input `.sv`:** 68px wide, 6px padding, 6px radius, mono 13px bold, blue text, white bg, centered.

**Range slider `.sr`:**
- Track: 8px height, `#c0c5d6` base, 4px radius
- Thumb: 24px circle, 3px white border, `box-shadow: 0 2px 8px rgba(78,87,166,.35)`, `margin-top: -8px`
- Color variants: `.gs` → green thumb, `.ps` → purple thumb
- **Dynamic fill** (JS): `background: linear-gradient(90deg, color 0%, color pct%, #c0c5d6 pct%, #c0c5d6 100%)`

### 6.6 Data Table `.rt`
- `border-collapse: separate; border-spacing: 0; font-size: 12.5px`
- Header: uppercase, muted, 2px bottom border, right-aligned (except first column)
- Cells: mono font, right-aligned (first column left-aligned in body font, weight 500)
- Hover: `rgba(78,87,166,.03)` row highlight
- `.val` class: blue, weight 600

```html
<table class="rt">
  <thead><tr><th>Label</th><th>Value</th><th>Unit</th></tr></thead>
  <tbody>
    <tr><td>Parameter</td><td class="val">1,234</td><td>kWh/t</td></tr>
  </tbody>
</table>
```

### 6.7 Hero Result Card `.fr`
```css
background: linear-gradient(135deg, var(--blue), var(--blue-dark) 50%, var(--purple));
border-radius: 14px; padding: 32px 36px; text-align: center;
box-shadow: 0 8px 32px rgba(78,87,166,.12);
/* Decorative circle via ::before */
```
Inner elements: `.lt` (label), `.bnum` (big number), `.bu` (unit), `.bs` (secondary value), `.cs` (status pill)

```html
<div class="fr">
  <div class="lt">Total Specific Energy</div>
  <div class="bnum" id="totalVal">—</div>
  <div class="bu">kWh/t</div>
  <div class="bs" id="subVal">—</div>
  <span class="cs cs-g">Status text</span>
</div>
```

### 6.8 Confidence Cards `.cc`
```css
background: #fff; border: 1px solid var(--border-l);
border-radius: var(--r); padding: 18px 20px; text-align: center;
```
Inner: `.cl` (label — 11px, uppercase), `.cv` (value — 24px, 800 weight, blue), `.cu` (unit — 11px, mono, dimmed)

### 6.9 Breakdown Rows `.bk`
```css
display: flex; justify-content: space-between; align-items: center;
padding: 12px 0; border-bottom: 1px solid var(--border-l);
```
- `.bl` — label (13px, weight 500)
- `.bv` — value (13.5px, mono, weight 600, blue)
- `.bk.hi` — highlighted row with blue-pale bg, rounded, bold
- `.bk.sub` — sub-total row, bold labels/values

### 6.10 Circuit Tabs `.tabs` / `.tab`
```css
.tabs { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
.tab {
  padding: 10px 22px; border: 1.5px solid var(--border);
  border-radius: 28px; font-size: 13px; font-weight: 600;
  cursor: pointer; background: #fff; color: var(--tm);
}
.tab:hover { border-color: var(--blue); color: var(--blue); }
.tab.active {
  background: var(--blue); color: #fff; border-color: var(--blue);
  box-shadow: 0 2px 8px rgba(78,87,166,.25);
}
```

```html
<div class="tabs" id="circuitTabs">
  <div class="tab active" data-circuit="sabc">SABC</div>
  <div class="tab" data-circuit="hpgr_ball">HPGR / Ball Mill</div>
  <div class="tab" data-circuit="crush_ball">Crush / Ball Mill</div>
</div>
```

### 6.11 CTA / Download Button `.bc`
Green gradient pill button with icon support. Used for primary actions including PPTX export.

```css
.bc {
  display: inline-flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, #62bb43, #4a9e30);
  color: #fff; font-size: 14px; font-weight: 700;
  padding: 14px 36px; border-radius: 28px; border: none;
  cursor: pointer; font-family: var(--fb);
  box-shadow: 0 4px 16px rgba(98,187,67,.3);
  transition: transform .15s, box-shadow .2s;
}
.bc:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(98,187,67,.4);
}
```

**PPTX Download Button pattern:**
```html
<div style="text-align:center;margin-top:28px">
  <button class="bc" onclick="downloadPPTX()" style="font-size:15px;padding:16px 44px">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff"
         stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
    Download PPTX Summary
  </button>
  <p style="font-size:11px;color:var(--td);margin-top:8px">
    Generates a 5-slide PowerPoint from your current live values
  </p>
</div>
```

**PPTX Library Embedding:** The PptxGenJS library (v4.0.1, ~450KB) must be embedded inline in a `<script>` tag (not loaded from CDN) so the download works in all environments including Claude's preview. Source: `pptxgenjs/dist/pptxgen.bundle.js`.

### 6.12 Secondary Button `.br`
```css
background: #fff; color: var(--tm);
font-size: 13px; font-weight: 600;
border: 1.5px solid var(--border);
padding: 12px 28px; border-radius: 28px;
/* Hover: */ border-color: var(--blue); color: var(--blue);
```

### 6.13 Comparison Card `.cmp`
```css
.cmp {
  background: #fff; border: 1.5px solid var(--border-l);
  border-radius: 14px; padding: 24px;
  transition: transform .2s, box-shadow .2s;
}
.cmp:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(78,87,166,.1); }
.cmp.best { border-color: var(--green); box-shadow: 0 4px 20px rgba(98,187,67,.15); }
.cmp.best::before { /* "MOST EFFICIENT" ribbon */ }
```
Inner: `.cmp-name` (16px, 700), `.cmp-desc` (11.5px, dimmed), `.cmp-val` (centered value block on `--bg`), `.cmp-val .n` (32px, 800), `.cmp-val .u` (12px, mono, dimmed)

### 6.14 Bar Chart Rows `.bar-row`
```html
<div class="bar-row">
  <div class="bar-lbl">SABC</div>
  <div class="bar-ctr"><div class="bar-fill bar-sabc" style="width:85%">14.2</div></div>
</div>
```
- `.bar-ctr`: flex:1, 32px height, `--bg` background, 6px radius
- `.bar-fill`: full height, 6px radius, color-coded, text right-aligned (mono, 11px, white)
- Variants: `.bar-sabc` (blue gradient), `.bar-hpgr` (purple gradient), `.bar-crush` (green gradient)

### 6.15 Canvas Chart Container
```html
<canvas id="chartId" width="560" height="320"
  style="width:100%;border-radius:10px;background:#fff;border:1px solid var(--border-l)">
</canvas>
```

### 6.16 Pill Badges `.pill`
```css
.pill {
  display: inline-block; padding: 6px 16px;
  border-radius: 20px; font-size: 12px; font-weight: 700; text-align: center;
}
.pill-g { background: var(--green-pale); color: var(--green-dark); }
.pill-r { background: #fde8e8; color: var(--danger); }
.pill-n { background: var(--bg); color: var(--td); }
```

### 6.17 Recommendation Box
```html
<div id="recBox" style="margin-top:18px;background:var(--green-pale);
  border:1px solid rgba(98,187,67,.3);border-radius:14px;padding:20px 24px">
  <div style="font-size:13px;font-weight:700;color:var(--green-dark);margin-bottom:8px">
    Recommendation
  </div>
  <div id="recText" style="font-size:13px;color:var(--text);line-height:1.7"></div>
</div>
```

### 6.18 Tooltip `.it`
15px circle, blue-pale bg, `cursor: help`. On hover reveals `::after` tooltip:
```css
background: var(--blue-deeper); color: #fff;
font-size: 11px; padding: 10px 14px; border-radius: 8px;
max-width: 260px; box-shadow: 0 8px 24px rgba(0,0,0,.2);
min-width: 180px; line-height: 1.5;
```

### 6.19 Mill Summary Card `.mc`
```css
background: var(--bg); border: 1.5px solid var(--border-l);
border-radius: 8px; padding: 18px 20px;
```
Row items `.ms`: flex space-between, 1px bottom border. Label `.ml` muted 12px, value `.mv` mono 13px bold.

### 6.20 Icon Badge `.ic`
24px square, 6px radius, white 11px bold text. `.si` → blue bg, `.bi` → purple bg.

### 6.21 Unit Badge `.unit`
```css
font-family: var(--fm); font-size: 10px; font-weight: 500;
color: var(--blue-light); background: var(--blue-pale);
padding: 1px 7px; border-radius: 4px;
```

### 6.22 Disclaimer `.disc`
```css
background: #fffcf0; border: 1px solid #f0e0b0;
border-radius: 14px; padding: 20px 24px; margin-top: 24px;
```
- `h5`: 13px, 700, `#8a6d00`
- `p`: 12px, `#6b5500`, line-height 1.7

### 6.23 Footer `.ft`
```css
text-align: center; padding: 30px 0;
font-size: 11.5px; font-weight: 500; color: var(--td);
```

---

## 7. Layout Grids

```css
.g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
/* Both collapse to 1fr at 768px */
@media(max-width:768px) { .g2, .g3 { grid-template-columns: 1fr; } }
```

---

## 8. Shadows

| Context | Value |
|---------|-------|
| Card default | `0 1px 3px rgba(78,87,166,.06)` |
| Hero result | `0 8px 32px rgba(78,87,166,.12)` |
| CTA button | `0 4px 16px rgba(98,187,67,.3)` |
| CTA hover | `0 6px 24px rgba(98,187,67,.4)` |
| Slider thumb | `0 2px 8px rgba(78,87,166,.35)` |
| Active tab | `0 2px 8px rgba(78,87,166,.25)` |
| Tooltip | `0 8px 24px rgba(0,0,0,.2)` |
| Comparison card hover | `0 6px 20px rgba(78,87,166,.1)` |
| Best comparison card | `0 4px 20px rgba(98,187,67,.15)` |

---

## 9. Transitions & Animations

### Transitions
| Element | Property | Duration |
|---------|----------|----------|
| Inputs & selects | `border-color, box-shadow` | `0.2s` |
| CTA button | `transform, box-shadow` | `0.15s / 0.2s` |
| Secondary button | `border-color, color` | `0.2s` |
| Slider thumb | `transform` | `0.15s` |
| Tabs | `all` | `0.2s` |
| Comparison cards | `transform, box-shadow` | `0.2s` |
| Bar chart fill width | `width` | `0.6s ease` |

### Animations
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.sec { animation: fadeIn .5s ease backwards; }
.sec:nth-child(2) { animation-delay: .1s; }
.sec:nth-child(3) { animation-delay: .15s; }
.sec:nth-child(4) { animation-delay: .2s; }
.sec:nth-child(5) { animation-delay: .25s; }
```

---

## 10. Responsive Breakpoints

```css
@media(max-width:768px) {
  .g2, .g3 { grid-template-columns: 1fr; }
}
@media(max-width:640px) {
  .ctr { padding: 16px; }
  .sec { padding: 20px 18px; }
  .fr  { padding: 24px 20px; }
  .fr .bnum { font-size: 38px; }
  .tabs { gap: 6px; }
  .tab  { padding: 8px 16px; font-size: 12px; }
}
```

---

## 11. Page Skeleton

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Tool Name — CMD Consulting</title>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Fira+Code:wght@400;500;600&display=swap" rel="stylesheet">
  <style>/* all CSS custom properties and component styles */</style>
</head>
<body>

<!-- Navbar -->
<div class="bb">
  <div class="bbi">
    <svg width="36" height="36"><!-- CMD logo SVG --></svg>
    <span class="brand-text">cmd consulting</span>
    <span class="brand-sub">tool name v1.0</span>
  </div>
</div>

<!-- Container -->
<div class="ctr">

  <!-- Header -->
  <div class="hdr">
    <h1>tool <span>name</span></h1>
    <div class="sub">Brief description of the tool purpose.</div>
    <div class="hb">standard / method reference</div>
  </div>

  <!-- Input Section (green top border) -->
  <div class="sec sg">
    <div class="st2"><span class="dot"></span>Input Parameters</div>
    <div class="g2">
      <!-- slider fields go here -->
    </div>
  </div>

  <!-- Calculated Section (blue top border) -->
  <div class="sec sb">
    <div class="st2"><span class="dot" style="background:var(--blue)"></span>Calculated Properties</div>
    <table class="rt"><!-- data table --></table>
  </div>

  <!-- Configuration Section (purple top border) -->
  <div class="sec sp">
    <div class="st2"><span class="dot" style="background:var(--purple)"></span>Configuration</div>
    <div class="tabs"><!-- tab buttons --></div>
    <!-- tab content panels -->
  </div>

  <!-- Results Section -->
  <div class="sec sg">
    <div class="st2"><span class="dot"></span>Results</div>
    <div class="fr"><!-- hero result card --></div>
    <div class="g2" style="gap:10px;margin:18px 0"><!-- confidence cards --></div>
    <div class="mc"><!-- breakdown rows --></div>
  </div>

  <!-- Comparison Section -->
  <div class="sec sb">
    <div class="st2"><span class="dot" style="background:var(--blue)"></span>Comparison</div>
    <div class="g3"><!-- comparison cards --></div>
  </div>

  <!-- Summary Dashboard -->
  <div class="sec sg">
    <div class="st2"><span class="dot"></span>Summary Dashboard</div>
    <div class="g2" style="gap:24px;margin-bottom:24px">
      <div><canvas id="chart1" width="560" height="320" style="width:100%;border-radius:10px;background:#fff;border:1px solid var(--border-l)"></canvas></div>
      <div><canvas id="chart2" width="560" height="320" style="width:100%;border-radius:10px;background:#fff;border:1px solid var(--border-l)"></canvas></div>
    </div>
    <table class="rt"><!-- summary table --></table>

    <!-- PPTX Download Button -->
    <div style="text-align:center;margin-top:28px">
      <button class="bc" onclick="downloadPPTX()" style="font-size:15px;padding:16px 44px">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff"
             stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Download PPTX Summary
      </button>
      <p style="font-size:11px;color:var(--td);margin-top:8px">
        Generates a 5-slide PowerPoint from your current live values
      </p>
    </div>
  </div>

  <!-- Disclaimer -->
  <div class="disc">
    <h5>⚠️ Disclaimer &amp; Terms of Use</h5>
    <p>Disclaimer text here.</p>
  </div>

  <!-- Footer -->
  <div class="ft">© CMD Consulting Pty Ltd — Tool Name</div>

</div>

<!-- PptxGenJS library (embedded inline, ~450KB) -->
<script>/* contents of pptxgen.bundle.js pasted here */</script>

<!-- Application JavaScript -->
<script>
  // Slider fill coloring
  function updateSliderFill(slider) {
    const val = parseFloat(slider.value), min = parseFloat(slider.min), max = parseFloat(slider.max);
    const pct = ((val - min) / (max - min)) * 100;
    let color = '#4e57a6'; // default blue
    if (slider.classList.contains('gs')) color = '#62bb43'; // green
    if (slider.classList.contains('ps')) color = '#4c2566'; // purple
    slider.style.background = `linear-gradient(90deg, ${color} 0%, ${color} ${pct}%, #c0c5d6 ${pct}%, #c0c5d6 100%)`;
  }

  // Number formatting with commas
  function fmt(n, d) {
    if (isNaN(n) || !isFinite(n)) return '—';
    return n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
  }

  // Initialize all sliders on load
  function paintAllSliders() {
    document.querySelectorAll('.sr').forEach(updateSliderFill);
  }
  window.addEventListener('load', paintAllSliders);
</script>
</body>
</html>
```

---

## 12. CSS Custom Properties (full `:root`)

```css
:root {
  /* Blues */
  --blue: #4e57a6;
  --blue-dark: #3b4280;
  --blue-deeper: #2d3366;
  --blue-light: #6670b8;
  --blue-pale: #e8eaf5;

  /* Greens */
  --green: #62bb43;
  --green-dark: #4a9e30;
  --green-light: #7dd462;
  --green-pale: #e6f5e0;

  /* Purples */
  --purple: #4c2566;
  --purple-light: #6b3d8a;
  --purple-pale: #f0e6f5;

  /* Surfaces & Neutrals */
  --bg: #f4f6fb;
  --bgw: #fff;
  --border: #d8dce8;
  --border-l: #e8ecf4;

  /* Text */
  --text: #2c2f45;
  --tm: #6b7094;
  --td: #9498b4;

  /* Semantic */
  --danger: #d45a5a;

  /* Typography */
  --fb: 'Nunito', sans-serif;
  --fm: 'Fira Code', monospace;

  /* Radii */
  --r: 14px;
  --rs: 8px;
}
```

---

## 13. PPTX Generation Notes

The embedded PptxGenJS library enables client-side PowerPoint generation from live calculator values. Key implementation details:

- **Library:** PptxGenJS v4.0.1, self-contained bundle (~450KB), embedded inline in `<script>` tag
- **Slide dimensions:** `LAYOUT_16x9`
- **PPTX color mapping from CSS tokens:**

| CSS Token | PPTX Hex (no #) | Usage in slides |
|-----------|-----------------|-----------------|
| `--blue` | `4e57a6` | Table headers, value text, card accents |
| `--blue-dark` | `3b4280` | Slide header bars, title backgrounds |
| `--green` | `62bb43` | Best-result highlights, accent bars, chart bars |
| `--green-dark` | `4a9e30` | Input card accent, text on green elements |
| `--purple` | `4c2566` | Decorative elements, circuit identity |
| `--purple-light` | `6b3d8a` | HPGR circuit accent |
| `--green-pale` | `e6f5e0` | Reference/info bar backgrounds |
| `--blue-pale` | `e8ecf4` | Table borders, background bars |
| `--bg` | `f4f6fb` | Slide backgrounds |
| `--text` | `2c2f45` | Primary body text |
| `--tm` | `6b7094` | Muted/label text |

- **Font mapping:** Calibri (body), Consolas (mono/values) — system fonts for universal PPTX compatibility
- **Shadow helper:** `{type:"outer", blur:6, offset:2, angle:135, color:"000000", opacity:0.10}`
