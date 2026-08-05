// ============================================================
// CMD Consulting Pty Ltd — DOCX Style Kit
// ============================================================
// Reusable module for docx-js (npm install -g docx).
// Captures all finalised colours, fonts, typesetting, table
// helpers, header/footer builders, and title page builder.
//
// USAGE — paste this file alongside your report script, then:
//
//   const CMD = require("./cmd_docx_styles_final");
//
//   // 1. Load the logo (JPEG, RGB — no RGBA/PNG transparency)
//   CMD.loadLogo("/path/to/cmd_logo.jpg");
//
//   // 2. Build a document
//   const doc = new Document({
//     styles:    CMD.documentStyles,
//     numbering: CMD.numbering,
//     sections: [{
//       properties: CMD.pageProperties,
//       headers:    { default: CMD.buildHeader() },
//       footers:    { default: CMD.buildFooter() },
//       children: [
//         ...CMD.buildTitlePage("REPORT TITLE", "Subtitle Line"),
//         new PageBreak(),
//         // ... your content using CMD.h(), CMD.p(), CMD.bold(),
//         //     CMD.hCell(), CMD.dCell(), etc.
//       ]
//     }]
//   });
//
// IMPORTANT — LOGO FORMAT:
//   • Use JPEG (.jpg) with RGB colour mode (no alpha channel).
//   • RGBA PNG causes Word to strip images as "unreadable".
//   • The type:"jpg" flag is set automatically by the helpers.
//   • Recommended source size: 300×153 px (≈2:1 aspect ratio).
//
// IMPORTANT — HEADING SIZES:
//   • H1 and H2 are both set to 14pt, differentiated by colour
//     (H1 = CMD Blue, H2 = Charcoal) and spacing.
//   • H3 is 12pt CMD Blue.
//   • This ensures long section titles fit on a single line in
//     both Word and PDF export.
// ============================================================

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak, TabStopType, TabStopPosition,
  ImageRun
} = require("docx");

// ── COLOUR PALETTE ───────────────────────────────────────────
// Extracted from the CMD Consulting globe logo.
// All values are hex WITHOUT '#' (docx-js convention).
const COLORS = {
  PRIMARY:    "4E57A6",  // CMD Blue  — headings, header bar, table headers
  SECONDARY:  "60BB46",  // CMD Green — accent lines, highlights, call-outs
  DARK:       "231F20",  // Charcoal  — body text, H2 headings, dark fills
  WHITE:      "FFFFFF",  // White     — reversed text, backgrounds
  LIGHT_GREY: "F2F2F2",  // Light Grey — alternate table rows, subtle fills
  BLUE_TINT:  "E8E9F3",  // Blue Tint  — light section fills
  GREEN_TINT: "EAF6E6",  // Green Tint — success badges, light highlights
  SLATE:      "6B6B6B",  // Slate      — captions, subtitles, muted text
  BORDER:     "CCCCCC",  // Border     — table borders, divider lines
};

// ── FONT FAMILIES ────────────────────────────────────────────
const FONTS = {
  HEADING: "Trebuchet MS",  // All headings, company name
  BODY:    "Calibri",       // Body text, tables, captions, footers
  MONO:    "Consolas",      // Code snippets, data values
};

// ── FONT SIZES (in half-points, docx-js convention) ──────────
// Multiply pt × 2 to get half-points.
const SIZES = {
  TITLE_PAGE_MAIN:  44,  // 22pt — main title on cover page
  TITLE_PAGE_SUB:   32,  // 16pt — subtitle on cover page
  TITLE_PAGE_BODY:  24,  // 12pt — details on cover page (date, client)
  TITLE_PAGE_COMPANY: 32, // 16pt — "CMD Consulting Pty Ltd" on cover
  H1:               28,  // 14pt — Section headings
  H2:               28,  // 14pt — Sub-section headings
  H3:               24,  // 12pt — Sub-sub-section headings
  BODY:             22,  // 11pt — Body paragraphs
  TABLE_HEADER:     22,  // 11pt — Table header cells (bold, white on blue)
  TABLE_BODY:       20,  // 10pt — Table body cells
  CAPTION:          20,  // 10pt — Table captions, figure labels
  HEADER:           18,  //  9pt — Page header text
  FOOTER:           16,  //  8pt — Page footer text
};

