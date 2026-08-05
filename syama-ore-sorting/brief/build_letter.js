// Syama SAG pebble (scat) ore sorting — covering letter
// Built on the CMD Consulting DOCX Style Kit.
const fs = require("fs");
const CMD = require("./styles/cmd_docx_styles_final");
const { AlignmentType, Paragraph, TextRun, Table, TableRow, WidthType, BorderStyle,
        Header, ImageRun, TabStopType, TabStopPosition } = CMD;
// letter runs a little tighter than the report template
CMD.documentStyles.default.document.paragraph.spacing.line = 258;
CMD.documentStyles.paragraphStyles.forEach(st => {
  if (st.id === "Heading2") st.paragraph.spacing = { before: 130, after: 100 };
});

CMD.loadLogo(__dirname + "/styles/cmd_logo.jpg");

const C = CMD.COLORS, F = CMD.FONTS, S = CMD.SIZES;

const headerRightAligned = () => new Header({
  children: [new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.PRIMARY, space: 4 } },
    spacing: { after: CMD.SPACING.HEADER_AFTER },
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    children: [
      new ImageRun({ data: fs.readFileSync(__dirname + "/styles/cmd_logo.jpg"),
        transformation: { width: 70, height: 36 }, type: "jpg" }),
      new TextRun({ text: "\tCMD Consulting Pty Ltd", font: F.HEADING,
        size: S.HEADER, bold: true, color: C.PRIMARY }),
    ],
  })],
});
const RED_TINT = "F7E4E4";                 // single semantic accent for the downside case
const W = 9360;                            // US Letter less 1" margins each side

// letter-specific helpers ---------------------------------------------------
const line = (t, o = {}) => new Paragraph({
  keepNext: o.keep, keepLines: true,
  spacing: { before: o.before || 0, after: o.after ?? 0, line: 260 },
  children: [new TextRun({ text: t, font: F.BODY, size: o.size || S.BODY,
    bold: o.b, italics: o.i, color: o.c || C.DARK })] });

const subject = (t) => new Paragraph({
  spacing: { before: 240, after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.SECONDARY, space: 6 } },
  children: [new TextRun({ text: t, font: F.HEADING, size: S.H1, bold: true, color: C.PRIMARY })] });

const table = (headers, widths, rows) => new Table({
  width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
  columnWidths: widths,
  rows: [ new TableRow({ tableHeader: true,
            children: widths.map((w, i) => CMD.hCell(headers[i], w)) }),
    ...rows.map((r, ri) => new TableRow({ cantSplit: true,
      children: r.map((cell, ci) => {
        const c = typeof cell === "object" ? cell : { t: String(cell) };
        return CMD.dCell(c.t, widths[ci], {
          fill: c.fill || (ri % 2 === 1 ? C.LIGHT_GREY : undefined),
          bold: c.b || ci === 0,
          align: ci === 0 ? AlignmentType.LEFT : AlignmentType.RIGHT });
      }) })) ] });

