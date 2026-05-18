<script setup>
import Panzoom from '@panzoom/panzoom'
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import auroraOverlaySvgRaw from '@/assets/subnautica/aurora-overlay.svg?raw'
import vanillaBiomesSvgRaw from '@/assets/subnautica/vanilla-biomes.svg?raw'
import layersConfig from '@/data/subnautica/layers.json'
import iconsCatalog from '@/data/subnautica/icons.js'
import markersData from '@/data/subnautica/markers.json'
import surfaceCavesMarkers from '@/data/subnautica/surfaceCavesMarkers.json'
import snVanilla from '@/data/subnautica/subnauticamap-vanilla.json'

const iconRegistry = iconsCatalog.icons ?? {}
const markerSvgDefault =
  typeof iconsCatalog.defaultSvg === 'string' && iconsCatalog.defaultSvg.trim()
    ? iconsCatalog.defaultSvg.trim()
    : ''

function resolveMarkerSvgRaw(m) {
  const key = typeof m.icon === 'string' ? m.icon.trim() : ''
  if (key) {
    const svg = iconRegistry[key]
    if (typeof svg === 'string' && svg.trim()) return svg.trim()
  }
  return markerSvgDefault || null
}

const MAP_IMG_BASE = '/images/map/subnautica1/'

/** English biome article name → SVG path id (matches vanilla-biomes.svg) */
const BIOME_NAME_TO_PATH_ID = Object.freeze({
  'Blood Kelp Zone': 'BloodKelpZone',
  'Bulb Zone': 'KooshZone',
  'Crag Field': 'CragField',
  'Crash Zone': 'CrashZone',
  'Dunes': 'Dunes',
  'Grand Reef': 'GrandReef',
  'Grassy Plateaus': 'GrassyPlateaus',
  'Kelp Forest': 'KelpForest',
  'Mountains': 'Mountains',
  'Mushroom Forest': 'MushroomForest',
  'Safe Shallows': 'SafeShallows',
  "Sea Treader's Path": 'SeaTreadersPath',
  'Sparse Reef': 'SparseReef',
  'Underwater Islands': 'UnderwaterIslands',
  'Floating Island': 'FloatingIsland',
  'Mountain Island': 'MountainIsland',
  'Jellyshroom Cave': 'JellyShroomCave',
  'Lost River': 'LostRiver',
  'Inactive Lava Zone': 'InactiveLavaZone',
  'Lava Lakes': 'ActiveLavaZone',
})

