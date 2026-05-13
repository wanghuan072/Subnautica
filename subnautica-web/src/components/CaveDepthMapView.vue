<script setup>
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'

const props = defineProps({
  /** Map Genie bundle from `src/data/mapgenie` or `src/data/mapgenie-bz` */
  dataset: { type: Object, required: true },
})

const markersData = computed(() => props.dataset.markers)
const regionsGeo = computed(() => props.dataset.regionsGeo)
const regionLabelsGeo = computed(() => props.dataset.regionLabelsGeo)
const regionNav = computed(() => props.dataset.regionNav)
const markersAtlas = computed(() => props.dataset.markersAtlas)
const worldRasterConfig = computed(() => props.dataset.worldRasterConfig)
const markersAtlasPng = computed(() => props.dataset.markersAtlasPng)

/** Optional: Below Zero per-biome colors + cave-sheet polygons hidden on world view (see worldRasterConfig.regionPolygonOverlay). */
const regionPolygonOverlay = computed(() => worldRasterConfig.value.regionPolygonOverlay)

/** Official `mapData.styles.regionStyles` per `regionId` (see `mapGenieRegionStylesById.json`, written by extract). */
const regionStylesById = computed(() => {
  const x = props.dataset.regionStylesById
  return x && typeof x === 'object' && !Array.isArray(x) ? x : {}
})

function hasOfficialRegionStyles() {
  return Object.keys(regionStylesById.value).length > 0
}

/** When set in `worldRasterConfig.regionPolygonOverlay`, biome outlines use this color (Map Genie world map look). */
function regionOutlineAccentColor() {
  const c = regionPolygonOverlay.value?.outlineAccentColor
  return typeof c === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(c.trim()) ? c.trim() : null
}

/**
 * @param {string} prop paint key on style objects (e.g. fill-color)
 * @param {string} fallback hex
 */
function paintMatchFromRegionStyles(prop, fallback) {
  const flat = []
  for (const [id, s] of Object.entries(regionStylesById.value)) {
    const v = s?.[prop]
    if (typeof v !== 'string' || !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim())) continue
    flat.push(id, v.trim())
  }
  if (flat.length < 2) return null
  return /** @type {import('maplibre-gl').ExpressionSpecification} */ ([
    'match',
    ['to-string', ['get', 'regionId']],
    ...flat,
    fallback,
  ])
}

/** @returns {import('maplibre-gl').ExpressionSpecification | string | null} */
function biomeColorMatchFromTitle(colorsObj) {
  if (!colorsObj || typeof colorsObj !== 'object') return null
  const flat = []
  for (const [k, v] of Object.entries(colorsObj)) {
    if (!k || typeof v !== 'string' || !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim())) continue
    flat.push(k, v.trim())
  }
  if (!flat.length) return null
  return /** @type {import('maplibre-gl').ExpressionSpecification} */ (['match', ['get', 'title'], ...flat, '#aac4d6'])
}

function buildRegionFillOpacityExpression() {
  const op = regionPolygonOverlay.value?.fillOpacity
  const idle = typeof op?.idle === 'number' ? op.idle : 0.07
  const hover = typeof op?.hover === 'number' ? op.hover : 0.28
  const selected = typeof op?.selected === 'number' ? op.selected : 0.42
  const raw = regionPolygonOverlay.value?.excludePolygonTitles
  if (Array.isArray(raw) && raw.length > 0) {
    const lit = /** @type {import('maplibre-gl').ExpressionSpecification} */ (['literal', raw.map(String)])
    return /** @type {import('maplibre-gl').ExpressionSpecification} */ ([
      'case',
      ['in', ['get', 'title'], lit],
      0,
      ['boolean', ['feature-state', 'selected'], false],
      selected,
      ['boolean', ['feature-state', 'hover'], false],
      hover,
      idle,
    ])
  }
  return /** @type {import('maplibre-gl').ExpressionSpecification} */ ([
    'case',
    ['boolean', ['feature-state', 'selected'], false],
    selected,
    ['boolean', ['feature-state', 'hover'], false],
    hover,
    idle,
  ])
}

function buildRegionLineOpacityExpression() {
  const strong = !!regionOutlineAccentColor()
  const oSel = strong ? 1 : 0.95
  const oHov = strong ? 0.97 : 0.78
  const oIdle = strong ? 0.9 : 0.62
  const raw = regionPolygonOverlay.value?.excludePolygonTitles
  if (Array.isArray(raw) && raw.length > 0) {
    const lit = /** @type {import('maplibre-gl').ExpressionSpecification} */ (['literal', raw.map(String)])
    return /** @type {import('maplibre-gl').ExpressionSpecification} */ ([
      'case',
      ['in', ['get', 'title'], lit],
      0,
      ['boolean', ['feature-state', 'selected'], false],
      oSel,
      ['boolean', ['feature-state', 'hover'], false],
      oHov,
      oIdle,
    ])
  }
  return /** @type {import('maplibre-gl').ExpressionSpecification} */ ([
    'case',
    ['boolean', ['feature-state', 'selected'], false],
    oSel,
    ['boolean', ['feature-state', 'hover'], false],
    oHov,
    oIdle,
  ])
}

function regionLabelLayerFilter() {
  const raw = regionPolygonOverlay.value?.excludePolygonTitles
  if (!Array.isArray(raw) || !raw.length) return undefined
  const lit = /** @type {import('maplibre-gl').ExpressionSpecification} */ (['literal', raw.map(String)])
  return /** @type {import('maplibre-gl').FilterSpecification} */ (['!', ['in', ['get', 'title'], lit]])
}

/** Same order as Map Genie Resources biome list (`mapData.regions` array) */
const REGION_NAV_RANK = computed(() => {
  const m = new Map()
  for (let i = 0; i < (regionNav.value.order ?? []).length; i++) {
    const id = Number(regionNav.value.order[i])
    if (Number.isFinite(id)) m.set(id, i)
  }
  return m
})

const mapContainerRef = ref(null)
/** @type {import('maplibre-gl').Map | null} */
let map = null
let resizeObs = null
/** Right panel: HTML from `buildLocationPopupHtml` / region summaries (trusted, escaped at build time). */
const detailPanelHtml = ref('')

function showDetailPanel(html) {
  detailPanelHtml.value = typeof html === 'string' ? html : ''
}

/** @type {string | number | null} */
let hoveredRegionFid = null
/** Sidebar / Biomes: selected region feature id (promoteId: fid) for feature-state.selected */
let selectedRegionHighlightFids = []

/** regionId → all polygon feature fids for that region (matches promoteId) */
const fidsByRegionId = computed(() => {
  const m = new Map()
  for (const f of regionsGeo.value.features ?? []) {
    const rid = f.properties?.regionId
    const fid = f.properties?.fid
    if (rid == null || fid == null) continue
    const key = Number(rid)
    if (!Number.isFinite(key)) continue
    if (!m.has(key)) m.set(key, [])
    m.get(key).push(fid)
  }
  return m
})

function expandLngLatBbox(coords, acc) {
  if (!coords || !coords.length) return
  if (typeof coords[0] === 'number') {
    const lng = coords[0]
    const lat = coords[1]
    acc.minLng = Math.min(acc.minLng, lng)
    acc.maxLng = Math.max(acc.maxLng, lng)
    acc.minLat = Math.min(acc.minLat, lat)
    acc.maxLat = Math.max(acc.maxLat, lat)
    return
  }
  for (const c of coords) expandLngLatBbox(c, acc)
}

/** @returns {[[number, number], [number, number]] | null} */
function bboxLngLatForRegionId(regionId) {
  const acc = { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity }
  for (const f of regionsGeo.value.features ?? []) {
    if (Number(f.properties?.regionId) !== Number(regionId)) continue
    expandLngLatBbox(f.geometry?.coordinates, acc)
  }
  if (!Number.isFinite(acc.minLng) || acc.minLng === Infinity) return null
  return [
    [acc.minLng, acc.minLat],
    [acc.maxLng, acc.maxLat],
  ]
}

/** Union bounding box for multiple regionIds (one resource, many biomes) */
function bboxLngLatForRegionIds(regionIds) {
  const acc = { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity }
  let any = false
  const seen = new Set()
  for (const rid of regionIds) {
    const key = Number(rid)
    if (!Number.isFinite(key) || seen.has(key)) continue
    seen.add(key)
    const b = bboxLngLatForRegionId(key)
    if (!b) continue
    any = true
    acc.minLng = Math.min(acc.minLng, b[0][0])
    acc.minLat = Math.min(acc.minLat, b[0][1])
    acc.maxLng = Math.max(acc.maxLng, b[1][0])
    acc.maxLat = Math.max(acc.maxLat, b[1][1])
  }
  if (!any || !Number.isFinite(acc.minLng) || acc.minLng === Infinity) return null
  return [
    [acc.minLng, acc.minLat],
    [acc.maxLng, acc.maxLat],
  ]
}

function popupLngLatForBboxCenter(bbox) {
  if (!bbox) return /** @type {[number, number]} */ ([0, 0])
  const cx = (bbox[0][0] + bbox[1][0]) / 2
  const cy = (bbox[0][1] + bbox[1][1]) / 2
  return /** @type {[number, number]} */ ([cx, cy])
}

function clearRegionHighlightSelection() {
  if (!map?.getSource?.('mg-regions')) return
  for (const fid of selectedRegionHighlightFids) {
    try {
      map.setFeatureState({ source: 'mg-regions', id: fid }, { selected: false })
    } catch {
      /* ignore */
    }
  }
  selectedRegionHighlightFids = []
}

