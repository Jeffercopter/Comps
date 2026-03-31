import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side, numbers
from openpyxl.utils import get_column_letter

wb = openpyxl.Workbook()
ws = wb.active
ws.title = "EV-EBITDA Comps"

# Styles
header_font = Font(bold=True, color="FFFFFF", size=11)
header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
header_align = Alignment(horizontal="center", vertical="center", wrap_text=True)
data_align = Alignment(horizontal="center", vertical="center")
left_align = Alignment(horizontal="left", vertical="center", wrap_text=True)
currency_fmt = '#,##0.0'
multiple_fmt = '0.0x'
pct_fmt = '0%'
thin_border = Border(
    left=Side(style='thin'),
    right=Side(style='thin'),
    top=Side(style='thin'),
    bottom=Side(style='thin')
)

# Headers
headers = [
    "Target",
    "Acquirer",
    "Percentage Acquired (%)",
    "Country",
    "Completion Date",
    "EBITDA (A$m)",
    "Enterprise Value (A$m)",
    "EV/EBITDA Multiple",
    "Source"
]

for col, header in enumerate(headers, 1):
    cell = ws.cell(row=1, column=col, value=header)
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = header_align
    cell.border = thin_border

# Transaction data - only using officially disclosed/sourced figures
transactions = [
    {
        "target": "SG Fleet Group Limited",
        "acquirer": "Pacific Equity Partners Pty Limited",
        "pct": 1.0,
        "country": "Australia",
        "date": "Apr-25",
        "ebitda": 171.0,
        "ev": 1400.0,
        "multiple": "=G2/F2",
        "source": "https://investors.sgfleet.com/DownloadFile.axd?file=/Report/ComNews/20241204/02890088.pdf"
    },
    {
        "target": "Benchmark Scaffolding Ltd.",
        "acquirer": "Acrow Limited",
        "pct": 1.0,
        "country": "United Kingdom",
        "date": "Mar-24",
        "ebitda": 2.4,
        "ev": 9.0,
        "multiple": "=G3/F3",
        "source": "https://www.listcorp.com/asx/acf/acrow-limited/news/acquisition-of-benchmark-scaffolding-3001857.html"
    },
    {
        "target": "Pit N Portal Mining Services Pty Ltd",
        "acquirer": "Macmahon Holdings Limited",
        "pct": 1.0,
        "country": "Australia",
        "date": "Feb-24",
        "ebitda": "Not Disclosed",
        "ev": 10.0,
        "multiple": "Not Disclosed",
        "source": "https://im-mining.com/2023/12/19/macmahon-acquires-key-mining-contracts-from-emecos-pit-n-portal/"
    },
    {
        "target": "MI Scaffold Pty Ltd",
        "acquirer": "Acrow Formwork and Construction Services Limited (nka: Acrow Limited)",
        "pct": 1.0,
        "country": "Australia",
        "date": "Nov-23",
        "ebitda": 6.6,
        "ev": 36.4,
        "multiple": "=G5/F5",
        "source": "https://www.kapitales.com.au/news/latest/acrow-acquires-mi-scaffold-to-enhance-industrial-services",
        "note_ebitda": "Implied from stated 4.0x on upfront consideration of $26.4m"
    },
    {
        "target": "STA Traffic Management Pty Ltd",
        "acquirer": "AVADA Group Limited",
        "pct": 1.0,
        "country": "Australia",
        "date": "Oct-23",
        "ebitda": "Not Disclosed",
        "ev": 8.5,
        "multiple": "Not Disclosed",
        "source": "https://www.marketscreener.com/quote/stock/AVADA-GROUP-LIMITED-129389843/news/AVADA-Group-Limited-entered-in-a-binding-agreement-to-acquire-Sta-Traffic-Management-Pty-Ltd-fir-AUD-44687162/"
    },
    {
        "target": "Business and assets of Construct Traffic Pty Ltd",
        "acquirer": "AVADA Group Limited",
        "pct": 1.0,
        "country": "Australia",
        "date": "Aug-22",
        "ebitda": 5.0,
        "ev": 23.5,
        "multiple": "=G7/F7",
        "source": "https://newsnreleases.com/2022/08/26/avada-group-has-acquired-business-and-assets-of-construct-traffic/"
    },
    {
        "target": "Karratha Machinery Hire",
        "acquirer": "SSH Group Limited",
        "pct": 1.0,
        "country": "Australia",
        "date": "May-22",
        "ebitda": 3.8,
        "ev": 15.0,
        "multiple": "=G8/F8",
        "source": "https://stockhead.com.au/resources/ssh-groups-latest-acquisition-to-boost-earnings-add-third-revenue-arm/"
    },
    {
        "target": "Pit N Portal Mining Services Pty Ltd / Pit N Portal Equipment Hire Pty Ltd",
        "acquirer": "Emeco Holdings Limited",
        "pct": 1.0,
        "country": "Australia",
        "date": "Feb-20",
        "ebitda": 20.0,
        "ev": 72.0,
        "multiple": "=G9/F9",
        "source": "https://im-mining.com/2020/01/29/emeco-go-underground-pit-n-portal-acquisition/"
    },
    {
        "target": "Uni-Span Australia Pty Limited",
        "acquirer": "Acrow Formwork and Construction Services Limited (nka: Acrow Limited)",
        "pct": 1.0,
        "country": "Australia",
        "date": "Oct-19",
        "ebitda": 4.83,
        "ev": 21.25,
        "multiple": "=G10/F10",
        "source": "https://www.insideconstruction.com.au/section/industry-news/acrow-formwork-and-construction-makes-21-25m-buyout/"
    },
    {
        "target": "Matilda Equipment Holdings Pty Ltd",
        "acquirer": "Emeco Holdings Limited",
        "pct": 1.0,
        "country": "Australia",
        "date": "Jul-18",
        "ebitda": 24.2,
        "ev": 80.0,
        "multiple": "=G11/F11",
        "source": "https://im-mining.com/2018/05/01/44159/"
    },
]