// ── SPACING ──────────────────────────────────────────────────
// Values in twips (twentieths of a point) unless noted.
const SPACING = {
  PAGE_MARGIN:        1440,   // 1 inch (all sides)
  BODY_AFTER:         120,    // 6pt after body paragraphs
  BODY_LINE:          276,    // 1.15× line spacing
  H1_BEFORE:          200,
  H1_AFTER:           180,
  H2_BEFORE:          160,
  H2_AFTER:           140,
  H3_BEFORE:          100,
  H3_AFTER:           100,
  HEADER_AFTER:       200,    // Below header rule
  TABLE_CELL_TOP:     60,
  TABLE_CELL_BOTTOM:  60,
  TABLE_CELL_LEFT:    100,
  TABLE_CELL_RIGHT:   100,
  BULLET_AFTER:       80,     // Between bullet items
  NUMBERED_AFTER:     100,    // Between numbered items
};

// ── PAGE DIMENSIONS (US Letter) ──────────────────────────────
const pageProperties = {
  page: {
    size:   { width: 12240, height: 15840 },
    margin: { top: SPACING.PAGE_MARGIN, right: SPACING.PAGE_MARGIN,
              bottom: SPACING.PAGE_MARGIN, left: SPACING.PAGE_MARGIN },
  },
};

// ── DOCUMENT STYLES ──────────────────────────────────────────
// Pass directly to: new Document({ styles: documentStyles })
const documentStyles = {
  default: {
    document: {
      run:       { font: FONTS.BODY, size: SIZES.BODY, color: COLORS.DARK },
      paragraph: { spacing: { after: SPACING.BODY_AFTER, line: SPACING.BODY_LINE } },
    },
  },
  paragraphStyles: [
    {
      id: "Heading1", name: "Heading 1",
      basedOn: "Normal", next: "Normal", quickFormat: true,
      run:       { font: FONTS.HEADING, size: SIZES.H1, bold: true, color: COLORS.PRIMARY },
      paragraph: { spacing: { before: SPACING.H1_BEFORE, after: SPACING.H1_AFTER }, outlineLevel: 0 },
    },
    {
      id: "Heading2", name: "Heading 2",
      basedOn: "Normal", next: "Normal", quickFormat: true,
      run:       { font: FONTS.HEADING, size: SIZES.H2, bold: true, color: COLORS.DARK },
      paragraph: { spacing: { before: SPACING.H2_BEFORE, after: SPACING.H2_AFTER }, outlineLevel: 1 },
    },
    {
      id: "Heading3", name: "Heading 3",
      basedOn: "Normal", next: "Normal", quickFormat: true,
      run:       { font: FONTS.HEADING, size: SIZES.H3, bold: true, color: COLORS.PRIMARY },
      paragraph: { spacing: { before: SPACING.H3_BEFORE, after: SPACING.H3_AFTER }, outlineLevel: 2 },
    },
  ],
};

// ── NUMBERING (bullets & numbered lists) ─────────────────────
const numbering = {
  config: [
    {
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "\u2022",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
      }],
    },
    {
      reference: "numbers",
      levels: [{
        level: 0, format: LevelFormat.DECIMAL, text: "%1.",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
      }],
    },
  ],
};

// ── LOGO STORAGE ─────────────────────────────────────────────
let _logoData = null;

/**
 * Load the CMD logo from disk. Call once before building headers
 * or title pages. Must be JPEG RGB (not RGBA PNG).
 * @param {string} path - Absolute path to cmd_logo.jpg
 */
function loadLogo(path) {
  const fs = require("fs");
  _logoData = fs.readFileSync(path);
}

function _requireLogo() {
  if (!_logoData) throw new Error("Call CMD.loadLogo('/path/to/cmd_logo.jpg') before building headers or title pages.");
  return _logoData;
}

// ── HEADER BUILDER ───────────────────────────────────────────
/**
 * Returns a Header with the CMD logo + company name + blue underline.
 * Logo dimensions: 70×36 px (maintains 2:1 aspect ratio).
 */
function buildHeader() {
  return new Header({
    children: [new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.PRIMARY, space: 4 } },
      spacing: { after: SPACING.HEADER_AFTER },
      children: [
        new ImageRun({ data: _requireLogo(), transformation: { width: 70, height: 36 }, type: "jpg" }),
        new TextRun({ text: "  CMD Consulting Pty Ltd", font: FONTS.HEADING, size: SIZES.HEADER, bold: true, color: COLORS.PRIMARY }),
      ],
    })],
  });
}

// ── FOOTER BUILDER ───────────────────────────────────────────
/**
 * Returns a Footer with "CMD Consulting Pty Ltd | Confidential"
 * left-aligned and page number right-aligned.
 */
