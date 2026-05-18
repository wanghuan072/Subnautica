/**
 * Fetch Map Genie page and write src/data/mapgenie | mapgenie-bz | mapgenie-sn2:
 * markers.json (POIs + resources), regions / labels / regionNav GeoJSON.
 *
 * Locations/regions may be loaded from `GET {origin}/api/v1/maps/{mapData.map.id}/data`
 * when no longer embedded in `window.mapData` (current mapgenie.io behaviour).
 *
 * npm run extract:mapgenie · extract:mapgenie:bz · extract:mapgenie:sn2
 */
import fs from 'node:fs'
import path from 'node:path'
import {
  extractJsonAssignment,
  extractMarkerSpritePositionsV3,
  fetchMapgeniePageHtml,
  MAPGENIE_BELOW_ZERO_WORLD,
  MAPGENIE_SUBNAUTICA_2_WORLD,
  MAPGENIE_SUBNAUTICA_WORLD,
} from './lib/extract-mapgenie-html-json.mjs'
import { MAPGENIE_BZ_DATA_DIR, MAPGENIE_DATA_DIR, MAPGENIE_SN2_DATA_DIR } from './lib/mapgenie-data-paths.mjs'

const GAMES = {
  subnautica: {
    pageUrl: MAPGENIE_SUBNAUTICA_WORLD,
    dir: MAPGENIE_DATA_DIR,
    /** Fixed bounds (legacy Subnautica extract) */
    gameWorldBounds: { minLng: -1.05, maxLng: -0.39, minLat: 0.49, maxLat: 0.94 },
  },
  belowZero: {
    pageUrl: MAPGENIE_BELOW_ZERO_WORLD,
    dir: MAPGENIE_BZ_DATA_DIR,
    /** Derived from POI lng/lat + padding */
    gameWorldBounds: null,
  },
  subnautica2: {
    pageUrl: MAPGENIE_SUBNAUTICA_2_WORLD,
    dir: MAPGENIE_SN2_DATA_DIR,
    gameWorldBounds: null,
  },
}

function resolveGameKey() {
  const a = (process.argv[2] || 'subnautica').toLowerCase()
  if (a === 'belowzero' || a === 'bz' || a === 'subnautica-below-zero') return 'belowZero'
  if (a === 'sn2' || a === 'subnautica2' || a === 'subnautica-2') return 'subnautica2'
  return 'subnautica'
}

/** Fallback when MARKER_SPRITE_POSITIONS_V3 is missing (do not use for shipped SN2 — run extract against live page). */
function buildMarkersAtlas2xLayoutFallback(categories) {
  const icons = new Set(['other'])
  for (const c of Object.values(categories || {})) {
    if (c && typeof c.icon === 'string' && c.icon) icons.add(c.icon)
  }
  const ordered = [...icons].sort((a, b) => a.localeCompare(b, 'en'))
  const out = {}
  let y = 0
  for (const key of ordered) {
    out[key] = { width: 66, height: 88, x: 0, y, pixelRatio: 2 }
    y += 88
  }
  return out
}

function spriteRectArea(r) {
  if (!r || typeof r.width !== 'number' || typeof r.height !== 'number') return 0
  return Math.abs(r.width * r.height)
}

function normalizeSpriteRect(r) {
  if (!r || typeof r !== 'object') return null
  const width = Number(r.width)
  const height = Number(r.height)
  const x = Number(r.x)
  const y = Number(r.y)
  if (![width, height, x, y].every(Number.isFinite)) return null
  return {
    width,
    height,
    x,
    y,
    pixelRatio: Number.isFinite(Number(r.pixelRatio)) ? Number(r.pixelRatio) : 2,
  }
}

/**
 * Official sprite layout: map category id → rect, then collapse by `icon` string (MapLibre symbol uses icon).
 * When several categories share an icon, keep the largest rect (avoids 50×50 placeholder duplicates).
 */
