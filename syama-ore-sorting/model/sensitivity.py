import json, importlib.util
spec = importlib.util.spec_from_file_location("m", "model.py")
# re-use the engine without re-running its prints
src = open("model.py").read().split("# ------------------------------------------------------------------ INPUTS")[0]
ns = {}; exec(src, ns)
cascade, solve_deportment, goal_seek = ns['cascade'], ns['solve_deportment'], ns['goal_seek']
G = 31.1035
I = dict(F=200.0, dil=0.20, ROM=2.40, scat_tph=30.0, scat_grade=2.00, hours=7884.0,
         rec=0.75, au_oz=4000.0, cmill=8.00, cmine=53.00, cdump=2.50, csort=0.45,
         capex=4_095_000.0, disc=0.10, life=96, build=12, orec=0.95, w2r=0.70)
AU = I['au_oz']/G

def npv(net_a, disc=None, capex=None):
    r = (disc or I['disc'])/12; v = -(capex or I['capex'])
    for m in range(1, I['build']+I['life']+1):
        v += (net_a/12 if m > I['build'] else 0.0)/((1+r)**m)
    return v

def run(dil=None, scat_grade=None, orec=None, w2r=None, capture=1.0, inc_grade=None,
        au_oz=None, F=None, scat_tph=None):
    dil = I['dil'] if dil is None else dil
    sg  = I['scat_grade'] if scat_grade is None else scat_grade
    orec = I['orec'] if orec is None else orec
    w2r  = I['w2r'] if w2r is None else w2r
    au   = (au_oz or I['au_oz'])/G
    F0   = F or I['F']; st = scat_tph or I['scat_tph']
    L = I['ROM']/(1-dil)
    fo, fw = solve_deportment(F0, dil, L, st, sg)
    b = cascade(F0, dil, L, fo, fw)
    Fs = goal_seek(b['leach'], dil, L, fo, fw, orec, w2r)
    dR = (Fs - F0)*capture
    if inc_grade is None:
        s = cascade(F0+dR, dil, L, fo, fw, orec, w2r)
    else:
        blend = (F0*b['ROM_grade'] + dR*inc_grade)/(F0+dR)
        s = cascade(F0+dR, dil, blend/(1-dil), fo, fw, orec, w2r)
    d_au = s['leach_Au'] - b['leach_Au']
    net = (d_au*I['rec']*au - I['csort']*s['peb'] - I['cdump']*s['rej']
           - I['cmine']*dR + I['cmill']*(b['mill']-s['mill']))
    return dict(contrast=fw/fo, pull=s['rej']/s['peb'] if s['peb'] else 0,
                rej_grade=s['rej_grade'], dROM=dR, oz=d_au*I['rec']*I['hours']/G,
                net_a=net*I['hours'], npv=npv(net*I['hours']))

TABLES = []
TABLES.append(("A.  Capacity capture  -  what share of freed SAG capacity is actually filled with ore",
    "Capture", ["Capture", "ROM uplift t/h", "Extra oz/a", "Net $/a", "NPV $"],
    [[f"{c:.0%}"] + [run(capture=c)[k] for k in ("dROM","oz","net_a","npv")] for c in
     (0,0.10,0.21,0.25,0.50,0.75,1.00)]))
TABLES.append(("B.  Grade of the incremental feed that fills the freed capacity",
    "Incremental feed g/t", ["Incremental feed g/t","ROM uplift t/h","Extra oz/a","Net $/a","NPV $"],
    [[g] + [run(inc_grade=g)[k] for k in ("dROM","oz","net_a","npv")] for g in
     (0.8,1.2,1.6,2.0,2.4,3.0)]))
TABLES.append(("C.  Measured scat grade  -  the single most important material property",
    "Scat grade g/t", ["Scat grade g/t","Contrast x","Reject grade g/t","Mass pull","Net $/a","NPV $"],
    [[g] + [run(scat_grade=g)[k] for k in ("contrast","rej_grade","pull","net_a","npv")] for g in
     (0.5,0.8,1.2,1.6,2.0,2.4)]))
TABLES.append(("D.  Sorter performance  (ore recovery / waste rejection)",
    "Sorter", ["Ore rec / waste rej","Mass pull","Reject grade g/t","Extra oz/a","Net $/a","NPV $"],
    [[f"{o:.0%} / {w:.0%}"] + [run(orec=o,w2r=w)[k] for k in ("pull","rej_grade","oz","net_a","npv")]
     for o,w in ((0.99,0.50),(0.95,0.70),(0.90,0.90),(0.85,0.95))]))
TABLES.append(("E.  SLC dilution  -  drives the back-solved heterogeneity contrast",
    "Dilution", ["Dilution","Contrast x","Mass pull","Reject grade g/t","Net $/a","NPV $"],
    [[f"{d:.0%}"] + [run(dil=d)[k] for k in ("contrast","pull","rej_grade","net_a","npv")] for d in
     (0.10,0.15,0.20,0.25,0.30)]))
TABLES.append(("F.  Gold price and discount rate",
    "Gold price", ["Gold price $/oz","Net $/a","NPV @8%","NPV @10%","NPV @15%"],
    [[p, (rr:=run(au_oz=p))['net_a'], npv(rr['net_a'],0.08), npv(rr['net_a'],0.10), npv(rr['net_a'],0.15)]
     for p in (2500,3000,3500,4000,4500)]))
json.dump([[t[0], t[2], t[3]] for t in TABLES], open("sens.json","w"), indent=1)
for title, _, hdr, rows in [(t[0],t[1],t[2],t[3]) for t in TABLES]:
    print("\n"+title); print("  " + " | ".join(f"{h:>18}" for h in hdr))
    for row in rows:
        print("  " + " | ".join(f"{v:>18,.3f}" if isinstance(v,float) else f"{str(v):>18}" for v in row))