function buildFooter() {
  return new Footer({
    children: [new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: COLORS.BORDER, space: 4 } },
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      children: [
        new TextRun({ text: "CMD Consulting Pty Ltd  |  Confidential", font: FONTS.BODY, size: SIZES.FOOTER, color: COLORS.SLATE }),
        new TextRun({ text: "\tPage ", font: FONTS.BODY, size: SIZES.FOOTER, color: COLORS.SLATE }),
        new TextRun({ children: [PageNumber.CURRENT], font: FONTS.BODY, size: SIZES.FOOTER, color: COLORS.SLATE }),
      ],
    })],
  });
}

// ── TITLE PAGE BUILDER ───────────────────────────────────────
/**
 * Returns an array of Paragraphs that form a branded title page.
 * Includes: logo, company name, main title, subtitle, green
 * accent rule, and optional detail lines (client, date, etc.).
 *
 * @param {string}   title    - Main report title (uppercase recommended)
 * @param {string}   subtitle - Line below title
 * @param {string[]} [details] - Additional lines (e.g. ["Prepared for Client", "February 2026"])
 * @returns {Paragraph[]}
 */
function buildTitlePage(title, subtitle, details = []) {
  const paras = [
    // Logo
    new Paragraph({ spacing: { before: 2400 }, alignment: AlignmentType.CENTER, children: [
      new ImageRun({ data: _requireLogo(), transformation: { width: 220, height: 112 }, type: "jpg" }),
    ]}),
    // Company name
    new Paragraph({ spacing: { before: 400, after: 100 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: "CMD Consulting Pty Ltd", font: FONTS.HEADING, size: SIZES.TITLE_PAGE_COMPANY, color: COLORS.SLATE }),
    ]}),
    // Main title
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 300, after: 200 }, children: [
      new TextRun({ text: title, font: FONTS.HEADING, size: SIZES.TITLE_PAGE_MAIN, bold: true, color: COLORS.PRIMARY }),
    ]}),
    // Subtitle
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 500 }, children: [
      new TextRun({ text: subtitle, font: FONTS.HEADING, size: SIZES.TITLE_PAGE_SUB, color: COLORS.DARK }),
    ]}),
    // Green accent line
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 8, color: COLORS.SECONDARY, space: 12 } },
      spacing: { before: 100, after: 100 },
      children: details.length > 0
        ? [new TextRun({ text: details[0], font: FONTS.BODY, size: SIZES.TITLE_PAGE_BODY, color: COLORS.DARK })]
        : [],
    }),
  ];

  // Additional detail lines
  for (let i = 1; i < details.length; i++) {
    paras.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [
      new TextRun({ text: details[i], font: FONTS.BODY, size: SIZES.TITLE_PAGE_BODY, color: i === details.length - 1 ? COLORS.SLATE : COLORS.DARK }),
    ]}));
  }

  return paras;
}

// ── TABLE HELPERS ────────────────────────────────────────────
const TABLE_BORDER  = { style: BorderStyle.SINGLE, size: 1, color: COLORS.BORDER };
const TABLE_BORDERS = { top: TABLE_BORDER, bottom: TABLE_BORDER, left: TABLE_BORDER, right: TABLE_BORDER };
const CELL_MARGINS  = { top: SPACING.TABLE_CELL_TOP, bottom: SPACING.TABLE_CELL_BOTTOM,
                        left: SPACING.TABLE_CELL_LEFT, right: SPACING.TABLE_CELL_RIGHT };

/**
 * Table header cell — CMD Blue background, white bold text, centred.
 * @param {string} text
 * @param {number} width - Column width in DXA (twips)
 */
function hCell(text, width) {
  return new TableCell({
    borders: TABLE_BORDERS, width: { size: width, type: WidthType.DXA },
    shading: { fill: COLORS.PRIMARY, type: ShadingType.CLEAR },
    margins: CELL_MARGINS,
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
      new TextRun({ text, bold: true, font: FONTS.BODY, size: SIZES.TABLE_HEADER, color: COLORS.WHITE }),
    ]})],
  });
}

/**
 * Table body cell with optional styling.
 * @param {string} text
 * @param {number} width     - Column width in DXA
 * @param {object} [opts]
 * @param {string} [opts.fill]  - Background hex (use COLORS.LIGHT_GREY for alt rows)
 * @param {boolean} [opts.bold] - Bold text
 * @param {AlignmentType} [opts.align] - AlignmentType (default CENTER)
 */
function dCell(text, width, opts = {}) {
  const shading = opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined;
  return new TableCell({
    borders: TABLE_BORDERS, width: { size: width, type: WidthType.DXA },
    shading, margins: CELL_MARGINS,
    children: [new Paragraph({ alignment: opts.align || AlignmentType.CENTER, children: [
      new TextRun({ text, font: FONTS.BODY, size: SIZES.TABLE_BODY, color: COLORS.DARK, bold: opts.bold || false }),
    ]})],
  });
}

