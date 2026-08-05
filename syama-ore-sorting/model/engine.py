"""Syama pebble (SAG scat) sorting simulation.
Engine replicates the STEINERT Sukari SR241558 workbook logic, re-parameterised
for the Syama converted (ex-oxide) SAG line post Sulphide Conversion Project."""
G_PER_OZ = 31.1035

def cascade(F, d, L, f_o, f_w, ore_rec=1.0, w2r=0.0, npass=25):
    K, O = F*(1-d), F*d
    tK = tO = 0.0
    for _ in range(npass):
        tK += K; tO += O
        K_os, O_os = K*f_o, O*f_w
        K, O = K_os*ore_rec, O_os*(1-w2r)
    mill = tK + tO
    pK, pO = tK*f_o, tO*f_w
    peb = pK + pO
    rK, rO = pK*(1-ore_rec), pO*w2r
    rej = rK + rO
    cK, cO = pK-rK, pO-rO
    lK, lO = tK-pK, tO-pO
    leach = lK + lO
    g = lambda k, m: (k*L/m) if m > 1e-12 else 0.0
    return dict(ROM=F, ROM_grade=(1-d)*L, mill=mill, mill_grade=g(tK, mill),
                peb=peb, peb_grade=g(pK, peb), rej=rej, rej_grade=g(rK, rej),
                rej_Au=rK*L, con=cK+cO, con_grade=g(cK, cK+cO),
                leach=leach, leach_grade=g(lK, leach), leach_Au=lK*L,
                Au_rec_conc=(pK-rK)/pK if pK else 0.0)

def solve_deportment(F, d, L, scat_tph, scat_grade):
    """Find f_o, f_w giving the observed circulating scat rate and grade."""
    lo, hi = 1e-6, 0.95
    for _ in range(300):                       # bisect on f_o
        f_o = (lo+hi)/2
        # for this f_o, choose f_w to hit the scat grade
        a, b = 1e-9, 0.999
        for _ in range(300):
            f_w = (a+b)/2
            r = cascade(F, d, L, f_o, f_w)
            (a := f_w) if r['peb_grade'] > scat_grade else (b := f_w)
            if r['peb_grade'] > scat_grade: a = f_w
            else: b = f_w
        r = cascade(F, d, L, f_o, f_w)
        if r['peb'] < scat_tph: lo = f_o
        else: hi = f_o
    return f_o, f_w

def goal_seek(target_leach, d, L, f_o, f_w, orec, w2r):
    lo, hi = 1.0, 5000.0
    for _ in range(300):
        m = (lo+hi)/2
        if cascade(m, d, L, f_o, f_w, orec, w2r)['leach'] < target_leach: lo = m
        else: hi = m
    return (lo+hi)/2

# ------------------------------------------------------------------ INPUTS
I = dict(F=200.0, dilution=0.20, ROM_grade=2.40, scat_tph=30.0, scat_grade=2.00,
         hours=7884.0, recovery=0.75, au_oz=4000.0, mill_cost=8.00,
         mine_cost=53.00, dump_cost=2.50, sort_opex=0.45, capex=4_095_000.0,
         disc=0.10, life_m=96, build_m=12)
AU = I['au_oz']/G_PER_OZ
d = I['dilution']; L = I['ROM_grade']/(1-d)
f_o, f_w = solve_deportment(I['F'], d, L, I['scat_tph'], I['scat_grade'])
base = cascade(I['F'], d, L, f_o, f_w)

print(f"Au price {AU:.2f} $/g | undiluted ore grade {L:.2f} g/t")
print(f"Deportment: f_ore->scats {f_o:.4f}  f_waste->scats {f_w:.4f}  "
      f"CONTRAST {f_w/f_o:.2f}x   (Sukari: 8.91x)")
print(f"BASE  ROM {base['ROM']:.1f} t/h @ {base['ROM_grade']:.2f} | mill {base['mill']:.1f} "
      f"@ {base['mill_grade']:.3f} | scats {base['peb']:.1f} @ {base['peb_grade']:.3f} "
      f"| leach {base['leach']:.1f} @ {base['leach_grade']:.3f}")