function highlightRegionPolygonsByRegionIds(regionIds) {
  clearRegionHighlightSelection()
  if (!map?.getSource?.('mg-regions')) return
  if (!Array.isArray(regionIds) || !regionIds.length) return
  const seen = new Set()
  for (const rid of regionIds) {
    const key = Number(rid)
    if (!Number.isFinite(key) || seen.has(key)) continue
    seen.add(key)
    const fids = fidsByRegionId.value.get(key)
    if (!fids?.length) continue
    for (const fid of fids) {
      try {
        map.setFeatureState({ source: 'mg-regions', id: fid }, { selected: true })
        selectedRegionHighlightFids.push(fid)
      } catch {
        /* ignore */
      }
    }
  }
}

function highlightRegionPolygonsByRegionId(regionId) {
  highlightRegionPolygonsByRegionIds([regionId])
}

const cavesVisible = ref(true)
const cavesOpacity = ref(0.85)
/** Shown for all maps; Map Genie SN1 also blends caves-v1 over default with its own slider. */
const mainRasterOpacity = ref(1)

const searchQuery = ref('')

/** Sidebar accordion: only the first block (Categories) expanded by default */
const sidebarFold = reactive({
  categories: true,
  biomes: false,
  resources: false,
  poi: false,
})

/** @param {'categories' | 'biomes' | 'resources' | 'poi'} key */
function toggleSidebarFold(key) {
  sidebarFold[key] = !sidebarFold[key]
}

/**
 * Playable area from tiles + on-map pins; when resources are not on the map, bounds use POI coords only.
 */
const mapMaxBoundsLngLat = computed(() => {
  let minLng = Infinity
  let maxLng = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity
  for (const m of markersData.value) {
    if (m.mapGenieSource === 'resource' && worldRasterConfig.value.displayResourcePinsOnMap !== true) continue
    const lng = Number(m.lng)
    const lat = Number(m.lat)
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
  }
  if (!Number.isFinite(minLng) || minLng === Infinity) return null
  const padLng = (maxLng - minLng) * 0.1
  const padLat = (maxLat - minLat) * 0.1
  return /** @type {[[number, number], [number, number]]} */ ([
    [minLng - padLng, minLat - padLat],
    [maxLng + padLng, maxLat + padLat],
  ])
})

/** Group titles match bundled Map Genie data; Raw Materials / Biological only list icons with POI pins */
const MAP_GENIE_GROUP_ORDER = ['Locations', 'Raw Materials', 'Biological', 'Tech', 'Communications', 'Other']

function poiSidebarGroupTitle(m) {
  const g = typeof m.groupTitle === 'string' ? m.groupTitle.trim() : ''
  return g || 'Other'
}

/** Legacy rows without groupTitle: fall back to resourceKind */
function resourceDataPanelKey(m) {
  const gt = typeof m.groupTitle === 'string' ? m.groupTitle.trim() : ''
  if (gt === 'Raw Materials' || gt === 'Biological') return gt
  const rk = m.resourceKind
  if (rk === 'mineral') return 'Raw Materials'
  if (rk === 'biological' || rk === 'fauna') return 'Biological'
  return 'Other'
}

/**
 * Map Genie Resources sidebar: group by resource name, then list spawn biomes in site `regions` nav order (not by biome).
 * @returns {Array<{ key: string, name: string, primaryIcon: string, regionRows: Array<{ markerId: number, regionId: number | null, regionTitle: string }> }>}
 */
function collectResourceEntries(markerRows, titleMap) {
  const UNKNOWN_NAV = 100000
  /** @type Map<string, { key: string, name: string, primaryIcon: string, regionRows: Array<{ markerId: number, regionId: number | null, regionTitle: string }> }> */
  const byKey = new Map()

  for (const m of markerRows) {
    const rk = m.resourceKind
    const reid = m.resourceEntryId
    if (rk == null || reid == null) continue
    const key = `${rk}:${reid}`
    const regId = m.regionId
    let regionTitle = ''
    if (typeof regId === 'number' && Number.isFinite(regId)) {
      const rt = titleMap.get(regId)
      if (typeof rt === 'string' && rt.trim()) regionTitle = rt.trim()
    }
    if (!regionTitle) regionTitle = 'Other'

    if (!byKey.has(key)) {
      byKey.set(key, {
        key,
        name: typeof m.name === 'string' ? m.name : '',
        primaryIcon: typeof m.icon === 'string' ? m.icon : 'other',
        regionRows: [],
      })
    }
    byKey.get(key).regionRows.push({
      markerId: m.id,
      regionId: typeof regId === 'number' && Number.isFinite(regId) ? regId : null,
      regionTitle,
    })
  }

  const entries = [...byKey.values()]
  for (const e of entries) {
    e.regionRows.sort((a, b) => {
      const ra =
        a.regionId != null && REGION_NAV_RANK.value.has(Number(a.regionId))
          ? REGION_NAV_RANK.value.get(Number(a.regionId))
          : UNKNOWN_NAV
      const rb =
        b.regionId != null && REGION_NAV_RANK.value.has(Number(b.regionId))
          ? REGION_NAV_RANK.value.get(Number(b.regionId))
          : UNKNOWN_NAV
      const ia = ra === undefined ? UNKNOWN_NAV : ra
      const ib = rb === undefined ? UNKNOWN_NAV : rb
      if (ia !== ib) return ia - ib
      return String(a.regionTitle).localeCompare(String(b.regionTitle), 'en')
    })
  }

  entries.sort((a, b) => String(a.name).localeCompare(String(b.name), 'en'))
  return entries
}

/** regionId → biome label (matches map labels) */
function buildMarkerFeatureProperties(m, regionTitleById) {
  const name = typeof m.name === 'string' ? m.name : ''
  const rid = m.regionId
  let regionTitle = ''
  if (typeof rid === 'number' && Number.isFinite(rid)) {
    regionTitle = regionTitleById.get(rid) ?? ''
  }
  return {
    id: m.id,
    title: name,
    icon: typeof m.icon === 'string' ? m.icon : 'other',
    categoryId: m.categoryId != null ? m.categoryId : '',
    categoryTitle: typeof m.categoryTitle === 'string' ? m.categoryTitle : '',
    regionTitle,
    summary: typeof m.detailSummary === 'string' ? m.detailSummary : '',
    description: typeof m.detailDescription === 'string' ? m.detailDescription : '',
    media: Array.isArray(m.media) ? m.media : [],
    mapGenieSource: m.mapGenieSource === 'resource' ? 'resource' : 'poi',
  }
}

function mapgenieMarkersToFeatureCollection(markers, regionTitleById) {
  const features = []
  for (const m of markers) {
    const lng = Number(m.lng)
    const lat = Number(m.lat)
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: buildMarkerFeatureProperties(m, regionTitleById),
    })
  }
  return { type: 'FeatureCollection', features }
}

/** Map + category toggles: POIs and (when configured) Raw Materials / Biological pins like mapgenie.io */
const markersOnMapOnly = computed(() => {
  if (worldRasterConfig.value.displayResourcePinsOnMap === true) return markersData.value
  return markersData.value.filter((m) => m.mapGenieSource !== 'resource')
})

const resourceMarkersCount = computed(() => markersData.value.filter((m) => m.mapGenieSource === 'resource').length)

const regionIdToTitle = computed(() => {
  const map = new Map()
  for (const f of regionLabelsGeo.value.features ?? []) {
    const id = f.properties?.regionId
    const t = f.properties?.title
    if (id == null || typeof t !== 'string') continue
    const n = Number(id)
    if (Number.isFinite(n)) map.set(n, t)
  }
  return map
})

const locationsGeo = computed(() => mapgenieMarkersToFeatureCollection(markersOnMapOnly.value, regionIdToTitle.value))
const locationFeatures = computed(() => locationsGeo.value.features ?? [])

/** Icon keys used on the map (excludes biological_resource etc. used only in Resources) */
const iconKeysList = computed(() => {
  const s = new Set()
  for (const f of locationFeatures.value) {
    const i = f.properties?.icon
    if (typeof i === 'string') s.add(i)
  }
  return [...s].sort()
})

/** Category visibility → symbol layer filter */
const iconVisible = reactive(/** @type {Record<string, boolean>} */ {})

watch(
  iconKeysList,
  (keys) => {
    for (const k of keys) {
      if (iconVisible[k] === undefined) iconVisible[k] = true
    }
  },
  { immediate: true },
)

const iconCounts = computed(() => {
  const m = Object.create(null)
  for (const f of locationFeatures.value) {
    const i = f.properties?.icon
    if (typeof i !== 'string') continue
    m[i] = (m[i] || 0) + 1
  }
  return m
})

/** Categories: groups that actually have on-map POIs */
const sidebarCategoryGroups = computed(() => {
  const rows = []
  for (const groupTitle of MAP_GENIE_GROUP_ORDER) {
    const iconSet = new Set()
    for (const m of markersOnMapOnly.value) {
      if (poiSidebarGroupTitle(m) !== groupTitle) continue
      if (typeof m.icon === 'string') iconSet.add(m.icon)
    }
    const icons = [...iconSet].sort((a, b) => a.localeCompare(b, 'en'))
    if (!icons.length) continue
    rows.push({ groupTitle, icons })
  }
  return rows
})