/** Normalize placeholder typos from bundled data (e.g. xa0) */
function normalizeRefText(t) {
  if (typeof t !== 'string') return ''
  return t
    .replace(/xa0/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** layers.json default detail fields per POI layer (markers may override detail*) */
const layerDetailById = Object.fromEntries(
  (layersConfig.layers ?? []).map((l) => [
    l.id,
    {
      summary: typeof l.detailSummary === 'string' ? l.detailSummary.trim() : '',
      description: typeof l.detailDescription === 'string' ? l.detailDescription.trim() : '',
      image: typeof l.detailImage === 'string' ? l.detailImage.trim() : '',
    },
  ]),
)

/** Detail images: paths relative to public/images/map/subnautica1/; http(s) or absolute URLs as-is */
function resolveMapImage(rel) {
  if (!rel || typeof rel !== 'string') return ''
  const t = rel.trim()
  if (!t) return ''
  if (/^https?:\/\//i.test(t)) {
    try {
      const u = new URL(t)
      if (u.origin !== window.location.origin) return ''
    } catch {
      return ''
    }
    return t
  }
  if (t.startsWith('/')) return t
  return `${MAP_IMG_BASE}${t.replace(/^\/+/, '')}`
}

function enrichMarker(m) {
  const layerDef = layerDetailById[m.layerId] ?? { summary: '', description: '', image: '' }
  const titleFromMarker = typeof m.detailTitle === 'string' ? m.detailTitle.trim() : ''
  const summary =
    (typeof m.detailSummary === 'string' && m.detailSummary.trim()
      ? m.detailSummary.trim()
      : layerDef.summary) || ''
  const description =
    (typeof m.detailDescription === 'string' && m.detailDescription.trim()
      ? m.detailDescription.trim()
      : layerDef.description) || ''
  const image =
    (typeof m.detailImage === 'string' && m.detailImage.trim()
      ? m.detailImage.trim()
      : layerDef.image) || ''
  return {
    ...m,
    detailTitle: titleFromMarker || m.name,
    detailSummary: normalizeRefText(summary),
    detailDescription: normalizeRefText(description),
    detailImage: image,
  }
}

const markersList = [...markersData, ...surfaceCavesMarkers].map((m) =>
  enrichMarker({
    ...m,
    resolvedMarkerSvg: resolveMarkerSvgRaw(m),
  }),
)

const SVG_SECTION_ORDER = ['biome', 'island', 'cave', 'overlay']
const SVG_SECTION_TITLES = {
  biome: 'Surface biomes',
  island: 'Islands',
  cave: 'Cave layers',
  overlay: 'Landmark overlays',
}

let hoveredZonePath = null
let selectedZonePath = null

const FALLBACK_GAME_EXTENT = { min: -2048, max: 2048 }

const svgGroupsConfig = Array.isArray(layersConfig.svgGroups) ? layersConfig.svgGroups : []

const gameExtent =
  layersConfig.gameExtent &&
  typeof layersConfig.gameExtent.min === 'number' &&
  typeof layersConfig.gameExtent.max === 'number'
    ? layersConfig.gameExtent
    : FALLBACK_GAME_EXTENT

/** Match bundled SVG / styled vanilla layout: keep SVG string untouched (styles rely on root class iqPocd) */
const svgMarkup =
  typeof vanillaBiomesSvgRaw === 'string'
    ? vanillaBiomesSvgRaw
    : '<svg viewBox="0 0 1001 1001" xmlns="http://www.w3.org/2000/svg"><text x="20" y="40" fill="#94a3b8">Failed to load map SVG</text></svg>'

/** Aurora overlay: separate SVG layer (261² viewBox, percentage anchors) like reference site */
const auroraOverlayMarkup =
  typeof auroraOverlaySvgRaw === 'string' ? auroraOverlaySvgRaw : ''

const panParentRef = ref(null)
const panzoomElemRef = ref(null)
let panzoom = null
let onWheel = null

const mapInitError = ref('')
const cursor = reactive({ x: 0, z: 0, active: false })
const selectedMarker = ref(null)
/** POI under cursor (separate from biomes; matches reference POI vs biome) */
const hoveredMarker = ref(null)
const hoveredZoneId = ref('')
const selectedZoneId = ref('')
const tooltipPos = reactive({ x: 0, y: 0 })
/** Panzoom scale; used to counter-scale markers/overlays */
const mapScale = ref(1)
const markerOverlayVars = computed(() => ({
  '--sn-map-inv-scale': String(1 / Math.max(mapScale.value, 0.001)),
}))

const visibility = reactive({})
for (const layer of layersConfig.layers ?? []) {
  visibility[layer.id] = layer.defaultVisible
}

const svgGroupVisibility = reactive({})
for (const g of svgGroupsConfig) {
  svgGroupVisibility[g.id] = g.defaultVisible
}

const gameSpan = Math.max(1, gameExtent.max - gameExtent.min)

/** Same as HUD coords: x horizontal, z vertical (north = increasing z, moves up on screen) */
function gameCoordsToCssPercent(x, z) {
  return {
    left: `${((x - gameExtent.min) / gameSpan) * 100}%`,
    top: `${((gameExtent.max - z) / gameSpan) * 100}%`,
  }
}

const colorByLayer = Object.fromEntries((layersConfig.layers ?? []).map((l) => [l.id, l.color]))

const poiLayers = computed(() => layersConfig.layers ?? [])

function inferSvgSection(g) {
  if (g.section) return g.section
  const id = g.id
  if (id === 'Zones' || id === 'biomes') return 'biome'
  if (id === 'Islands') return 'island'
  if (
    id === 'Caves' ||
    ['jellyshroom', 'lostRiver', 'inactiveLava', 'lavaLakes'].includes(id)
  ) {
    return 'cave'
  }
  if (id === 'auroraHull') return 'biome'
  return 'other'
}

const svgSidebarBlocks = computed(() => {
  const m = new Map()
  for (const g of svgGroupsConfig) {
    const sec = inferSvgSection(g)
    if (!m.has(sec)) m.set(sec, [])
    m.get(sec).push(g)
  }
  const order = [...SVG_SECTION_ORDER]
  if (m.has('other')) order.push('other')
  return order.filter((s) => m.has(s)).map((s) => ({
    title: SVG_SECTION_TITLES[s] || 'Layers',
    groups: m.get(s),
  }))
})

/** Legacy layers.json: Zones / Islands / Caves / biomes */
function svgGroupTargets(g) {
  if (Array.isArray(g.targets) && g.targets.length > 0) return g.targets
  const legacy = {
    Zones: ['#Zones'],
    Islands: ['#FloatingIsland', '#MountainIsland'],
    Caves: ['#JellyShroomCave', '#LostRiver', '#InactiveLavaZone', '#ActiveLavaZone'],
    biomes: ['#Zones'],
  }
  if (legacy[g.id]) return legacy[g.id]
  return [`#${g.id}`]
}

const zoneLabelById = computed(() => {
  const o = Object.create(null)
  for (const g of svgGroupsConfig) {
    for (const sel of svgGroupTargets(g)) {
      const id = sel.startsWith('#') ? sel.slice(1) : sel
      o[id] = g.label
    }
  }
  return o
})

const biomeDetailByPathId = computed(() => {
  const o = Object.create(null)
  for (const b of snVanilla.biomes ?? []) {
    const pathId = BIOME_NAME_TO_PATH_ID[b.name]
    if (!pathId) continue
    const depth = Array.isArray(b.depthRange)
      ? b.depthRange.map((x) => normalizeRefText(String(x))).join('\n')
      : ''
    const harvest = Array.isArray(b.harvestingNodes) ? b.harvestingNodes.join(', ') : ''
    const poi = Array.isArray(b.pointsOfInterest) ? b.pointsOfInterest.join(', ') : ''
    const lines = []
    if (harvest) lines.push(`Harvesting nodes: ${harvest}`)
    if (poi) lines.push(`Points of interest: ${poi}`)
    o[pathId] = {
      title: b.name,
      summary: depth,
      description: lines.join('\n'),
      image: typeof b.image === 'string' ? b.image.trim() : '',
    }
  }
  const auroraArt = (snVanilla.articles ?? []).find((a) => a.name === 'Aurora')
  if (auroraArt) {
    o.AuroraShip = {
      title: auroraArt.name,
      summary: '',
      description: normalizeRefText(auroraArt.summary),
      image: typeof auroraArt.image === 'string' ? auroraArt.image.trim() : '',
    }
  }
  return o
})

/** SVG path id (e.g. SafeShallows) → detail fields from layers.json svgGroups */
const zoneDetailByPathId = computed(() => {
  const o = Object.create(null)
  for (const g of svgGroupsConfig) {
    for (const sel of svgGroupTargets(g)) {
      const pathId = sel.startsWith('#') ? sel.slice(1) : sel
      const title =
        typeof g.detailTitle === 'string' && g.detailTitle.trim() ? g.detailTitle.trim() : g.label
      o[pathId] = {
        title,
        summary: typeof g.detailSummary === 'string' ? g.detailSummary.trim() : '',
        description: typeof g.detailDescription === 'string' ? g.detailDescription.trim() : '',
        image: typeof g.detailImage === 'string' ? g.detailImage.trim() : '',
      }
    }
  }
  return o
})

const hoveredZoneLabel = computed(() => {
  const id = hoveredZoneId.value
  return id ? zoneLabelById.value[id] || id : ''
})

const selectedZoneLabel = computed(() => {
  const id = selectedZoneId.value
  return id ? zoneLabelById.value[id] || id : ''
})

const selectedZoneDetail = computed(() => {
  const id = selectedZoneId.value
  if (!id) return null
  const label = selectedZoneLabel.value
  const bio = biomeDetailByPathId.value[id]
  if (bio) {
    return {
      title: bio.title,
      summary: bio.summary,
      description: bio.description,
      image: bio.image,
    }
  }
  const d = zoneDetailByPathId.value[id]
  return {
    title: d?.title || label,
    summary: d?.summary || '',
    description: d?.description || '',
    image: d?.image || '',
  }
})

const layerLabelById = computed(() =>
  Object.fromEntries((layersConfig.layers ?? []).map((l) => [l.id, l.label])),
)

const visibleMarkers = computed(() =>
  (markersList ?? []).filter((m) => visibility[m.layerId]),
)

/** Styled vanilla layout: name + depth (from y coordinate) */
function markerDisplayLine(m) {
  const depth = m.depthM
  if (depth != null && depth !== '') return `${m.name}, ${depth}m`
  return m.name
}

function pointerToGame(clientX, clientY) {
  const el = panzoomElemRef.value
  if (!el) return { x: 0, z: 0 }
  const rect = el.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return { x: 0, z: 0 }
  const fx = (clientX - rect.left) / rect.width
  const fy = (clientY - rect.top) / rect.height
  const x = Math.round(fx * gameSpan + gameExtent.min)
  const z = Math.round(gameExtent.max - fy * gameSpan)
  return { x, z }
}

function markerStyle(m) {
  const pos = gameCoordsToCssPercent(m.x, m.z)
  if (m.resolvedMarkerSvg) return pos
  const fill = colorByLayer[m.layerId] || '#fff'
  return {
    ...pos,
    '--sn-marker-fill': fill,
  }
}

function onDocKeydown(e) {
  if (e.key === 'Escape') clearMapDetailPanel()
}

/**
 * Hit-test markers by screen bounds (not elementsFromPoint stacking).
 * Fixes clicks falling through to biome paths when they cover a marker.
 */
function pickMarkerButtonAt(clientX, clientY) {
  const stage = panzoomElemRef.value
  if (!stage) return null
  const buttons = stage.querySelectorAll('.sn-marker[data-marker-id]')
  let best = null
  let bestDist = Infinity
  const pad = 0
  for (const btn of buttons) {
    if (!(btn instanceof HTMLElement)) continue
    const r = btn.getBoundingClientRect()
    if (clientX < r.left - pad || clientX > r.right + pad || clientY < r.top - pad || clientY > r.bottom + pad) {
      continue
    }
    const cx = (r.left + r.right) / 2
    const cy = (r.top + r.bottom) / 2
    const d = (clientX - cx) ** 2 + (clientY - cy) ** 2
    if (d < bestDist) {
      bestDist = d
      best = btn
    }
  }
  return best
}

function markerModelFromButton(btn) {
  const id = btn?.getAttribute?.('data-marker-id')
  return id ? visibleMarkers.value.find((x) => x.id === id) : null
}

function resolvePathHit(el) {
  if (!(el instanceof Element)) return null
  if (el.tagName === 'path' && el.id && el.id !== 'MapClean') return el
  if (el.tagName === 'use') {
    const href = el.getAttribute('href') || el.getAttribute('xlink:href')
    if (!href?.startsWith('#')) return null
    const id = href.slice(1)
    const svgRoot = el.ownerSVGElement
    const ref = svgRoot?.getElementById(id)
    if (ref?.tagName === 'path') return ref
  }
  return null
}

function findInteractivePathUnder(clientX, clientY) {
  const stage = panzoomElemRef.value
  if (!stage) return null
  const stack = document.elementsFromPoint(clientX, clientY)
  for (const el of stack) {
    if (!(el instanceof Element)) continue
    if (!stage.contains(el)) continue

    const pathEl = resolvePathHit(el)
    if (!pathEl || pathEl.id === 'MapClean') continue

    if (pathEl.id === 'AuroraShip') {
      if (!svgGroupVisibility.auroraHull) continue
      return pathEl
    }

    const cs = window.getComputedStyle(pathEl)
    if (cs.opacity === '0' || cs.pointerEvents === 'none') continue
    return pathEl
  }
  return null
}

function clearZoneHover() {
  if (hoveredZonePath) {
    hoveredZonePath.classList.remove('zoneActive')
    hoveredZonePath = null
  }
  hoveredZoneId.value = ''
}

function pruneZoneSelection() {
  if (!selectedZonePath) return
  if (selectedZonePath.id === 'AuroraShip') {
    if (!svgGroupVisibility.auroraHull) {
      selectedZonePath = null
      selectedZoneId.value = ''
    }
    return
  }
  const cs = window.getComputedStyle(selectedZonePath)
  if (cs.opacity === '0' || cs.pointerEvents === 'none') {
    selectedZonePath.classList.remove('zoneSelected')
    selectedZonePath = null
    selectedZoneId.value = ''
  }
}

/** Reference site: each path toggles independently; island/cave paths hidden by CSS until checked (!important) */
function applySvgLayers() {
  const svg = panzoomElemRef.value?.querySelector('.sn-svg-layer svg')
  if (!svg) return

  const setImportant = (el, on) => {
    if (!el) return
    el.style.setProperty('opacity', on ? '1' : '0', 'important')
    el.style.setProperty('pointer-events', on ? 'auto' : 'none', 'important')
  }

  for (const g of svgGroupsConfig) {
    if (g.id === 'auroraHull') continue
    const on = svgGroupVisibility[g.id]
    for (const sel of svgGroupTargets(g)) {
      svg.querySelectorAll(sel).forEach((el) => setImportant(el, on))
    }
  }

  nextTick(() => {
    pruneZoneSelection()
  })
}

function onMapMouseMove(e) {
  cursor.active = true
  const g = pointerToGame(e.clientX, e.clientY)
  cursor.x = g.x
  cursor.z = g.z

  const stage = panzoomElemRef.value
  const markerBtn = pickMarkerButtonAt(e.clientX, e.clientY)
  const overMarker = markerBtn ? markerModelFromButton(markerBtn) : null
  hoveredMarker.value = overMarker

  if (overMarker) {
    if (stage) stage.style.cursor = 'pointer'
    hoveredZoneId.value = ''
    if (hoveredZonePath) {
      hoveredZonePath.classList.remove('zoneActive')
      hoveredZonePath = null
    }
    tooltipPos.x = e.clientX
    tooltipPos.y = e.clientY
    return
  }

  const path = findInteractivePathUnder(e.clientX, e.clientY)
  if (stage) stage.style.cursor = path ? 'pointer' : 'grab'

  hoveredZoneId.value = path?.id && path.id !== 'MapClean' ? path.id : ''

  if (path === hoveredZonePath) {
    tooltipPos.x = e.clientX
    tooltipPos.y = e.clientY
    return
  }

  if (hoveredZonePath) {
    hoveredZonePath.classList.remove('zoneActive')
    hoveredZonePath = null
  }

  if (path && path.id !== 'MapClean') {
    if (!path.classList.contains('zoneSelected')) {
      path.classList.add('zoneActive')
    }
    hoveredZonePath = path
  }

  tooltipPos.x = e.clientX
  tooltipPos.y = e.clientY
}

function onMapMouseLeave() {
  cursor.active = false
  const stage = panzoomElemRef.value
  if (stage) stage.style.cursor = 'grab'
  tooltipPos.x = 0
  tooltipPos.y = 0
  hoveredMarker.value = null
  clearZoneHover()
}

function onMapClick(e) {
  const markerBtn = pickMarkerButtonAt(e.clientX, e.clientY)
  if (markerBtn) {
    const m = markerModelFromButton(markerBtn)
    if (m) selectedMarker.value = m
    e.preventDefault()
    e.stopPropagation()
    return
  }

  if (e.target.closest?.('.sn-marker-popup')) return

  if (e.target.closest?.('.panzoom-exclude')) return

  selectedMarker.value = null
  const path = findInteractivePathUnder(e.clientX, e.clientY)

  if (path && path.id !== 'MapClean' && selectedZonePath === path) {
    path.classList.remove('zoneSelected')
    selectedZonePath = null
    selectedZoneId.value = ''
    nextTick(() => onMapMouseMove(e))
    return
  }

  if (selectedZonePath) {
    selectedZonePath.classList.remove('zoneSelected')
    selectedZonePath = null
    selectedZoneId.value = ''
  }

  if (path && path.id !== 'MapClean') {
    selectedZonePath = path
    selectedZoneId.value = path.id
    path.classList.add('zoneSelected')
  }

  nextTick(() => onMapMouseMove(e))
}

function clearZoneSelection() {
  if (selectedZonePath) {
    selectedZonePath.classList.remove('zoneSelected')
    selectedZonePath = null
    selectedZoneId.value = ''
  }
}

function clearMapDetailPanel() {
  selectedMarker.value = null
  clearZoneSelection()
}

function setSvgGroupVisible(id, visible) {
  svgGroupVisibility[id] = visible
  if (id === 'auroraHull' && !visible && hoveredZoneId.value === 'AuroraShip') {
    clearZoneHover()
  }
  nextTick(() => applySvgLayers())
}

function setLayerVisible(id, visible) {
  visibility[id] = visible
}

function zoomIn() {
  panzoom?.zoomIn()
}

function zoomOut() {
  panzoom?.zoomOut()
}

function resetView() {
  panzoom?.reset({ animate: false })
}

function onPanzoomChange(e) {
  const s = e?.detail?.scale
  if (typeof s === 'number' && s > 0) mapScale.value = s
}

onMounted(() => {
  const parent = panParentRef.value
  const elem = panzoomElemRef.value
  if (!parent || !elem) {
    mapInitError.value = 'Map container not ready'
    return
  }

  try {
    panzoom = Panzoom(elem, {
      canvas: true,
      maxScale: 10,
      minScale: 0.2,
      origin: '0 0',
      overflow: 'hidden',
      startScale: 1,
      cursor: 'grab',
    })

    onWheel = (e) => panzoom.zoomWithWheel(e)
    parent.addEventListener('wheel', onWheel, { passive: false })
    elem.addEventListener('mousemove', onMapMouseMove)
    elem.addEventListener('mouseleave', onMapMouseLeave)
    elem.addEventListener('click', onMapClick)
    elem.addEventListener('panzoomchange', onPanzoomChange)

    window.addEventListener('keydown', onDocKeydown)

    nextTick(() => {
      mapScale.value = panzoom?.getScale?.() ?? 1
      applySvgLayers()
    })
  } catch (err) {
    console.error(err)
    mapInitError.value = 'Failed to initialize map zoom. Please refresh and try again.'
  }
})

onUnmounted(() => {
  const parent = panParentRef.value
  const elem = panzoomElemRef.value
  if (parent && onWheel) parent.removeEventListener('wheel', onWheel)
  if (elem) {
    elem.removeEventListener('mousemove', onMapMouseMove)
    elem.removeEventListener('mouseleave', onMapMouseLeave)
    elem.removeEventListener('click', onMapClick)
    elem.removeEventListener('panzoomchange', onPanzoomChange)
  }
  window.removeEventListener('keydown', onDocKeydown)
  clearZoneHover()
  if (selectedZonePath) {
    selectedZonePath.classList.remove('zoneSelected')
    selectedZonePath = null
  }
  panzoom?.destroy()
  panzoom = null
  onWheel = null
})
</script>

<template>
  <div class="sn-page">
    <p v-if="mapInitError" class="sn-global-error panzoom-exclude" role="alert">{{ mapInitError }}</p>
    <div class="sn-map-root">
    <aside class="sn-sidebar panzoom-exclude">
      <section class="sn-section">
        <h2>Map layers (SVG)</h2>
        <div v-for="block in svgSidebarBlocks" :key="block.title" class="sn-layer-block">
          <h3 class="sn-subsection">{{ block.title }}</h3>
          <ul class="sn-layers">
            <li v-for="g in block.groups" :key="g.id">
              <label class="sn-row">
                <input
                  type="checkbox"
                  :checked="svgGroupVisibility[g.id]"
                  @change="setSvgGroupVisible(g.id, $event.target.checked)"
                />
                <span class="sn-dot sn-dot-muted" />
                {{ g.label }}
              </label>
            </li>
          </ul>
        </div>
      </section>

      <section class="sn-section">
        <h2>Points of interest layers</h2>
        <p class="sn-sidebar-note">
          “Cave entrances”: 54 surface openings (embedded vanilla data); more layers mean more markers at once.
        </p>
        <ul class="sn-layers">
          <li v-for="layer in poiLayers" :key="layer.id">
            <label class="sn-row">
              <input
                type="checkbox"
                :checked="visibility[layer.id]"
                @change="setLayerVisible(layer.id, $event.target.checked)"
              />
              <span class="sn-dot" :style="{ background: layer.color }" />
              {{ layer.label }}
            </label>
          </li>
        </ul>
      </section>

      <section class="sn-section sn-coords">
        <h2>Coordinates</h2>
        <p v-if="cursor.active" class="sn-coord-readout">
          x: {{ cursor.x }}, z: {{ cursor.z }}
        </p>
        <p v-else class="sn-coord-muted">Move the mouse over the map to see coordinates</p>
      </section>

      <section class="sn-section sn-sidebar-pois">
        <h2>Points of interest (markers)</h2>
        <p class="sn-sidebar-note">Independent of <strong>Zones</strong> below: layer checkboxes control which dots appear.</p>
        <p v-if="hoveredMarker" class="sn-poi-hover">
          Hover: <span class="sn-poi-name">{{ markerDisplayLine(hoveredMarker) }}</span>
          <span class="sn-poi-meta">{{ layerLabelById[hoveredMarker.layerId] || hoveredMarker.layerId }}</span>
        </p>
        <p v-else class="sn-coord-muted">Move the cursor near a marker to see its name</p>
      </section>

      <section class="sn-section sn-sidebar-zones">
        <h2>Zones (biomes)</h2>
        <p class="sn-sidebar-note">
          Surface biome fills plus <strong>Aurora hull area</strong> (same interaction as biomes). POI dots are controlled by the layers above.
        </p>
        <p v-if="hoveredZoneLabel && !hoveredMarker" class="sn-zone-hover">Hover zone: {{ hoveredZoneLabel }}</p>
        <p v-else-if="hoveredMarker" class="sn-coord-muted">Zone hover is hidden while the cursor is on a marker</p>
        <p v-else class="sn-coord-muted">Move over the map to highlight zones</p>
      </section>
    </aside>

    <div class="sn-viewport">
      <div class="sn-zoom-toolbar panzoom-exclude">
        <button type="button" class="sn-zoom-btn" title="Zoom in" @click="zoomIn">+</button>
        <button type="button" class="sn-zoom-btn" title="Zoom out" @click="zoomOut">−</button>
        <button type="button" class="sn-zoom-btn sn-zoom-reset" title="Reset view" @click="resetView">
          ⟲
        </button>
      </div>

      <div
        v-show="cursor.active && (hoveredMarker || hoveredZoneLabel)"
        class="sn-map-tooltip panzoom-exclude"
        :class="{ 'sn-map-tooltip--aurora': hoveredZoneId === 'AuroraShip' && !hoveredMarker }"
        :style="{ left: tooltipPos.x + 14 + 'px', top: tooltipPos.y + 14 + 'px' }"
      >
        {{ hoveredMarker ? markerDisplayLine(hoveredMarker) : hoveredZoneLabel }}
      </div>

      <div ref="panParentRef" class="sn-panzoom-parent">
        <div ref="panzoomElemRef" class="sn-map-stage">
          <div class="sn-svg-layer" v-html="svgMarkup"></div>

          <div v-show="svgGroupVisibility.auroraHull" class="sn-aurora-layer">
            <div class="sn-aurora-anchor" v-html="auroraOverlayMarkup" />
          </div>

          <div class="sn-markers" :style="markerOverlayVars">
            <button
              v-for="m in visibleMarkers"
              :key="m.id"
              type="button"
              class="sn-marker panzoom-exclude"
              :class="{
                'sn-marker--hover': hoveredMarker?.id === m.id,
                'sn-marker--svg': !!m.resolvedMarkerSvg,
              }"
              :data-marker-id="m.id"
              :style="markerStyle(m)"
              :title="`${markerDisplayLine(m)} · x:${m.x} z:${m.z}`"
              :aria-label="markerDisplayLine(m)"
            >
              <span
                v-if="m.resolvedMarkerSvg"
                class="sn-marker-svg-glyph"
                aria-hidden="true"
                v-html="m.resolvedMarkerSvg"
              />
              <span v-else class="visually-hidden">{{ markerDisplayLine(m) }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <aside class="sn-detail-panel panzoom-exclude" aria-label="Selection details">
      <div class="sn-detail-panel__head">
        <h2 class="sn-detail-panel__title">Details</h2>
        <button
          v-if="selectedMarker || selectedZoneDetail"
          type="button"
          class="sn-detail-panel__clear"
          @click="clearMapDetailPanel"
        >
          Clear
        </button>
      </div>
      <div class="sn-detail-panel__scroll">
        <template v-if="selectedMarker">
          <div class="sn-detail-card sn-detail-card--poi">
            <img
              v-if="selectedMarker.detailImage"
              class="sn-detail-card__img"
              :src="resolveMapImage(selectedMarker.detailImage)"
              :alt="selectedMarker.detailTitle"
            />
            <h3 class="sn-detail-card__title">{{ selectedMarker.detailTitle }}</h3>
            <p class="sn-detail-card__meta">
              {{ layerLabelById[selectedMarker.layerId] || selectedMarker.layerId }} · x: {{ selectedMarker.x }}, z:
              {{ selectedMarker.z }}
            </p>
            <p v-if="selectedMarker.depthM != null" class="sn-detail-card__meta">
              Depth (from data y): ~{{ selectedMarker.depthM }} m
            </p>
            <p v-if="selectedMarker.detailSummary" class="sn-detail-card__summary">{{ selectedMarker.detailSummary }}</p>
            <p v-if="selectedMarker.detailDescription" class="sn-detail-card__body">{{ selectedMarker.detailDescription }}</p>
          </div>
        </template>
        <template v-else-if="selectedZoneDetail">
          <div class="sn-detail-card sn-detail-card--zone">
            <img
              v-if="selectedZoneDetail.image"
              class="sn-detail-card__img"
              :src="resolveMapImage(selectedZoneDetail.image)"
              :alt="selectedZoneDetail.title"
            />
            <h3 class="sn-detail-card__title">{{ selectedZoneDetail.title }}</h3>
            <p v-if="selectedZoneDetail.summary" class="sn-detail-card__summary">{{ selectedZoneDetail.summary }}</p>
            <p v-if="selectedZoneDetail.description" class="sn-detail-card__body">{{ selectedZoneDetail.description }}</p>
          </div>
        </template>
        <div v-else class="sn-detail-panel__empty">
          <p class="sn-detail-panel__empty-title">Nothing selected</p>
          <p class="sn-detail-panel__empty-hint">Click a marker or a biome region on the map to see details.</p>
        </div>
      </div>
    </aside>
  </div>
  </div>
</template>

<style scoped>
.visually-hidden {
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

.sn-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
}

.sn-map-root {
  /*
   * Subnautica PDA palette (community reference): Cello #1d395e, East Bay #3b5b81,
   * Steel Blue #4c8dc2, Aquamarine #6dd4e3, Blizzard #9ce4f2; selection often light yellow ring.
   */
  --sn-cello: #1d395e;
  --sn-eastbay: #3b5b81;
  --sn-steel: #4c8dc2;
  --sn-aqua: #6dd4e3;
  --sn-blizzard: #9ce4f2;
  --sn-deep: #0a1628;
  --sn-panel-top: #152d4a;
  --sn-panel-bot: #0f2140;
  --sn-text: var(--sn-blizzard);
  --sn-text-soft: color-mix(in srgb, var(--sn-blizzard) 72%, var(--sn-eastbay));
  --sn-text-faint: color-mix(in srgb, var(--sn-eastbay) 78%, #000);
  --sn-select: #edd05e;
  --sn-select-soft: #f5e7a8;
  --sn-accent: var(--sn-select);
  --sn-accent-hot: var(--sn-select-soft);
  --sn-teal: var(--sn-aqua);
  --sn-teal-muted: rgba(109, 212, 227, 0.22);
  --sn-line: rgba(109, 212, 227, 0.28);
  --sn-line-soft: rgba(59, 91, 129, 0.55);

  display: grid;
  grid-template-columns: minmax(260px, min(30vw, 340px)) minmax(0, 1fr) minmax(280px, min(34vw, 400px));
  align-items: stretch;
  flex: 1;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
  background: var(--sn-deep);
  color: var(--sn-text);
  font-family: var(--font-body);
}

.sn-global-error {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  margin: 0;
  padding: 10px 16px;
  background: linear-gradient(90deg, #4a1515, #6b1f1f);
  color: #ffd4d4;
  font-size: 0.9rem;
  text-align: center;
  border-bottom: 1px solid rgba(109, 212, 227, 0.35);
}

.sn-sidebar {
  min-width: 0;
  max-width: 100%;
  padding: 18px 18px 24px;
  box-sizing: border-box;
  background:
    linear-gradient(180deg, rgba(109, 212, 227, 0.07) 0%, transparent 32%),
    linear-gradient(165deg, var(--sn-panel-top) 0%, var(--sn-panel-bot) 52%, #081426 100%);
  border-right: 1px solid var(--sn-line-soft);
  box-shadow: inset -1px 0 0 var(--sn-line);
  overflow-y: auto;
}

.sn-detail-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  border-left: 1px solid var(--sn-line-soft);
  box-shadow: inset 1px 0 0 var(--sn-line);
  background:
    linear-gradient(195deg, rgba(12, 26, 44, 0.98) 0%, rgba(8, 16, 30, 0.99) 100%),
    linear-gradient(180deg, rgba(109, 212, 227, 0.05) 0%, transparent 28%);
}

.sn-detail-panel__head {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--sn-line-soft);
  background: rgba(5, 12, 24, 0.55);
}

.sn-detail-panel__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--sn-blizzard);
}

.sn-detail-panel__clear {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--sn-line);
  background: rgba(29, 57, 94, 0.55);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.sn-detail-panel__clear:hover {
  background: rgba(76, 141, 194, 0.35);
  border-color: rgba(156, 228, 242, 0.45);
}

.sn-detail-panel__scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 16px 18px 22px;
}

