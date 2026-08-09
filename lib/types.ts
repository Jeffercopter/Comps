export type Category =
  | 'open-gear'
  | 'gearbox-oil'
  | 'grease'
  | 'wire-rope'
  | 'specialty'

export type Chemistry =
  | 'fully-synthetic'
  | 'semi-synthetic'
  | 'non-asphaltic'
  | 'mineral'

export interface SpecRow {
  label: string
  value: string
}

export interface Product {
  /** Stable slug, also the terminal argument. */
  slug: string
  name: string
  family: string
  category: Category
  chemistry: Chemistry
  /** One-line strapline used in list views. */
  tagline: string
  description: string
  /** Grades / pack variants as sold. */
  grades: string[]
  applications: string[]
  specs: SpecRow[]
  /** OEM specifications the product is stated to meet. */
  approvals: string[]
  /** What this displaces in a legacy asphaltic programme. */
  replaces: string[]
  /** Priority for the Australian launch programme. */
  auPriority: 1 | 2 | 3
  /** Notes specific to Australian mining duty cycles. */
  auNote: string
  sources: string[]
}

export interface PlanSection {
  id: string
  title: string
  summary: string
  body: string[]
  metrics?: { label: string; value: string; note?: string }[]
}