const filteredLocations = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return locationFeatures.value.filter((f) => {
    const p = f.properties
    if (!p) return false
    if (iconVisible[p.icon] === false) return false
    if (!q) return true
    const title = String(p.title ?? '').toLowerCase()
    const cat = String(p.categoryTitle ?? '').toLowerCase()
    const iconLbl = formatIconLabel(String(p.icon ?? '')).toLowerCase()
    const summary = String(p.summary ?? '').toLowerCase()
    const desc = String(p.description ?? '').toLowerCase()
    const region = String(p.regionTitle ?? '').toLowerCase()
    return (
      title.includes(q) ||
      cat.includes(q) ||
      iconLbl.includes(q) ||
      summary.includes(q) ||
      desc.includes(q) ||
      region.includes(q)
    )
  })
})

/** POI list (matches map pins) */
const filteredPoiLocations = computed(() => filteredLocations.value)

/** Resource markers (markers.json): search only (categories affect POI layers) */
const filteredResourceMarkers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const out = []
  for (const m of markersData.value) {
    if (m.mapGenieSource !== 'resource') continue
    if (!q) {
      out.push(m)
      continue
    }
    const title = String(m.name ?? '').toLowerCase()
    const cat = String(m.categoryTitle ?? '').toLowerCase()
    const iconLbl = formatIconLabel(String(m.icon ?? '')).toLowerCase()
    const desc = String(m.detailDescription ?? '').toLowerCase()
    const rid = m.regionId
    const regTitle =
      typeof rid === 'number' && Number.isFinite(rid) ? String(regionIdToTitle.value.get(rid) ?? '').toLowerCase() : ''
    const gTitle = String(m.groupTitle ?? '').toLowerCase()
    if (
      title.includes(q) ||
      cat.includes(q) ||
      iconLbl.includes(q) ||
      desc.includes(q) ||
      regTitle.includes(q) ||
      gTitle.includes(q)
    )
      out.push(m)
  }
  return out
})

/**
 * specialData.resources: split like the site into Raw Materials / Biological (Samples / Creatures); sidebar groups by resource then biome rows.
 */
const resourceSidebarPanels = computed(() => {
  const titleMap = regionIdToTitle.value
  /** @type {Array<{ kind: string, groupTitle: string, resourceEntries?: unknown[], subsections?: unknown[] }>} */
  const panels = []

  const raw = filteredResourceMarkers.value.filter((m) => resourceDataPanelKey(m) === 'Raw Materials')
  if (raw.length) {
    panels.push({
      kind: 'resources',
      groupTitle: 'Raw Materials',
      resourceEntries: collectResourceEntries(raw, titleMap),
    })
  }

  const bio = filteredResourceMarkers.value.filter((m) => resourceDataPanelKey(m) === 'Biological')
  if (bio.length) {
    const samples = bio.filter((m) => m.resourceKind === 'biological')
    const creatures = bio.filter((m) => m.resourceKind === 'fauna')
    const subsections = []
    if (samples.length) {
      subsections.push({
        label: 'Samples',
        resourceEntries: collectResourceEntries(samples, titleMap),
      })
    }
    if (creatures.length) {
      subsections.push({
        label: 'Creatures',
        resourceEntries: collectResourceEntries(creatures, titleMap),
      })
    }
    if (subsections.length) {
      panels.push({
        kind: 'bio-sub',
        groupTitle: 'Biological',
        subsections,
      })
    }
  }

  return panels
})

function resourcePanelRowCount(panel) {
  if (panel.resourceEntries) {
    return panel.resourceEntries.reduce((s, e) => s + e.regionRows.length, 0)
  }
  if (panel.subsections) {
    return panel.subsections.reduce(
      (sum, sub) => sum + sub.resourceEntries.reduce((s, e) => s + e.regionRows.length, 0),
      0,
    )
  }
  return 0
}

const regionItems = computed(() => {
  const UNKNOWN_NAV = 100000
  return [...(regionLabelsGeo.value.features ?? [])]
    .map((f) => {
      const g = f.geometry
      if (!g || g.type !== 'Point') return null
      const c = g.coordinates
      return {
        id: f.properties?.regionId,
        title: typeof f.properties?.title === 'string' ? f.properties.title : '',
        lng: c[0],
        lat: c[1],
      }
    })
    .filter(Boolean)
    .sort((a, b) => {
      const ra =
        a.id != null && REGION_NAV_RANK.value.has(Number(a.id)) ? REGION_NAV_RANK.value.get(Number(a.id)) : UNKNOWN_NAV
      const rb =
        b.id != null && REGION_NAV_RANK.value.has(Number(b.id)) ? REGION_NAV_RANK.value.get(Number(b.id)) : UNKNOWN_NAV
      const ia = ra === undefined ? UNKNOWN_NAV : ra
      const ib = rb === undefined ? UNKNOWN_NAV : rb
      if (ia !== ib) return ia - ib
      return String(a.title).localeCompare(String(b.title), 'en')
    })
})

function formatIconLabel(icon) {
  return String(icon)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
}

function applyLocationIconFilter() {
  if (!map?.getLayer?.('mg-locations-symbols')) return
  const mapIcons = [
    ...new Set(locationFeatures.value.map((f) => f.properties?.icon).filter((x) => typeof x === 'string')),
  ]
  const allowed = mapIcons.filter((k) => iconVisible[k] !== false)
  if (allowed.length === 0) {
    map.setFilter('mg-locations-symbols', ['boolean', false])
  } else if (allowed.length === mapIcons.length && mapIcons.every((k) => iconVisible[k] !== false)) {
    map.setFilter('mg-locations-symbols', null)
  } else {
    map.setFilter('mg-locations-symbols', ['in', ['get', 'icon'], ['literal', allowed]])
  }
}

watch(iconVisible, () => applyLocationIconFilter(), { deep: true })

function flyToLngLat(lng, lat, zoom) {
  map?.flyTo({
    center: [lng, lat],
    zoom,
    duration: 1100,
    essential: true,
  })
}

function focusLocationById(id) {
  if (!map) return

  const f = locationFeatures.value.find((x) => x.properties?.id === id)
  if (f && f.geometry.type === 'Point') {
    clearRegionHighlightSelection()
    const coords = /** @type {[number, number]} */ ([
      f.geometry.coordinates[0],
      f.geometry.coordinates[1],
    ])
    flyToLngLat(coords[0], coords[1], 14)
    showDetailPanel(buildLocationPopupHtml(f.properties))
    return
  }

  const m = markersData.value.find((x) => x.id === id)
  if (!m || m.mapGenieSource !== 'resource') return
  const rid = m.regionId
  if (typeof rid === 'number' && Number.isFinite(rid)) {
    focusRegionById(rid)
    const props = buildMarkerFeatureProperties(m, regionIdToTitle.value)
    const r = regionItems.value.find((x) => Number(x.id) === Number(rid))
    if (r && typeof r.lng === 'number' && typeof r.lat === 'number') {
      showDetailPanel(buildLocationPopupHtml(props))
    }
    return
  }
  clearRegionHighlightSelection()
  const lng = Number(m.lng)
  const lat = Number(m.lat)
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return
  const props = buildMarkerFeatureProperties(m, regionIdToTitle.value)
  flyToLngLat(lng, lat, 14)
  showDetailPanel(buildLocationPopupHtml(props))
}

/** Click one biome row: highlight only that region */
function onResourceSidebarItemClick(item) {
  if (!map) return
  const rid = item.regionId
  if (rid == null || !Number.isFinite(Number(rid))) return
  focusRegionById(rid)
  const m = markersData.value.find((x) => x.id === item.markerId)
  if (!m) return
  const props = buildMarkerFeatureProperties(m, regionIdToTitle.value)
  const r = regionItems.value.find((x) => Number(x.id) === Number(rid))
  if (r && typeof r.lng === 'number' && typeof r.lat === 'number') {
    showDetailPanel(buildLocationPopupHtml(props))
  }
}

/** Click resource title: highlight all biomes for that entry in specialData (e.g. Copper Ore) */
function onResourceEntryAllRegionsClick(entry) {
  if (!map) return
  const ids = [
    ...new Set(
      entry.regionRows.map((r) => r.regionId).filter((id) => id != null && Number.isFinite(Number(id))),
    ),
  ].map(Number)
  if (!ids.length) return

  highlightRegionPolygonsByRegionIds(ids)
  const bbox = bboxLngLatForRegionIds(ids)
  if (bbox && map) {
    map.fitBounds(bbox, {
      padding: 88,
      duration: 1100,
      maxZoom: ids.length > 4 ? 11 : 12.5,
      essential: true,
    })
  }

  const repRow = entry.regionRows[0]
  const m = markersData.value.find((x) => x.id === repRow.markerId)
  if (!m) return

  const titlesOrdered = []
  const seenT = new Set()
  for (const row of entry.regionRows) {
    const t = row.regionTitle
    if (!t || seenT.has(t)) continue
    seenT.add(t)
    titlesOrdered.push(t)
  }

  const props = { ...buildMarkerFeatureProperties(m, regionIdToTitle.value) }
  props.title = entry.name
  props.regionTitle = titlesOrdered.join(', ')
  showDetailPanel(buildLocationPopupHtml(props))
}

function focusRegionById(regionId) {
  highlightRegionPolygonsByRegionId(regionId)
  const bbox = bboxLngLatForRegionId(regionId)
  if (bbox && map) {
    map.fitBounds(bbox, { padding: 72, duration: 1100, maxZoom: 12.5, essential: true })
    return
  }
  const r = regionItems.value.find((x) => Number(x.id) === Number(regionId))
  if (!r || typeof r.lng !== 'number' || typeof r.lat !== 'number') return
  flyToLngLat(r.lng, r.lat, 11)
}

