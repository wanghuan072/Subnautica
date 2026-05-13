/**
 * Mirror Map Genie raster tiles into public/tiles/mapgenie/… for offline use.
 * BBox = union of all POI lng/lat + all region polygon vertices + padding.
 *
 * Usage: npm run download:mapgenie-tiles
 * Env: TILES_REMOTE_BASE (default https://tiles.mapgenie.io/games/)
 */
import fs from 'node:fs'
import path from 'node:path'
import { MAPGENIE_DATA_DIR, REPO_ROOT } from './lib/mapgenie-data-paths.mjs'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'
const REMOTE_BASE = (process.env.TILES_REMOTE_BASE || 'https://tiles.mapgenie.io/games/').replace(
  /\/?$/,
  '/',
)
const PUBLIC_TILES_ROOT = path.join(REPO_ROOT, 'public/tiles/mapgenie')

function lngLatToTileXY(lng, lat, z) {
  const n = 2 ** z
  const x = Math.floor(((lng + 180) / 360) * n)
  const latRad = (lat * Math.PI) / 180
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  )
  return [x, y]
}

/** Tile range [xMin,xMax] [yMin,yMax] inclusive for lng/lat bbox */
function tileCoverage(minLng, minLat, maxLng, maxLat, z) {
  const corners = [
    [minLng, maxLat],
    [maxLng, maxLat],
    [minLng, minLat],
    [maxLng, minLat],
  ]
  let xMin = Infinity
  let xMax = -Infinity
  let yMin = Infinity
  let yMax = -Infinity
  for (const [lng, lat] of corners) {
    const [tx, ty] = lngLatToTileXY(lng, lat, z)
    xMin = Math.min(xMin, tx)
    xMax = Math.max(xMax, tx)
    yMin = Math.min(yMin, ty)
    yMax = Math.max(yMax, ty)
  }
  return { xMin, xMax, yMin, yMax }
}

function expandLngLatBbox(coords, acc) {
  if (!coords || !coords.length) return
  if (typeof coords[0] === 'number') {
    const lng = coords[0]
    const lat = coords[1]
    if (Number.isFinite(lng) && Number.isFinite(lat)) {
      acc.minLng = Math.min(acc.minLng, lng)
      acc.maxLng = Math.max(acc.maxLng, lng)
      acc.minLat = Math.min(acc.minLat, lat)
      acc.maxLat = Math.max(acc.maxLat, lat)
    }
    return
  }
  for (const c of coords) expandLngLatBbox(c, acc)
}

function bboxFromMarkersAndRegions(markers, regionsGeo) {
  const acc = { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity }
  for (const m of markers) {
    const lng = Number(m.lng)
    const lat = Number(m.lat)
    if (Number.isFinite(lng) && Number.isFinite(lat)) {
      acc.minLng = Math.min(acc.minLng, lng)
      acc.maxLng = Math.max(acc.maxLng, lng)
      acc.minLat = Math.min(acc.minLat, lat)
      acc.maxLat = Math.max(acc.maxLat, lat)
    }
  }
  for (const f of regionsGeo.features ?? []) {
    expandLngLatBbox(f.geometry?.coordinates, acc)
  }
  if (!Number.isFinite(acc.minLng) || acc.minLng === Infinity) {
    acc.minLng = -1.05
    acc.maxLng = -0.39
    acc.minLat = 0.49
    acc.maxLat = 0.94
  }
  const padLng = (acc.maxLng - acc.minLng) * 0.12
  const padLat = (acc.maxLat - acc.minLat) * 0.12
  return {
    minLng: acc.minLng - padLng,
    maxLng: acc.maxLng + padLng,
    minLat: acc.minLat - padLat,
    maxLat: acc.maxLat + padLat,
  }
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms))
}

async function downloadOne(remoteUrl, diskPath, retries = 4) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(remoteUrl, { headers: { 'User-Agent': UA } })
      if (res.status === 404) return false
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      fs.mkdirSync(path.dirname(diskPath), { recursive: true })
      fs.writeFileSync(diskPath, Buffer.from(await res.arrayBuffer()))
      return true
    } catch {
      await sleep(200 * (attempt + 1))
    }
  }
  return false
}

async function runPool(tasks, limit) {
  let i = 0
  async function worker() {
    while (i < tasks.length) {
      const idx = i++
      await tasks[idx]()
    }
  }
  const n = Math.min(limit, tasks.length)
  await Promise.all(Array.from({ length: n }, worker))
}

async function main() {
  const dataDirArg = process.argv[2]
  const DATA_DIR = dataDirArg ? path.resolve(REPO_ROOT, dataDirArg) : MAPGENIE_DATA_DIR
  const markersPath = path.join(DATA_DIR, 'markers.json')
  const cfgPath = path.join(DATA_DIR, 'worldRasterConfig.json')
  const regionsPath = path.join(DATA_DIR, 'mapGenieRegions.json')

  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'))
  const markers = JSON.parse(fs.readFileSync(markersPath, 'utf8'))
  const regionsGeo = JSON.parse(fs.readFileSync(regionsPath, 'utf8'))

  const bbox = bboxFromMarkersAndRegions(Array.isArray(markers) ? markers : [], regionsGeo)
  const sets = [cfg.mainTileSet, cfg.cavesTileSet].filter(Boolean)
  const minZ = Math.min(...sets.map((s) => s.minZoom))
  const maxZ = Math.max(...sets.map((s) => s.maxZoom))

  /** @type {{ remote: string, disk: string }[]} */
  const queue = []
  for (const tileSet of sets) {
    const pattern = tileSet.pattern
    for (let z = minZ; z <= maxZ; z++) {
      const { xMin, xMax, yMin, yMax } = tileCoverage(
        bbox.minLng,
        bbox.minLat,
        bbox.maxLng,
        bbox.maxLat,
        z,
      )
      for (let x = xMin; x <= xMax; x++) {
        for (let y = yMin; y <= yMax; y++) {
          const rel = pattern.replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y))
          const remote = `${REMOTE_BASE}${rel}`
          const disk = path.join(PUBLIC_TILES_ROOT, rel.split('/').join(path.sep))
          queue.push({ remote, disk })
        }
      }
    }
  }

  console.log('BBox', bbox)
  console.log('Zoom', minZ, '..', maxZ, 'tasks', queue.length)

  let ok = 0
  let skip = 0
  let fail = 0

  const tasks = queue.map(({ remote, disk }) => async () => {
    if (fs.existsSync(disk)) {
      skip++
      return
    }
    const success = await downloadOne(remote, disk)
    if (success) ok++
    else fail++
    await sleep(25)
  })

  await runPool(tasks, 14)
  console.log('Downloaded:', ok, 'skip:', skip, 'fail:', fail)
  console.log('Tiles root:', PUBLIC_TILES_ROOT)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
