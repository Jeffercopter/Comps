#!/usr/bin/env node
/**
 * eHPCC DEM — verification harness
 *
 * Drives ../../ehpcc.html in headless Chromium and reports what the model
 * actually does, so the numbers in docs/ehpcc-dem.md can be reproduced rather
 * than taken on trust.
 *
 * The trick that makes this usable: rendering is paused (`state.running =
 * false`) and the physics is stepped directly, 60 "frames" per second of
 * machine time. Twenty seconds of machine time then takes seconds of wall
 * clock instead of a minute of watching an animation.
 *
 *   node verify.mjs soak            parameter response matrix (the docs table)
 *   node verify.mjs trace           time series to steady state
 *   node verify.mjs probe           contact and region diagnostics
 *   node verify.mjs shot            live render, readouts and screenshots
 *
 * Every command takes slider overrides as JSON, e.g.
 *   node verify.mjs trace '{"sGap":20,"sFeed":30}'
 *
 * See README.md for what each command is for and how to read it.
 */
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const MODEL = pathToFileURL(join(here, '..', '..', 'ehpcc.html')).href

/* Playwright is a dev-only dependency and is not in package.json — the repo
   builds and deploys without it. Resolve it from wherever it happens to be
   installed rather than requiring a particular layout. */
const require_ = createRequire(import.meta.url)
let chromium
for (const spec of ['playwright', 'playwright-core', '/opt/node22/lib/node_modules/playwright']) {
  try { ({ chromium } = require_(spec)); break } catch { /* try the next */ }
}
if (!chromium) {
  console.error('playwright not found — install it with `npm i -D playwright` and `npx playwright install chromium`')
  process.exit(1)
}

// SwiftShader: these runs are about the physics, and CI has no GPU.
const LAUNCH = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']

async function open({ width = 900, height = 700 } = {}) {
  const browser = await chromium.launch({ args: LAUNCH })
  const page = await browser.newPage({ viewport: { width, height } })
  const errors = []
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message))
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()) })
  page.on('requestfailed', r => errors.push('REQFAIL: ' + r.url()))
  await page.goto(MODEL)
  await page.waitForTimeout(1500)
  return { browser, page, errors }
}

const setSliders = async (page, kv) => {
  for (const [id, value] of Object.entries(kv)) {
    await page.fill('#' + id, String(value))
    await page.dispatchEvent('#' + id, 'input')
  }
}

/* Step the model without rendering. Mirrors the frame body of the real loop —
   if the loop in ehpcc.html changes, this has to change with it. */
const step = secs => `
  const frames = Math.round(${secs} * 60);
  for (let f = 0; f < frames; f++) {
    buildPairs();
    for (let s = 0; s < SUBSTEPS; s++) {
      physicsStep(DT);
      state.powerEMA += (Math.max(0, stepPower) - state.powerEMA) * 0.05;
    }
    houseKeeping();
    feed(DT * SUBSTEPS);
  }`

/* Rates are read over a trailing window of machine time, the same way the
   on-screen readouts do it, so a soak and the live model agree. */
const readout = win => `
  const t0 = state.simTime - ${win};
  while (state.prodWindow.length && state.prodWindow[0][0] < t0) state.prodWindow.shift();
  while (state.brkWindow.length && state.brkWindow[0] < t0) state.brkWindow.shift();
  let pm = 0; for (const p of state.prodWindow) pm += p[1];
  let hold = 0, ore = 0, vmax = 0;
  for (let i = 0; i < N; i++) {
    const v = Math.hypot(vx[i], vy[i], vz[i]); if (v > vmax) vmax = v;
    if (!isMedia[i]) { hold += mass[i]; ore++; }
  }
  const d80 = p80();`

const summary = win => `{
    t: +state.simTime.toFixed(0),
    n: N, media: N - ore,
    tph: +(pm / ${win} * 3.6).toFixed(3),
    p80: d80 ? +(d80 * 1000).toFixed(2) : null,
    W: +state.powerEMA.toFixed(1),
    brk: +(state.brkWindow.length / ${win}).toFixed(0),
    hold: +hold.toFixed(3),
    vmax: +vmax.toFixed(1),
    g: +gForce().toFixed(0),
    cut: +(cutSize() * 1000).toFixed(1),
    choked: N >= NMAX - 6,
  }`

