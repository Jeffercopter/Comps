# VTM//TOWER — Tower Mill Power Model

A screening-level power model for vertical stirred (tower) mills — Vertimill
(VTM) and JETM tower mill families — served at `/vtm`.

Given mill geometry (body diameter `D`, body height `H`, screw pitch `S`) and
screw speed (rpm), it returns three independent power estimates, their average,
and a bias-corrected expected shaft power with a p10–p90 confidence band. It
can also size a mill against a duty (throughput × specific energy) and shows
the nearest installations from the benchmark database for context.

## Where the model came from

The model was developed from CMD's installation benchmark workbook
(`tower_mill_power_model_results.xlsx`): 82 installations — 64 VTM, 18 JETM —
each with geometry, speed, installed motor power, operating shaft power and
three literature-style power estimates (Nitta-type, M&J-type,
Radziszewski-type).

Per mill family, each of the three estimates was regressed onto geometry as a
log-linear power law:

- calibration quality (per-family fit vs the reference set): mean deviation
  0.1–1.4%, worst-case 5.3% (small VTM frames, where the reference values are
  integer-rounded);
- the three-estimate average is then **bias-corrected against measured shaft
  power** using the fleet statistics of `(P_avg − P_shaft)/P_shaft` per family,
  and banded with the fleet p10/p90 spread. VTM fleet bias is −6.7%, JETM
  −19.9%.

Motor sizing assumes shaft power ≈ 88.4% of installed motor power, the
dominant convention in the dataset.

These are screening estimates for flowsheet studies — verify against vendor
data before committing a design.

## IP boundary — who sees what

This tool follows the CMD architecture for shielding proprietary engineering
IP (see the build-structure diagram): **the formulas never leave the server.**

| Artefact | Where it lives | Reaches the browser? |
| --- | --- | --- |
| Calibrated coefficients | `lib/vtm/data.server.ts` | **No** |
| Installation database (82 rows) | `lib/vtm/data.server.ts` | **No** — only the 5 nearest rows of a result, server-selected |
| Calculation engine | `lib/vtm/engine.server.ts` | **No** |
| API route | `app/api/vtm/route.ts` | Runs server-side (Vercel serverless) |
| Frame catalogue (geometry + motor sizes) | passed as props to the page | Yes — public vendor-catalogue data |
| UI shell | `components/VtmTool.tsx`, `app/vtm/page.tsx` | Yes — layout only, zero maths |

Rules that keep it that way:

1. `lib/vtm/*.server.ts` modules are imported **only** from the API route and
   the `/vtm` server component. Never import them from a `'use client'` file —
   that would pull the coefficients into the public bundle.
2. The API returns computed numbers (kW, %, option tables), never coefficients
   or exponents.
3. No reliance on JS obfuscation anywhere.

## API

```
GET  /api/vtm            → { frames: Frame[] }        public catalogue
POST /api/vtm            → EvaluateResult             run the model
```

POST body:

```jsonc
{
  "mode": "frame",          // or "custom"
  "family": "VTM",          // or "JETM"
  "model": "VTM-1250",      // frame mode
  "D": 3.9, "H": 5.6,       // custom mode (m)
  "S": 1.35, "rpm": 20,
  "units": 2,               // optional, default 1
  "tph": 100, "seKwht": 8   // optional duty sizing
}
```

Inputs are range-validated server-side; out-of-range values return `400`.

### Auth and audit

- Every run is logged to Supabase `vtm_runs` (insert-only under RLS; no select
  policy — usage history is service-role only). Logging is best-effort and
  never blocks a calculation; without Supabase configured the tool still works.
- The `/vtm` page has a sign-in panel (`components/VtmAuth.tsx`) — password
  sign-in against Supabase Auth via a browser client that persists the session
  (`lib/supabase-browser.ts`). The session JWT is attached to every
  calculation request; the API verifies it and attributes the log row to the
  user id. There is deliberately no self-signup UI — provision accounts in
  the Supabase dashboard (Authentication → Users → Add user) and disable
  public signups in Supabase Auth settings to enforce that server-side.
- Set `VTM_REQUIRE_AUTH=1` on the deployment (and redeploy) to make sign-in
  mandatory: the API returns 401 to anonymous requests and the UI disables
  the run button until signed in. Default is open access — the sign-in panel
  is then optional and merely attributes runs.
- The daily verification workflow handles the gate: on a 401 it signs in as a
  dedicated verifier user (secrets `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
  `VTM_VERIFY_EMAIL`, `VTM_VERIFY_PASSWORD` — see the workflow header) and
  retries with the JWT.

## Files

```
app/vtm/page.tsx           /vtm page (server component)
app/api/vtm/route.ts       serverless API — validation, auth, logging
components/VtmTool.tsx     client UI shell
lib/vtm/data.server.ts     coefficients, frames, installations  (server-only)
lib/vtm/engine.server.ts   calculation engine                   (server-only)
supabase/schema.sql        vtm_runs audit table + RLS
```
