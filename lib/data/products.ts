import type { Product } from '@/lib/types'

const WHITMORE_OGL = 'https://www.whitmores.com/lubricants/open-gear-lubricants'
const WHITMORE_DRAGLINE = 'https://www.whitmores.com/applications/draglines-shovels'
const WHITMORE_MINING = 'https://www.whitmores.com/industries/mining'
const WHITMORE_EP = 'https://www.whitmores.com/lubricants/extreme-pressure-greases'
const WHITMORE_SYNTH = 'https://www.whitmores.com/lubricants/synthetic'

/**
 * Catalogue assembled from publicly indexed Whitmore product pages, technical
 * data sheets and distributor listings. Figures quoted verbatim from those
 * sources are marked in `specs`; anything framed as an Australian launch
 * position is our commercial interpretation, not a manufacturer claim.
 */
export const PRODUCTS: Product[] = [
  // ── OPEN GEAR LUBRICANTS ────────────────────────────────────────────────
  {
    slug: 'envirolube-xe-extreme',
    name: 'Envirolube® XE Extreme',
    family: 'Envirolube',
    category: 'open-gear',
    chemistry: 'semi-synthetic',
    tagline: "Whitmore's most recommended open gear lubricant. Asphalt-free.",
    description:
      'A blend of high viscosity petroleum distillate, synthetic polymer and resins, entirely free of asphalt. Because the spent lubricant does not harden over time, shutdown clean-down is dramatically simplified compared with an asphaltic film that sets hard in the root of the tooth. The dense residual film plus dedicated extreme-pressure chemistry keeps the tooth flank separated under the shock loading that characterises mill and dragline duty.',
    grades: ['Envirolube XE Extreme', 'Envirolube XE Extreme Heavy'],
    applications: [
      'Girth gears on SAG, ball and rod mills',
      'Kiln and dryer girth gears',
      'Dragline swing rack and drum gearing',
      'Intermittent spray lubrication systems',
    ],
    specs: [
      { label: 'Base', value: 'High-viscosity distillate + synthetic polymer/resin' },
      { label: 'Asphalt content', value: 'None' },
      { label: 'Solvent', value: 'Non-solvent-cutback residual film' },
      { label: 'Spent film behaviour', value: 'Does not harden — remains removable' },
      { label: 'Application', value: 'Automatic spray, intermittent spray, manual' },
    ],
    approvals: [
      'Meets Falk open gear specifications',
      'Meets Metso Minerals open gear specifications',
      'Meets FLSmidth requirements when used in intermittent spray systems',
    ],
    replaces: ['Asphaltic/bitumen OGL', 'Solvent-cutback open gear compounds'],
    auPriority: 1,
    auNote:
      'Lead SKU for the Australian mill conversion programme. The no-hardening claim is the single most persuasive argument to a Pilbara or Bowen Basin reliability engineer who has scraped set asphalt out of a girth gear root during a shut.',
    sources: [WHITMORE_OGL, 'https://www.whitmores.com/products/envirolube-xe-extreme'],
  },
  {
    slug: 'envirolube-heavy-tclp',
    name: 'Envirolube® Heavy TCLP-Safe',
    family: 'Envirolube',
    category: 'open-gear',
    chemistry: 'semi-synthetic',
    tagline: 'Heavy-grade asphalt-free OGL for hot or worn gear sets.',
    description:
      'The heavy grade of the Envirolube family, formulated TCLP-safe so that spent lubricant and contaminated waste are simpler to characterise for disposal. Meets or exceeds the requirements of major OEMs for open gear lubricants; the combination of a dense protective film with specialised extreme-pressure additives sustains smooth operation under severe load. Specified where gears run hot or where wear has already opened up the tooth profile.',
    grades: ['Heavy TCLP-Safe', 'Heavy TCLP-Safe P2', 'Heavy TCLP-Safe w/Li'],
    applications: [
      'Heated mills operating up to 220°F (105°C)',
      'Badly worn gear sets needing extra film thickness',
      'Applications with waste-characterisation constraints',
    ],
    specs: [
      { label: 'Max application temp', value: '220°F / 105°C (heated mills)' },
      { label: 'Waste profile', value: 'TCLP-safe formulation' },
      { label: 'Film', value: 'Dense residual + EP additive package' },
      { label: 'Packs', value: 'Pail, keg, drum, tote' },
    ],
    approvals: ['Meets or exceeds major OEM open gear lubricant requirements'],
    replaces: ['Heavy asphaltic OGL', 'Lead-containing legacy gear compounds'],
    auPriority: 1,
    auNote:
      'TCLP-safe positioning maps directly onto Australian site waste-tracking obligations and makes the environmental case without needing a lab argument.',
    sources: [WHITMORE_OGL, 'https://www.whitmores.com/lubricants/open-gear-lubricants'],
  },
  {
    slug: 'surtac-2000',
    name: 'Surtac® 2000',
    family: 'Surtac',
    category: 'open-gear',
    chemistry: 'non-asphaltic',
    tagline: 'Multiservice dragline lubricant. ~50% less consumption than asphaltics.',
    description:
      'The multiservice workhorse of the dragline product line. Surtac 2000 forms a protective coating on metal without asphalt, solvents or lead. It carries graphite and molybdenum disulfide, and specialised carrier chemistry bonds those solids to the metal surface as a dense grey film that minimises metal-to-metal contact and wear. Correctly applied it leaves a matte, non-greasy film, which is a decisive advantage in very dusty environments where a tacky film simply becomes a grinding paste.',
    grades: ['Surtac 2000', 'Surtac 2000 RD', 'Surtac 2000 HD', 'Surtac 2000 XD'],
    applications: [
      'Dragline open gears',
      'Swing racks and house rails',
      'House rollers and drum laggings',
      'Wire ropes',
      'Slow-moving heavily loaded bushings and bearings',
    ],
    specs: [
      { label: 'Solid lubricants', value: 'Graphite + MoS₂' },
      { label: 'Thickener (XD/HD)', value: 'Bentone base' },
      { label: 'Asphalt / solvent / lead', value: 'None' },
      { label: 'Consumption vs asphaltic', value: 'Reduced by approximately 50%' },
      { label: 'Film appearance', value: 'Matte, non-greasy, dust-shedding grey' },
    ],
    approvals: ['Widely specified on surface mining draglines'],
    replaces: ['Asphaltic dragline compounds', 'Lead-based open gear grease'],
    auPriority: 1,
    auNote:
      'The consumption argument carries the business case on its own: halving OGL draw on a large dragline removes both product cost and the labour and pumping time behind it.',
    sources: [WHITMORE_DRAGLINE, 'https://www.whitmores.com/products/surtac-2000'],
  },
  {
    slug: 'gearmate-1000',
    name: 'GearMate® 1000 / 1000 ICT',
    family: 'GearMate',
    category: 'open-gear',
    chemistry: 'semi-synthetic',
    tagline: "The toughest lubricant in the range. Built for draglines and shovels.",
    description:
      "Whitmore's toughest open gear lubricant, recommended specifically for draglines and shovels. It contains a high molecular weight polymer that resists drying, oxidation and thermal decomposition, so the film survives long exposure between applications. Critically for open-air mining equipment, it does not emulsify in water — the film stays on the tooth through rain, ice and snow rather than washing into the pit. The ICT variant extends cold-temperature pumpability.",
    grades: ['GearMate 1000', 'GearMate 1000 ICT'],
    applications: [
      'Dragline and mining shovel open gears',
      'Severe exposed applications with long re-lube intervals',
      'Equipment operating in persistent wet conditions',
    ],
    specs: [
      { label: 'Polymer', value: 'High molecular weight, oxidation resistant' },
      { label: 'Water behaviour', value: 'Does not emulsify' },
      { label: 'Weather', value: 'Rated for rain, ice and snow exposure' },
      { label: 'Thermal', value: 'Resists drying and thermal decomposition' },
    ],
    approvals: ['Specified for dragline and shovel open gearing'],
    replaces: ['Asphaltic OGL on exposed gearing'],
    auPriority: 2,
    auNote:
      'Water resistance is the hook for Queensland wet-season operation, where an emulsifying film is washed off the rack during the monsoon and the gear runs dry into the next shift.',
    sources: [WHITMORE_OGL, 'https://www.whitmores.com/products/gearmate-1000-ict'],
  },
  {
    slug: 'decathlon-gold',
    name: 'Decathlon® Gold',
    family: 'Decathlon',
    category: 'open-gear',
    chemistry: 'fully-synthetic',
    tagline: 'Clean synthetic high-viscosity OGL. Down to 20°F (-7°C).',
    description:
      'A clean, environmentally-considerate, high-viscosity synthetic oil that wets and protects even the most heavily loaded gears. Decathlon Gold is the visual opposite of an asphaltic product — it runs clear rather than black, so gear tooth condition can be inspected without a wash-down, which changes how a reliability team monitors the asset. Contains no hazardous materials. Available across a viscosity ladder from semi-synthetic to fully synthetic super heavy.',
    grades: ['Decathlon Gold (semi-synthetic)', 'Decathlon Gold Heavy (semi-synthetic)', 'Decathlon Gold Super Heavy (fully synthetic)'],
    applications: [
      'Kiln girth gears',
      'Ball mill and SAG mill gearing',
      'Dryers and pelletizers',
      'Cold-climate open gear service',
    ],
    specs: [
      { label: 'Lower temp limit', value: '20°F / -7°C' },
      { label: 'Hazardous materials', value: 'None' },
      { label: 'Appearance', value: 'Clear — permits visual gear inspection' },
      { label: 'Typical OGL viscosity band', value: '≈15,000–18,000 cSt @ 40°C' },
    ],
    approvals: ['Formulated for heavily loaded kiln, mill and pelletizer gearing'],
    replaces: ['Black asphaltic OGL where inspection visibility matters'],
    auPriority: 2,
    auNote:
      'Sell this on inspectability. A clear film lets a fitter photograph tooth contact pattern during a walk-around — an asphaltic film makes that impossible.',
    sources: [WHITMORE_OGL, 'https://www.whitmores.com/products/decathlon-gold', WHITMORE_SYNTH],
  },
  {
    slug: 'surstik-800',
    name: 'SurStik® 800',
    family: 'SurStik',
    category: 'open-gear',
    chemistry: 'non-asphaltic',
    tagline: 'High-performance EP open gear lubricant across four viscosity grades.',
    description:
      'A high-performance extreme-pressure lubricant designed for use on open gears, supplied across a viscosity ladder so that a single chemistry can be matched to ambient temperature and gear condition rather than forcing one grade across a whole fleet. The Arctic grade extends the range into cold-start service; Extra Heavy covers worn gearing and elevated operating temperature.',
    grades: ['SurStik 800 Arctic', 'SurStik 800 Medium', 'SurStik 800 Heavy', 'SurStik 800 Extra Heavy'],
    applications: [
      'Open gears across mining and heavy industry',
      'Seasonal grade-switching programmes',
      'Worn gear sets requiring additional film',
    ],
    specs: [
      { label: 'Grades', value: 'Arctic / Medium / Heavy / Extra Heavy' },
      { label: 'Additive', value: 'Extreme pressure' },
      { label: 'Packs', value: 'Pail, keg, drum, tote' },
    ],
    approvals: ['Specified for open gear service in mining'],
    replaces: ['Single-grade asphaltic programmes'],
    auPriority: 3,
    auNote:
      'Useful as the range product for sites that want summer/winter grade discipline across the Bowen Basin temperature swing.',
    sources: [WHITMORE_MINING, WHITMORE_OGL],
  },

  // ── ENCLOSED GEARBOX OILS ───────────────────────────────────────────────
  {
    slug: 'decathlon-extreme',
    name: 'Decathlon® Extreme',
    family: 'Decathlon',
    category: 'gearbox-oil',
    chemistry: 'fully-synthetic',
    tagline: 'Synthetic enclosed gear oil. ISO 150–680. Meets GE D50E35.',
    description:
      'Formulated to meet the exacting demands of gearboxes operating under the most challenging conditions: heavy load, shock loading and frequent reversing action — which is a precise description of a dragline hoist, drag and swing gearbox. The fully synthetic base oil blend delivers maximum viscosity stability across a wide temperature range, and the anti-oxidant package is targeted at exactly the duty where conventional mineral gear oils shorten their life. Available ISO 150 through 680.',
    grades: ['ISO 150', 'ISO 220', 'ISO 320', 'ISO 460', 'ISO 680'],
    applications: [
      'Dragline hoist, drag and swing gearboxes',
      'Shovel gearcases',
      'Off-highway haul truck gearboxes (Komatsu, Terex, Hitachi)',
      'Gearboxes exposed to external heat or cold',
    ],
    specs: [
      { label: 'Base oil', value: 'Fully synthetic blend' },
      { label: 'ISO VG range', value: '150 – 680' },
      { label: 'Viscosity stability', value: 'Maximised across temperature swing' },
      { label: 'Duty', value: 'Heavy load, shock load, frequent reversing' },
      { label: 'Additives', value: 'Anti-oxidant + EP' },
    ],
    approvals: [
      'Meets GE specification D50E35 for off-highway vehicle gearboxes',
      'Suitable for Komatsu, Terex and Hitachi haul truck gearboxes',
    ],
    replaces: ['Conventional mineral enclosed gear oils under severe duty'],
    auPriority: 1,
    auNote:
      'The pull-through product. Once a site converts open gear to synthetic, the enclosed gearbox conversation follows on the same shut — one distributor, one technical relationship, two revenue lines.',
    sources: ['https://www.whitmores.com/products/decathlon-extreme', WHITMORE_DRAGLINE],
  },
  {
    slug: 'decathlon-pag',
    name: 'Decathlon® PAG',
    family: 'Decathlon',
    category: 'gearbox-oil',
    chemistry: 'fully-synthetic',
    tagline: 'Polyalkylene glycol oil for trunnions and extreme-temperature gearboxes.',
    description:
      'A synthetic polyalkylene glycol oil formulated to protect trunnion bearings on kilns and dryers, and heavily loaded enclosed gearboxes operating at exceptionally high or low temperatures. PAG chemistry brings a markedly higher viscosity index and lower traction coefficient than mineral equivalents, which shows up as reduced operating temperature in the gearcase rather than as a number on a data sheet.',
    grades: ['Decathlon PAG (multiple ISO grades)'],
    applications: [
      'Kiln and dryer trunnion bearings',
      'Heavily loaded enclosed gearboxes',
      'Exceptionally high or low ambient operation',
    ],
    specs: [
      { label: 'Base oil', value: 'Polyalkylene glycol (PAG)' },
      { label: 'Temperature envelope', value: 'Exceptionally high and low' },
      { label: 'Target', value: 'Trunnion bearings, heavily loaded gearcases' },
    ],
    approvals: ['Formulated for kiln and dryer trunnion service'],
    replaces: ['Mineral trunnion oils', 'Conventional high-temp gear oils'],
    auPriority: 3,
    auNote:
      'Not a dragline product. Carried for the cement and alumina calcination accounts that sit alongside the mining base in Queensland and Western Australia.',
    sources: [WHITMORE_SYNTH, 'https://www.whitmores.com/applications/kilns'],
  },

  // ── EXTREME PRESSURE GREASES ────────────────────────────────────────────
  {
    slug: 'caliber-blue',
    name: 'Caliber™ Blue EP',
    family: 'Caliber',
    category: 'grease',
    chemistry: 'semi-synthetic',
    tagline: 'Light-coloured SL-Tech solids. -37°C to 95°C.',
    description:
      'An extreme-pressure grease for heavy-duty plant lubrication, earthmoving equipment and any application involving extreme pressure at slow to medium speeds. Wear protection under high load comes from SL-Tech, a proprietary blend of light-coloured solid lubricants that forms a protective cushion and delivers greater extreme-pressure performance than MoS₂ or graphite. The light colour is not cosmetic: it makes purge and contamination visible at the bearing, which is how a lube tech confirms a point actually took grease.',
    grades: ['Caliber Blue EP 1', 'Caliber Blue EP 2'],
    applications: [
      'Earthmoving equipment pins and bushings',
      'Heavy-duty plant lubrication',
      'Extreme pressure at slow to medium speed',
    ],
    specs: [
      { label: 'Solid lubricant', value: 'SL-Tech light-coloured solids' },
      { label: 'EP performance', value: 'Exceeds MoS₂ and graphite systems' },
      { label: 'Temperature range', value: '-35°F to ~200°F (-37°C to 95°C)' },
      { label: 'NLGI grades', value: 'EP 1, EP 2' },
    ],
    approvals: ['Specified for heavy earthmoving and plant service'],
    replaces: ['Moly-loaded black EP greases where purge visibility matters'],
    auPriority: 2,
    auNote:
      'Strong fit for the contract-mining fleets, where visible purge at the pin is the difference between a completed lube round and an assumed one.',
    sources: [WHITMORE_EP, 'https://www.whitmores.com/lubricants/extreme-pressure-greases'],
  },
  {
    slug: 'caliber-xr',
    name: 'Caliber® XR',
    family: 'Caliber',
    category: 'grease',
    chemistry: 'semi-synthetic',
    tagline: 'The most robust lithium-based bearing grease in the range.',
    description:
      'Designed for heavy duty applications where the most severe high and shock loads are encountered. Caliber XR combines high fluid viscosity, effective extreme-pressure and anti-wear additives, and solid lubricants. It is the most robust lithium-based bearing grease Whitmore make, and it is aimed squarely at the joints that fail first: slew rings, roll stands, and the heavily loaded bearings in mills and grinders.',
    grades: ['Caliber XR EP 1', 'Caliber XR EP 2'],
    applications: [
      'Slew rings on mining and forestry equipment',
      'Steel mill roll stands',
      'Heavily loaded mills and grinders',
      'Shock-loaded bearings',
    ],
    specs: [
      { label: 'Thickener', value: 'Lithium' },
      { label: 'Fluid viscosity', value: 'High' },
      { label: 'Additives', value: 'EP + anti-wear + solid lubricants' },
      { label: 'Duty', value: 'Most severe high and shock loading' },
    ],
    approvals: ['Specified for slew ring and roll stand service'],
    replaces: ['Standard lithium EP2 under shock loading'],
    auPriority: 2,
    auNote:
      'Slew ring wear on excavators is a recurring Australian warranty argument. A grease specified for the duty is an easy technical win.',
    sources: [WHITMORE_EP, 'https://www.whitmores.com/products/caliber-xr'],
  },
  {
    slug: 'caliber-3m-5m',
    name: 'Caliber™ 3M / 5M',
    family: 'Caliber',
    category: 'grease',
    chemistry: 'semi-synthetic',
    tagline: 'Purpose-built for dragline and shovel greasing.',
    description:
      'The 3M and 5M grades are designed primarily for use in mining equipment — specifically draglines and shovels. They sit in the automatic lubrication systems that feed the boom point, shipper shaft and propel bearings, where pumpability over long line runs matters as much as the film strength at the point of application.',
    grades: ['Caliber 3M', 'Caliber 5M'],
    applications: [
      'Dragline automatic lubrication systems',
      'Mining shovel greasing circuits',
      'Long-line centralised systems',
    ],
    specs: [
      { label: 'Target equipment', value: 'Draglines and mining shovels' },
      { label: 'Delivery', value: 'Centralised / automatic lubrication systems' },
      { label: 'Family', value: 'Caliber extreme-pressure line' },
    ],
    approvals: ['Specified for dragline and shovel service'],
    replaces: ['General-purpose EP greases in mining auto-lube circuits'],
    auPriority: 2,
    auNote:
      'Sells alongside Surtac 2000 as a complete dragline package rather than a single-line substitution.',
    sources: [WHITMORE_EP, WHITMORE_DRAGLINE],
  },
  {
    slug: 'matrix',
    name: 'Matrix®',
    family: 'Matrix',
    category: 'grease',
    chemistry: 'semi-synthetic',
    tagline: 'Core extreme-pressure grease line.',
    description:
      'Part of the core Whitmore extreme-pressure grease line alongside Caliber, covering heavy industrial bearing and pin service where EP capability and water resistance are both required.',
    grades: ['Matrix (multiple NLGI grades)'],
    applications: ['Heavy industrial bearings', 'Pin and bushing service', 'Wet-environment greasing'],
    specs: [
      { label: 'Line', value: 'Whitmore extreme-pressure greases' },
      { label: 'Duty', value: 'Heavy industrial' },
    ],
    approvals: ['Whitmore extreme-pressure grease range'],
    replaces: ['Commodity EP greases'],
    auPriority: 3,
    auNote: 'Range-filler for general plant so that a site can consolidate onto a single supplier.',
    sources: [WHITMORE_EP],
  },
  {
    slug: 'medallion-fm',
    name: 'Medallion™ FM Grease',
    family: 'Medallion',
    category: 'grease',
    chemistry: 'semi-synthetic',
    tagline: 'Premium water-resistant EP grease for washdown service.',
    description:
      'A premium, water-resistant, versatile extreme-pressure lubricant providing excellent protection from wear across a wide range of conditions, including heavy load and frequent washdowns. Where a conventional grease is displaced by high-pressure water and leaves the bearing dry, Medallion FM holds the film.',
    grades: ['Medallion FM'],
    applications: ['Frequent washdown environments', 'Heavy load bearing service', 'Wet processing plant'],
    specs: [
      { label: 'Water resistance', value: 'Premium — rated for frequent washdown' },
      { label: 'Duty', value: 'Heavy load, wide condition range' },
      { label: 'Additive', value: 'Extreme pressure' },
    ],
    approvals: ['Whitmore premium grease range'],
    replaces: ['Water-washout-prone lithium greases'],
    auPriority: 3,
    auNote: 'Coal handling and wash plant applications, where washdown is continuous.',
    sources: [WHITMORE_EP, 'https://www.whitmores.com/lubricants/multi-purpose-grease'],
  },
  {
    slug: 'omnilith-gl',
    name: 'OMNILITH™ GL',
    family: 'Omnilith',
    category: 'grease',
    chemistry: 'mineral',
    tagline: 'Multi-purpose EP grease for general plant consolidation.',
    description:
      'A multi-purpose grease suitable for use in extreme pressure applications across general plant. Its role in the Australian range is consolidation: it lets a site collapse a shelf of assorted commodity greases into one product without giving up EP capability.',
    grades: ['Omnilith GL'],
    applications: ['General plant lubrication', 'Extreme pressure applications', 'Mixed-fleet workshops'],
    specs: [
      { label: 'Type', value: 'Multi-purpose EP' },
      { label: 'Role', value: 'Grease consolidation' },
    ],
    approvals: ['Whitmore multi-purpose grease range'],
    replaces: ['Assorted commodity EP greases'],
    auPriority: 3,
    auNote: 'The product that makes a lube-store rationalisation proposal work commercially.',
    sources: ['https://www.whitmores.com/lubricants/multi-purpose-grease'],
  },
  {
    slug: 'legacy-m',
    name: 'Legacy™ M',
    family: 'Legacy',
    category: 'grease',
    chemistry: 'fully-synthetic',
    tagline: 'Arctic-grade synthetic. Pumps at -46°C.',
    description:
      'An aluminium complex thickened synthetic grease that pumps at -50°F (-46°C), developed for arctic dragline and shovel boom-point lubrication. The relevance to Australia is not ambient temperature but pumpability headroom: a grease that moves at -46°C moves through a long, cold, early-morning line run without starving the boom point.',
    grades: ['Legacy M'],
    applications: [
      'Dragline and shovel boom point lubrication',
      'Cold-start centralised systems',
      'Long-line automatic lubrication',
    ],
    specs: [
      { label: 'Thickener', value: 'Aluminium complex' },
      { label: 'Base oil', value: 'Synthetic' },
      { label: 'Pumpability', value: 'Pumps at -50°F / -46°C' },
    ],
    approvals: ['Specified for arctic dragline and shovel service'],
    replaces: ['Conventional greases that channel in long lines'],
    auPriority: 3,
    auNote:
      'Positioned technically, not climatically: pumpability headroom means the last point on the line gets grease at every cycle.',
    sources: [WHITMORE_EP, WHITMORE_DRAGLINE],
  },

  // ── WIRE ROPE ───────────────────────────────────────────────────────────
  {
    slug: 'drag-rope-lubricant-hf',
    name: 'Drag Rope Lubricant HF',
    family: 'Drag Rope',
    category: 'wire-rope',
    chemistry: 'semi-synthetic',
    tagline: 'Extends the life of hoist and drag ropes.',
    description:
      'Formulated to extend the life of any wire rope, including hoist and drag ropes on draglines and the ropes used on cranes and mining shovels. Rope is one of the highest-value consumables on a dragline; lubrication that reaches the core rather than sitting on the crown is the difference between a rope change on schedule and one under a discard criterion.',
    grades: ['Drag Rope Lubricant HF'],
    applications: [
      'Dragline hoist and drag ropes',
      'Mining shovel ropes',
      'Crane ropes',
    ],
    specs: [
      { label: 'Target', value: 'Hoist, drag, crane and shovel ropes' },
      { label: 'Objective', value: 'Rope life extension' },
      { label: 'Penetration', value: 'Formulated for core penetration' },
    ],
    approvals: ['Specified for dragline rope service'],
    replaces: ['Asphaltic rope dressings that seal the crown without penetrating'],
    auPriority: 2,
    auNote:
      'Rope spend is a line item every Australian dragline owner can quote from memory. That makes the ROI conversation short.',
    sources: ['https://www.whitmores.com/products/drag-rope-lubricant-hf', WHITMORE_DRAGLINE],
  },

  // ── SPECIALTY ───────────────────────────────────────────────────────────
  {
    slug: 'whitslide-extreme',
    name: 'WhitSlide® Extreme',
    family: 'WhitSlide',
    category: 'specialty',
    chemistry: 'semi-synthetic',
    tagline: 'Slide box lubricant for Bucyrus 2500 series draglines.',
    description:
      'Intended for use on the slide boxes of Bucyrus 2500 series draglines — a narrow, machine-specific application that demonstrates the depth of the dragline range. A distributor that can supply the slide box product is a distributor that has actually walked the machine.',
    grades: ['WhitSlide Extreme'],
    applications: ['Bucyrus 2500 series dragline slide boxes'],
    specs: [
      { label: 'Application', value: 'Dragline slide boxes' },
      { label: 'Machine', value: 'Bucyrus 2500 series' },
    ],
    approvals: ['Machine-specific dragline application'],
    replaces: ['General-purpose slide compounds'],
    auPriority: 3,
    auNote:
      'A credibility product. Stocking it signals dragline competence more effectively than any brochure.',
    sources: [WHITMORE_DRAGLINE],
  },
  {
    slug: 'omnitask',
    name: 'Omnitask® Performance Lubricants',
    family: 'Omnitask',
    category: 'specialty',
    chemistry: 'semi-synthetic',
    tagline: 'Performance lubricants and compounds across mixed plant.',
    description:
      'A performance lubricant and compound range covering the assorted requirements that sit around the core mining products — the products a site buys in small volume but cannot operate without.',
    grades: ['Omnitask range'],
    applications: ['General performance lubrication', 'Specialty compounds'],
    specs: [{ label: 'Line', value: 'Omnitask performance lubricants and compounds' }],
    approvals: ['Whitmore performance product range'],
    replaces: ['Miscellaneous specialty purchases'],
    auPriority: 3,
    auNote: 'Range completeness — supports a single-supplier consolidation pitch.',
    sources: ['https://www.whitmores.com/products/omnitask'],
  },
]

export const CATEGORY_LABELS: Record<string, string> = {
  'open-gear': 'Open Gear Lubricants (OGL)',
  'gearbox-oil': 'Enclosed Gearbox Oils',
  grease: 'Extreme Pressure Greases',
  'wire-rope': 'Wire Rope Lubricants',
  specialty: 'Specialty & Multi-Service',
}

export const CHEMISTRY_LABELS: Record<string, string> = {
  'fully-synthetic': 'Fully synthetic',
  'semi-synthetic': 'Semi-synthetic',
  'non-asphaltic': 'Non-asphaltic',
  mineral: 'Mineral',
}

export function findProduct(query: string): Product | undefined {
  const q = query.trim().toLowerCase()
  if (!q) return undefined
  return (
    PRODUCTS.find((p) => p.slug === q) ??
    PRODUCTS.find((p) => p.slug.startsWith(q)) ??
    PRODUCTS.find((p) => p.name.toLowerCase().includes(q)) ??
    PRODUCTS.find((p) => p.family.toLowerCase() === q)
  )
}
