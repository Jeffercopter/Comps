# Session handoff — WHITMORE//AU

Written for a fresh Claude Code session picking this repo up cold. It covers what
exists, why it is shaped the way it is, what is still open, and the decisions that
should not be quietly reversed.

---

## 1. The original request

Verbatim intent from the user who commissioned this:

> Access the entire website at `https://www.whitmores.com`, isolate/capture all
> information relating to the products offered at `https://whitmore.vercel.app/app/`.
> Clone or generate a website merging the information relating to the Australian
> distributorship, gearbox oils, OGL greases and draglines. Develop a **cmd style
> website** that leads into and supports the business plan. Add the website to
> Vercel and Supabase. Use any other information provided by **Laurence Davies**,
> particularly referencing **the move to synthetics and away from asphaltics**.
> Use innovative web design features to impress.

Follow-on instructions across the session, in order: deploy without Supabase for
now; confirm whether SGI disclosure is required; open a PR; ship the app; deploy
it to Vercel.

---

## 2. Where things stand

| Thing | State |
| --- | --- |
| Application code | **Merged to `main`** via PR #2 (`f8aee65`) |
| Clean-clone build | Verified green with **no** environment variables set |
| CI | `.github/workflows/ci.yml` — typecheck + build on push/PR |
| Live URL | **None yet.** Nobody has deployed it. See §8. |
| Open PR #7 | Draft — adds a CI-based Vercel deploy workflow |
| Supabase project | **Does not exist.** Schema is written but never applied. |

Two applications now ship from this one repo:

| App | What | Source | Route |
| --- | --- | --- | --- |
| **WHITMORE//AU** | Terminal console for the distributorship proposal | `app/`, `components/`, `lib/` | `/` |
| **DEM SAG Mill** | Single-file DEM mill simulator, CMD edition | `index.html` | `/mill` |

