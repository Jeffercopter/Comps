import type { PlanSection } from '@/lib/types'

/**
 * The business plan the console exists to support: appointment of an
 * Australian distributorship for the Whitmore mining lubricant range, with
 * the asphaltic-to-synthetic transition as the commercial wedge.
 */
export const PLAN: PlanSection[] = [
  {
    id: 'thesis',
    title: 'Thesis',
    summary: 'Australia still runs asphaltics. That is the opening.',
    body: [
      'Asphaltic open gear lubricants were the industry standard until the early 1990s, when concern about the effect of the diluents on the ozone layer — and the possible carcinogenicity of the carrier — pushed them out of favour in most developed markets.',
      'Three decades later, a meaningful share of Australian surface mining equipment is still lubricated on asphaltic or solvent-cutback chemistry, or on first-generation replacements that never delivered the consumption reduction they promised.',
      'The technical case for conversion is settled. Historic asphaltic products carried Timken OK loads in the order of 20 to 25 pounds and required large applied volumes to achieve protection. Modern non-asphaltic and synthetic formulations deliver stronger film protection at a fraction of the applied volume, with cleaner shutdowns and simpler waste characterisation.',
      'What is missing in Australia is not the product. It is a distributor with the technical depth to run the conversion — survey the gearing, model the consumption, commission the spray system, and stay on site through the first three months when the old film is still purging.',
      'That is the business. Not selling drums. Selling conversions.',
    ],
    metrics: [
      { label: 'Consumption reduction', value: '~50%', note: 'Surtac 2000 vs asphaltic fluids' },
      { label: 'Legacy Timken OK load', value: '20–25 lb', note: 'typical asphaltic OGL' },
      { label: 'Whitmore heritage', value: '116+ yrs', note: 'gear, bearing, chain, rope lubrication' },
      { label: 'Global distributors', value: '130+', note: 'authorised network' },
    ],
  },
  {
    id: 'market',
    title: 'Market',
    summary: 'Bowen Basin, Hunter Valley, Pilbara. Draglines, shovels, mills.',
    body: [
      'The addressable Australian fleet concentrates in three basins. The Bowen Basin and Hunter Valley carry the walking draglines and the large rope shovels — the machines where open gear lubricant consumption is measured in tonnes per year per machine, not drums. The Pilbara carries the crushing and grinding circuits, where girth gear conversion on SAG and ball mills is the equivalent opportunity.',
      'Whitmore product is already in use on a majority of draglines globally. The Australian gap is distribution and technical service, not product acceptance — which means the sales conversation starts from reference sites rather than from first principles.',
      'Demand for synthetic and semi-synthetic open gear formulations is rising specifically in the regions where mining is expanding — Australia, Chile and Africa are named repeatedly in market analysis. The Australian buyer is not being asked to be a pioneer.',
      'Secondary markets sit adjacent and require no additional range: cement and lime kilns, alumina calcination, steel processing, and the sand and gravel sector. Each buys the same Decathlon and Envirolube chemistry against different equipment.',
    ],
    metrics: [
      { label: 'Primary basins', value: '3', note: 'Bowen, Hunter, Pilbara' },
      { label: 'Core machine classes', value: '4', note: 'draglines, shovels, mills, kilns' },
      { label: 'Adjacent verticals', value: '5', note: 'cement, alumina, steel, power, aggregate' },
    ],
  },
  {
    id: 'wedge',
    title: 'The Wedge — Asphaltics Out, Synthetics In',
    summary: 'One conversion argument, four independent proof points.',
    body: [
      'CONSUMPTION. Surtac 2000 reduces lubricant consumption by approximately 50% against asphaltic fluids. That is a direct, auditable line item — halve the tonnes and you halve the product spend, the freight, the drum handling and the pumping hours behind it.',
      'CLEAN-DOWN. Envirolube XE contains no asphalt, and the spent lubricant does not harden over time. Asphaltic residue sets in the tooth root and has to be chipped out during a shut. Removing that task removes shut hours from the critical path, and shut hours are the most expensive hours a mine owns.',
      'ENVIRONMENTAL AND WASTE. The Envirolube Heavy line is formulated TCLP-safe. Non-asphaltic Surtac carries no asphalt, no solvents and no lead. This turns a waste-characterisation liability into a compliance advantage the site can put in its own reporting.',
      'INSPECTABILITY. Decathlon Gold runs clear rather than black. A reliability engineer can photograph the tooth contact pattern during a walk-around instead of scheduling a wash-down to see the gear. Condition monitoring becomes continuous rather than periodic.',
      'The four arguments are independent. A site that rejects the environmental case on cost grounds still cannot argue with halved consumption, and a site indifferent to consumption still wants its shut hours back. That redundancy is what makes the conversion pitch resilient across different buyer personalities.',
    ],
    metrics: [
      { label: 'Product spend', value: '↓ ~50%', note: 'applied volume reduction' },
      { label: 'Shut clean-down', value: 'Eliminated', note: 'no hardening residue' },
      { label: 'Lead / asphalt / solvent', value: 'Zero', note: 'Surtac 2000 formulation' },
      { label: 'Visual inspection', value: 'Enabled', note: 'clear synthetic film' },
    ],
  },
  {
    id: 'distributorship',
    title: 'Australian Distributorship',
    summary: 'Exclusive mining-sector appointment, technical-service led.',
    body: [
      'STRUCTURE. An exclusive Australian appointment for the mining and heavy industry range, operating within the Whitmore global distributor network — the same structure the manufacturer runs across Africa, Europe, the Middle East, Russia, Asia and Australasia through its international channel management.',
      'DIFFERENTIATION. The appointment is won and defended on technical service, not price. The distributor performs the gear survey, models the conversion, commissions and tunes the spray system, and audits consumption against the model at 30, 90 and 180 days. That service wrapper is the moat; anyone can freight a drum.',
      'STOCKING. Local inventory of the priority-one SKUs — Envirolube XE Extreme, Surtac 2000, Decathlon Extreme — held against forecast rather than order. Long ocean freight from the United States makes stock position, not price, the deciding factor when a dragline is down.',
      'COVERAGE. Queensland and New South Wales served from a Mackay or Newcastle base against the dragline and shovel fleet. Western Australia served from Perth against the grinding circuits and the alumina refineries. Technical staff resident in the basin, not flying in.',
      'PULL-THROUGH. Open gear conversion opens the enclosed gearbox, grease and wire rope lines on the same relationship. A single dragline conversion carries Surtac 2000, Decathlon Extreme, Caliber 3M/5M and Drag Rope Lubricant HF — four lines from one technical engagement.',
    ],
    metrics: [
      { label: 'Model', value: 'Exclusive', note: 'mining & heavy industry range' },
      { label: 'Stocked P1 SKUs', value: '3', note: 'Envirolube XE, Surtac 2000, Decathlon Extreme' },
      { label: 'Service bases', value: '3', note: 'Mackay / Newcastle / Perth' },
      { label: 'Lines per conversion', value: '4', note: 'OGL, gearbox, grease, rope' },
    ],
  },
  {
    id: 'operating',
    title: 'Operating Model',
    summary: 'Survey → model → convert → audit. Repeat per machine.',
    body: [
      'SURVEY. Gear condition, tooth profile wear, existing spray system configuration, current product and applied volume, shut history. Output is a baseline consumption figure the customer signs off on — without an agreed baseline there is no provable saving.',
      'MODEL. Product selection against duty and ambient. Projected applied volume, projected consumption reduction, projected clean-down hours removed. Delivered as a written conversion proposal with the assumptions visible, not a brochure.',
      'CONVERT. Product changeover scheduled against a planned shut. Spray system re-nozzled and re-timed for the new viscosity. Purge period managed — the old asphaltic film continues to shed for weeks and a site that is not warned reads that as product failure.',
      'AUDIT. Consumption measured at 30, 90 and 180 days against the model. Tooth contact pattern photographed. Variance reported honestly, including where the model was optimistic. The audit is what converts one machine into a fleet.',
      'The audit step is the commercially important one and the one most distributors skip. A signed 90-day audit showing measured consumption against a written prediction is the only sales asset that survives a change of maintenance superintendent.',
    ],
    metrics: [
      { label: 'Stages', value: '4', note: 'survey, model, convert, audit' },
      { label: 'Audit points', value: '30/90/180 d' },
      { label: 'Baseline', value: 'Customer-signed', note: 'precondition for provable saving' },
    ],
  },
  {
    id: 'commercial',
    title: 'Commercial Model',
    summary: 'Sell the delivered cost of lubrication, not the price per kilogram.',
    body: [
      'A synthetic or non-asphaltic OGL carries a higher price per kilogram than the asphaltic product it replaces. Any conversation conducted on unit price is lost before it starts.',
      'The unit of sale is therefore annual delivered cost of lubrication per machine: product, freight, drum handling, pumping labour, shut clean-down hours, and gear life. Halved consumption at a higher unit price still lands materially below the incumbent on that basis, and the shut hours are effectively free upside.',
      'Gear replacement is the tail risk that dwarfs all of it. A girth gear or swing rack change is a capital event. Any product argument that measurably extends gear life is worth more than the entire annual lubricant spend, and should be presented that way rather than buried in a technical appendix.',
      'Commercial terms follow the service model: annual supply agreements priced against a modelled consumption volume, with the audit as the review mechanism. This aligns the distributor with reduced consumption instead of against it — a supplier paid per tonne has no reason to help a customer use less.',
    ],
    metrics: [
      { label: 'Unit of sale', value: 'Cost / machine / yr' },
      { label: 'Price per kg', value: 'Higher', note: 'and irrelevant in isolation' },
      { label: 'Contract form', value: 'Annual, modelled volume' },
      { label: 'Alignment', value: 'Paid to reduce consumption' },
    ],
  },
  {
    id: 'roadmap',
    title: 'Roadmap',
    summary: 'Reference machine, then basin, then range.',
    body: [
      'PHASE 1 — REFERENCE (months 0–6). Appointment executed. Priority-one stock landed. One dragline and one grinding circuit converted at cost, on the explicit condition that the 90-day audit may be published. The reference site is the entire phase-one deliverable.',
      'PHASE 2 — BASIN (months 6–18). Convert across the Bowen Basin and Hunter Valley off the reference audit. Resident technical staff in Mackay and Newcastle. Pull enclosed gearbox oil and grease lines through the accounts already converted on open gear.',
      'PHASE 3 — RANGE (months 18–36). Western Australia grinding circuits and alumina calcination. Adjacent verticals — cement, steel, power generation, aggregate — off the same Decathlon and Envirolube chemistry. Consolidation proposals that collapse a site lube store onto a single supplier.',
      'The sequencing matters. Attempting basin-wide conversion without a published local audit means arguing from United States reference data to an Australian maintenance superintendent, which is a materially weaker position than arguing from the machine down the road.',
    ],
    metrics: [
      { label: 'Phase 1', value: '0–6 mo', note: 'reference conversions' },
      { label: 'Phase 2', value: '6–18 mo', note: 'basin rollout' },
      { label: 'Phase 3', value: '18–36 mo', note: 'range + adjacent verticals' },
    ],
  },
  {
    id: 'risk',
    title: 'Risk Register',
    summary: 'Stated plainly, with the mitigation that actually applies.',
    body: [
      'PURGE MISREAD AS FAILURE. The residual asphaltic film sheds for weeks after conversion and looks like the new product breaking down. Mitigation: warn in writing before the shut, photograph weekly, and make the purge curve part of the signed proposal.',
      'FREIGHT AND LEAD TIME. Product ships from the United States. A dragline down waiting on a container is an account lost permanently. Mitigation: forecast-based stocking of priority-one SKUs, held locally, funded as a cost of market entry rather than treated as working capital to be minimised.',
      'PRICE-LED PROCUREMENT. A procurement function measured on unit price will reject the range on the first line of the quote. Mitigation: engage reliability and maintenance engineering ahead of procurement, and arrive at the commercial conversation with a signed consumption baseline already in hand.',
      'INCUMBENT RESPONSE. Established suppliers will discount aggressively against a credible conversion programme. Mitigation: compete on the audit, not the quote. A measured 90-day consumption result is not answerable with a discount.',
      'SPRAY SYSTEM MISMATCH. Systems tuned for asphaltic viscosity will misapply a different-viscosity product and generate a false failure. Mitigation: re-nozzling and re-timing are non-negotiable inclusions in every conversion, not optional extras.',
      'TECHNICAL DEPTH. The model depends on people who can walk a dragline and read a tooth contact pattern. Mitigation: hire from mine maintenance rather than from lubricant sales, and resource the manufacturer training before the first conversion, not after.',
    ],
    metrics: [
      { label: 'Risks tracked', value: '6' },
      { label: 'Highest severity', value: 'Freight / lead time' },
      { label: 'Most common', value: 'Purge misread' },
    ],
  },
]

