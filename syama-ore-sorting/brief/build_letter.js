const { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell,
        WidthType, ShadingType, BorderStyle } = require('docx');
const fs = require('fs');
const FONT = "Calibri", NAVY = "1F3864", STEEL = "2E5C8A", LIGHT = "DCE6F1",
      AMBER = "FFF2CC", GREEN = "E2EFDA", RED = "FCE4E4", GREY = "F2F2F2";

const T = (t,o={}) => new TextRun({ text:t, font:FONT, size:o.size||20, bold:o.b,
  italics:o.i, color:o.c||"000000" });
const P = (t,o={}) => new Paragraph({ children: Array.isArray(t)?t:[T(t,o)],
  spacing:{ before:o.before??0, after:o.after??110, line:o.line??250 },
  alignment:o.al, border:o.border });
const GAP = (h) => new Paragraph({ children:[T("")], spacing:{ before:0, after:h, line:120 } });

const W = 10080;
function table(cols, rows) {
  const total = cols.reduce((a,b)=>a+b,0);
  const sc = cols.map(c=>Math.round(c/total*W));
  sc[sc.length-1] += W - sc.reduce((a,b)=>a+b,0);
  return new Table({ columnWidths: sc, width:{ size:W, type:WidthType.DXA },
    borders:["top","bottom","left","right","insideHorizontal","insideVertical"]
      .reduce((o,k)=>{o[k]={style:BorderStyle.SINGLE,size:2,color:"AEBBD0"};return o;},{}),
    rows: rows.map((r,ri)=> new TableRow({ cantSplit:true, tableHeader:ri===0,
      children: r.map((cell,ci)=>{
        const h = ri===0, c = typeof cell==="object"?cell:{t:String(cell)};
        return new TableCell({ width:{ size:sc[ci], type:WidthType.DXA },
          shading:{ type:ShadingType.CLEAR, color:"auto",
                    fill: h?NAVY:(c.fill||(ri%2===0?GREY:"FFFFFF")) },
          margins:{ top:30, bottom:30, left:80, right:80 },
          children:[ new Paragraph({ children:[new TextRun({ text:c.t, font:FONT,
            size:c.size||17, bold:h||c.b, color:h?"FFFFFF":(c.c||"000000") })],
            spacing:{ before:0, after:0, line:220 },
            alignment: ci===0?AlignmentType.LEFT:AlignmentType.RIGHT })] });
      }) })) });
}

const doc = new Document({
  styles:{ default:{ document:{ run:{ font:FONT, size:20 } } } },
  sections:[{ properties:{ page:{ size:{ width:12240, height:15840 },
      margin:{ top:680, bottom:520, left:1080, right:1080 } } },
  children:[

  // sender block
  P([T("[Your Name]",{b:true,size:22})], {after:0, line:240}),
  P([T("[Title]",{size:18,c:"404040"})], {after:0, line:240}),
  P([T("[Company]  ·  [Address]  ·  [Email]  ·  [Phone]",{size:18,c:"404040"})],
    {after:120, line:240}),
  new Paragraph({ children:[T("")], spacing:{ before:0, after:150 },
    border:{ bottom:{ style:BorderStyle.SINGLE, size:8, color:NAVY } } }),

  P("5 August 2026", {after:150}),

  P([T("[Recipient Name]",{b:true})], {after:0, line:240}),
  P("[Title]", {after:0, line:240}),
  P("Société des Mines de Syama S.A. (SOMISY)", {after:0, line:240}),
  P("Syama Gold Mine, Sikasso Region, Mali", {after:170, line:240}),

  P([T("Dear [Recipient Name],")], {after:120}),

  P([T("Syama SAG pebble (scat) ore sorting — assessment and recommendation",{b:true})],
    {after:160}),

  P("Thank you for providing the scat assay data. We have completed the assessment you "
  + "requested, updating the pebble sorting business case for Syama and testing whether "
  + "STEINERT ore sorting is worth pursuing on your SAG scat stream. This letter sets out "
  + "the conclusion; the enclosed brief and model carry the detail."),

  P("The work builds on the pebble sorting simulation prepared for Sukari (ref. SR241558), "
  + "which rejects barren scat mass, reduces the circulating load and refills the freed SAG "
  + "capacity with ROM. That engine transfers to Syama unmodified. What does not transfer is "
  + "the material property that made Sukari work."),

  P([T("Your measured scat grade of 2.0 g/t Au is the pivotal number.",{b:true}),
     T(" Sukari's scats assayed 0.56 g/t against a 1.57 g/t ROM — barren material, discardable "
     + "almost for free. Syama's run at 83% of ROM grade. Back-solving the deportment against "
     + "20% sublevel-cave dilution gives a waste-to-ore contrast of only 1.8×, against 8.9× at "
     + "Sukari, so roughly one third of the scat stream is barren dilution. That is a hard "
     + "ceiling on what any sorter can reject, and no sorter setting overcomes it.")]),

  P("The case is therefore throughput debottlenecking, not gold recovery — your scats already "
  + "recirculate, so no gold is being lost today, and the Sulphide Conversion Project is "
  + "installing a pebble crusher for this very stream. The economics hinge on one question:"),

  table([46,27,27], [
    [{t:"Scenario (95% ore recovery / 70% waste rejection)",al:AlignmentType.LEFT},
     {t:"Net US$/a"},{t:"NPV @10%"}],
    [{t:"Freed SAG capacity fully refilled with 2.4 g/t ore",b:true},{t:"+7.58 M"},
     {t:"+33.6 M",b:true,fill:GREEN}],
    [{t:"Breakeven",b:true},{t:"+0.82 M"},{t:"0  (29% capture)",b:true,fill:AMBER}],
    [{t:"No spare ore — ROM feed held flat",b:true},{t:"−1.96 M"},{t:"−13.9 M",b:true,fill:RED}],
  ]),

  GAP(60),

  P([T("Our recommendation is a conditional go: fund the test work, not the plant.",{b:true}),
     T(" On US$4.1 M of capital the upside is genuine — a 6.5-month payback — but it rests "
     + "entirely on freed capacity being refilled, and the published record points the other "
     + "way. Two gates should close first: a constraint audit confirming that comminution "
     + "rather than the roaster or ore supply binds the converted line, and a bulk sensor test "
     + "on 2–5 t of scats, since a 1.8× mass contrast is not evidence of a detectable sensor "
     + "contrast. We would also scope dilution rejection on coarse ROM into that campaign, "
     + "where the heterogeneity is considerably better.")]),

  P("Absent site data, several model inputs remain placeholders — flagged on the Dashboard — "
  + "and the dilution assumption in particular drives the result. I would welcome the chance "
  + "to refine these with your metallurgical team and to walk through the model."),

  P("Yours sincerely,", {before:30, after:190}),
  P([T("[Your Name]",{b:true})], {after:0, line:240}),
  P([T("[Title]",{size:18,c:"404040"})], {after:150, line:240}),

  new Paragraph({ children:[T("")], spacing:{ before:0, after:80 },
    border:{ bottom:{ style:BorderStyle.SINGLE, size:4, color:"AEBBD0" } } }),
  P([T("Enclosures:  ",{b:true,size:17}),
     T("two-page decision brief;  Syama_Pebble_Sorting_Simulation.xlsx",{size:17})], {after:0}),
  ]}]
});

Packer.toBuffer(doc).then(b=>{ fs.writeFileSync("Syama_Ore_Sorting_Letter.docx", b);
  console.log("written"); });