.sn-detail-panel__empty {
  padding: 32px 12px;
  text-align: center;
}

.sn-detail-panel__empty-title {
  margin: 0 0 10px;
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
}

.sn-detail-panel__empty-hint {
  margin: 0;
  font-size: 0.84rem;
  line-height: 1.55;
  color: var(--sn-text-faint);
  max-width: 20rem;
  margin-inline: auto;
}

.sn-detail-card {
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid var(--sn-line);
  background: linear-gradient(165deg, rgba(29, 57, 94, 0.55) 0%, rgba(15, 33, 64, 0.85) 100%);
  box-shadow:
    0 0 0 1px rgba(109, 212, 227, 0.08),
    0 10px 28px rgba(0, 0, 0, 0.35);
}

.sn-detail-card--poi {
  border-left: 3px solid var(--sn-teal);
}

.sn-detail-card--zone {
  border-left: 3px solid var(--sn-select);
}

.sn-detail-card__img {
  display: block;
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid rgba(109, 212, 227, 0.25);
  background: rgba(0, 0, 0, 0.35);
}

.sn-detail-card__title {
  margin: 0 0 8px;
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.35;
}

.sn-detail-card__meta {
  margin: 0 0 6px;
  font-size: 0.8rem;
  color: var(--sn-text-soft);
  line-height: 1.45;
}