for i, txn in enumerate(transactions):
    row = i + 2
    ws.cell(row=row, column=1, value=txn["target"]).alignment = left_align
    ws.cell(row=row, column=2, value=txn["acquirer"]).alignment = left_align
    
    pct_cell = ws.cell(row=row, column=3, value=txn["pct"])
    pct_cell.number_format = pct_fmt
    pct_cell.alignment = data_align
    
    ws.cell(row=row, column=4, value=txn["country"]).alignment = data_align
    ws.cell(row=row, column=5, value=txn["date"]).alignment = data_align
    
    # EBITDA
    ebitda_cell = ws.cell(row=row, column=6)
    if isinstance(txn["ebitda"], str):
        ebitda_cell.value = txn["ebitda"]
    else:
        ebitda_cell.value = txn["ebitda"]
        ebitda_cell.number_format = currency_fmt
    ebitda_cell.alignment = data_align
    
    # EV
    ev_cell = ws.cell(row=row, column=7)
    if isinstance(txn["ev"], str):
        ev_cell.value = txn["ev"]
    else:
        ev_cell.value = txn["ev"]
        ev_cell.number_format = currency_fmt
    ev_cell.alignment = data_align
    
    # Multiple
    mult_cell = ws.cell(row=row, column=8)
    if isinstance(txn["multiple"], str) and txn["multiple"].startswith("="):
        mult_cell.value = txn["multiple"]
        mult_cell.number_format = '0.0"x"'
    else:
        mult_cell.value = txn["multiple"]
    mult_cell.alignment = data_align
    
    # Source (hyperlink)
    source_cell = ws.cell(row=row, column=9)
    source_cell.value = txn["source"]
    source_cell.hyperlink = txn["source"]
    source_cell.font = Font(color="0563C1", underline="single")
    source_cell.alignment = left_align
    
    # Apply borders
    for col in range(1, 10):
        ws.cell(row=row, column=col).border = thin_border