function buildMarkersAtlasFromSpriteV3(categories, spriteByCategoryId) {
  if (!spriteByCategoryId || typeof spriteByCategoryId !== 'object') return null
  const byIcon = {}
  for (const cat of Object.values(categories || {})) {
    if (!cat || cat.id == null) continue
    const sid = String(cat.id)
    const rect = normalizeSpriteRect(spriteByCategoryId[sid])
    const icon = cat.icon
    if (typeof icon !== 'string' || !icon || !rect) continue
    const prev = byIcon[icon]
    if (!prev || spriteRectArea(rect) > spriteRectArea(prev)) byIcon[icon] = rect
  }
  if (!Object.keys(byIcon).length) return null
  if (!byIcon.other) {
    byIcon.other = byIcon.point_of_interest || byIcon.lifepod || Object.values(byIcon)[0]
  }
  return byIcon
}

function buildSn2WorldRasterConfig(mapData) {
  const ts0 = mapData.mapConfig?.tile_sets?.[0] || {}
  const pattern =
    typeof ts0.pattern === 'string' && ts0.pattern.trim()
      ? ts0.pattern.trim()
      : 'subnautica-2/world/default-v2/{z}/{y}/{x}.jpg'
  const startLng = Number(mapData.mapConfig?.start_lng)
  const startLat = Number(mapData.mapConfig?.start_lat)
  const minZ = Number(ts0.min_zoom)
  const maxZ = Number(ts0.max_zoom)
  return {
    _meta: {
      id: 'mapgenie-subnautica-2',
      title: 'Map Genie · Subnautica 2',
      note:
        'Tile URL from mapData.mapConfig.tile_sets[0].pattern (Subnautica 2 uses {z}/{y}/{x}). markersAtlas2x.json: rects from page MARKER_SPRITE_POSITIONS_V3. npm run download:mapgenie-sn2-media for pin photos.',
    },
    tilesBaseUrl: 'https://tiles.mapgenie.io/games/',
    tileAttribution: 'Map tiles and location data © Map Genie — https://mapgenie.io',
    mainTileSet: {
      pattern,
      minZoom: Number.isFinite(minZ) && minZ >= 0 ? minZ : 8,
      maxZoom: Number.isFinite(maxZ) && maxZ >= 0 ? maxZ : 18,
    },
    initialCenterLngLat: [
      Number.isFinite(startLng) ? startLng : -0.7,
      Number.isFinite(startLat) ? startLat : 0.7,
    ],
    initialZoom:
      Number.isFinite(Number(mapData.mapConfig?.initial_zoom)) && Number(mapData.mapConfig.initial_zoom) >= 1
        ? Number(mapData.mapConfig.initial_zoom)
        : 12,
    displayResourcePinsOnMap: true,
    /** Match mapgenie.io sidebar: dense resource/fauna/flora pins off until the user enables them. */
    defaultHiddenPoiGroupTitles: ['Resources', 'Wildlife', 'Plants'],
    regionPolygonOverlay: {
      /** Matches mapData.styles.mapStyle.showRegionPolygons (false on mapgenie.io for SN2). */
      defaultMapLayerVisible: mapData.styles?.mapStyle?.showRegionPolygons === true,
      fillOpacity: { idle: 0.42, hover: 0.56, selected: 0.68 },
      outlineAccentColor: '#f5a623',
    },
  }
}

function computeBoundsFromMapLocations(locations) {
  let minLng = Infinity
  let maxLng = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity
  for (const loc of Array.isArray(locations) ? locations : []) {
    const lng = Number(loc.longitude)
    const lat = Number(loc.latitude)
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
  }
  if (!Number.isFinite(minLng) || minLng === Infinity) {
    return { minLng: -1.05, maxLng: -0.39, minLat: 0.49, maxLat: 0.94 }
  }
  const padLng = (maxLng - minLng) * 0.12
  const padLat = (maxLat - minLat) * 0.12
  return {
    minLng: minLng - padLng,
    maxLng: maxLng + padLng,
    minLat: minLat - padLat,
    maxLat: maxLat + padLat,
  }
}