function setAllCategoriesVisible(visible) {
  for (const k of iconKeysList.value) {
    iconVisible[k] = visible
  }
}

function tileUrl(pattern) {
  return `${worldRasterConfig.value.tilesBaseUrl}${pattern}`
}

const hasCavesLayer = computed(() => !!worldRasterConfig.value.cavesTileSet)

/** MapLibre `raster` layer paint props we allow from worldRasterConfig.mainRasterPaint */
const MAIN_RASTER_PAINT_KEYS = new Set([
  'raster-brightness-min',
  'raster-brightness-max',
  'raster-contrast',
  'raster-saturation',
  'raster-hue-rotate',
  'raster-fade-duration',
])

function buildMainRasterPaint() {
  const cfg = worldRasterConfig.value
  const extra = cfg.mainRasterPaint && typeof cfg.mainRasterPaint === 'object' ? cfg.mainRasterPaint : {}
  /** @type {Record<string, number>} */
  const paint = { 'raster-opacity': mainRasterOpacity.value }
  for (const [k, v] of Object.entries(extra)) {
    if (!MAIN_RASTER_PAINT_KEYS.has(k)) continue
    if (typeof v !== 'number' || !Number.isFinite(v)) continue
    paint[k] = v
  }
  return paint
}

function buildStyle() {
  const cfg = worldRasterConfig.value
  const main = cfg.mainTileSet
  const caves = cfg.cavesTileSet
  const sources = {
    mg_main: {
      type: 'raster',
      tiles: [tileUrl(main.pattern)],
      tileSize: 256,
      minzoom: main.minZoom,
      maxzoom: main.maxZoom,
      attribution: 'Local raster tiles',
    },
  }
  const layers = [
    {
      id: 'mg_background',
      type: 'background',
      paint: { 'background-color': '#000000' },
    },
    {
      id: 'mg_main',
      type: 'raster',
      source: 'mg_main',
      paint: buildMainRasterPaint(),
    },
  ]
  if (caves) {
    sources.mg_caves = {
      type: 'raster',
      tiles: [tileUrl(caves.pattern)],
      tileSize: 256,
      minzoom: caves.minZoom,
      maxzoom: caves.maxZoom,
    }
    layers.push({
      id: 'mg_caves',
      type: 'raster',
      source: 'mg_caves',
      paint: { 'raster-opacity': cavesOpacity.value },
      layout: { visibility: cavesVisible.value ? 'visible' : 'none' },
    })
  }
  return { version: 8, sources, layers }
}

function applyMainRasterLayer() {
  if (!map?.getLayer?.('mg_main')) return
  const paint = buildMainRasterPaint()
  for (const [k, v] of Object.entries(paint)) {
    map.setPaintProperty('mg_main', k, v)
  }
}

function applyCavesLayer() {
  if (!map?.getLayer?.('mg_caves')) return
  map.setLayoutProperty('mg_caves', 'visibility', cavesVisible.value ? 'visible' : 'none')
  map.setPaintProperty('mg_caves', 'raster-opacity', cavesOpacity.value)
}

function applyRasterLayers() {
  applyMainRasterLayer()
  applyCavesLayer()
}

watch([mainRasterOpacity], applyMainRasterLayer)
watch([cavesVisible, cavesOpacity], applyCavesLayer)

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeAttr(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
}

/** https only; keeps markdown links from Map Genie extracts usable without stripping. */
function isTrustedExternalLinkHost(hostname) {
  const h = String(hostname).toLowerCase()
  if (h === 'mapgenie.io') return true
  if (h.endsWith('.mapgenie.io')) return true
  if (h === 'fandom.com' || h.endsWith('.fandom.com')) return true
  if (h === 'wikia.com' || h.endsWith('.wikia.com')) return true
  if (h === 'unknownworlds.com' || h.endsWith('.unknownworlds.com')) return true
  return false
}

function isAllowedLinkUrl(url) {
  if (typeof url !== 'string') return false
  const u = url.trim()
  if (u.startsWith('/') && !u.startsWith('//')) return true
  try {
    const parsed = new URL(u)
    if (parsed.origin === window.location.origin) return true
    if (parsed.protocol === 'https:' && isTrustedExternalLinkHost(parsed.hostname)) return true
    return false
  } catch {
    return false
  }
}

/** Popup images: local bundles under /images/ (see npm run download:mapgenie-bz-media). */
function isAllowedMediaUrl(url) {
  if (typeof url !== 'string') return false
  return url.startsWith('/images/')
}

function parseMedia(prop) {
  if (Array.isArray(prop)) return prop
  if (typeof prop === 'string') {
    try {
      const x = JSON.parse(prop)
      return Array.isArray(x) ? x : []
    } catch {
      return []
    }
  }
  return []
}

/** Drop duplicate **Region:** line in resource body (biome already in popup header) */
function stripDuplicateResourceRegionLine(raw) {
  const s = typeof raw === 'string' ? raw : ''
  return s.replace(/\*\*Region:\*\*\s*[^\n\r]*(?:\r?\n|$)/gi, '').trimEnd()
}

/** Light Markdown: **bold**, [label](url), newlines */
function descriptionToHtml(raw) {
  const s = typeof raw === 'string' ? raw : ''
  const links = []
  const t = s.replace(/\[([^\]]*)\]\(([^)\s]+)\)/gi, (full, label, url) => {
    if (!isAllowedLinkUrl(url)) return label
    const i = links.length
    links.push({ label, url })
    return `@@MG_LINK_${i}@@`
  })
  let out = escapeHtml(t)
  for (let i = 0; i < links.length; i++) {
    const { label, url } = links[i]
    out = out.replace(
      `@@MG_LINK_${i}@@`,
      `<a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`,
    )
  }
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  out = out.replace(/\n/g, '<br />')
  return out
}

function buildLocationPopupHtml(props) {
  if (!props) return ''
  const title = props.title ?? ''
  const summary = props.summary ?? ''
  let description = props.description ?? ''
  const media = parseMedia(props.media)

  const chunks = [`<div class="cdm-ml-popup-body">`]
  chunks.push(`<div class="cdm-ml-popup-title">${escapeHtml(title)}</div>`)

  const regionTitle = typeof props.regionTitle === 'string' ? props.regionTitle.trim() : ''
  if (regionTitle) {
    chunks.push(`<div class="cdm-ml-popup-region">${escapeHtml(regionTitle)}</div>`)
  }

  if (props.mapGenieSource === 'resource' && regionTitle) {
    description = stripDuplicateResourceRegionLine(description)
  }

  const summaryHtml = descriptionToHtml(summary)
  if (summaryHtml.trim()) {
    chunks.push(`<div class="cdm-ml-popup-summary">${summaryHtml}</div>`)
  }

  const descHtml = descriptionToHtml(description)
  if (descHtml.trim()) chunks.push(`<div class="cdm-ml-popup-desc">${descHtml}</div>`)

  for (const m of media) {
    if (!m?.url || !isAllowedMediaUrl(m.url)) continue
    const isImg =
      m.type === 'image' || /\.(jpe?g|png|webp|gif)(\?|$)/i.test(m.url)
    if (!isImg) continue
    chunks.push(
      `<figure class="cdm-ml-popup-fig"><img class="cdm-ml-popup-img" src="${escapeAttr(m.url)}" alt="${escapeAttr(m.title || '')}" loading="lazy" decoding="async" /></figure>`,
    )
  }

  chunks.push(`</div>`)
  return chunks.join('')
}

function loadCrossOriginImage(url) {
  return new Promise((resolve, reject) => {
    const im = new Image()
    im.crossOrigin = 'anonymous'
    im.onload = () => resolve(im)
    im.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    im.src = url
  })
}

function atlasRectForIcon(iconKey) {
  const key = typeof iconKey === 'string' ? iconKey : ''
  const atlas = markersAtlas.value
  return atlas[key] ?? atlas.other
}

