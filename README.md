# WHITMORE//AU — Distributorship Console

A terminal-native website for an Australian distributorship proposal covering the
Whitmore mining lubricant range: open gear lubricants (OGL), enclosed gearbox
oils, extreme-pressure greases and the dragline package — organised around one
commercial argument, **off asphaltics, onto synthetics**.

The whole site is a command console. There are no pages to click through; the
product catalogue, the business plan, the comparison table and an interactive
conversion model are all reached by typing.

---

## Try it

```
help                 every command, grouped
compare              asphaltic vs synthetic, dimension by dimension
products             the full range
spec surtac-2000     one product, full technical sheet
dragline             the machine, point by point, with the four product lines
roi                  interactive conversion model — move the assumptions
plan                 the business plan, section by section
au                   the Australian distributorship structure
stock                stocking plan by launch priority
sources              where the data came from, and what it is not
```

`TAB` completes (to the longest common prefix, like a real shell), `↑`/`↓`
recall history, `CTRL+L` clears, and any highlighted token in the output is
clickable. `?cmd=compare` on the URL runs a command on load, so any view is
linkable.

Three phosphor themes (`theme amber|green|ice`), CRT emulation (`crt on|off`)
and a telemetry panel (`hud on|off`) — all persisted to `localStorage`.

---

## Stack

| Layer    | Choice                                    |
| -------- | ----------------------------------------- |
| Framework| Next.js 14 (App Router), React 18, TypeScript |
| Styling  | Tailwind CSS with CSS-variable phosphor themes |
| Data     | Supabase (Postgres + RLS)                 |
| Hosting  | Vercel (`syd1` region)                    |

### Layout

```
app/                 layout, page, global CSS, icon
components/          Console (shell), Hud, Backdrop (canvas), Roi, Enquiry, renderers
lib/data/            product catalogue + business plan (bundled seed)
lib/terminal/        command registry, completion, ASCII art
lib/supabase.ts      client with automatic fallback to the bundled seed
supabase/schema.sql  tables, RLS policies, triggers
scripts/seed-supabase.mjs  loads the catalogue into Supabase
```

The catalogue is fetched server-side on request (`revalidate = 3600`). If
Supabase is unconfigured, unreachable or empty, the console serves the bundled
seed and says so in the status bar and in `status` — it never renders empty.

---

## Running locally

```bash
npm install
npm run dev            # http://localhost:3000
```

No environment variables are required to run. Supabase is optional.

```bash
npm run build          # production build
npm run typecheck      # tsc --noEmit
```

---

## Deploying

### Vercel (Supabase not required)

The console renders completely with no environment variables at all — it falls
back to the bundled catalogue and reports that in the status bar. So the fastest
path is to deploy first and wire Supabase up later, or never.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FJeffercopter%2FComps)

Or from the dashboard: **Add New → Project → import `Jeffercopter/Comps`**.
Vercel detects Next.js on its own; accept every default and deploy. Set the
production branch under Settings → Git if you want it tracking a branch other
than `main`.

From the CLI:

```bash
npx vercel link
npx vercel --prod
```

No region is pinned in `vercel.json`, because pinning one is restricted to Pro
and Enterprise plans and will fail a Hobby deploy. On a paid plan, add
`"regions": ["syd1"]` to put the functions next to the audience.

### 1. Supabase (optional)

Create a project, then in the SQL editor run [`supabase/schema.sql`](supabase/schema.sql).
It creates:

- `products` — public **read-only** under RLS. Writes are reserved for the
  service role, which bypasses RLS; no anon write policy exists.
- `enquiries` — anon **insert-only**. The public console can lodge a lead but
  deliberately has no `select` policy, so it cannot read the lead list back.

Then load the catalogue:

```bash
export NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
npm run seed
```

The service role key is server-side only. Keep it out of the repo and out of any
`NEXT_PUBLIC_*` variable.

### 2. Point the deployment at it

```bash
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel --prod
```

Or add the same two variables under Project → Settings → Environment Variables
and redeploy. Only the two `NEXT_PUBLIC_*` values belong on Vercel — the service
role key is for the local seed script and nothing else.

Run `status` in the console afterwards to confirm it flipped from
`bundled seed (local)` to `supabase (live)`.

---

## On the data

Product information was compiled from publicly indexed Whitmore product pages,
technical data sheets and authorised distributor listings. Direct access to
`whitmores.com` was not available from the build environment, so **figures should
be verified against the current manufacturer technical data sheet before being
quoted to a customer**. Run `sources` in the console for the reference list.

This is an independent distributorship proposal. It is not a manufacturer
publication and is not endorsed by Whitmore or CSW Industrials. Australian launch
positioning, product priorities and all commercial framing are our own
interpretation, not manufacturer claims. The ROI model is a model — every input
is an assumption a customer should be invited to argue with.