/** Set per run() before region/resource logic */
let activeGameBounds = { minLng: -1.05, maxLng: -0.39, minLat: 0.49, maxLat: 0.94 }

function normalizeMedia(loc) {
  if (!Array.isArray(loc.media)) return []
  const out = []
  for (const m of loc.media) {
    if (!m || typeof m.url !== 'string' || !/^https:\/\//i.test(m.url)) continue
    try {
      const host = new URL(m.url).hostname.toLowerCase()
      if (!host.endsWith('mapgenie.io')) continue
    } catch {
      continue
    }
    out.push({
      url: m.url,
      title: typeof m.title === 'string' ? m.title : '',
      type: typeof m.type === 'string' ? m.type : '',
    })
  }
  return out
}

/** Matches mapgenie.io Subnautica `mapData.groups[].title` (not minerals/biological resource wording) */
const RESOURCE_SIDEBAR_GROUP_TITLE = {
  mineral: 'Raw Materials',
  biological: 'Biological',
  fauna: 'Biological',
}

/** Negative ids avoid collisions with positive location.id */
function stableResourceMarkerId(bucket, resourceId, regionId) {
  const s = `${bucket}:${resourceId}:${regionId}`
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return h <= 0 ? h : -h
}

function resourceSpriteIcon(bucket, item) {
  if (bucket === 'mineral') return 'resource_deposit'
  if (bucket === 'biological') return 'biological_resource'
  const typ = String(item.type ?? '').toLowerCase()
  const name = String(item.name ?? '').toLowerCase()
  if (typ.includes('leviathan') || name.includes('leviathan') || name.includes('sea dragon')) return 'leviathon'
  if (typ.includes('carnivore') || typ.includes('scavenger') || typ.includes('parasite')) return 'carnivore'
  return 'herbivore'
}

/** Some official biome center_x/center_y are 0 or invalid; bbox center can fall outside holes—must land inside polygon. */
function isBadRegionCenter(lng, lat) {
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return true
  if (lng === 0 && lat === 0) return true
  return false
}

function isOutsideGameWorldLngLat(lng, lat) {
  return (
    lng < activeGameBounds.minLng ||
    lng > activeGameBounds.maxLng ||
    lat < activeGameBounds.minLat ||
    lat > activeGameBounds.maxLat
  )
}

/** Ray casting; ring must be closed */
function pointInRingLngLat(lng, lat, ring) {
  if (!Array.isArray(ring) || ring.length < 4) return false
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0]
    const yi = ring[i][1]
    const xj = ring[j][0]
    const yj = ring[j][1]
    const denom = yj - yi || 1e-18
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / denom + xi
    if (intersect) inside = !inside
  }
  return inside
}

function pointInPolygonRings(lng, lat, polygonCoords) {
  if (!Array.isArray(polygonCoords) || !polygonCoords[0]) return false
  const outer = polygonCoords[0]
  if (!pointInRingLngLat(lng, lat, outer)) return false
  for (let h = 1; h < polygonCoords.length; h++) {
    if (pointInRingLngLat(lng, lat, polygonCoords[h])) return false
  }
  return true
}

function pointInGeometryLngLat(lng, lat, geom) {
  if (!geom || typeof geom !== 'object') return false
  if (geom.type === 'Polygon') return pointInPolygonRings(lng, lat, geom.coordinates)
  if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates || []) {
      if (poly && pointInPolygonRings(lng, lat, poly)) return true
    }
    return false
  }
  return false
}

function pointInRegionFeatures(lng, lat, features) {
  if (!Array.isArray(features)) return false
  for (const f of features) {
    if (f?.geometry && pointInGeometryLngLat(lng, lat, f.geometry)) return true
  }
  return false
}

