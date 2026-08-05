#!/usr/bin/env node
/**
 * Load the bundled catalogue into Supabase.
 *
 *   1. Run supabase/schema.sql against the project first.
 *   2. Export NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 *   3. npm run seed
 *
 * Uses the service role key, so it must only ever run locally or in CI —
 * never in the browser bundle.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('✗ NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set.')
  process.exit(1)
}

// The catalogue lives in TypeScript; parse the exported literal rather than
// adding a build step just to seed. Keeps a single source of truth.
const source = readFileSync(resolve(here, '../lib/data/products.ts'), 'utf8')
const start = source.indexOf('export const PRODUCTS: Product[] = [')
const open = source.indexOf('[', start)
if (start === -1 || open === -1) {
  console.error('✗ Could not locate the PRODUCTS array in lib/data/products.ts')
  process.exit(1)
}

// Balanced-bracket scan that ignores brackets inside string literals.
let depth = 0
let end = -1
let quote = null
for (let i = open; i < source.length; i++) {
  const ch = source[i]
  const prev = source[i - 1]
  if (quote) {
    if (ch === quote && prev !== '\\') quote = null
    continue
  }
  if (ch === "'" || ch === '"' || ch === '`') { quote = ch; continue }
  if (ch === '[') depth++
  else if (ch === ']') {
    depth--
    if (depth === 0) { end = i; break }
  }
}
if (end === -1) {
  console.error('✗ Unbalanced brackets while parsing PRODUCTS.')
  process.exit(1)
}

const literal = source.slice(open, end + 1)
// eslint-disable-next-line no-new-func
const products = new Function(`return (${literal});`)()

const rows = products.map((p) => ({
  slug: p.slug,
  name: p.name,
  family: p.family,
  category: p.category,
  chemistry: p.chemistry,
  tagline: p.tagline,
  description: p.description,
  grades: p.grades,
  applications: p.applications,
  specs: p.specs,
  approvals: p.approvals,
  replaces: p.replaces,
  au_priority: p.auPriority,
  au_note: p.auNote,
  sources: p.sources,
}))

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

const { error } = await supabase.from('products').upsert(rows, { onConflict: 'slug' })
if (error) {
  console.error(`✗ Seed failed: ${error.message}`)
  process.exit(1)
}

console.log(`✓ Upserted ${rows.length} products into ${new URL(url).host}`)