.sn-detail-card__summary {
  margin: 0 0 10px;
  font-size: 0.86rem;
  line-height: 1.5;
  color: var(--sn-blizzard);
}

.sn-detail-card__body {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.55;
  color: var(--sn-text-soft);
  white-space: pre-wrap;
}

.sn-code {
  font-family: ui-monospace, 'Cascadia Code', monospace;
  font-size: 0.76em;
  color: var(--sn-blizzard);
  padding: 0.1em 0.35em;
  border-radius: 4px;
  background: rgba(29, 57, 94, 0.55);
}

.sn-sidebar-note {
  margin: 0 0 10px;
  font-size: 0.72rem;
  line-height: 1.45;
  color: var(--sn-text-faint);
}

.sn-sidebar-pois {
  padding-left: 14px;
  border-left: 3px solid var(--sn-teal);
}

.sn-sidebar-zones {
  padding-left: 14px;
  border-left: 3px solid color-mix(in srgb, var(--sn-steel) 65%, #a78bfa);
}

.sn-poi-hover {
  margin: 0 0 8px;
  font-size: 0.88rem;
  color: var(--sn-teal);
}

.sn-poi-name {
  font-weight: 700;
  color: #ffffff;
}

.sn-poi-meta {
  display: block;
  margin-top: 4px;
  font-size: 0.78rem;
  color: var(--sn-text-soft);
}

.sn-poi-selected-label {
  margin: 12px 0 4px;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--sn-text-faint);
}