function accumulateGeomBBox(geom, acc) {
  function walkRing(ring) {
    if (!Array.isArray(ring)) return
    for (const pt of ring) {
      if (!Array.isArray(pt) || pt.length < 2) continue
      const x = Number(pt[0])
      const y = Number(pt[1])
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue
      acc.minX = Math.min(acc.minX, x)
      acc.maxX = Math.max(acc.maxX, x)
      acc.minY = Math.min(acc.minY, y)
      acc.maxY = Math.max(acc.maxY, y)
    }
  }
  if (geom.type === 'Polygon') {
    for (const ring of geom.coordinates || []) walkRing(ring)
  } else if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates || []) {
      for (const ring of poly || []) walkRing(ring)
    }
  }
}

function regionFeaturesBBox(features) {
  const acc = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
  if (!Array.isArray(features)) return null
  for (const f of features) {
    if (f?.geometry) accumulateGeomBBox(f.geometry, acc)
  }
  if (!Number.isFinite(acc.minX) || acc.minX === Infinity) return null
  return acc
}

/** Interior point: try hint (official center or bbox center), then grid scan inside bbox (pins sit inside polygon like Map Genie). */
function findInteriorPointInRegion(features, hintLng, hintLat) {
  if (!Array.isArray(features) || features.length === 0) return null
  if (Number.isFinite(hintLng) && Number.isFinite(hintLat) && pointInRegionFeatures(hintLng, hintLat, features)) {
    return [hintLng, hintLat]
  }
  const bb = regionFeaturesBBox(features)
  if (!bb) return null
  const { minX, maxX, minY, maxY } = bb
  const steps = 56
  for (let iy = 0; iy <= steps; iy++) {
    const lat = minY + ((maxY - minY) * iy) / steps
    for (let ix = 0; ix <= steps; ix++) {
      const lng = minX + ((maxX - minX) * ix) / steps
      if (pointInRegionFeatures(lng, lat, features)) return [lng, lat]
    }
  }
  return null
}

function ringSignedArea(ring) {
  if (!Array.isArray(ring) || ring.length < 4) return 0
  let sum = 0
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i]
    const [x2, y2] = ring[i + 1]
    sum += x1 * y2 - x2 * y1
  }
  return sum / 2
}

function ringBBoxCenter(ring) {
  if (!Array.isArray(ring) || ring.length < 3) return null
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const pt of ring) {
    if (!Array.isArray(pt) || pt.length < 2) continue
    const x = Number(pt[0])
    const y = Number(pt[1])
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }
  if (!Number.isFinite(minX) || minX === Infinity) return null
  return [(minX + maxX) / 2, (minY + maxY) / 2]
}

function bboxCenterFromGeometry(geom) {
  if (!geom || typeof geom !== 'object') return null
  if (geom.type === 'Polygon') {
    const coords = geom.coordinates
    if (!Array.isArray(coords) || !coords[0]) return null
    return ringBBoxCenter(coords[0])
  }
  if (geom.type === 'MultiPolygon') {
    let best = null
    let bestArea = 0
    for (const poly of geom.coordinates || []) {
      if (!poly?.[0]) continue
      const outer = poly[0]
      const a = Math.abs(ringSignedArea(outer))
      const c = ringBBoxCenter(outer)
      if (c && a > bestArea) {
        bestArea = a
        best = c
      }
    }
    return best
  }
  return null
}

/** Region may have multiple polygons; use bbox center of largest outer ring by area */
function bboxCenterFromRegionFeatures(features) {
  if (!Array.isArray(features)) return null
  let best = null
  let bestArea = 0
  for (const f of features) {
    const g = f?.geometry
    if (!g) continue
    let area = 0
    if (g.type === 'Polygon' && g.coordinates?.[0]) {
      area = Math.abs(ringSignedArea(g.coordinates[0]))
    } else if (g.type === 'MultiPolygon') {
      for (const poly of g.coordinates || []) {
        if (poly?.[0]) area += Math.abs(ringSignedArea(poly[0]))
      }
    }
    const c = bboxCenterFromGeometry(g)
    if (!c || !(area > bestArea)) continue
    bestArea = area
    best = c
  }
  return best
}