/** Region fill / outline / labels (Map Genie–like palette) */
function mountMapGenieRegions() {
  if (!map || map.getSource('mg-regions')) return

  const fillFromStyles = paintMatchFromRegionStyles('fill-color', '#aac4d6')
  const lineFromStyles = paintMatchFromRegionStyles('line-color', '#aac4d6')
  const titleFallback = biomeColorMatchFromTitle(regionPolygonOverlay.value?.fillColors)
  const fillColorPaint = fillFromStyles ?? titleFallback ?? '#ffcc00'
  const outlineAccent = regionOutlineAccentColor()
  const lineColorPaint =
    outlineAccent ?? lineFromStyles ?? fillFromStyles ?? titleFallback ?? '#ffcc00'

  const lineWidthPaint = outlineAccent
    ? /** @type {import('maplibre-gl').ExpressionSpecification} */ ([
        'case',
        ['boolean', ['feature-state', 'selected'], false],
        ['interpolate', ['linear'], ['zoom'], 9, 4.5, 12, 5.25, 15, 6],
        ['boolean', ['feature-state', 'hover'], false],
        ['interpolate', ['linear'], ['zoom'], 9, 3.5, 12, 4, 15, 4.75],
        ['interpolate', ['linear'], ['zoom'], 9, 2.5, 12, 3, 15, 3.5],
      ])
    : hasOfficialRegionStyles()
      ? /** @type {import('maplibre-gl').ExpressionSpecification} */ ([
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          4,
          ['boolean', ['feature-state', 'hover'], false],
          3,
          2,
        ])
      : /** @type {import('maplibre-gl').ExpressionSpecification} */ ([
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          4,
          ['boolean', ['feature-state', 'hover'], false],
          2.5,
          1,
        ])

  const textColorPaint = paintMatchFromRegionStyles('text-color', '#E6E6E6')
  const textHaloPaint = paintMatchFromRegionStyles('text-halo-color', '#253139')

  map.addSource('mg-regions', {
    type: 'geojson',
    data: regionsGeo.value,
    promoteId: 'fid',
  })

  map.addSource('mg-region-labels', {
    type: 'geojson',
    data: regionLabelsGeo.value,
  })

  map.addLayer({
    id: 'mg-regions-fill',
    type: 'fill',
    source: 'mg-regions',
    paint: {
      'fill-color': fillColorPaint,
      'fill-opacity': buildRegionFillOpacityExpression(),
    },
  })

  map.addLayer({
    id: 'mg-regions-line',
    type: 'line',
    source: 'mg-regions',
    paint: {
      'line-color': lineColorPaint,
      'line-width': lineWidthPaint,
      'line-opacity': buildRegionLineOpacityExpression(),
    },
  })

  const labelFilter = regionLabelLayerFilter()
  map.addLayer({
    id: 'mg-region-labels',
    type: 'symbol',
    source: 'mg-region-labels',
    minzoom: 9,
    ...(labelFilter ? { filter: labelFilter } : {}),
    layout: {
      'text-field': ['get', 'title'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 9, 9, 11, 11, 14, 15],
      'text-variable-anchor': ['center', 'top', 'bottom', 'left', 'right'],
      'text-radial-offset': 0.12,
      'text-allow-overlap': false,
      'text-ignore-placement': false,
      'text-padding': 4,
    },
    paint: {
      'text-color': textColorPaint ?? '#c7dcf9',
      'text-halo-color': textHaloPaint ?? '#000000',
      'text-halo-width': 1,
      'text-opacity': ['interpolate', ['linear'], ['zoom'], 9, 0.75, 10.5, 1],
    },
  })

  map.on('mousemove', 'mg-regions-fill', (e) => {
    const f = e.features?.[0]
    const fid = f?.id
    if (fid == null) return
    if (map) map.getCanvas().style.cursor = 'pointer'
    if (hoveredRegionFid === fid) return
    if (hoveredRegionFid != null) {
      map.setFeatureState({ source: 'mg-regions', id: hoveredRegionFid }, { hover: false })
    }
    hoveredRegionFid = fid
    map.setFeatureState({ source: 'mg-regions', id: hoveredRegionFid }, { hover: true })
  })

  map.on('mouseleave', 'mg-regions-fill', () => {
    if (map) map.getCanvas().style.cursor = ''
    if (hoveredRegionFid != null && map) {
      map.setFeatureState({ source: 'mg-regions', id: hoveredRegionFid }, { hover: false })
      hoveredRegionFid = null
    }
  })

  map.on('click', 'mg-regions-fill', (e) => {
    const f = e.features?.[0]
    const p = f?.properties
    if (!p) return
    const rid = p.regionId
    if (rid != null && rid !== '') highlightRegionPolygonsByRegionId(rid)
    const title = p.title ?? ''
    const subtitle = p.subtitle ?? ''
    const subHtml = subtitle ? `<div class="cdm-ml-popup-desc">${escapeHtml(subtitle)}</div>` : ''
    showDetailPanel(
      `<div class="cdm-ml-popup-body"><div class="cdm-ml-popup-title">${escapeHtml(title)}</div>${subHtml}</div>`,
    )
  })

  map.on('contextmenu', 'mg-regions-fill', (e) => {
    e.preventDefault()
    const rid = e.features?.[0]?.properties?.regionId
    if (rid == null || rid === '') return
    focusRegionById(rid)
    showDetailPanel('')
  })
}

async function mountMapGenieLocationSymbols() {
  if (!map || map.getSource('mg-locations')) return

  const feats = locationFeatures.value
  const usedIcons = new Set()
  for (const f of feats) {
    const icon = f.properties?.icon
    if (typeof icon === 'string') usedIcons.add(icon)
  }

  const atlasImage = await loadCrossOriginImage(markersAtlasPng.value)

  for (const iconName of usedIcons) {
    if (map.hasImage(iconName)) continue
    const rect = atlasRectForIcon(iconName)
    if (!rect) continue

    const canvas = document.createElement('canvas')
    canvas.width = rect.width
    canvas.height = rect.height
    const ctx = canvas.getContext('2d')
    if (!ctx) continue
    ctx.drawImage(
      atlasImage,
      rect.x,
      rect.y,
      rect.width,
      rect.height,
      0,
      0,
      rect.width,
      rect.height,
    )
    const bitmap = await createImageBitmap(canvas)
    map.addImage(iconName, bitmap, { pixelRatio: rect.pixelRatio ?? 2 })
  }

  map.addSource('mg-locations', {
    type: 'geojson',
    data: locationsGeo.value,
  })

  map.addLayer({
    id: 'mg-locations-symbols',
    type: 'symbol',
    source: 'mg-locations',
    layout: {
      'icon-image': ['get', 'icon'],
      /** Reference: collision hides overlap at low zoom; from ~zoom 10 allow dense overlapping pins */
      'icon-size': ['interpolate', ['linear'], ['zoom'], 9, 0.42, 12, 0.52, 15, 0.58],
      'icon-anchor': 'bottom',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'symbol-sort-key': ['get', 'id'],
    },
  })

  map.on('click', 'mg-locations-symbols', (e) => {
    clearRegionHighlightSelection()
    const f = e.features?.[0]
    if (!f || f.geometry.type !== 'Point') return
    const html = buildLocationPopupHtml(f.properties)
    showDetailPanel(html)
  })

  map.on('mouseenter', 'mg-locations-symbols', () => {
    if (map) map.getCanvas().style.cursor = 'pointer'
  })
  map.on('mouseleave', 'mg-locations-symbols', () => {
    if (map) map.getCanvas().style.cursor = ''
  })

  applyLocationIconFilter()
}

onMounted(() => {
  const el = mapContainerRef.value
  if (!el) return

  map = new maplibregl.Map({
    container: el,
    style: buildStyle(),
    center: worldRasterConfig.value.initialCenterLngLat,
    zoom: worldRasterConfig.value.initialZoom,
    minZoom: worldRasterConfig.value.mainTileSet.minZoom,
    maxZoom: worldRasterConfig.value.mainTileSet.maxZoom + 0.99,
    maxBounds: mapMaxBoundsLngLat.value ?? undefined,
    renderWorldCopies: false,
    attributionControl: true,
  })

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
  map.on('error', (e) => console.warn('[mapgenie tiles]', e.error ?? e))

  map.on('load', async () => {
    applyRasterLayers()
    try {
      mountMapGenieRegions()
      await mountMapGenieLocationSymbols()
    } catch (err) {
      console.warn('[mapgenie overlays]', err)
    }
  })

  resizeObs = new ResizeObserver(() => map?.resize())
  resizeObs.observe(el)
})

onUnmounted(() => {
  showDetailPanel('')
  clearRegionHighlightSelection()
  if (map && hoveredRegionFid != null) {
    try {
      map.setFeatureState({ source: 'mg-regions', id: hoveredRegionFid }, { hover: false })
    } catch {
      /* map may already be destroyed */
    }
    hoveredRegionFid = null
  }
  resizeObs?.disconnect()
  resizeObs = null
  map?.remove()
  map = null
})
</script>