.sn-section {
  margin-top: 22px;
}

.sn-section:first-of-type {
  margin-top: 0;
}

.sn-section h2 {
  margin: 0 0 12px;
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--sn-aqua);
  padding-left: 10px;
  border-left: 2px solid var(--sn-aqua);
}

.sn-subsection {
  margin: 14px 0 8px;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--sn-text-faint);
  font-weight: 600;
}

.sn-subsection:first-child {
  margin-top: 0;
}

.sn-layer-block:first-child .sn-subsection {
  margin-top: 0;
}

.sn-layer-block + .sn-layer-block .sn-subsection {
  margin-top: 14px;
}

.sn-zone-hover {
  margin: 0;
  font-size: 0.9rem;
  color: var(--sn-blizzard);
}

.sn-zone-selected {
  margin: 8px 0 0;
  font-size: 0.9rem;
  color: var(--sn-accent-hot);
  font-weight: 600;
}

.sn-layers {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sn-layers li + li {
  margin-top: 6px;
}

.sn-row {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 0.875rem;
  user-select: none;
  padding: 5px 8px;
  margin: 0 -8px;
  border-radius: 6px;
  transition: background 0.15s ease;
}

.sn-row:hover {
  background: rgba(109, 212, 227, 0.07);
}

.sn-row input {
  accent-color: var(--sn-aqua);
}

.sn-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.55),
    0 0 6px rgba(0, 0, 0, 0.4);
}