function patchRegionCentersFromPolygons(regions, regionById) {
  for (const region of regions) {
    const meta = regionById.get(region.id)
    if (!meta) continue
    const feats = Array.isArray(region.features) ? region.features : []
    const { lng, lat } = meta

    const officialInside =
      Number.isFinite(lng) &&
      Number.isFinite(lat) &&
      !isBadRegionCenter(lng, lat) &&
      !isOutsideGameWorldLngLat(lng, lat) &&
      pointInRegionFeatures(lng, lat, feats)

    if (officialInside) continue

    const bboxHint = bboxCenterFromRegionFeatures(feats)
    const hintLng =
      Number.isFinite(lng) && !(lng === 0 && lat === 0) ? lng : (bboxHint?.[0] ?? Number.NaN)
    const hintLat =
      Number.isFinite(lat) && !(lng === 0 && lat === 0) ? lat : (bboxHint?.[1] ?? Number.NaN)
    const interior = findInteriorPointInRegion(
      feats,
      Number.isFinite(hintLng) ? hintLng : bboxHint?.[0],
      Number.isFinite(hintLat) ? hintLat : bboxHint?.[1],
    )

    if (interior && Number.isFinite(interior[0]) && Number.isFinite(interior[1])) {
      meta.lng = interior[0]
      meta.lat = interior[1]
    }
  }
}

function buildResourceMarkers(specialData, regionById) {
  const out = []
  const resources = specialData?.resources
  if (!resources || typeof resources !== 'object') return out

  for (const bucket of ['mineral', 'biological', 'fauna']) {
    const list = resources[bucket]
    if (!Array.isArray(list)) continue
    const catTitle = RESOURCE_SIDEBAR_GROUP_TITLE[bucket] ?? bucket

    for (const item of list) {
      if (!item || typeof item !== 'object') continue
      const ridRaw = item.regions
      if (!Array.isArray(ridRaw)) continue
      const regionIds = [...new Set(ridRaw.map(Number).filter(Number.isFinite))]

      for (const regionId of regionIds) {
        const meta = regionById.get(regionId)
        if (!meta) continue
        const { lng, lat, title: regionTitle } = meta
        if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue
        if (lng === 0 && lat === 0) continue
        if (isOutsideGameWorldLngLat(lng, lat)) continue

        const icon = resourceSpriteIcon(bucket, item)
        const typeStr = typeof item.type === 'string' ? item.type : ''
        const nameStr = typeof item.name === 'string' ? item.name : ''
        const fromParts = Array.isArray(item.obtained_from)
          ? item.obtained_from.filter((x) => typeof x === 'string')
          : []

        const descLines = [`**Type:** ${typeStr}`]
        if (fromParts.length) descLines.push(`**Obtained from:** ${fromParts.join('; ')}`)
        descLines.push(`**Region:** ${regionTitle || String(regionId)}`)
        descLines.push('')
        descLines.push(
          '_Regional reference from Map Genie resources panel (marker at biome center, not a precise farm coordinate)._',
        )

        out.push({
          mapGenieSource: 'resource',
          resourceKind: bucket,
          resourceEntryId: item.id,
          regionId,
          layerId: icon,
          categoryId: null,
          categoryTitle: catTitle,
          groupTitle: catTitle,
          id: stableResourceMarkerId(bucket, item.id, regionId),
          name: nameStr,
          lng,
          lat,
          icon,
          detailTitle: nameStr,
          detailSummary: '',
          detailDescription: descLines.join('\n'),
          detailImage: '',
          media: [],
        })
      }
    }
  }
  return out
}

const MAPGENIE_DATA_API_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'