<template>
  <div class="cdm-root">
    <main class="cdm-main">
      <div class="cdm-map-row">
        <div class="cdm-split">
          <aside class="cdm-sidebar panzoom-exclude" aria-label="Filters and lists">
            <div class="cdm-sidebar__sticky">
              <label class="cdm-side-search">
                <span class="cdm-sr-only">Search</span>
                <input
                  v-model.trim="searchQuery"
                  type="search"
                  class="cdm-side-search__input"
                  placeholder="Search markers, biomes, resources…"
                  autocomplete="off"
                />
              </label>
            </div>

            <div class="cdm-sidebar__body">
              <!-- Categories + biomes: stacked on narrow sidebar; two columns when wide enough -->
              <div class="cdm-sidebar__pair">
                <div class="cdm-fold cdm-side-panel" :class="{ 'cdm-fold--expanded': sidebarFold.categories }">
                  <button
                    type="button"
                    class="cdm-fold__trigger"
                    :aria-expanded="sidebarFold.categories"
                    aria-controls="cdm-fold-panel-categories"
                    id="cdm-fold-heading-categories"
                    @click="toggleSidebarFold('categories')"
                  >
                    <span class="cdm-fold__chevron" aria-hidden="true" />
                    <span class="cdm-fold__title">Categories</span>
                    <span class="cdm-fold__badge">{{ sidebarCategoryGroups.length }}</span>
                  </button>
                  <div
                    id="cdm-fold-panel-categories"
                    class="cdm-fold__panel"
                    role="region"
                    aria-labelledby="cdm-fold-heading-categories"
                    :hidden="!sidebarFold.categories"
                  >
                    <div class="cdm-fold__toolbar">
                      <button type="button" class="cdm-side-linkbtn" @click="setAllCategoriesVisible(true)">Show all</button>
                      <button type="button" class="cdm-side-linkbtn" @click="setAllCategoriesVisible(false)">Hide all</button>
                    </div>
                    <div class="cdm-category-groups">
                      <details
                        v-for="(grp, gIdx) in sidebarCategoryGroups"
                        :key="grp.groupTitle"
                        class="cdm-details"
                        :open="gIdx === 0"
                      >
                        <summary class="cdm-details__summary">{{ grp.groupTitle }}</summary>
                        <div class="cdm-details__body">
                          <div class="cdm-icon-chips cdm-icon-chips--scroll">
                            <label v-for="icon in grp.icons" :key="`${grp.groupTitle}-${icon}`" class="cdm-chip">
                              <input v-model="iconVisible[icon]" type="checkbox" />
                              <span class="cdm-chip__text">{{ formatIconLabel(icon) }}</span>
                              <span class="cdm-chip__cnt">{{ iconCounts[icon] ?? 0 }}</span>
                            </label>
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>

                <div class="cdm-fold cdm-side-panel" :class="{ 'cdm-fold--expanded': sidebarFold.biomes }">
                  <button
                    type="button"
                    class="cdm-fold__trigger"
                    :aria-expanded="sidebarFold.biomes"
                    aria-controls="cdm-fold-panel-biomes"
                    id="cdm-fold-heading-biomes"
                    @click="toggleSidebarFold('biomes')"
                  >
                    <span class="cdm-fold__chevron" aria-hidden="true" />
                    <span class="cdm-fold__title">Biomes</span>
                    <span class="cdm-fold__badge">{{ regionItems.length }}</span>
                  </button>
                  <div
                    id="cdm-fold-panel-biomes"
                    class="cdm-fold__panel"
                    role="region"
                    aria-labelledby="cdm-fold-heading-biomes"
                    :hidden="!sidebarFold.biomes"
                  >
                    <p class="cdm-biomes-tip">Right-click a biome polygon on the map to fly to its center.</p>
                    <ul class="cdm-side-list cdm-side-list--regions">
                      <li v-for="r in regionItems" :key="r.id">
                        <button type="button" class="cdm-side-item cdm-side-item--region" @click="focusRegionById(r.id)">
                          {{ r.title }}
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Resources -->
              <div class="cdm-fold cdm-side-panel" :class="{ 'cdm-fold--expanded': sidebarFold.resources }">
                <button
                  type="button"
                  class="cdm-fold__trigger"
                  :aria-expanded="sidebarFold.resources"
                  aria-controls="cdm-fold-panel-resources"
                  id="cdm-fold-heading-resources"
                  @click="toggleSidebarFold('resources')"
                >
                  <span class="cdm-fold__chevron" aria-hidden="true" />
                  <span class="cdm-fold__title">Resources</span>
                  <span class="cdm-fold__badge">{{ resourceSidebarPanels.length }}</span>
                </button>
                <div
                  id="cdm-fold-panel-resources"
                  class="cdm-fold__panel"
                  role="region"
                  aria-labelledby="cdm-fold-heading-resources"
                  :hidden="!sidebarFold.resources"
                >
                  <template v-if="resourceSidebarPanels.length === 0">
                    <p class="cdm-resource-empty cdm-resource-empty--standalone">No matching resources (try clearing the search).</p>
                  </template>
                  <template v-else>
                    <details
                      v-for="(panel, pIdx) in resourceSidebarPanels"
                      :key="panel.groupTitle"
                      class="cdm-details cdm-details--ruled"
                      :open="pIdx === 0"
                    >
                      <summary class="cdm-details__summary cdm-details__summary--strong">
                        {{ panel.groupTitle }}
                        <span class="cdm-details__count">{{ resourcePanelRowCount(panel) }}</span>
                      </summary>
                      <div class="cdm-details__body cdm-details__body--flush">
                        <div class="cdm-resource-scroll">
                          <template v-if="panel.kind === 'resources'">
                            <div v-for="entry in panel.resourceEntries" :key="entry.key" class="cdm-resource-item-block">
                              <button
                                type="button"
                                class="cdm-side-item cdm-resource-entry-head"
                                @click="onResourceEntryAllRegionsClick(entry)"
                              >
                                <span class="cdm-side-item__title">{{ entry.name }}</span>
                                <span class="cdm-side-item__meta"
                                  >{{ formatIconLabel(entry.primaryIcon) }} · {{ entry.regionRows.length }}</span
                                >
                              </button>
                              <ul class="cdm-side-list cdm-side-list--resource-block">
                                <li v-for="row in entry.regionRows" :key="row.markerId">
                                  <button
                                    type="button"
                                    class="cdm-side-item cdm-side-item--loc"
                                    @click="onResourceSidebarItemClick(row)"
                                  >
                                    <span class="cdm-side-item__title">{{ row.regionTitle }}</span>
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </template>
                          <template v-else>
                            <div v-for="sub in panel.subsections" :key="sub.label" class="cdm-resource-bio-sub">
                              <h4 class="cdm-resource-subhead cdm-resource-subhead--bio">{{ sub.label }}</h4>
                              <div v-for="entry in sub.resourceEntries" :key="entry.key" class="cdm-resource-item-block">
                                <button
                                  type="button"
                                  class="cdm-side-item cdm-resource-entry-head"
                                  @click="onResourceEntryAllRegionsClick(entry)"
                                >
                                  <span class="cdm-side-item__title">{{ entry.name }}</span>
                                  <span class="cdm-side-item__meta"
                                    >{{ formatIconLabel(entry.primaryIcon) }} · {{ entry.regionRows.length }}</span
                                  >
                                </button>
                                <ul class="cdm-side-list cdm-side-list--resource-block">
                                  <li v-for="row in entry.regionRows" :key="row.markerId">
                                    <button
                                      type="button"
                                      class="cdm-side-item cdm-side-item--loc"
                                      @click="onResourceSidebarItemClick(row)"
                                    >
                                      <span class="cdm-side-item__title">{{ row.regionTitle }}</span>
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </template>
                        </div>
                      </div>
                    </details>
                  </template>
                </div>
              </div>

              <!-- POIs: two-column cards -->
              <div class="cdm-fold cdm-side-panel" :class="{ 'cdm-fold--expanded': sidebarFold.poi }">
                <button
                  type="button"
                  class="cdm-fold__trigger"
                  :aria-expanded="sidebarFold.poi"
                  aria-controls="cdm-fold-panel-poi"
                  id="cdm-fold-heading-poi"
                  @click="toggleSidebarFold('poi')"
                >
                  <span class="cdm-fold__chevron" aria-hidden="true" />
                  <span class="cdm-fold__title">Points of interest</span>
                  <span class="cdm-fold__badge">{{ filteredPoiLocations.length }}</span>
                </button>
                <div
                  id="cdm-fold-panel-poi"
                  class="cdm-fold__panel"
                  role="region"
                  aria-labelledby="cdm-fold-heading-poi"
                  :hidden="!sidebarFold.poi"
                >
                  <ul class="cdm-side-list cdm-side-list--locations cdm-side-list--grid2">
                    <li v-for="f in filteredPoiLocations" :key="f.properties.id">
                      <button type="button" class="cdm-side-item cdm-side-item--loc" @click="focusLocationById(f.properties.id)">
                        <span class="cdm-side-item__title">{{ f.properties.title }}</span>
                        <span v-if="f.properties.regionTitle" class="cdm-side-item__regions">{{ f.properties.regionTitle }}</span>
                        <span class="cdm-side-item__meta">{{
                          f.properties.categoryTitle || formatIconLabel(f.properties.icon)
                        }}</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </aside>

          <div class="cdm-map-stage">
            <div class="cdm-map-frame">
              <div ref="mapContainerRef" class="cdm-map-host" />
              <div
                class="cdm-toolbar cdm-toolbar--float panzoom-exclude"
                role="group"
                aria-label="Basemap opacity"
              >
                <label class="cdm-range">
                  <span class="cdm-range__label">Base map</span>
                  <input
                    v-model.number="mainRasterOpacity"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                  />
                </label>
                <template v-if="hasCavesLayer">
                  <label class="cdm-check">
                    <input v-model="cavesVisible" type="checkbox" />
                    <span>Cave layer caves-v1</span>
                  </label>
                  <label class="cdm-range">
                    <span class="cdm-range__label">Caves opacity</span>
                    <input
                      v-model.number="cavesOpacity"
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      :disabled="!cavesVisible"
                    />
                  </label>
                </template>
              </div>
            </div>
          </div>

          <aside class="cdm-detail-panel panzoom-exclude" aria-label="Selection details">
            <div class="cdm-detail-panel__head">
              <h2 class="cdm-detail-panel__title">Details</h2>
              <button
                v-if="detailPanelHtml"
                type="button"
                class="cdm-detail-panel__clear"
                @click="showDetailPanel('')"
              >
                Clear
              </button>
            </div>
            <div class="cdm-detail-panel__scroll">
              <div v-if="detailPanelHtml" class="cdm-rich-html" v-html="detailPanelHtml" />
              <div v-else class="cdm-detail-panel__empty">
                <p class="cdm-detail-panel__empty-title">Nothing selected</p>
                <p class="cdm-detail-panel__empty-hint">
                  Click a pin or a biome polygon on the map to see descriptions and resource info.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.cdm-root {
  --cdm-deep: #070f18;
  --cdm-ink: #0e1a28;
  --cdm-surface: rgba(16, 32, 52, 0.72);
  --cdm-elevated: rgba(20, 38, 62, 0.94);
  --cdm-border: rgba(92, 124, 148, 0.38);
  --cdm-border-strong: rgba(140, 168, 188, 0.28);
  --cdm-text: #e8f2f3;
  --cdm-muted: rgba(168, 198, 208, 0.82);
  --cdm-faint: rgba(148, 178, 190, 0.55);
  --cdm-sea: #4e9d94;
  --cdm-amber: #d4a93a;
  --cdm-amber-dim: rgba(212, 169, 58, 0.18);

  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  background: var(--cdm-deep);
  background-image:
    radial-gradient(ellipse 120% 80% at 12% -10%, rgba(78, 157, 148, 0.08), transparent 55%),
    radial-gradient(ellipse 90% 60% at 88% 100%, rgba(212, 169, 58, 0.06), transparent 50%);
  color: var(--cdm-muted);
  font-family: 'Noto Sans', system-ui, sans-serif;
}

