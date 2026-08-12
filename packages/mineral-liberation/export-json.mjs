#!/usr/bin/env node
/**
 * Emits ores.json — the ore and mineral database in a language-neutral form,
 * for C++, Python or Fortran hosts. ores.mjs stays the source of truth; this
 * is a projection of it, so regenerate rather than hand-edit.
 *
 *   node export-json.mjs > ores.json
 */
import { MINERALS } from './minerals.mjs'
import { ORES } from './ores.mjs'

const out = {
  units: { size: 'm', density: 'kg/m3', ecs: 'kWh/t' },
  note: 'Generated from ores.mjs by export-json.mjs — do not hand-edit.',
  minerals: MINERALS,
  ores: ORES,
}
process.stdout.write(JSON.stringify(out, null, 2) + '\n')