export const ASPHALTIC_COMPARISON = {
  columns: ['Dimension', 'Legacy asphaltic', 'Whitmore synthetic / non-asphaltic'],
  rows: [
    ['Base chemistry', 'Asphalt / bitumen, often solvent cut-back', 'Synthetic polymer, resin, high-viscosity distillate'],
    ['Applied volume', 'High — volume substitutes for film strength', 'Approximately half (Surtac 2000 vs asphaltic)'],
    ['Timken OK load (legacy typical)', '20–25 lb', 'Extreme-pressure additised, solids-reinforced'],
    ['Spent film', 'Hardens; must be chipped from the tooth root', 'Does not harden; remains removable'],
    ['Shutdown clean-down', 'Scheduled labour on the critical path', 'Largely eliminated'],
    ['Lead content', 'Present in legacy formulations', 'None'],
    ['Solvent carrier', 'Common; ozone and health concerns from the 1990s', 'None'],
    ['Waste characterisation', 'Problematic', 'TCLP-safe grades available'],
    ['Water washout', 'Emulsifies and sheds in rain', 'GearMate 1000 does not emulsify'],
    ['Gear inspection', 'Opaque black film — requires wash-down', 'Decathlon Gold runs clear — inspect in place'],
    ['Dust behaviour', 'Tacky film captures dust, becomes lapping paste', 'Surtac 2000 leaves a matte, non-greasy film'],
    ['Unit price', 'Lower per kilogram', 'Higher per kilogram, lower per machine-year'],
  ],
}