# Summary row
summary_row = len(transactions) + 3
ws.cell(row=summary_row, column=1, value="Summary Statistics").font = Font(bold=True)

# Mean (excluding non-disclosed)
ws.cell(row=summary_row + 1, column=7, value="Mean EV/EBITDA:").font = Font(bold=True)
ws.cell(row=summary_row + 1, column=7).alignment = Alignment(horizontal="right")
mean_cell = ws.cell(row=summary_row + 1, column=8)
mean_cell.value = "=AVERAGE(H2:H11)"
mean_cell.number_format = '0.0"x"'
mean_cell.font = Font(bold=True)
mean_cell.alignment = data_align

ws.cell(row=summary_row + 2, column=7, value="Median EV/EBITDA:").font = Font(bold=True)
ws.cell(row=summary_row + 2, column=7).alignment = Alignment(horizontal="right")
median_cell = ws.cell(row=summary_row + 2, column=8)
median_cell.value = "=MEDIAN(H2:H11)"
median_cell.number_format = '0.0"x"'
median_cell.font = Font(bold=True)
median_cell.alignment = data_align

# Notes
notes_row = summary_row + 4
ws.cell(row=notes_row, column=1, value="Notes:").font = Font(bold=True, italic=True)
ws.cell(row=notes_row + 1, column=1, value="1. All figures in AUD millions unless otherwise stated.").font = Font(italic=True)
ws.cell(row=notes_row + 2, column=1, value="2. SG Fleet EBITDA = FY24 Operating EBITDA of A$171m as disclosed in Scheme Implementation Deed.").font = Font(italic=True)
ws.cell(row=notes_row + 3, column=1, value="3. Benchmark Scaffolding EBITDA = annualised EBITDA of A$2.4m; EV = base consideration of A$9m (excl. earn-outs up to A$1m).").font = Font(italic=True)
ws.cell(row=notes_row + 4, column=1, value="4. Pit N Portal / Macmahon (2024): Structured as asset/contract transfer with equipment swap; no EBITDA multiple publicly disclosed.").font = Font(italic=True)
ws.cell(row=notes_row + 5, column=1, value="5. MI Scaffold: Upfront consideration ~4.0x EV/EBITDA (A$26.4m); total EV incl. deferred = A$36.4m. EBITDA implied from stated 4.0x on upfront.").font = Font(italic=True)
ws.cell(row=notes_row + 6, column=1, value="6. STA Traffic Management: EBITDA not publicly disclosed; EV of A$8.5m from ASX announcement.").font = Font(italic=True)
ws.cell(row=notes_row + 7, column=1, value="7. Construct Traffic: FY22 sustainable EBITDA ~A$5m, EV A$23.5m (incl. upfront A$17.6m + earn-out capped at A$5.4m + vehicles).").font = Font(italic=True)
ws.cell(row=notes_row + 8, column=1, value="8. Karratha Machinery Hire: FY21 unaudited EBITDA ~A$3.8m, total consideration A$15m.").font = Font(italic=True)
ws.cell(row=notes_row + 9, column=1, value="9. Pit N Portal / Emeco (2020): FY19 Operating EBITDA A$20m (normalised), EV A$72m.").font = Font(italic=True)
ws.cell(row=notes_row + 10, column=1, value="10. Uni-Span: FY19 normalised EBITDA implied ~A$4.83m from stated 4.4x multiple on A$21.25m consideration.").font = Font(italic=True)
ws.cell(row=notes_row + 11, column=1, value="11. Matilda Equipment: Annualised March quarter EBITDA implied ~A$24.2m from stated 3.3x multiple on A$80m EV.").font = Font(italic=True)

# Column widths
col_widths = {1: 50, 2: 55, 3: 15, 4: 18, 5: 16, 6: 16, 7: 20, 8: 18, 9: 85}
for col, width in col_widths.items():
    ws.column_dimensions[get_column_letter(col)].width = width

# Row height for header
ws.row_dimensions[1].height = 30

wb.save("/home/user/Comps/EV_EBITDA_Comps.xlsx")
print("Excel file created successfully!")