/* ── soak ──────────────────────────────────────────────────────────────────
   One row per parameter change, each from a freshly seeded charge, run to
   steady state. This is the table in docs/ehpcc-dem.md. Run it after any
   change to the physics and diff the numbers. */
const CASES = [
  ['base   rpm420 D10 g8 a20', {}],
  ['D=0    bodies concentric', { sEcc: 0 }],
  ['D=4    shallow zone     ', { sEcc: 4 }],
  ['D=18   deep penetration ', { sEcc: 18 }],
  ['gap=6  tight            ', { sEcc: 10, sGap: 6 }],
  ['gap=20 open             ', { sGap: 20 }],
  ['rpm=150 low field       ', { sGap: 8, sRpm: 150 }],
  ['rpm=800 high field      ', { sRpm: 800 }],
  ['air=12 fine cut         ', { sRpm: 420, sAir: 12 }],
  ['air=30 coarse cut       ', { sAir: 30 }],
  ['ecs=0.80 hard ore       ', { sAir: 20, sEcs: 0.8 }],
  ['feed=30 choke           ', { sEcs: 0.25, sFeed: 30 }],
]

async function soak(overrides, secs = 20) {
  secs = secs ?? 20
  const { browser, page, errors } = await open()
  await page.evaluate(() => { state.running = false })
  for (const [label, kv] of CASES) {
    await setSliders(page, { ...kv, ...overrides })
    await page.evaluate(() => seedCharge())
    const r = await page.evaluate(`(() => {${step(secs)}${readout(1.5)}return ${summary(1.5)}})()`)
    console.log(label, JSON.stringify(r))
  }
  report(errors)
  await browser.close()
}

/* ── trace ─────────────────────────────────────────────────────────────────
   One case, sampled repeatedly, so you can see whether it settles, drifts or
   chokes. A single end-state reading cannot tell those apart. Also reports
   how many contacts the two driven surfaces actually hold — if `cE` sits at
   zero the grinding element is not touching the bed and the machine is only
   pretending to work. */
async function trace(overrides, chunk = 8, chunks = 5) {
  chunk = chunk ?? 8
  const { browser, page, errors } = await open()
  await page.evaluate(() => { state.running = false })
  await setSliders(page, overrides)
  await page.evaluate(() => seedCharge())
  const contacts = `
    buildPairs(); buildContacts();
    let cE = 0, cR = 0, both = 0, inZone = 0;
    const touchE = new Uint8Array(N), touchR = new Uint8Array(N);
    for (let k = 0; k < nC; k++) {
      if (cB[k] === B_ELEMENT) { cE++; touchE[cA[k]] = 1; }
      if (cB[k] === B_RECEPTACLE) { cR++; touchR[cA[k]] = 1; }
    }
    for (let i = 0; i < N; i++) {
      if (touchE[i] && touchR[i]) both++;
      if (!isMedia[i] && Math.cos(Math.atan2(pz[i], px[i])) > 0.5) inZone++;
    }`
  for (let i = 0; i < chunks; i++) {
    const r = await page.evaluate(
      `(() => {${step(chunk)}${readout(2)}${contacts}
        return Object.assign(${summary(2)}, {
          cE, cR, both,
          drive: +stepPowerAccum.toFixed(0),
          zone: +(inZone / Math.max(1, ore)).toFixed(2),
        });
      })()`)
    console.log(JSON.stringify(r))
  }
  report(errors)
  await browser.close()
}