@media (prefers-reduced-motion: reduce) {
  .cdm-side-item,
  .cdm-chip,
  .cdm-fold__trigger,
  .cdm-fold__chevron,
  .cdm-details__summary::after {
    transition: none !important;
  }
}

.cdm-main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 8px 10px 10px;
  box-sizing: border-box;
}

.cdm-map-row {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  align-items: stretch;
}

/* Left filters | map | right details */
.cdm-split {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(240px, min(28vw, 340px)) minmax(0, 1fr) minmax(260px, min(32vw, 400px));
  align-items: stretch;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--cdm-border);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.05),
    0 12px 40px rgba(0, 0, 0, 0.45);
}

.cdm-map-stage {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--cdm-border);
  border-right: 1px solid var(--cdm-border);
}

.cdm-map-frame {
  flex: 1;
  min-height: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 0;
  box-shadow: none;
}

.cdm-toolbar {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 20px;
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--cdm-elevated);
  border: 1px solid var(--cdm-border);
  font-size: 0.8rem;
  color: var(--cdm-muted);
}

.cdm-toolbar--float {
  position: absolute;
  left: 12px;
  bottom: 12px;
  z-index: 2;
  max-width: min(100% - 24px, 400px);
  box-shadow: 0 10px 36px rgba(0, 0, 0, 0.42);
}

.cdm-check {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.cdm-check input {
  accent-color: var(--cdm-amber);
}

.cdm-range {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: min(100%, 220px);
}

.cdm-range__label {
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  font-size: 0.74rem;
  color: var(--cdm-faint);
}

.cdm-range input[type='range'] {
  flex: 1;
  min-width: 100px;
  accent-color: var(--cdm-sea);
}

.cdm-map-host {
  flex: 1;
  min-height: min(62vh, 640px);
  width: 100%;
  border-radius: 0;
  overflow: hidden;
  border: none;
}

.cdm-detail-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  background: linear-gradient(195deg, rgba(12, 24, 40, 0.98) 0%, rgba(8, 14, 26, 0.99) 100%);
}

.cdm-detail-panel__head {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--cdm-border);
  background: rgba(6, 12, 22, 0.55);
}

.cdm-detail-panel__title {
  margin: 0;
  font-family: Oxanium, 'Noto Sans', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(184, 232, 223, 0.92);
}

.cdm-detail-panel__clear {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid rgba(92, 124, 148, 0.45);
  background: rgba(8, 16, 28, 0.55);
  color: var(--cdm-text);
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.cdm-detail-panel__clear:hover {
  background: rgba(78, 157, 148, 0.18);
  border-color: rgba(78, 157, 148, 0.45);
}

.cdm-detail-panel__scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 14px 16px 18px;
  scrollbar-gutter: stable;
}

.cdm-detail-panel__empty {
  padding: 28px 8px;
  text-align: center;
}

.cdm-detail-panel__empty-title {
  margin: 0 0 8px;
  font-family: Oxanium, 'Noto Sans', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: var(--cdm-text);
}

.cdm-detail-panel__empty-hint {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.55;
  color: var(--cdm-faint);
  max-width: 22rem;
  margin-inline: auto;
}

.cdm-sidebar {
  flex-shrink: 0;
  width: auto;
  max-width: none;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 0;
  border-radius: 0;
  background: linear-gradient(198deg, rgba(22, 40, 62, 0.94) 0%, rgba(11, 20, 34, 0.98) 100%);
  border: none;
  box-shadow: none;
  container-type: inline-size;
  container-name: cdm-sidebar;
}

.cdm-sidebar__sticky {
  flex-shrink: 0;
  padding: 14px 16px 12px;
  border-bottom: 1px solid var(--cdm-border);
  background: rgba(6, 12, 22, 0.42);
}

.cdm-sidebar__body {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  /* Scrollbar appears when content overflows; stable gutter avoids layout shift when it kicks in. */
  overflow-y: auto;
  scrollbar-gutter: stable;
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: auto;
  scrollbar-color: rgba(212, 169, 58, 0.65) rgba(8, 16, 28, 0.65);
}

.cdm-sidebar__body::-webkit-scrollbar {
  width: 12px;
}

.cdm-sidebar__body::-webkit-scrollbar-track {
  background: rgba(8, 16, 28, 0.55);
  border-radius: 8px;
  margin: 4px 0;
}

.cdm-sidebar__body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(212, 169, 58, 0.55), rgba(212, 169, 58, 0.28));
  border-radius: 8px;
  border: 2px solid rgba(8, 16, 28, 0.35);
}

.cdm-sidebar__body::-webkit-scrollbar-thumb:hover {
  background: rgba(212, 169, 58, 0.62);
}

/* Categories + biomes: full-width rows */
.cdm-sidebar__pair {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: stretch;
}

/* Major accordion blocks */
.cdm-fold.cdm-side-panel {
  padding: 0;
  /* Let sidebar body own scrolling; hidden here clipped nested scrollbars on some engines. */
  overflow: visible;
}

.cdm-fold__trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: none;
  background: rgba(8, 16, 28, 0.42);
  color: inherit;
  cursor: pointer;
  text-align: left;
  font: inherit;
  transition: background 0.15s ease;
}

.cdm-fold__trigger:hover {
  background: rgba(14, 26, 42, 0.62);
}

.cdm-fold__trigger:focus-visible {
  outline: 2px solid var(--cdm-amber);
  outline-offset: -2px;
}

.cdm-fold__chevron {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  display: grid;
  place-items: center;
  transition: transform 0.2s ease;
}

.cdm-fold__chevron::before {
  content: '';
  width: 6px;
  height: 6px;
  margin-top: -2px;
  border-right: 2px solid var(--cdm-muted);
  border-bottom: 2px solid var(--cdm-muted);
  transform: rotate(45deg);
}

.cdm-fold:not(.cdm-fold--expanded) .cdm-fold__chevron {
  transform: rotate(-90deg);
}

.cdm-fold__title {
  flex: 1;
  min-width: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(184, 232, 223, 0.88);
}

.cdm-fold__badge {
  flex-shrink: 0;
  font-family: Oxanium, ui-monospace, monospace;
  font-size: 0.65rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--cdm-amber-dim);
  border: 1px solid rgba(212, 169, 58, 0.35);
  color: var(--cdm-text);
}

.cdm-fold__panel {
  padding: 8px 10px 12px;
  border-top: 1px solid rgba(92, 124, 148, 0.28);
}

.cdm-fold__toolbar {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px 14px;
  padding: 4px 2px 10px;
  margin-bottom: 6px;
  border-bottom: 1px solid rgba(92, 124, 148, 0.2);
}

/* Nested native <details> inside Categories */
.cdm-details {
  border: 1px solid var(--cdm-border);
  border-radius: 8px;
  background: rgba(4, 10, 18, 0.38);
  margin-bottom: 8px;
}

.cdm-details:last-child {
  margin-bottom: 0;
}

.cdm-details__summary {
  cursor: pointer;
  padding: 8px 10px;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--cdm-faint);
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.cdm-details__summary::-webkit-details-marker {
  display: none;
}

.cdm-details__summary::after {
  content: '';
  width: 5px;
  height: 5px;
  flex-shrink: 0;
  border-right: 1.5px solid var(--cdm-muted);
  border-bottom: 1.5px solid var(--cdm-muted);
  transform: rotate(45deg);
  opacity: 0.75;
  transition: transform 0.18s ease;
}

.cdm-details[open] > .cdm-details__summary::after {
  transform: rotate(225deg);
  margin-top: 2px;
}

.cdm-details__body {
  padding: 4px 8px 10px;
}

.cdm-details__body--flush {
  padding: 0 0 6px;
}

.cdm-details--ruled {
  margin-bottom: 10px;
}

.cdm-details__summary--strong {
  color: rgba(232, 190, 130, 0.92);
  letter-spacing: 0.07em;
}

.cdm-details__count {
  font-family: Oxanium, ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  padding: 1px 7px;
  border-radius: 999px;
  background: rgba(212, 169, 58, 0.12);
  border: 1px solid rgba(212, 169, 58, 0.28);
  color: var(--cdm-amber);
}

.cdm-icon-chips--scroll {
  max-height: 112px;
  overflow-y: auto;
  scrollbar-width: thin;
}

/* POI two-column grid; single column on very narrow sidebar */
.cdm-side-list--grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 4px 2px 2px;
  border: none;
  background: transparent;
}

@container cdm-sidebar (max-width: 319px) {
  .cdm-side-list--grid2 {
    grid-template-columns: 1fr;
  }
}

.cdm-side-list--grid2 .cdm-side-item {
  height: 100%;
  min-height: 3.25rem;
  padding: 8px;
}

