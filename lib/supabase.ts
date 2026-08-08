import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { PRODUCTS } from '@/lib/data/products'
import type { Product } from '@/lib/types'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Supabase is the system of record for the catalogue, but the site must render
 * with zero configuration — a blocked network or an unprovisioned project falls
 * back to the bundled seed rather than showing an empty console.
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null
  if (!client) {
    client = createClient(url as string, anonKey as string, {
      auth: { persistSession: false },
    })
  }
  return client
}

interface ProductRow {
  slug: string
  name: string
  family: string
  category: Product['category']
  chemistry: Product['chemistry']
  tagline: string
  description: string
  grades: string[]
  applications: string[]
  specs: Product['specs']
  approvals: string[]
  replaces: string[]
  au_priority: Product['auPriority']
  au_note: string
  sources: string[]
}

function fromRow(row: ProductRow): Product {
  return {
    slug: row.slug,
    name: row.name,
    family: row.family,
    category: row.category,
    chemistry: row.chemistry,
    tagline: row.tagline,
    description: row.description,
    grades: row.grades ?? [],
    applications: row.applications ?? [],
    specs: row.specs ?? [],
    approvals: row.approvals ?? [],
    replaces: row.replaces ?? [],
    auPriority: row.au_priority,
    auNote: row.au_note,
    sources: row.sources ?? [],
  }
}

export type CatalogSource = 'supabase' | 'local'

export interface CatalogResult {
  products: Product[]
  source: CatalogSource
  note?: string
}

/**
 * Load the catalogue, preferring Supabase and degrading to the bundled seed.
 * Never throws — the terminal reports the source it actually used via `origin`.
 */
export async function loadCatalog(): Promise<CatalogResult> {
  const supabase = getSupabase()
  if (!supabase) {
    return {
      products: PRODUCTS,
      source: 'local',
      note: 'NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY not set — serving bundled seed.',
    }
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('au_priority', { ascending: true })
      .order('name', { ascending: true })

    if (error) throw new Error(error.message)
    if (!data || data.length === 0) {
      return {
        products: PRODUCTS,
        source: 'local',
        note: 'Supabase reachable but products table is empty — run `npm run seed`.',
      }
    }
    return { products: (data as ProductRow[]).map(fromRow), source: 'supabase' }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { products: PRODUCTS, source: 'local', note: `Supabase query failed (${message}) — serving bundled seed.` }
  }
}

/**
 * Best-effort enquiry capture. Returns a human-readable status either way so a
 * misconfigured backend never silently swallows a lead.
 */
export async function submitEnquiry(input: {
  company: string
  contact: string
  email: string
  interest: string
  message: string
}): Promise<{ ok: boolean; detail: string }> {
  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, detail: 'No Supabase connection configured — enquiry not persisted.' }
  }
  try {
    const { error } = await supabase.from('enquiries').insert({
      company: input.company,
      contact_name: input.contact,
      email: input.email,
      interest: input.interest,
      message: input.message,
    })
    if (error) throw new Error(error.message)
    return { ok: true, detail: 'Enquiry recorded.' }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, detail: `Enquiry not recorded: ${message}` }
  }
}
