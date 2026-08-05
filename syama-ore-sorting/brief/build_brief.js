const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow,
        TableCell, WidthType, ShadingType, BorderStyle, PageOrientation } = require('docx');
const fs = require('fs');

const NAVY = "1F3864", STEEL = "2E5C8A", LIGHT = "DCE6F1", AMBER = "FFF2CC",
      GREEN = "E2EFDA", RED = "FCE4E4", GREY = "F2F2F2";
const FONT = "Calibri";

const T = (t, o={}) => new TextRun({ text: t, font: FONT, size: o.size||17, bold: o.b,
  italics: o.i, color: o.c || "000000" });
const P = (runs, o={}) => new Paragraph({ children: Array.isArray(runs)?runs:[runs],
  spacing: { before: o.before??0, after: o.after??60, line: o.line??230 },
  alignment: o.al, indent: o.indent, border: o.border, keepNext: o.keepNext });
const txt = (t, o={}) => P([T(t, o)], o);

const H = (t) => new Paragraph({
  children: [new TextRun({ text: t, font: FONT, size: 19, bold: true, color: "FFFFFF" })],
  shading: { type: ShadingType.CLEAR, fill: STEEL, color: "auto" },
  spacing: { before: 130, after: 70, line: 240 }, keepNext: true,
  indent: { left: 60 } });

const W = 9360;                              // usable width, US Letter 1" margins
function table(cols, rows, opt={}) {
  const total = cols.reduce((a,b)=>a+b,0);
  const scaled = cols.map(c => Math.round(c/total*W));
  scaled[scaled.length-1] += W - scaled.reduce((a,b)=>a+b,0);
  return new Table({
    columnWidths: scaled,
    width: { size: W, type: WidthType.DXA },
    borders: ["top","bottom","left","right","insideHorizontal","insideVertical"].reduce((o,k)=>{
      o[k] = { style: BorderStyle.SINGLE, size: 2, color: "AEBBD0" }; return o; }, {}),
    rows: rows.map((r, ri) => new TableRow({
      cantSplit: true,
      tableHeader: ri === 0,
      children: r.map((cell, ci) => {
        const isH = ri === 0;
        const c = typeof cell === "object" ? cell : { t: String(cell) };
        return new TableCell({
          width: { size: scaled[ci], type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, color: "auto",
                     fill: isH ? NAVY : (c.fill || (ri % 2 === 0 ? GREY : "FFFFFF")) },
          margins: { top: 25, bottom: 25, left: 70, right: 70 },
          children: [new Paragraph({
            children: [new TextRun({ text: c.t, font: FONT, size: c.size||15,
              bold: isH || c.b, italics: c.i, color: isH ? "FFFFFF" : (c.c||"000000") })],
            spacing: { before: 0, after: 0, line: 210 },
            alignment: ci === 0 ? AlignmentType.LEFT : (c.al || AlignmentType.RIGHT) })] });
      }) }))
  });
}

const bullet = (t, o={}) => new Paragraph({
  children: [T(t, o)], bullet: { level: 0 },
  spacing: { before: 0, after: 40, line: 225 }, indent: { left: 260, hanging: 180 } });

const RULE = new Paragraph({ children: [T("")], spacing: { before: 0, after: 60 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: STEEL } } });

