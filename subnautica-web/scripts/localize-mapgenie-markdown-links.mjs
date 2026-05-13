/**
 * Strip Map Genie markdown links in markers.json to plain labels.
 * Optional legacy step: CaveDepthMapView now allows https links on mapgenie.io / fandom.com,
 * so prefer keeping links. Removed from npm run localize:offline-* scripts.
 */
import fs from 'node:fs'
import path from 'node:path'
import { MAPGENIE_MARKERS_JSON, REPO_ROOT } from './lib/mapgenie-data-paths.mjs'

const LINK_RE = /\[([^\]]*)\]\(\s*https?:\/\/[^)\s]*mapgenie\.io[^)]*\)/gi

function stripLinks(s) {
  return typeof s === 'string' ? s.replace(LINK_RE, '$1') : s
}

async function main() {
  const arg = process.argv[2]
  const markersPath = arg ? path.resolve(REPO_ROOT, arg) : MAPGENIE_MARKERS_JSON
  const raw = fs.readFileSync(markersPath, 'utf8')
  const markers = JSON.parse(raw)
  let n = 0
  for (const row of Array.isArray(markers) ? markers : []) {
    const d0 = row.detailDescription
    const s0 = row.detailSummary
    row.detailDescription = stripLinks(row.detailDescription)
    row.detailSummary = stripLinks(row.detailSummary)
    if (d0 !== row.detailDescription || s0 !== row.detailSummary) n++
  }
  fs.writeFileSync(markersPath, `${JSON.stringify(markers)}\n`, 'utf8')
  console.log('Rows touched:', n)
  console.log('Updated', markersPath)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