.sn-dot-muted {
  background: var(--sn-eastbay);
}

.sn-coords {
  margin-top: 28px;
}

.sn-coord-readout {
  margin: 0;
  font-family: ui-monospace, 'Cascadia Code', monospace;
  font-size: 0.95rem;
  color: var(--sn-teal);
  letter-spacing: 0.02em;
}

.sn-coord-muted {
  margin: 0;
  font-size: 0.85rem;
  color: var(--sn-text-faint);
}

.sn-detail-name {
  margin: 0 0 8px;
  font-weight: 600;
}

.sn-close-detail {
  margin-top: 10px;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--sn-line);
  background: rgba(0, 0, 0, 0.35);
  color: var(--sn-text);
  cursor: pointer;
}

.sn-close-detail:hover {
  background: rgba(109, 212, 227, 0.1);
  border-color: rgba(156, 228, 242, 0.35);
}

.sn-viewport {
  position: relative;
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(ellipse 75% 60% at 50% 42%, rgba(76, 141, 194, 0.14), transparent 58%),
    radial-gradient(ellipse 100% 85% at 50% 100%, rgba(10, 22, 40, 0.96), transparent 52%),
    linear-gradient(165deg, #0c1830 0%, #081426 42%, #050c18 100%);
}

.sn-zoom-toolbar {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 20;
  display: flex;
  gap: 6px;
}

.sn-zoom-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(12, 22, 40, 0.88);
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);
}