// ---------------------------------------------------------------------------
const doc = new CMD.Document({
  styles: CMD.documentStyles,
  numbering: CMD.numbering,
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 },
                    margin: { top: 1440, right: 1440, bottom: 900, left: 1440 } } },
    headers: { default: headerRightAligned() },
    footers: { default: CMD.buildFooter() },
    children: [

      line("5 August 2026", { after: 240, c: C.SLATE }),

      line("Daniel Millar", { b: true }),
      line("[Title]", { c: C.SLATE }),
      line("Société des Mines de Syama S.A. (SOMISY)"),
      line("Syama Gold Mine, Sikasso Region, Mali", { after: 240 }),

      line("Dear Daniel,", { after: 0 }),

      subject("Syama SAG pebble (scat) ore sorting — assessment and recommendation"),

      CMD.p("Thank you for providing the scat assay data. We have completed the assessment "
      + "you requested: updating the pebble sorting business case for Syama and testing "
      + "whether STEINERT ore sorting is worth pursuing on your SAG scat stream. The "
      + "opportunity is real but conditional, and the next spend should be on test work "
      + "rather than on plant."),

      CMD.p("The work builds on the Sukari pebble sorting simulation (ref. SR241558), which "
      + "rejects barren scat mass, reduces the circulating load and refills the freed SAG "
      + "capacity with ROM. We re-parameterised it for the converted (ex-oxide) SAG line as "
      + "it will run after the Sulphide Conversion Project, calibrating to your measured "
      + "scat stream. The engine transfers unmodified; the material property that made the "
      + "Sukari case work does not."),

      CMD.h2("Principal finding"),

      CMD.pRuns([
        CMD.bold("Your measured scat grade of 2.0 g/t Au is the pivotal number. "),
        CMD.text("Sukari's scats assayed 0.56 g/t against a 1.57 g/t ROM — barren material, "
        + "discardable almost for free. Syama's run at 83% of ROM grade. Back-solving the "
        + "deportment against 20% sublevel-cave dilution gives a waste-to-ore contrast of "
        + "only 1.8×, against 8.9× at Sukari, so roughly one third of the scat stream is "
        + "barren dilution — a hard ceiling on what any sorter can reject."),
      ]),

      CMD.caption("Table 1: Syama scat stream compared with the Sukari base case"),
      table(["Parameter", "Sukari", "Syama"], [4560, 2400, 2400], [
        ["ROM / scat grade (g/t Au)", "1.57 / 0.56", { t: "2.40 / 2.00", b: true, fill: C.BLUE_TINT }],
        ["Scat grade as % of ROM", "35%", { t: "83%", b: true, fill: C.BLUE_TINT }],
        ["Heterogeneity contrast", "8.9×", { t: "1.8×", b: true, fill: C.BLUE_TINT }],
        ["Barren mass available in scats", "~69%", { t: "~33%", b: true, fill: C.BLUE_TINT }],
        ["Reject grade achieved (g/t Au)", "0.148", { t: "0.429", b: true, fill: C.BLUE_TINT }],
      ]),

      CMD.p("Every rejected tonne is therefore expensive. At 0.43 g/t and US$4,000/oz the "
      + "reject stream holds some US$41 per tonne of recoverable gold against roughly US$10 "
      + "per tonne of cost avoided, so the sorter must be tuned conservatively for high ore "
      + "recovery — capping mass pull at about 25%.", { after: 160 }),

      CMD.h2("Economics"),

      CMD.p("Your scats already recirculate, and the Sulphide Conversion Project is "
      + "installing a pebble crusher for this stream, so no gold is being lost today. The "
      + "case is throughput debottlenecking, not recovery, and turns on whether the freed "
      + "SAG capacity can be refilled with ore."),

      CMD.caption("Table 2: Outcomes at 95% ore recovery / 70% waste rejection, US$4.1 M capital"),
      table(["Scenario", "Net US$/a", "NPV @ 10%"], [4560, 2400, 2400], [
        ["Freed capacity refilled at 2.4 g/t", "+7.58 M",
         { t: "+33.6 M", b: true, fill: C.GREEN_TINT }],
        ["Breakeven (29% capture)", "+0.82 M",
         { t: "0", b: true, fill: C.LIGHT_GREY }],
        ["No spare ore — ROM feed held flat", "−1.96 M",
         { t: "−13.9 M", b: true, fill: RED_TINT }],
      ]),

      CMD.p("The upside is genuine, with a payback near six and a half months, but the "
      + "downside is equally real: a plant that cannot fill the capacity it frees destroys "
      + "value and permanently sends gold to the dump. Price is not the swing factor — at "
      + "US$2,500/oz the favourable case still returns some US$13 M.", { after: 150 }),

      CMD.h2("Recommendation"),

      CMD.pRuns([
        CMD.bold("We recommend a conditional go: fund the test work, not the plant. "),
        CMD.text("Two gates should close before any capital is committed."),
      ], { after: 140 }),

      CMD.numberedBold("Constraint audit — ",
        "confirm that comminution, rather than the roaster or ore supply, binds the "
        + "converted line, and that ore exists at reserve grade to fill it. The published "
        + "record points the other way, with sulphide stockpiles drawn down through 2025 to "
        + "maintain throughput. No cost, about four weeks."),
      CMD.numberedBold("Bulk sensor test — ",
        "2 to 5 tonnes of scats through an XRT rig. A 1.8× mass contrast is not evidence "
        + "of a detectable sensor contrast, and Syama's gold is refractory, so reject grades "
        + "need fire assay. Roughly US$60,000 to US$150,000, about three months.",
        { after: 150 }),

      CMD.h2("Related considerations"),

      CMD.bullet("We would scope dilution rejection on coarse ROM into the same campaign; "
      + "20% dilution across some 2.6 Mt/a of underground feed offers far more "
      + "heterogeneity than the scats do."),
      CMD.bullet("A sulphidic reject stream will need acid rock drainage characterisation "
      + "before it can be dumped, carrying its own closure cost.", { after: 150 }),

      CMD.p("Absent site data, several model inputs remain placeholders, flagged on the "
      + "enclosed model's Dashboard; dilution in particular drives the result. We would "
      + "welcome the chance to refine these with your team.", { after: 180 }),

      line("Yours sincerely,", { after: 150, keep: true }),
      line("[Name]", { b: true, keep: true }),
      line("[Title]", { c: C.SLATE, keep: true }),
      line("CMD Consulting Pty Ltd", { c: C.SLATE, after: 150, keep: true }),

      new Paragraph({ spacing: { before: 0, after: 0 }, keepLines: true,
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.BORDER, space: 8 } },
        children: [
          new TextRun({ text: "Enclosures:  ", font: F.BODY, size: S.CAPTION, bold: true, color: C.SLATE }),
          new TextRun({ text: "decision brief;  Syama_Pebble_Sorting_Simulation.xlsx",
            font: F.BODY, size: S.CAPTION, color: C.SLATE })] }),
    ],
  }],
});

CMD.Packer.toBuffer(doc).then(b => {
  fs.writeFileSync(__dirname + "/Syama_Ore_Sorting_Letter.docx", b);
  console.log("written");
});