// ------------------------------------------------------------------ CONTENT
const doc = new Document({
  styles: { default: { document: { run: { font: FONT, size: 17 } } } },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 },
                          margin: { top: 720, bottom: 620, left: 720, right: 720 } } },
    children: [

  new Paragraph({ children: [new TextRun({ text: "SYAMA  |  SAG PEBBLE (SCAT) ORE SORTING",
      font: FONT, size: 26, bold: true, color: "FFFFFF" })],
    shading: { type: ShadingType.CLEAR, fill: NAVY, color: "auto" },
    spacing: { after: 0, line: 300 }, indent: { left: 60 } }),
  new Paragraph({ children: [new TextRun({ text: "Assessment of the business case and recommendation on STEINERT ore sorting",
      font: FONT, size: 17, color: "FFFFFF" })],
    shading: { type: ShadingType.CLEAR, fill: STEEL, color: "auto" },
    spacing: { after: 100, line: 250 }, indent: { left: 60 } }),

  table([15,38,15,32], [
    [{t:"Field",al:AlignmentType.LEFT},{t:"Detail",al:AlignmentType.LEFT},{t:"Field",al:AlignmentType.LEFT},{t:"Detail",al:AlignmentType.LEFT}],
    [{t:"Date",b:true},{t:"5 August 2026",al:AlignmentType.LEFT},{t:"Basis",b:true},
     {t:"STEINERT model SR241558 (Sukari), re-parameterised",al:AlignmentType.LEFT}],
    [{t:"Subject",b:true},{t:"Sorting of SAG scats, converted (ex-oxide) line",al:AlignmentType.LEFT},
     {t:"Key input",b:true},{t:"Scat grade 2.0 g/t Au (client sampling)",al:AlignmentType.LEFT,b:true}],
  ]),

  H("1.  Recommendation"),
  txt("Conditional GO — fund test work, not the plant. The re-parameterised case returns an NPV of "
    + "US$33.6 M with a 6.5-month payback on US$4.1 M of capital, but the entire result rests on one "
    + "assumption that has not been tested: that freed SAG capacity gets refilled with ore. Strip that "
    + "away and the same plant destroys US$13.9 M. Two gates must be closed before any capital is committed.",
    { after: 70 }),
  bullet("Gate 1 (commercial, no cost, ~4 weeks) — confirm that comminution, not the roaster/flotation "
    + "circuit or ore supply, is the binding constraint on the converted line post-SSCP, and that ore exists to fill it.", {b:false}),
  bullet("Gate 2 (technical, ~US$60–150 k, ~3 months) — a bulk XRT/sensor test on 2–5 t of Syama scats. "
    + "A 1.8× mass contrast is not proof of a detectable sensor contrast."),
  txt("Do not order a sorter until both gates pass. The downside case is not marginal — it is a "
    + "materially negative NPV plus permanent gold loss to the waste dump.", { i:true, after: 40 }),

  H("2.  What the work to date establishes"),
  txt("The Sukari SR241558 model simulates a pebble sorter on the SAG mill discharge screen oversize. "
    + "Barren scat mass is rejected, the circulating load falls, freed SAG capacity is refilled with ROM, "
    + "and mill/leach feed tonnage is held constant by Goal Seek so the benefit reports as higher feed grade. "
    + "At Sukari it produced +7,925 oz/a for US$8.2 M. The engine is sound and transfers directly to Syama; "
    + "what does not transfer is the material property that made Sukari work.", { after: 70 }),

  table([30,17,17,36], [
    [{t:"Parameter",al:AlignmentType.LEFT},{t:"Sukari"},{t:"Syama"},{t:"Why it matters",al:AlignmentType.LEFT}],
    [{t:"ROM / scat grade (g/t Au)",b:true},{t:"1.57 / 0.56"},{t:"2.40 / 2.00",b:true,fill:AMBER},
     {t:"Sukari scats were barren; Syama scats are not",al:AlignmentType.LEFT}],
    [{t:"Scat grade as % of ROM",b:true},{t:"35%"},{t:"83%",b:true,fill:AMBER},
     {t:"Gold is not rejecting to the coarse fraction",al:AlignmentType.LEFT}],
    [{t:"Heterogeneity contrast",b:true},{t:"8.9×"},{t:"1.8×",b:true,fill:RED},
     {t:"Back-solved waste:ore deportment to scats — the crux",al:AlignmentType.LEFT}],
    [{t:"Barren mass available in scats",b:true},{t:"~69%"},{t:"~33%",fill:AMBER},
     {t:"Hard ceiling on what any sorter can reject",al:AlignmentType.LEFT}],
    [{t:"Reject grade achieved (g/t)",b:true},{t:"0.148"},{t:"0.429",b:true,fill:RED},
     {t:"Gold walking out to the dump",al:AlignmentType.LEFT}],
  ]),

  H("3.  Assessment — what a 2 g/t scat grade means"),
  bullet("The scats are not a waste stream. At 2.0 g/t they run at 83% of ROM grade and carry 12.5% of the "
    + "gold in the circuit. Back-solving the deportment against 20% SLC dilution gives a waste:ore contrast "
    + "to scats of only 1.8× — against 8.9× at Sukari. Roughly one third of the scat stream is barren "
    + "dilution; that is the hard ceiling on mass rejection."),
  bullet("Every rejected tonne is expensive. At 0.43 g/t and US$4,000/oz the reject stream holds US$41/t of "
    + "recoverable gold against US$10.50/t of milling and handling cost avoided — a 3.9× ratio. The sorter "
    + "must be tuned for high ore recovery (≥95%), which caps mass pull at ~25% and forfeits roughly a third "
    + "of the theoretical prize.", {b:false}),
  bullet("The comminution problem is already being solved. The SSCP installs a secondary crusher and a "
    + "pebble crusher specifically to handle scats. Crushing recovers 100% of the contained gold; sorting "
    + "discards some of it. Sorting must beat crushing, not merely beat doing nothing."),
  bullet("Nothing here is a recovery gain. Scats recirculate — no gold is currently being lost. The value is "
    + "purely throughput debottlenecking, which is worth exactly nothing if the SAG is not the binding constraint."),

  H("4.  Economics — and the single factor that decides them"),
  table([34,22,22,22], [
    [{t:"Scenario (realistic XRT: 95% ore rec / 70% waste rej)",al:AlignmentType.LEFT},
     {t:"Extra oz/a"},{t:"Net US$/a"},{t:"NPV @10%"}],
    [{t:"Freed capacity fully refilled with 2.4 g/t ore",b:true},{t:"+2,699"},{t:"+7.58 M"},{t:"+33.6 M",b:true,fill:GREEN}],
    [{t:"Half refilled",b:true},{t:"+1,066"},{t:"+2.81 M"},{t:"+9.9 M",fill:GREEN}],
    [{t:"NPV breakeven",b:true},{t:"+388"},{t:"+0.82 M"},{t:"0  (29% capture)",b:true,fill:AMBER}],
    [{t:"No spare ore — ROM held flat",b:true},{t:"−567"},{t:"−1.96 M"},{t:"−13.9 M",b:true,fill:RED}],
    [{t:"Refilled with 1.2 g/t stockpile instead",b:true},{t:"+1,066"},{t:"+1.05 M"},{t:"+1.1 M",fill:AMBER}],
  ]),
  txt("Secondary sensitivities are mild by comparison: at US$2,500/oz the case still returns +US$13.4 M NPV, "
    + "and pushing the sorter to 90/90 adds only US$6 M. The scat grade itself is the dominant material lever — "
    + "at 0.8 g/t the same plant would be worth US$76 M. At 2.0 g/t, roughly 60% of the Sukari-style prize has "
    + "already been lost to the ore's own character.", { after: 40 }),

  table([26,17,19,19,19], [
    [{t:"If the scat grade were…",al:AlignmentType.LEFT},{t:"Contrast"},{t:"Reject g/t"},{t:"Mass pull"},{t:"NPV @10%"}],
    [{t:"0.8 g/t (Sukari-like)",b:true},{t:"7.5×"},{t:"0.10"},{t:"48%"},{t:"+76.4 M",fill:GREEN}],
    [{t:"1.2 g/t",b:true},{t:"4.4×"},{t:"0.18"},{t:"40%"},{t:"+63.2 M",fill:GREEN}],
    [{t:"1.6 g/t",b:true},{t:"2.9×"},{t:"0.28"},{t:"32%"},{t:"+49.0 M",fill:GREEN}],
    [{t:"2.0 g/t  —  Syama, as measured",b:true,fill:AMBER},{t:"1.8×",b:true,fill:AMBER},{t:"0.43",b:true,fill:AMBER},{t:"25%",b:true,fill:AMBER},{t:"+33.6 M",b:true,fill:AMBER}],
    [{t:"2.4 g/t (= ROM grade)",b:true},{t:"1.0×"},{t:"0.72"},{t:"17%"},{t:"+16.8 M",fill:RED}],
  ]),
  txt("Read down that table: the scat grade alone has already removed more than half the prize before a "
    + "single sorter is specified, and it does so by making the reject stream progressively more valuable. "
    + "Sorter performance is the weaker lever — running 90% rejection at 90% ore recovery instead of 70/95 "
    + "raises NPV only to US$39.6 M, and pushing harder (95/85) turns back down to US$37.7 M because the "
    + "gold lost outruns the extra mass rejected. There is no sorter setting that rescues a poor contrast.",
    { after: 40 }),

  H("5.  Why Gate 1 is the real risk"),
  txt("Public disclosure points away from comminution being the constraint. Sulphide stockpiles were drawn "
    + "down through 2025 to maintain throughput — a mill short of ore, not short of capacity. The SSCP is "
    + "adding 60% of sulphide capacity (2.4 → 4.0 Mtpa), and the declared debottlenecking target is the "
    + "roaster and its new ESP, not the mills. If flotation, the roaster or ore supply binds first, every "
    + "tonne of freed SAG capacity is worth zero and the case collapses to the −US$13.9 M row above. "
    + "This must be settled from the plant's own constraint data before anything else is spent.", { after: 40 }),

  H("6.  Risks and adjacent opportunity"),
  bullet("Refractory gold — reject grades must be confirmed by fire assay and diagnostic leach, not sensor "
    + "response. Gold is locked in sulphides and XRT sees density, not gold."),
  bullet("Sulphidic rejects — geochemical/ARD characterisation is required before a new reject stream is "
    + "sent to a waste dump; this can carry its own closure cost."),
  bullet("Mali country risk — supply chain and spares availability disrupted through 2026; a 10% discount "
    + "rate is applied and single-sorter redundancy is nil."),
  bullet("Larger prize elsewhere: SLC dilution rejection on ROM or coarse-crushed underground feed. Some "
    + "20% dilution across ~2.6 Mt/a offers far more heterogeneity than the scats do, and the same sample "
    + "campaign can test it at marginal extra cost. Recommend it be scoped into Gate 2.", {b:false}),

  H("7.  Next steps"),
  table([8,40,26,13,13], [
    [{t:"#",al:AlignmentType.LEFT},{t:"Action",al:AlignmentType.LEFT},{t:"Owner",al:AlignmentType.LEFT},{t:"Cost"},{t:"Duration"}],
    [{t:"1",al:AlignmentType.LEFT},{t:"Constraint audit of the converted line post-SSCP; confirm spare ore at reserve grade",al:AlignmentType.LEFT},{t:"Site metallurgy / planning",al:AlignmentType.LEFT},{t:"nil"},{t:"4 weeks"}],
    [{t:"2",al:AlignmentType.LEFT},{t:"Survey and assay the scat stream — tonnage, size distribution, grade by size, lithology split",al:AlignmentType.LEFT},{t:"Site metallurgy",al:AlignmentType.LEFT},{t:"<$20 k"},{t:"4 weeks"}],
    [{t:"3",al:AlignmentType.LEFT},{t:"Bulk XRT/sensor amenability test, 2–5 t, scats + coarse ROM",al:AlignmentType.LEFT},{t:"STEINERT test centre",al:AlignmentType.LEFT},{t:"$60–150 k"},{t:"3 months"}],
    [{t:"4",al:AlignmentType.LEFT},{t:"ARD / geochemical characterisation of the reject stream",al:AlignmentType.LEFT},{t:"Environmental",al:AlignmentType.LEFT},{t:"<$30 k"},{t:"2 months"}],
    [{t:"5",al:AlignmentType.LEFT},{t:"Re-run this model on measured sorter response; decide on capital",al:AlignmentType.LEFT},{t:"Study team",al:AlignmentType.LEFT},{t:"nil"},{t:"2 weeks"}],
  ]),

  txt("Model: Syama_Pebble_Sorting_Simulation.xlsx (Dashboard · MB Base · MB Sort · NPV · Sensitivity). "
    + "All costs in US$. Figures flagged \"Assumption – CONFIRM\" on the Dashboard are placeholders pending "
    + "site data: SAG line feed rate 200 t/h, SLC dilution 20%, scat load 30 t/h, milling cost US$8.00/t and "
    + "incremental mining cost US$53.00/t (derived from AISC, not from site costing).",
    { i:true, size:14, before: 100 }),
  ]}]
});

Packer.toBuffer(doc).then(b => { fs.writeFileSync("Syama_Ore_Sorting_Brief.docx", b);
  console.log("written"); });