.sn-zoom-btn:hover {
  background: rgba(40, 72, 108, 0.95);
  border-color: rgba(255, 255, 255, 0.55);
  color: #ffffff;
}

.sn-zoom-reset {
  font-size: 1rem;
}

.sn-map-tooltip {
  position: fixed;
  z-index: 50;
  pointer-events: none;
  padding: 8px 12px;
  border-radius: 4px;
  background: rgba(29, 57, 94, 0.94);
  color: var(--sn-blizzard);
  font-family: var(--font-display);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  box-shadow:
    0 0 0 1px rgba(109, 212, 227, 0.35),
    0 8px 24px rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(76, 141, 194, 0.45);
  max-width: min(260px, 70vw);
}

/* Aurora tooltip: cooler scanner-like strip */
.sn-map-tooltip--aurora {
  background: linear-gradient(180deg, #a8c5d4 0%, #8eb4c8 100%);
  color: #0a1218;
  border: 1px solid rgba(10, 18, 24, 0.35);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
  padding-bottom: 10px;
}

.sn-map-tooltip--aurora::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 3px;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #8eb4c8;
}

.sn-panzoom-parent {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sn-map-stage {
  position: relative;
  width: min(88vmin, 920px);
  height: min(88vmin, 920px);
  flex-shrink: 0;
  border-radius: 3px;
  box-shadow:
    0 0 0 1px rgba(109, 212, 227, 0.28),
    0 0 0 2px rgba(8, 16, 32, 0.95),
    0 0 40px rgba(76, 141, 194, 0.18),
    0 16px 48px rgba(0, 0, 0, 0.65);
}

.sn-svg-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.sn-svg-layer :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.sn-aurora-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  /* Below .sn-markers so the overlay does not block marker clicks */
  z-index: 2;
}

.sn-aurora-anchor {
  position: absolute;
  top: 56.2%;
  left: 73.80799999999999%;
  width: 25.48828125%;
  height: 25.48828125%;
  margin-left: -12.744140625%;
  margin-top: -12.744140625%;
  pointer-events: auto;
  cursor: pointer;
  transition:
    filter 200ms ease,
    opacity 250ms ease;
}

.sn-aurora-anchor :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.sn-markers {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
}

.sn-marker {
  pointer-events: auto;
  position: absolute;
  /* Same visual size as dots: marker hit area only */
  width: 16px;
  height: 16px;
  min-width: 16px;
  min-height: 16px;
  padding: 0;
  border: 2px solid rgba(10, 22, 32, 0.9);
  border-radius: 50%;
  cursor: pointer;
  transform: translate(-50%, -50%) scale(var(--sn-map-inv-scale, 1));
  box-sizing: border-box;
  touch-action: manipulation;
  background: var(--sn-marker-fill, #ffffff);
  box-shadow: none;
  z-index: 4;
  transition: transform 120ms ease, box-shadow 120ms ease;
}

.sn-marker:hover {
  filter: brightness(1.15);
  z-index: 8;
}

.sn-marker--hover {
  box-shadow: 0 0 0 2px rgba(237, 208, 94, 0.75);
  transform: translate(-50%, -50%) scale(calc(var(--sn-map-inv-scale, 1) * 1.08));
}

.sn-marker--svg {
  width: 22px;
  height: 22px;
  min-width: 22px;
  min-height: 22px;
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.75));
}

.sn-marker-svg-glyph {
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.sn-marker-svg-glyph :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
  filter: saturate(1.08) contrast(1.02);
}

.sn-marker--svg:hover {
  filter: drop-shadow(0 0 6px rgba(109, 212, 227, 0.5)) drop-shadow(0 0 2px rgba(237, 208, 94, 0.35));
}

.sn-marker--svg.sn-marker--hover {
  box-shadow: none;
  filter: drop-shadow(0 0 8px rgba(237, 208, 94, 0.55)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.8));
}

.sn-marker-popup-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 12;
}

.sn-marker-popup {
  pointer-events: auto;
  position: absolute;
  transform: translate(-50%, calc(-100% - 10px)) scale(var(--sn-map-inv-scale, 1));
  transform-origin: 50% 100%;
  min-width: 188px;
  max-width: min(280px, 46vw);
  padding: 12px 36px 12px 16px;
  border-radius: 4px;
  background: linear-gradient(145deg, rgba(29, 57, 94, 0.97) 0%, rgba(15, 33, 64, 0.99) 100%);
  border: 1px solid rgba(76, 141, 194, 0.35);
  border-left: 3px solid var(--sn-select);
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.45),
    0 12px 36px rgba(0, 0, 0, 0.55);
  text-align: left;
}

.sn-marker-popup::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -7px;
  transform: translateX(-50%);
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid rgba(21, 45, 74, 0.98);
  filter: drop-shadow(0 1px 0 rgba(109, 212, 227, 0.12));
}

.sn-marker-popup__close {
  position: absolute;
  top: 6px;
  right: 8px;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--sn-text-soft);
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sn-marker-popup__close:hover {
  color: var(--sn-blizzard);
  background: rgba(109, 212, 227, 0.12);
}

.sn-marker-popup__title {
  margin: 0 0 6px;
  font-family: var(--font-display);
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.35;
  color: #ffffff;
}

.sn-marker-popup__meta {
  margin: 0 0 4px;
  font-size: 0.75rem;
  color: var(--sn-text-soft);
}

.sn-marker-popup__depth {
  margin: 0 0 6px;
  font-size: 0.8rem;
  color: var(--sn-blizzard);
}

.sn-marker-popup__coords {
  margin: 0;
  font-family: ui-monospace, 'Cascadia Code', monospace;
  font-size: 0.8rem;
  color: var(--sn-teal);
}

.sn-marker-popup__img {
  display: block;
  width: 100%;
  max-height: 120px;
  object-fit: cover;
  border-radius: 4px;
  margin: 0 0 10px;
  border: 1px solid rgba(109, 212, 227, 0.15);
}

.sn-marker-popup__summary {
  margin: 10px 0 0;
  font-size: 0.78rem;
  line-height: 1.45;
  color: var(--sn-blizzard);
}