The mill simulator arrived separately (PR #4/#5, a different session) as a
zero-dependency `index.html` at the repo root. Next.js never serves a repo-root
`index.html`, so it would have vanished on deploy. See §5.4 for how they were
joined without breaking either.

---

## 3. Stack and layout

Next.js 16.3 App Router · React 19.2 · TypeScript 5.5 · Tailwind 3.4 · Supabase (optional).

```
app/                    layout, page, global CSS, generated icon
components/Console.tsx  the shell — boot sequence, input, history, dispatch
components/Hud.tsx      right-hand telemetry panel (xl: and up only)
components/Backdrop.tsx canvas gear-train animation
components/Roi.tsx      interactive conversion model
components/Enquiry.tsx  lead capture -> Supabase
components/renderers.tsx, ui.tsx   output primitives (Head, Bullets, Kv, Cmd, Meter…)
lib/data/products.ts    18-product catalogue — the data spine
lib/data/plan.ts        8 business-plan sections + ASPHALTIC_COMPARISON
lib/terminal/commands.tsx  command registry, resolve/complete/execute
lib/terminal/art.ts     LOGO, DRAGLINE, LUBE_POINTS, MAP_AU (ASCII)
lib/supabase.ts         client that never throws; falls back to bundled seed
supabase/schema.sql     tables + RLS policies
scripts/seed-supabase.mjs   loads the catalogue into Supabase (service role)
scripts/stage-mill.mjs      copies index.html -> public/mill/ at build
```

### Commands

`products` `spec` `ogl` `gearbox` `grease` `dragline` `search` `stock` `plan`
`compare` `roi` `au` `risk` `contact` `help` `clear` `theme` `crt` `hud` `status`
`history` `sources` `mill` `matrix`

Aliases include `ls`/`catalog`, `cat`/`show`, `grep`/`find`, `asphaltic`/`synthetics`,
`model`/`calc`, `australia`, `whoami`/`about`, `sag`/`dem`, `?`/`man`, `cls`.

Interaction: `TAB` completes to the **longest common prefix** (like a real shell,
not first-match), `↑`/`↓` recall history, `CTRL+L` clears, highlighted tokens in
output are clickable, and `?cmd=compare` on the URL runs a command on load so any
view is linkable. Three phosphor themes, CRT emulation and the HUD are all
toggleable and persisted to `localStorage`.

### Data model

`lib/data/products.ts` — 18 products typed as
`slug, name, family, category, chemistry, tagline, description, grades[],
applications[], specs[], approvals[], replaces[], auPriority (1|2|3), auNote, sources[]`.
Categories: `open-gear | gearbox-oil | grease | wire-rope | specialty`.

`lib/data/plan.ts` — sections `thesis, market, wedge, distributorship, operating,
commercial, roadmap, risk`, each with `summary`, `body[]`, `metrics[]`. Plus
`ASPHALTIC_COMPARISON` (3 columns × 12 rows) driving the `compare` view.

---

## 4. The commercial argument (do not dilute this)

The whole site exists to support one pitch: **off asphaltics, onto synthetics**.
It rests on **four deliberately independent proof points**, so a buyer who rejects
any one still faces the other three:

1. **Consumption** — Surtac 2000 reduces applied volume by roughly 50% against
   asphaltics. A direct, auditable line item.
2. **Clean-down** — Envirolube XE contains no asphalt; spent lubricant does not
   harden in the tooth root, so chipping it out leaves the shut critical path.
3. **Waste / compliance** — Envirolube Heavy is TCLP-safe; no asphalt, no
   solvents, no lead. Turns a waste-characterisation liability into an advantage.
4. **Inspectability** — Decathlon Gold runs clear rather than black, so tooth
   contact can be photographed on a walk-around. Condition monitoring becomes
   continuous rather than periodic.

That redundancy is the point. If you edit the `wedge` plan section or the
`compare` table, preserve it.

**The ROI model argues against itself on purpose.** At a 10% consumption
reduction it reports **−$280,800 (−65%)** in red, with a warning that the case
then rests on shut hours and gear life instead. Do not "fix" this into always
showing a positive number — a model that cannot lose is not persuasive to the
engineers this is aimed at.

---

## 5. Decisions worth understanding before changing anything

### 5.1 Product data provenance — the single most important caveat

**Both source sites were unreachable.** `www.whitmores.com` and
`whitmore.vercel.app` both returned **403 on CONNECT at the egress proxy**. Per
the environment's proxy policy ("do not retry organization policy denials —
report them instead"), that was not routed around.

The catalogue was therefore reconstructed from **WebSearch-indexed** public
product pages, technical data sheets and authorised distributor listings. This is
disclosed in four places — the `sources` command, the README, the PR body, and
the console footer — and it must stay disclosed.

**If you gain access to the real sites, re-verifying every figure against current
manufacturer data sheets is the highest-value work available in this repo.**
Nothing here should be quoted to a customer until that happens.

### 5.2 Trademark and standing disclosure

The site presents as `WHITMORE — AUSTRALIA · DISTRIBUTORSHIP`, which could imply
an appointment that **does not exist**. This was flagged unprompted and mitigated
in four places. Keep all of them:

- boot sequence line: `[ NOTE ] independent proposal — NOT an appointed Whitmore distributor`
- header chip: "Independent proposal"
- a bordered "Standing:" box in the banner
- HUD footer paragraph, and the "what this is not" block in `sources`

The `sources` command also carries the trademark attribution line. Do not remove
it.

### 5.3 Supabase is optional by design

`loadCatalog()` in `lib/supabase.ts` **never throws**. It returns
`{products, source: 'supabase' | 'local', note?}` and the console renders the
bundled seed when Supabase is unconfigured, unreachable or empty — reporting which
one it used in the status bar and in `status`. The console never renders empty.

`ci.yml` deliberately runs **with no Supabase env at all**, because that is the
condition a fresh Vercel deploy hits. Do not add Supabase secrets to CI to make
it "more realistic" — that would delete the coverage.

### 5.4 How the two apps share one deployment

`index.html` stays at the repo root, standalone and zero-build, because that is
what PR #4 intended and `xdg-open index.html` has to keep working.
`scripts/stage-mill.mjs` copies it into `public/mill/` on `predev`/`prebuild`, and
`public/mill/` is gitignored so the file is never committed twice.

`next.config.mjs` rewrites `/mill` → `/mill/index.html`. **This rewrite is
load-bearing**: Next serves public assets by exact path, so bare `/mill` 404s
without it. That was caught in verification, not in review.

### 5.5 Vercel config

`vercel.json` pins no region. `"regions": ["syd1"]` is Pro/Enterprise-only and
**fails a Hobby deploy**. It was removed for that reason; re-add it on a paid plan
to put the functions next to the Australian audience.

### 5.6 Dependency versions

Originally scaffolded on Next 14.2.15, which carries critical CVEs. Upgraded to
Next 16.3 + React 19 mid-session; `npm audit` is clean. Do not downgrade.

---

## 6. Security constraints — treat as non-negotiable

- **`SUPABASE_SERVICE_ROLE_KEY` never leaves the server.** It belongs in GitHub
  Actions secrets or a local shell for the seed script. Never in a `NEXT_PUBLIC_*`
  variable, never committed, never in the browser bundle. Only
  `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` go to Vercel.
- **`products`** — public SELECT for `anon`/`authenticated`. There is deliberately
  **no anon write policy**; writes go through the service role, which bypasses RLS.
- **`enquiries`** — anon INSERT only, with **deliberately no SELECT policy**, so
  the public console can lodge a lead but cannot read the lead list back. This
  omission is intentional. Adding a SELECT policy leaks every enquiry to the world.
- Never disable TLS verification, never unset `HTTPS_PROXY`, and do not retry
  proxy policy denials (403/407) — report them.

---

## 7. Verifying a change

```bash
npm install
npm run typecheck        # tsc --noEmit
npm run build            # also runs prebuild -> stages public/mill
npm run dev              # http://localhost:3000
```

No environment variables are required at any point.

Browser verification used Playwright against the pre-installed Chromium. Two
things that cost time and are worth knowing:

- Executable path is `/opt/pw-browsers/chromium-<build>/chrome-linux/chrome` —
  the build number is part of the path, and guessing it wrong produces a launch
  failure that reads like something else. `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`
  is already set; never run `playwright install`.
- The Playwright package is CommonJS from ESM: `import pkg from '…/playwright/index.js'; const { chromium } = pkg`.

A full pass drives the console across ~10 views, checks `TAB` completion resolves
`spec dec` → `spec decathlon-`, loads `/mill` and asserts its canvases mount, and
collects `console` + `pageerror` output. Last run: both routes 200, no errors.

---

## 8. Outstanding work

### Blocked on the user — cannot be done from a Claude Code container

**Nothing is deployed.** There is no live URL.

Deployment requires authenticating as the repo owner's Vercel account. This
environment has no Vercel credential and `api.vercel.com` returns **403 at the
egress proxy**, so it cannot be done from here. Two paths were prepared:

1. **Vercel Git integration (simpler).** [vercel.com/new](https://vercel.com/new)
   → import `Jeffercopter/Comps` → Deploy. Auto-detects Next.js, no configuration,
   redeploys on every push to `main`.
2. **CI deploy (PR #7, draft).** `.github/workflows/deploy-vercel.yml` deploys
   from a GitHub runner, which does have open egress. Needs one repository secret,
   `VERCEL_TOKEN`. It reports the URL to the job summary and smoke-tests `/` and
   `/mill`, so a deploy that returns a URL but does not serve both routes fails
   the job.

These are **alternatives, not complements** — running both deploys the same commit
twice. If path 1 is chosen, close PR #7 and delete the workflow.

**Supabase was never set up.** No project exists. To enable it: create a project,
run `supabase/schema.sql` in the SQL editor, `npm run seed` with the service role
key exported, then add the two `NEXT_PUBLIC_*` values to Vercel. Run `status` in
the console to confirm it flips from `bundled seed (local)` to `supabase (live)`.
`.github/workflows/seed-supabase.yml` can do the seeding remotely — dispatch-only,
requires typing `seed` to confirm, and needs `SUPABASE_URL` +
`SUPABASE_SERVICE_ROLE_KEY` as repository secrets.

### Open and worth doing

- **PR #7** is a draft awaiting the token decision above.
- **Laurence Davies material has never actually been supplied.** The
  `distributorship` plan section is written from general reasoning. Real input
  from him is the obvious way to sharpen it, and the user has been asked twice.
- Product figures need verification against live manufacturer data sheets (§5.1).

---

## 9. Things not to do

- Do not re-attempt `whitmores.com` or `whitmore.vercel.app` through the proxy.
  It is an organisation policy denial, not a transient failure.
- Do not remove the independent-proposal disclosures (§5.2) or the provenance
  caveat (§5.1).
- Do not add a SELECT policy to `enquiries` (§6).
- Do not make the ROI model incapable of returning a negative result (§4).
- Do not add Supabase env to `ci.yml` (§5.3).
- Do not commit `public/mill/` — it is generated (§5.4).
- Do not re-pin a Vercel region unless the account is on a paid plan (§5.5).
- PR #2 is **merged**. Do not reopen it or stack new work on it; branch fresh
  from `main`.

---

## 10. One-paragraph summary for a cold start

`main` holds a working, security-clean Next.js 16 terminal console for a Whitmore
Australia lubricant distributorship proposal, arguing a move off asphaltic open
gear lubricants onto synthetics across 18 products, an 8-section business plan and
an interactive ROI model — plus a DEM SAG mill simulator served at `/mill` from the
same deployment. It builds green from a bare clone with zero configuration. The
product data was reconstructed from search-indexed public sources because the
manufacturer sites were blocked by proxy policy, and that caveat is disclosed
throughout and still needs resolving. Nothing is deployed yet: the last step needs
a Vercel credential that only the repo owner can produce.