/**
 * Map Genie no longer embeds `locations` / `regions` (and sometimes `styles.regionStyles`) in `window.mapData`.
 * They are served from `GET /api/v1/maps/{mapId}/data` on the same origin as the map page.
 */
async function enrichMapDataFromMapDataApi(mapData, pageUrl) {
  const mapId = mapData?.map?.id
  if (mapId == null || !Number.isFinite(Number(mapId))) return mapData

  const locs = mapData.locations
  const regs = mapData.regions
  const needLoc = !Array.isArray(locs) || locs.length === 0
  const needReg = !Array.isArray(regs) || regs.length === 0

  const styles = mapData.styles
  const hasRegionStyles =
    styles &&
    typeof styles === 'object' &&
    styles.regionStyles &&
    typeof styles.regionStyles === 'object' &&
    Object.keys(styles.regionStyles).length > 0

  if (!needLoc && !needReg && hasRegionStyles) return mapData

  let origin
  try {
    origin = new URL(pageUrl).origin
  } catch {
    return mapData
  }
  const url = `${origin}/api/v1/maps/${mapId}/data`
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': MAPGENIE_DATA_API_UA },
  })
  if (!res.ok) {
    throw new Error(`Map data API HTTP ${res.status} for ${url} (expected locations/regions JSON)`)
  }
  const data = await res.json()

  const out = { ...mapData }
  if (needLoc && Array.isArray(data.locations) && data.locations.length) {
    out.locations = data.locations
  }
  if (needReg && Array.isArray(data.regions) && data.regions.length) {
    out.regions = data.regions
  }
  if (!hasRegionStyles && data.styles && typeof data.styles === 'object') {
    out.styles = data.styles
  }
  return out
}