.sn-marker-popup__body {
  margin: 8px 0 0;
  font-size: 0.76rem;
  line-height: 1.5;
  color: var(--sn-text-soft);
  white-space: pre-wrap;
}

.sn-marker-popup--rich {
  max-width: min(360px, 72vw);
}

.sn-side-card {
  margin-top: 10px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--sn-line-soft);
  background: rgba(0, 0, 0, 0.2);
}

.sn-side-card__img {
  display: block;
  width: 100%;
  max-height: 140px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 10px;
  border: 1px solid rgba(109, 212, 227, 0.12);
}

.sn-side-card__title {
  margin: 0 0 8px;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.35;
}

.sn-side-card__meta {
  margin: 0 0 6px;
  font-size: 0.78rem;
  color: var(--sn-text-soft);
  line-height: 1.4;
}

.sn-side-card__summary {
  margin: 0 0 8px;
  font-size: 0.84rem;
  line-height: 1.45;
  color: var(--sn-blizzard);
}

.sn-side-card__body {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--sn-text-soft);
  white-space: pre-wrap;
}

@media (max-width: 1023px) {
  .sn-map-root {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
    min-height: min-content;
  }

  .sn-viewport {
    order: 1;
    height: 50vh;
    min-height: 200px;
    border-bottom: 1px solid rgba(109, 212, 227, 0.15);
  }

  .sn-sidebar {
    order: 2;
    max-height: 40vh;
    border-right: none;
    border-top: 1px solid rgba(109, 212, 227, 0.18);
    box-shadow: inset 0 1px 0 rgba(76, 141, 194, 0.12);
  }

  .sn-detail-panel {
    order: 3;
    max-height: 38vh;
    border-left: none;
    border-top: 1px solid rgba(109, 212, 227, 0.18);
    box-shadow: inset 0 1px 0 rgba(76, 141, 194, 0.08);
  }

  .sn-map-stage {
    width: min(92vmin, 100%);
    height: min(92vmin, 100%);
  }
}
</style>

<style>
/*
 * Rules adapted from the reference StyledVanillaMap layout (.iqPocd-style grouping),
 * scoped under .sn-map-root for matching fills / strokes / shadows.
 */
.sn-map-root svg.iqPocd {
  -webkit-filter: drop-shadow(0 4px 0 rgba(5, 12, 24, 0.5));
  filter: drop-shadow(0 4px 0 rgba(5, 12, 24, 0.5));
}

.sn-map-root svg.iqPocd #Zones path {
  -webkit-transition: opacity 250ms, fill 200ms;
  transition: opacity 250ms, fill 200ms;
  fill: #364783;
}

.sn-map-root svg.iqPocd #Zones path.zoneActive {
  fill: #4c8dc2;
}

.sn-map-root svg.iqPocd #Caves path,
.sn-map-root svg.iqPocd #Zones path,
.sn-map-root svg.iqPocd #Islands path {
  cursor: pointer;
  stroke: #050c18;
  stroke-width: 1.35;
  -webkit-tap-highlight-color: transparent;
}

.sn-map-root svg.iqPocd #Caves path.zoneSelected,
.sn-map-root svg.iqPocd #Zones path.zoneSelected,
.sn-map-root svg.iqPocd #Islands path.zoneSelected {
  fill: #edd05e;
}

.sn-map-root svg.iqPocd #Islands path {
  opacity: 0;
  pointer-events: none;
  fill: #3a9465;
  -webkit-transition: opacity 250ms, fill 200ms;
  transition: opacity 250ms, fill 200ms;
}

.sn-map-root svg.iqPocd #Caves path {
  opacity: 0;
  pointer-events: none;
  -webkit-transition: opacity 250ms, fill 200ms;
  transition: opacity 250ms, fill 200ms;
}

.sn-map-root svg.iqPocd #Islands path:hover {
  fill: #44b57a;
}

.sn-map-root svg.iqPocd #Islands path.zoneActive {
  fill: #44b57a;
}

.sn-map-root svg.iqPocd #JellyShroomCave.zoneActive {
  fill: #bb54d8;
}

.sn-map-root svg.iqPocd #LostRiver.zoneActive {
  fill: #37bda9;
}

.sn-map-root svg.iqPocd #InactiveLavaZone.zoneActive {
  fill: #b92d50;
}

.sn-map-root svg.iqPocd #ActiveLavaZone.zoneActive {
  fill: #ff6052;
}

.sn-map-root svg.iqPocd #JellyShroomCave,
.sn-map-root svg.iqPocd #JellyShroomCave path {
  fill: #a721cc;
}

.sn-map-root svg.iqPocd #JellyShroomCave:hover,
.sn-map-root svg.iqPocd #JellyShroomCave path:hover {
  fill: #bb54d8;
}

.sn-map-root svg.iqPocd #LostRiver,
.sn-map-root svg.iqPocd #LostRiver path {
  fill: #11a08a;
}

.sn-map-root svg.iqPocd #LostRiver:hover,
.sn-map-root svg.iqPocd #LostRiver path:hover {
  fill: #37bda9;
}

.sn-map-root svg.iqPocd #InactiveLavaZone,
.sn-map-root svg.iqPocd #InactiveLavaZone path {
  fill: #a20028;
}

.sn-map-root svg.iqPocd #InactiveLavaZone:hover,
.sn-map-root svg.iqPocd #InactiveLavaZone path:hover {
  fill: #b92d50;
}

.sn-map-root svg.iqPocd #ActiveLavaZone,
.sn-map-root svg.iqPocd #ActiveLavaZone path {
  fill: #f91906;
}

.sn-map-root svg.iqPocd #ActiveLavaZone:hover,
.sn-map-root svg.iqPocd #ActiveLavaZone path:hover {
  fill: #ff6052;
}

.sn-map-root svg.iqPocd #Zones {
  opacity: 1 !important;
  pointer-events: auto !important;
}

/*
 * ---------- Aurora hull: single selectable zone ----------
 * Default / hover / selected fills: edit below (uses zoneActive / zoneSelected like biome paths)
 */
.sn-map-root svg.sn-aurora-svg #AuroraShip {
  fill: #8896b8;
  stroke: #050c18;
  stroke-width: 1.35;
  cursor: pointer;
  -webkit-transition: opacity 250ms, fill 200ms;
  transition: opacity 250ms, fill 200ms;
  -webkit-tap-highlight-color: transparent;
}

.sn-map-root svg.sn-aurora-svg #AuroraShip.zoneActive {
  fill: #a8b4ce;
}

.sn-map-root svg.sn-aurora-svg #AuroraShip.zoneSelected {
  fill: #edd05e;
}
</style>
