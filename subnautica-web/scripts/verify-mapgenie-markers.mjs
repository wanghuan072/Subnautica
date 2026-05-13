/**
 * Compare remote mapData.locations count with local markers.json POIs (excludes resource-derived rows).
 *
 * Usage:
 *   node scripts/verify-mapgenie-markers.mjs
 *   node scripts/verify-mapgenie-markers.mjs belowZero
 */
import fs from 'node:fs'
import {
  extractJsonAssignment,
  fetchMapgeniePageHtml,
  MAPGENIE_BELOW_ZERO_WORLD,
  MAPGENIE_SUBNAUTICA_WORLD,
} from './lib/extract-mapgenie-html-json.mjs'
import { MAPGENIE_BZ_MARKERS_JSON, MAPGENIE_MARKERS_JSON } from './lib/mapgenie-data-paths.mjs'

const GAMES = {
  subnautica: { pageUrl: MAPGENIE_SUBNAUTICA_WORLD, markersJson: MAPGENIE_MARKERS_JSON },
  belowZero: { pageUrl: MAPGENIE_BELOW_ZERO_WORLD, markersJson: MAPGENIE_BZ_MARKERS_JSON },
}

function resolveGameKey() {
  const a = (process.argv[2] || 'subnautica').toLowerCase()
  if (a === 'belowzero' || a === 'bz' || a === 'subnautica-below-zero') return 'belowZero'
  return 'subnautica'
}

async function main() {
  const gameKey = resolveGameKey()
  const cfg = GAMES[gameKey]
  if (!cfg) throw new Error(`Unknown game: ${gameKey}`)

  const html = await fetchMapgeniePageHtml(cfg.pageUrl)
  const j = JSON.parse(extractJsonAssignment(html, 'window.mapData = '))
  const remote = j.locations?.length ?? 0

  const markers = JSON.parse(fs.readFileSync(cfg.markersJson, 'utf8'))
  const poiLocal = Array.isArray(markers) ? markers.filter((m) => m.mapGenieSource !== 'resource').length : 0
  const resourceLocal = Array.isArray(markers) ? markers.filter((m) => m.mapGenieSource === 'resource').length : 0

  console.log('Game:', gameKey)
  console.log('Remote POI locations (mapData):', remote)
  console.log('Local POI markers:', poiLocal)
  console.log('Local resource markers (specialData):', resourceLocal)

  if (remote !== poiLocal) {
    console.error('Mismatch — POI count must match mapData.locations.')
    process.exit(1)
  }
  console.log('OK — POI counts match')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