/* ── probe ─────────────────────────────────────────────────────────────────
   Where the charge is and what it is touching. Written to catch the failures
   that produce plausible numbers while being nonsense:

     hist['-1'] / ['-2'] at zero  no wall or element contacts are reaching the
                                  solver — usually the contact buffer is full
     nPairs >> N * ~10            neighbour search is double-counting
     maxDeg in the hundreds       the charge has collapsed into a heap the
                                  solver cannot separate
     inElem / outside > 0         containment is leaking
     yb concentrated in one band  the bed is packed into a corner
*/
async function probe(overrides, secs = 2) {
  secs = secs ?? 2
  const { browser, page, errors } = await open()
  await page.evaluate(() => { state.running = false })
  await setSliders(page, overrides)
  await page.evaluate(() => seedCharge())
  const r = await page.evaluate(`(() => {
    const t0 = performance.now();
    ${step(secs)}
    const ms = performance.now() - t0;
    buildPairs(); buildContacts();
    const hist = {}, deg = new Int32Array(N);
    for (let k = 0; k < nC; k++) {
      const key = cB[k] < 0 ? cB[k] : 'particle';
      hist[key] = (hist[key] || 0) + 1;
      if (cB[k] >= 0) { deg[cA[k]]++; deg[cB[k]]++; }
    }
    let inElem = 0, inAnnulus = 0, above = 0, below = 0, outside = 0, worst = 0;
    const yb = {};
    for (let i = 0; i < N; i++) {
      if (deg[i] > deg[worst]) worst = i;
      const band = (Math.round(py[i] * 50) / 50).toFixed(2);
      yb[band] = (yb[band] || 0) + 1;
      const y = py[i], rr = Math.hypot(px[i], pz[i]);
      const re = Math.hypot(px[i] - state.offset, pz[i]);
      if (y > MACH.yRim) { above++; continue; }
      if (y < MACH.yFloor - 0.001) { below++; continue; }
      if (re < elemSurf(y).r - 1e-4) inElem++;
      else if (rr > chamberSurf(y).r + 1e-4) outside++;
      else inAnnulus++;
    }
    /* Contact count alone does not distinguish a dense bed from a collapsed
       one — grazing contacts are fine, deep ones mean the solver has lost.
       Overlap is reported as a fraction of the smaller grain's radius. */
    let deep = 0, penMax = 0, penSum = 0, nPart = 0;
    for (let k = 0; k < nC; k++) {
      if (cB[k] < 0) continue;
      const rMin = Math.min(rad[cA[k]], rad[cB[k]]);
      const f = cPen[k] / rMin;
      penSum += f; nPart++;
      if (f > penMax) penMax = f;
      if (f > 0.2) deep++;
    }
    return {
      ms: +ms.toFixed(0), realtime: +(${secs} * 1000 / ms).toFixed(2),
      N, nPairs, nC, hist,
      inElem, inAnnulus, above, below, outside,
      maxDeg: deg[worst],
      penMean: +(penSum / Math.max(1, nPart)).toFixed(3),
      penMax: +penMax.toFixed(3),
      deepContacts: deep,
      yb,
    };
  })()`)
  console.log(JSON.stringify(r, null, 2))
  report(errors)
  await browser.close()
}

/* ── shot ──────────────────────────────────────────────────────────────────
   The only command that runs the real render loop. Confirms the page loads
   clean, the inlined fonts resolve, every readout is live, and leaves two
   screenshots to look at. */
async function shot(overrides, secs = 14) {
  secs = secs ?? 14
  const { browser, page, errors } = await open({ width: 1440, height: 900 })
  await setSliders(page, overrides)
  await page.waitForTimeout(secs * 1000)
  await page.screenshot({ path: join(here, 'shot-assembled.png') })
  await page.evaluate(() => { tCut.checked = true; tCut.dispatchEvent(new Event('change')) })
  await page.waitForTimeout(5000)
  await page.screenshot({ path: join(here, 'shot-cutaway.png') })
  const r = await page.evaluate(() => ({
    status: simstat.textContent,
    tph: kThru.textContent, p80: kP80.textContent, kW: kPower.textContent,
    brk: kBrk.textContent, n: kN.textContent, hold: kHold.textContent,
    g: kG.textContent, slip: kSlip.textContent,
    rpm: vRpm.textContent, gap: vGap.textContent, offset: vEcc.textContent,
    air: vAir.textContent, feed: vFeed.textContent, media: vMedia.textContent,
    ecs: vEcs.textContent,
    fontsLoaded: document.fonts.check('16px Nunito') && document.fonts.check('16px "Fira Code"'),
  }))
  console.log(JSON.stringify(r, null, 2))
  console.log('screenshots: shot-assembled.png, shot-cutaway.png')
  report(errors)
  await browser.close()
}

function report(errors) {
  console.log('errors:', errors.length ? errors.slice(0, 8).join(' | ') : 'none')
  if (errors.length) process.exitCode = 1
}

const [cmd = 'soak', json = '{}', secs] = process.argv.slice(2)
const overrides = JSON.parse(json)
const commands = { soak, trace, probe, shot }
if (!commands[cmd]) {
  console.error(`unknown command "${cmd}" — expected one of: ${Object.keys(commands).join(', ')}`)
  process.exit(1)
}
await commands[cmd](overrides, secs === undefined ? undefined : Number(secs))