/**
 * Build a full branded table from header labels, column widths, and row data.
 * Automatically applies alternating row shading and bold first column.
 *
 * @param {string[]}   headers   - Column header labels
 * @param {number[]}   colWidths - Column widths in DXA
 * @param {string[][]} rows      - 2D array of cell text
 * @param {object}     [opts]
 * @param {boolean}    [opts.boldFirstCol=true]  - Bold text in first column
 * @param {AlignmentType} [opts.firstColAlign=LEFT] - Alignment for first column
 * @param {AlignmentType} [opts.dataAlign=CENTER]   - Alignment for data columns
 * @returns {Table}
 */
function buildTable(headers, colWidths, rows, opts = {}) {
  const boldFirst = opts.boldFirstCol !== false;
  const firstAlign = opts.firstColAlign || AlignmentType.LEFT;
  const dataAlign  = opts.dataAlign || AlignmentType.CENTER;
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);

  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({ children: colWidths.map((w, i) => hCell(headers[i], w)) }),
      ...rows.map((row, idx) => new TableRow({
        children: row.map((cell, ci) => dCell(cell, colWidths[ci], {
          fill: idx % 2 === 1 ? COLORS.LIGHT_GREY : undefined,
          bold: ci === 0 && boldFirst,
          align: ci === 0 ? firstAlign : dataAlign,
        })),
      })),
    ],
  });
}

// ── TEXT HELPERS ──────────────────────────────────────────────
// Shorthand functions for common paragraph types.

/** Heading 1 paragraph */
function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] });
}

/** Heading 2 paragraph */
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] });
}

/** Heading 3 paragraph */
function h3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(text)] });
}

/** Body paragraph (plain text) */
function p(text, opts = {}) {
  return new Paragraph({ spacing: { after: opts.after || 160 }, children: [
    new TextRun({ text, font: FONTS.BODY, size: SIZES.BODY, color: COLORS.DARK }),
  ]});
}

/** Body paragraph with mixed runs (pass array of TextRun objects) */
function pRuns(runs, opts = {}) {
  return new Paragraph({ spacing: { after: opts.after || 160 }, children: runs });
}

/** Bold TextRun */
function bold(text) {
  return new TextRun({ text, font: FONTS.BODY, size: SIZES.BODY, color: COLORS.DARK, bold: true });
}

/** Normal TextRun */
function text(str) {
  return new TextRun({ text: str, font: FONTS.BODY, size: SIZES.BODY, color: COLORS.DARK });
}

/** Bullet point paragraph */
function bullet(str, opts = {}) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: opts.after || SPACING.BULLET_AFTER },
    children: [new TextRun({ text: str, font: FONTS.BODY, size: SIZES.BODY, color: COLORS.DARK })],
  });
}

/** Numbered list paragraph */
function numbered(str, opts = {}) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { after: opts.after || SPACING.NUMBERED_AFTER },
    children: [new TextRun({ text: str, font: FONTS.BODY, size: SIZES.BODY, color: COLORS.DARK })],
  });
}

/** Numbered list paragraph with bold label + normal body */
function numberedBold(label, body, opts = {}) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { after: opts.after || SPACING.NUMBERED_AFTER },
    children: [bold(label), text(body)],
  });
}

/** Table caption (italic, slate, smaller) */
function caption(str) {
  return new Paragraph({ spacing: { before: 120, after: 80 }, children: [
    new TextRun({ text: str, font: FONTS.BODY, size: SIZES.CAPTION, bold: true, italics: true, color: COLORS.SLATE }),
  ]});
}

/** Page break paragraph */
function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// ── EXPORT ───────────────────────────────────────────────────
module.exports = {
  // Constants
  COLORS,
  FONTS,
  SIZES,
  SPACING,

  // Document config objects (pass directly to new Document / section)
  documentStyles,
  numbering,
  pageProperties,

  // Table constants
  TABLE_BORDER,
  TABLE_BORDERS,
  CELL_MARGINS,

  // Builders (call these to get docx-js objects)
  loadLogo,
  buildHeader,
  buildFooter,
  buildTitlePage,
  buildTable,

  // Cell helpers
  hCell,
  dCell,

  // Text helpers
  h1, h2, h3,
  p, pRuns,
  bold, text,
  bullet, numbered, numberedBold,
  caption,
  pageBreak,

  // Re-export docx-js essentials so report scripts don't need to import them
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, ImageRun, LevelFormat,
  TabStopType, TabStopPosition,
};
