#!/usr/bin/env node
/**
 * Copies the standalone simulators into public/ so the single Vercel deployment
 * serves them alongside the Whitmore console:
 *
 *   index.html  -> /mill    SAG mill DEM (2D)
 *   ehpcc.html  -> /ehpcc   eHPCC DEM (3D)
 *
 * Both files deliberately stay at the repo root: they are zero-build files and
 * opening either directly has to keep working. This staging step is the only
 * thing that couples them to the Next.js app, and the staged directories are
 * gitignored so nothing is committed twice.
 */
import { copyFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const apps = [
  { src: 'index.html', dir: 'mill' },
  { src: 'ehpcc.html', dir: 'ehpcc' },
]

for (const app of apps) {
  const dest = join(root, 'public', app.dir)
  await mkdir(dest, { recursive: true })
  await copyFile(join(root, app.src), join(dest, 'index.html'))
  console.log(`staged ${app.src} -> public/${app.dir}/index.html`)
}