print(f"Scat stream = {base['peb']/base['ROM']*100:.1f}% of new feed, carrying "
      f"{base['peb']*base['peb_grade']/(base['ROM']*base['ROM_grade'])*100:.1f}% of circuit gold\n")

def econ(s, base, tc=True, inc_grade=None, capture=1.0):
    d_rom = (s['ROM']-base['ROM'])*capture if tc else 0.0
    if tc and inc_grade is not None:          # incremental feed at a different grade
        blend = (base['ROM']*base['ROM_grade'] + d_rom*inc_grade)/(base['ROM']+d_rom)
        s = cascade(base['ROM']+d_rom, d, blend/(1-d), f_o, f_w, s['_orec'], s['_w2r'])
    d_au = s['leach_Au'] - base['leach_Au']
    rev = d_au*I['recovery']*AU
    c = (I['sort_opex']*s['peb'] + I['dump_cost']*s['rej'] + I['mine_cost']*d_rom
         - I['mill_cost']*(base['mill']-s['mill']))
    net = rev - c
    return dict(d_rom=d_rom, d_au=d_au, rev=rev, cost=c, net=net,
                net_a=net*I['hours'], oz_a=d_au*I['recovery']*I['hours']/G_PER_OZ)

def npv(net_a, capex=None, disc=None):
    capex = I['capex'] if capex is None else capex
    r = (I['disc'] if disc is None else disc)/12
    v = -capex
    for m in range(1, I['build_m']+I['life_m']+1):
        v += (net_a/12 if m > I['build_m'] else 0.0)/((1+r)**m)
    return v

SCEN = [("S1  Benchmark sorter  (90% ore rec / 90% waste rej)", 0.90, 0.90),
        ("S2  Realistic XRT     (95% ore rec / 70% waste rej)", 0.95, 0.70),
        ("S3  Stretch           (90% ore rec / 99% waste rej)", 0.90, 0.99)]

print("="*124)
print(f"{'Scenario':<52}{'pull%':>7}{'rej g/t':>9}{'AuRec%':>8}{'ΔROM':>7}{'Δoz/a':>9}{'$M/a':>8}{'NPV$M':>8}{'PB mo':>7}")
print("-"*124)
store = {}
for nm, orec, w2r in SCEN:
    F2 = goal_seek(base['leach'], d, L, f_o, f_w, orec, w2r)
    s = cascade(F2, d, L, f_o, f_w, orec, w2r); s['_orec'], s['_w2r'] = orec, w2r
    sf = cascade(I['F'], d, L, f_o, f_w, orec, w2r); sf['_orec'], sf['_w2r'] = orec, w2r
    for tag, ss, tc in (("", s, True), ("   +no spare ore (ROM flat)", sf, False)):
        e = econ(ss, base, tc)
        pb = I['capex']/e['net_a']*12 if e['net_a'] > 0 else float('nan')
        print(f"{nm+tag:<52}{ss['rej']/ss['peb']*100:>6.1f}%{ss['rej_grade']:>9.3f}"
              f"{ss['Au_rec_conc']*100:>8.1f}{e['d_rom']:>7.1f}{e['oz_a']:>9,.0f}"
              f"{e['net_a']/1e6:>8.2f}{npv(e['net_a'])/1e6:>8.1f}{pb:>7.1f}")
        store[(nm, tc)] = (ss, e)
    print()

# ------------------------------------------------------- SENSITIVITIES (on S2)
orec, w2r = 0.95, 0.70
F2 = goal_seek(base['leach'], d, L, f_o, f_w, orec, w2r)
s2 = cascade(F2, d, L, f_o, f_w, orec, w2r); s2['_orec'], s2['_w2r'] = orec, w2r
e2 = econ(s2, base)

print("SENSITIVITY 1 - fraction of freed SAG capacity actually filled with new ore (S2)")
for cap in (0, 0.25, 0.5, 0.75, 1.0):
    sc = cascade(base['ROM']+(s2['ROM']-base['ROM'])*cap, d, L, f_o, f_w, orec, w2r)
    e = econ(sc, base, tc=True); e['d_rom'] = (s2['ROM']-base['ROM'])*cap
    e = dict(e); e['net_a'] = (e['d_au']*I['recovery']*AU
        - I['sort_opex']*sc['peb'] - I['dump_cost']*sc['rej']
        - I['mine_cost']*e['d_rom'] + I['mill_cost']*(base['mill']-sc['mill']))*I['hours']
    print(f"   capture {cap*100:>3.0f}%   ΔROM {e['d_rom']:>5.1f} t/h   "
          f"net ${e['net_a']/1e6:>7.2f} M/a   NPV ${npv(e['net_a'])/1e6:>7.1f} M")

