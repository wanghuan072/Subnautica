/**
 * Fetch Map Genie markers sprite once into public/images/mapgenie/markers@2x.png
 * (same layout as markersAtlas2x.json).
 */
import fs from 'node:fs'
import path from 'node:path'
import { REPO_ROOT } from './lib/mapgenie-data-paths.mjs'

const BZ = process.argv.includes('--bz')
const SN2 = process.argv.includes('--sn2')

const REMOTE = SN2
  ? 'https://cdn.mapgenie.io/images/games/subnautica-2/markers@2x.png'
  : BZ
    ? 'https://cdn.mapgenie.io/images/games/subnautica-below-zero/markers@2x.png'
    : process.env.MAPGENIE_MARKERS_ATLAS_URL ||
      'https://cdn.mapgenie.io/images/games/subnautica/markers@2x.png'
const OUT = SN2
  ? path.join(REPO_ROOT, 'public/images/mapgenie-sn2/markers@2x.png')
  : BZ
    ? path.join(REPO_ROOT, 'public/images/mapgenie-bz/markers@2x.png')
    : path.join(REPO_ROOT, 'public/images/mapgenie/markers@2x.png')
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'

async function main() {
  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  const res = await fetch(REMOTE, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  fs.writeFileSync(OUT, Buffer.from(await res.arrayBuffer()))
  console.log('Wrote', OUT)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
