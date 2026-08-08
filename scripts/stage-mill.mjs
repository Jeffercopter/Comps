#!/usr/bin/env node
/**
 * Copies the standalone SAG mill simulator into public/mill/ so the single
 * Vercel deployment serves it at /mill alongside the Whitmore console.
 *
 * index.html deliberately stays at the repo root: it is a zero-dependency,
 * zero-build file and opening it directly has to keep working. This staging
 * step is the only thing that couples it to the Next.js app, and public/mill
 * is gitignored so the file is never committed twice.
 */
import { copyFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dest = join(root, 'public', 'mill')

await mkdir(dest, { recursive: true })
await copyFile(join(root, 'index.html'), join(dest, 'index.html'))

console.log('staged index.html -> public/mill/index.html')