print("\nSENSITIVITY 2 - grade of the incremental feed that fills freed capacity (S2, 100% capture)")
for ig in (0.8, 1.2, 1.6, 2.0, 2.4, 3.0):
    dR = s2['ROM']-base['ROM']
    blend = (base['ROM']*base['ROM_grade'] + dR*ig)/(base['ROM']+dR)
    sc = cascade(base['ROM']+dR, d, blend/(1-d), f_o, f_w, orec, w2r)
    d_au = sc['leach_Au']-base['leach_Au']
    net_a = (d_au*I['recovery']*AU - I['sort_opex']*sc['peb'] - I['dump_cost']*sc['rej']
             - I['mine_cost']*dR + I['mill_cost']*(base['mill']-sc['mill']))*I['hours']
    print(f"   incremental feed {ig:.1f} g/t   net ${net_a/1e6:>7.2f} M/a   "
          f"NPV ${npv(net_a)/1e6:>7.1f} M")

print("\nSENSITIVITY 3 - measured scat grade (all else equal, S2, full capture)")
for sg in (0.5, 0.8, 1.2, 1.6, 2.0, 2.4):
    fo2, fw2 = solve_deportment(I['F'], d, L, I['scat_tph'], sg)
    b2 = cascade(I['F'], d, L, fo2, fw2)
    F3 = goal_seek(b2['leach'], d, L, fo2, fw2, orec, w2r)
    s3 = cascade(F3, d, L, fo2, fw2, orec, w2r)
    d_au = s3['leach_Au']-b2['leach_Au']
    net_a = (d_au*I['recovery']*AU - I['sort_opex']*s3['peb'] - I['dump_cost']*s3['rej']
             - I['mine_cost']*(s3['ROM']-b2['ROM']) + I['mill_cost']*(b2['mill']-s3['mill']))*I['hours']
    print(f"   scats {sg:.1f} g/t (contrast {fw2/fo2:>5.2f}x)  reject grade {s3['rej_grade']:.3f} g/t  "
          f"mass pull {s3['rej']/s3['peb']*100:>4.1f}%  net ${net_a/1e6:>7.2f} M/a  NPV ${npv(net_a)/1e6:>7.1f} M")

print("\nSENSITIVITY 4 - gold price and discount rate (S2, full capture)")
for px in (2500, 3000, 3500, 4000, 4500):
    au = px/G_PER_OZ
    net_a = (e2['d_au']*I['recovery']*au - I['sort_opex']*s2['peb'] - I['dump_cost']*s2['rej']
             - I['mine_cost']*e2['d_rom'] + I['mill_cost']*(base['mill']-s2['mill']))*I['hours']
    print(f"   ${px}/oz   net ${net_a/1e6:>7.2f} M/a   NPV@8% ${npv(net_a,disc=0.08)/1e6:>7.1f} M"
          f"   NPV@10% ${npv(net_a)/1e6:>7.1f} M   NPV@15% ${npv(net_a,disc=0.15)/1e6:>7.1f} M")

print("\nVALUE-AT-RISK CHECK - gold walking out in the reject stream (S2)")
lost = s2['rej_Au']*I['recovery']*AU
print(f"   rejects {s2['rej']:.1f} t/h @ {s2['rej_grade']:.3f} g/t = {s2['rej_Au']:.1f} g/h contained")
print(f"   recoverable value discarded = ${lost:,.0f}/h  =  ${lost*I['hours']/1e6:.2f} M/a")
print(f"   in-situ value of reject stream = ${s2['rej_grade']*I['recovery']*AU:.2f}/t vs "
      f"${I['mill_cost']+I['dump_cost']:.2f}/t of cost avoided  -> ratio "
      f"{s2['rej_grade']*I['recovery']*AU/(I['mill_cost']+I['dump_cost']):.1f}x")