async function run() {
  const gameKey = resolveGameKey()
  const cfg = GAMES[gameKey]
  if (!cfg) throw new Error(`Unknown game key: ${gameKey}. Use subnautica | belowZero | subnautica2`)

  const html = await fetchMapgeniePageHtml(cfg.pageUrl)
  let j = JSON.parse(extractJsonAssignment(html, 'window.mapData = '))
  j = await enrichMapDataFromMapDataApi(j, cfg.pageUrl)
  if (!Array.isArray(j.locations) || j.locations.length === 0) {
    throw new Error('No locations in mapData after HTML + /api/v1/maps/{id}/data merge.')
  }
  const specialRaw = JSON.parse(extractJsonAssignment(html, 'window.specialData = '))
  const special = Array.isArray(specialRaw) ? {} : specialRaw && typeof specialRaw === 'object' ? specialRaw : {}

  const locations = j.locations ?? []
  activeGameBounds = cfg.gameWorldBounds ? { ...cfg.gameWorldBounds } : computeBoundsFromMapLocations(locations)

  const DIR = cfg.dir
  const OUT_MARKERS = path.join(DIR, 'markers.json')
  const OUT_REG = path.join(DIR, 'mapGenieRegions.json')
  const OUT_LABELS = path.join(DIR, 'mapGenieRegionLabels.json')
  const OUT_REGION_NAV = path.join(DIR, 'mapGenieRegionNav.json')
  const OUT_REGION_STYLES = path.join(DIR, 'mapGenieRegionStylesById.json')
  const OUT_GROUPS = path.join(DIR, 'mapGenieGroups.json')

  console.log('Game:', gameKey, '→', DIR)
  console.log('Active lng/lat bounds:', activeGameBounds)

  const categories = j.categories ?? {}
  const regions = j.regions ?? []
  const groupsList = j.groups ?? []
  const groupById = new Map(groupsList.map((g) => [g.id, g]))

  const regionById = new Map()
  for (const region of regions) {
    const lng = Number(region.center_x)
    const lat = Number(region.center_y)
    regionById.set(region.id, {
      lng,
      lat,
      title: typeof region.title === 'string' ? region.title : '',
    })
  }

  patchRegionCentersFromPolygons(regions, regionById)

  function firstDetailImageFromMedia(media) {
    if (!Array.isArray(media)) return ''
    const hit = media.find(
      (m) =>
        m &&
        typeof m.url === 'string' &&
        m.url &&
        (m.type === 'image' || /\.(jpe?g|png|webp|gif)(\?|$)/i.test(m.url)),
    )
    return hit && typeof hit.url === 'string' ? hit.url : ''
  }

  const markers = []
  for (const loc of locations) {
    const cid = loc.category_id
    const cat = categories[cid]
    const icon = cat?.icon
    if (!icon) continue
    const lng = Number(loc.longitude)
    const lat = Number(loc.latitude)
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue
    const title = typeof loc.title === 'string' ? loc.title : ''
    const description = typeof loc.description === 'string' ? loc.description : ''
    const catSummary = typeof cat?.info === 'string' ? cat.info.trim() : ''
    const media = normalizeMedia(loc)
    const rawRid = loc.region_id
    const regionIdNum = Number(rawRid)
    const regionId = Number.isFinite(regionIdNum) ? regionIdNum : null
    const gid = cat?.group_id
    const grp = gid != null ? groupById.get(gid) : null
    markers.push({
      mapGenieSource: 'poi',
      layerId: icon,
      categoryId: cid,
      categoryTitle: typeof cat?.title === 'string' ? cat.title : '',
      groupId: gid != null && gid !== '' ? gid : null,
      groupTitle: typeof grp?.title === 'string' ? grp.title : '',
      groupColor: typeof grp?.color === 'string' ? String(grp.color).replace(/^#/, '').trim() : '',
      regionId,
      id: loc.id,
      name: title,
      lng,
      lat,
      icon,
      detailTitle: title,
      detailSummary: catSummary,
      detailDescription: description,
      detailImage: firstDetailImageFromMedia(media),
      media,
    })
  }

  const resourceMarkers = buildResourceMarkers(special, regionById)
  const allMarkers = [...markers, ...resourceMarkers]

  /** Map Genie `styles.regionStyles`: Below Zero biome keys live in ~3042–3066 (first N match sorted `regions` by id). */
  function buildRegionStylesByRegionId(regionsIn, regionStyles) {
    const regs = [...regionsIn].sort((a, b) => Number(a.id) - Number(b.id))
    const keys = []
    for (const [k, v] of Object.entries(regionStyles || {})) {
      const n = Number(k)
      if (!Number.isFinite(n) || n < 3000 || n > 3400) continue
      if (!v || typeof v !== 'object' || typeof v['fill-color'] !== 'string') continue
      keys.push(n)
    }
    keys.sort((a, b) => a - b)
    /** @type {Record<string, Record<string, unknown>>} */
    const byId = {}
    if (keys.length < regs.length) {
      console.warn('regionStyles: not enough keys', keys.length, 'for regions', regs.length)
      return byId
    }
    const chosen = keys.slice(0, regs.length)
    for (let i = 0; i < regs.length; i++) {
      const r = regs[i]
      const sk = String(chosen[i])
      const full = regionStyles[sk]
      if (!full || typeof full !== 'object') continue
      byId[String(r.id)] = {
        styleKey: chosen[i],
        'fill-color': full['fill-color'],
        'line-color':
          typeof full['line-color'] === 'string' ? full['line-color'] : String(full['fill-color'] ?? '#888888'),
        'line-width': typeof full['line-width'] === 'number' && Number.isFinite(full['line-width']) ? full['line-width'] : 2,
        'text-color': full['text-color'],
        'text-halo-color': full['text-halo-color'],
        'fill-opacity': full['fill-opacity'],
      }
    }
    return byId
  }

  const regionStylesById = buildRegionStylesByRegionId(regions, j.styles?.regionStyles ?? {})
  if (gameKey === 'belowZero' && !Object.keys(regionStylesById).length) {
    console.warn('regionStyles zip failed —', OUT_REGION_STYLES, 'will be {}')
  }

  const regionFeatures = []
  for (const region of regions) {
    const feats = Array.isArray(region.features) ? region.features : []
    feats.forEach((f, idx) => {
      if (!f?.geometry) return
      regionFeatures.push({
        type: 'Feature',
        geometry: f.geometry,
        properties: {
          fid: `r${region.id}_${idx}`,
          regionId: region.id,
          title: typeof region.title === 'string' ? region.title : '',
          subtitle: region.subtitle == null ? '' : String(region.subtitle),
        },
      })
    })
  }

  const labelFeatures = []
  for (const region of regions) {
    const meta = regionById.get(region.id)
    if (!meta) continue
    const { lng, lat } = meta
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue
    if (lng === 0 && lat === 0) continue
    labelFeatures.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: {
        title: typeof region.title === 'string' ? region.title : '',
        regionId: region.id,
      },
    })
  }

  fs.mkdirSync(DIR, { recursive: true })
  fs.writeFileSync(OUT_MARKERS, `${JSON.stringify(allMarkers)}\n`, 'utf8')
  fs.writeFileSync(OUT_GROUPS, `${JSON.stringify(Array.isArray(groupsList) ? groupsList : [])}\n`, 'utf8')
  console.log('Wrote map groups:', Array.isArray(groupsList) ? groupsList.length : 0, OUT_GROUPS)
  if (gameKey === 'belowZero') {
    fs.writeFileSync(OUT_REGION_STYLES, `${JSON.stringify(regionStylesById)}\n`, 'utf8')
    console.log('Wrote region styles by id:', Object.keys(regionStylesById).length, OUT_REGION_STYLES)
  } else if (gameKey === 'subnautica2') {
    fs.writeFileSync(OUT_REGION_STYLES, '{}\n', 'utf8')
    console.log('Wrote empty region styles (SN2 uses title-based biome colors):', OUT_REGION_STYLES)
    const OUT_ATLAS = path.join(DIR, 'markersAtlas2x.json')
    const spriteV3 = extractMarkerSpritePositionsV3(html)
    const atlasMerged = buildMarkersAtlasFromSpriteV3(categories, spriteV3)
    const atlasFinal = atlasMerged || buildMarkersAtlas2xLayoutFallback(categories)
    if (!atlasMerged) {
      console.warn('MARKER_SPRITE_POSITIONS_V3 not parsed — wrote fallback atlas; pins will not match Map Genie.')
    }
    fs.writeFileSync(OUT_ATLAS, `${JSON.stringify(atlasFinal)}\n`, 'utf8')
    const OUT_WORLD = path.join(DIR, 'worldRasterConfig.json')
    fs.writeFileSync(OUT_WORLD, `${JSON.stringify(buildSn2WorldRasterConfig(j))}\n`, 'utf8')
    console.log('Wrote', OUT_ATLAS)
    console.log('Wrote', OUT_WORLD)
  }
  fs.writeFileSync(
    OUT_REG,
    `${JSON.stringify({ type: 'FeatureCollection', features: regionFeatures })}\n`,
    'utf8',
  )
  fs.writeFileSync(
    OUT_LABELS,
    `${JSON.stringify({ type: 'FeatureCollection', features: labelFeatures })}\n`,
    'utf8',
  )

  const regionNavOrder = { order: regions.map((r) => r.id) }
  fs.writeFileSync(OUT_REGION_NAV, `${JSON.stringify(regionNavOrder)}\n`, 'utf8')

  console.log('Wrote POI markers:', markers.length)
  console.log('Wrote resource markers:', resourceMarkers.length)
  console.log('Wrote markers total:', allMarkers.length, OUT_MARKERS)
  console.log('Wrote regions:', regionFeatures.length, OUT_REG)
  console.log('Wrote region labels:', labelFeatures.length, OUT_LABELS)
  console.log('Wrote region nav order:', regionNavOrder.order.length, OUT_REGION_NAV)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