.cdm-side-list--grid2 .cdm-side-item__title {
  font-size: 0.7rem;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.cdm-side-list--grid2 .cdm-side-item__regions {
  font-size: 0.6rem;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cdm-side-list--grid2 .cdm-side-item__meta {
  font-size: 0.58rem;
}

.cdm-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.cdm-side-search {
  flex-shrink: 0;
}

.cdm-side-search__input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid var(--cdm-border);
  background: rgba(6, 14, 24, 0.55);
  color: var(--cdm-text);
  font-size: 0.82rem;
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.cdm-side-search__input::placeholder {
  color: rgba(148, 178, 190, 0.45);
}

.cdm-side-search__input:focus {
  border-color: rgba(78, 157, 148, 0.55);
  box-shadow: 0 0 0 3px rgba(78, 157, 148, 0.15);
}

.cdm-side-panel {
  padding: 12px 13px 13px;
  border-radius: 10px;
  background: var(--cdm-surface);
  border: 1px solid var(--cdm-border);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.cdm-side-section {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}

.cdm-side-section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.cdm-side-h3 {
  margin: 0;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: rgba(184, 232, 223, 0.78);
}

.cdm-side-count {
  margin-left: 6px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--cdm-amber);
}

.cdm-side-section__actions {
  display: flex;
  gap: 10px;
}

.cdm-side-linkbtn {
  padding: 4px 2px;
  border: none;
  background: none;
  font: inherit;
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--cdm-sea);
  cursor: pointer;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition:
    color 0.12s ease,
    border-color 0.12s ease;
}

.cdm-side-linkbtn:hover {
  color: #c5f0ea;
  border-bottom-color: rgba(197, 240, 234, 0.45);
}

.cdm-category-groups {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cdm-icon-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  padding-right: 2px;
}

.cdm-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(8, 16, 28, 0.55);
  border: 1px solid var(--cdm-border);
  font-size: 0.66rem;
  color: rgba(236, 246, 248, 0.9);
  cursor: pointer;
  user-select: none;
  transition:
    border-color 0.12s ease,
    background 0.12s ease;
}

.cdm-chip:hover {
  border-color: rgba(140, 168, 188, 0.45);
  background: rgba(14, 26, 42, 0.75);
}

.cdm-chip:has(input:checked) {
  border-color: rgba(212, 169, 58, 0.55);
  background: var(--cdm-amber-dim);
}

.cdm-chip input {
  accent-color: var(--cdm-amber);
}

.cdm-chip__text {
  max-width: 9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cdm-chip__cnt {
  font-variant-numeric: tabular-nums;
  opacity: 0.55;
  font-size: 0.6rem;
}

.cdm-side-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.cdm-side-list--regions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  max-height: none;
  overflow: visible;
  padding: 6px;
  border-radius: 9px;
  border: 1px solid var(--cdm-border);
  background: rgba(4, 10, 18, 0.45);
}

.cdm-biomes-tip {
  margin: 0 0 6px;
  padding: 0 2px;
  font-size: 0.65rem;
  line-height: 1.4;
  color: var(--cdm-faint);
}

.cdm-side-item--region {
  padding: 7px 9px;
  font-size: 0.69rem;
  border-radius: 6px;
}

.cdm-side-list--regions li:nth-child(2n) .cdm-side-item--region {
  border-right: none;
}

.cdm-resource-scroll {
  max-height: none;
  overflow: visible;
  border-radius: 9px;
  border: 1px solid var(--cdm-border);
  background: rgba(4, 10, 18, 0.45);
  padding: 6px 4px 8px;
}

.cdm-resource-subhead {
  margin: 10px 10px 6px;
  padding: 0;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: rgba(232, 190, 130, 0.92);
}

.cdm-resource-subhead--bio {
  margin: 12px 10px 6px;
}

.cdm-resource-bio-sub {
  margin-bottom: 2px;
}

.cdm-resource-item-block {
  margin: 0 0 10px;
}

.cdm-resource-scroll > .cdm-resource-item-block:first-child .cdm-resource-entry-head {
  margin-top: 2px;
}

.cdm-resource-bio-sub .cdm-resource-item-block:first-child .cdm-resource-entry-head {
  margin-top: 2px;
}

.cdm-resource-entry-head {
  border-radius: 8px;
  margin: 0 4px;
  border: 1px solid rgba(212, 169, 58, 0.22);
  background: rgba(212, 169, 58, 0.07);
}

.cdm-side-list--resource-block {
  margin: 0 4px 4px;
}

.cdm-resource-empty {
  margin: 8px 6px;
  font-size: 0.74rem;
  line-height: 1.45;
  color: var(--cdm-faint);
}

.cdm-resource-empty--standalone {
  margin: 6px 4px 8px;
}

.cdm-side-list--locations {
  flex: 0 0 auto;
  min-height: 0;
  max-height: none;
  overflow: visible;
  padding: 6px;
  border-radius: 9px;
  border: 1px solid var(--cdm-border);
  background: rgba(4, 10, 18, 0.45);
}

.cdm-side-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 9px 11px;
  border: none;
  border-radius: 8px;
  border-bottom: none;
  margin-bottom: 2px;
  background: transparent;
  color: rgba(236, 246, 248, 0.92);
  font-size: 0.76rem;
  cursor: pointer;
  transition: background 0.14s ease;
}

.cdm-side-list li:last-child .cdm-side-item {
  border-bottom: none;
}

.cdm-side-item:hover {
  background: rgba(78, 157, 148, 0.12);
}

.cdm-side-item:focus-visible {
  outline: 2px solid var(--cdm-amber);
  outline-offset: 1px;
}

.cdm-side-item--loc {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
}

.cdm-side-item__title {
  font-weight: 600;
  color: var(--cdm-text);
}

.cdm-side-item__regions {
  font-size: 0.66rem;
  line-height: 1.4;
  color: rgba(176, 206, 216, 0.82);
  word-break: break-word;
}

.cdm-side-item__meta {
  font-size: 0.65rem;
  color: var(--cdm-faint);
}

@media (max-width: 1023px) {
  .cdm-split {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
    border-radius: 10px;
  }

  .cdm-map-stage {
    order: 1;
    border-left: none;
    border-right: none;
    border-bottom: 1px solid var(--cdm-border);
    min-height: min(48vh, 480px);
  }

  .cdm-sidebar {
    order: 2;
    max-height: min(38vh, 420px);
    border-top: 1px solid var(--cdm-border);
  }

  .cdm-detail-panel {
    order: 3;
    max-height: min(36vh, 380px);
    border-top: 1px solid var(--cdm-border);
  }

  .cdm-map-host {
    min-height: min(44vh, 440px);
  }

  .cdm-toolbar--float {
    left: 8px;
    bottom: 8px;
    max-width: calc(100% - 16px);
  }

  .cdm-resource-scroll {
    padding-bottom: 6px;
  }
}

/* MapLibre zoom: high-contrast white controls */
.cdm-map-host :deep(.maplibregl-ctrl-group) {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
}

.cdm-map-host :deep(.maplibregl-ctrl-group button) {
  background: rgba(12, 22, 38, 0.92);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.35);
}

.cdm-map-host :deep(.maplibregl-ctrl-group button + button) {
  border-top-color: rgba(255, 255, 255, 0.22);
}

.cdm-map-host :deep(.maplibregl-ctrl button:hover) {
  background: rgba(40, 72, 108, 0.95);
  color: #ffffff;
}

.cdm-map-host :deep(.maplibregl-ctrl-icon) {
  filter: brightness(0) invert(1);
}

.cdm-map-host :deep(.maplibregl-ctrl-attrib) {
  background: rgba(6, 14, 24, 0.88);
  color: var(--cdm-muted);
  font-size: 11px;
  border-radius: 6px 0 0 0;
}

.cdm-map-host :deep(.maplibregl-ctrl-attrib a) {
  color: var(--cdm-sea);
}
</style>

<style>
/* Right panel HTML (same classes as buildLocationPopupHtml output) */
.cdm-rich-html .cdm-ml-popup-body {
  max-height: none;
  overflow-x: hidden;
  overflow-y: visible;
}

.cdm-rich-html .cdm-ml-popup-title {
  margin: 0 0 8px;
  font:
    600 14px Oxanium,
    'Noto Sans',
    system-ui,
    sans-serif;
  color: #e8f2f3;
  line-height: 1.35;
}

.cdm-rich-html .cdm-ml-popup-region {
  margin: -2px 0 10px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: rgba(176, 206, 216, 0.9);
}

.cdm-rich-html .cdm-ml-popup-summary {
  margin: 0 0 10px;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(8, 16, 28, 0.65);
  border: 1px solid rgba(78, 157, 148, 0.22);
  font-size: 12px;
  line-height: 1.5;
  color: rgba(200, 228, 236, 0.92);
}

.cdm-rich-html .cdm-ml-popup-desc {
  margin: 0 0 10px;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(232, 242, 243, 0.95);
}

.cdm-rich-html .cdm-ml-popup-desc a,
.cdm-rich-html .cdm-ml-popup-summary a {
  color: #4e9d94;
  text-decoration: none;
  border-bottom: 1px solid rgba(78, 157, 148, 0.4);
}

.cdm-rich-html .cdm-ml-popup-desc a:hover,
.cdm-rich-html .cdm-ml-popup-summary a:hover {
  color: #b8e8df;
}

.cdm-rich-html .cdm-ml-popup-fig {
  margin: 10px 0 0;
  padding: 0;
}

.cdm-rich-html .cdm-ml-popup-img {
  display: block;
  width: 100%;
  height: auto;
  max-height: 240px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid rgba(92, 124, 148, 0.4);
  background: rgba(0, 0, 0, 0.35);
}
</style>
