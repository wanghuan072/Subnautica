/**
 * Align markers.json / surfaceCavesMarkers.json names and detail fields with subnauticamap.io vanilla table (nearest-neighbor by coords).
 * Run: node scripts/apply-subnauticamap-markers.mjs
 */
import fs from 'fs'
import path from 'node:path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const dataDir = path.join(root, 'src', 'data', 'subnautica')

function num(v) {
  if (v == null) return NaN
  if (typeof v === 'number' && Number.isFinite(v)) return v
  const n = parseFloat(String(v).trim())
  return Number.isFinite(n) ? n : NaN
}

function cleanSummary(s) {
  if (typeof s !== 'string') return ''
  return s
    .replace(/xa0/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const sn = JSON.parse(fs.readFileSync(path.join(dataDir, 'subnauticamap-vanilla.json'), 'utf8'))

const wrecksArticle = sn.articles.find((a) => a.name === 'Wrecks')
const lifepodsArticle = sn.articles.find((a) => a.name === 'Destroyed Lifepods')
const degasiArticle = sn.articles.find((a) => a.name === 'Degasi Seabases')

/** @type {{ refType: string, title: string, x: number, y: number, z: number, summary?: string, image?: string, link?: string }[]} */
const points = []

for (const w of sn.wrecks) {
  const c = w.coords
  points.push({
    refType: w.type,
    title: w.title,
    x: num(c.x),
    y: num(c.y),
    z: num(c.z),
    summary: wrecksArticle ? cleanSummary(wrecksArticle.summary) : '',
    image: wrecksArticle?.image || '',
    link: wrecksArticle?.link || '',
  })
}

for (const w of sn.lifepods) {
  const c = w.coords
  points.push({
    refType: w.type,
    title: w.title,
    x: num(c.x),
    y: num(c.y),
    z: num(c.z),
    summary: lifepodsArticle ? cleanSummary(lifepodsArticle.summary) : '',
    image: lifepodsArticle?.image || '',
    link: lifepodsArticle?.link || '',
  })
}

for (const w of sn.pois110) {
  const c = w.coords
  const base =
    w.type === 'degasiSeabases' && degasiArticle
      ? {
          summary: cleanSummary(degasiArticle.summary),
          image: degasiArticle.image,
          link: degasiArticle.link,
        }
      : { summary: '', image: '', link: '' }
  points.push({
    refType: w.type,
    title: w.title,
    x: num(c.x),
    y: num(c.y),
    z: num(c.z),
    ...base,
  })
}

for (const art of sn.articles) {
  if (!Array.isArray(art.coords)) continue
  const rt = art.poiType || (art.name === 'Degasi Seabases' ? 'degasiSeabases' : null)
  if (!rt) continue
  for (const c of art.coords) {
    points.push({
      refType: rt,
      title: art.name,
      x: num(c.x),
      y: num(c.y),
      z: num(c.z),
      summary: cleanSummary(art.summary),
      image: art.image || '',
      link: art.link || '',
    })
  }
}

const LAYER_TO_REF = {
  largeWrecks: 'largeWrecks',
  smallWrecks: 'smallWrecks',
  lifepods: 'lifepods',
  degasi: 'degasiSeabases',
  alienBases: 'alienBases',
  caveEntrances: 'caveEntrances',
  geysers: 'geysers',
  leviathans: 'leviathanSpawn',
  surfaceCaves: 'caveEntrances',
}

/** Reference bundle entries without standalone coords: link-only to Fandom (same wiki as subnauticamap) */
const MANUAL_BY_ID = {
  'vent-dunes': {
    name: 'Alien Vent Entrance Point',
    detailTitle: 'Alien Vent Entrance Point',
    detailSummary: '',
    detailDescription: 'https://subnautica.fandom.com/wiki/Alien_Vents',
    detailImage: '',
  },
  'vent-grand': {
    name: 'Alien Vent Entrance Point',
    detailTitle: 'Alien Vent Entrance Point',
    detailSummary: '',
    detailDescription: 'https://subnautica.fandom.com/wiki/Alien_Vents',
    detailImage: '',
  },
  'vent-sparse': {
    name: 'Alien Vent Entrance Point',
    detailTitle: 'Alien Vent Entrance Point',
    detailSummary: '',
    detailDescription: 'https://subnautica.fandom.com/wiki/Alien_Vents',
    detailImage: '',
  },
  'vent-islands': {
    name: 'Alien Vent Entrance Point',
    detailTitle: 'Alien Vent Entrance Point',
    detailSummary: '',
    detailDescription: 'https://subnautica.fandom.com/wiki/Alien_Vents',
    detailImage: '',
  },
  'vent-mushroom-ne': {
    name: 'Alien Vent Entrance Point (Northeastern)',
    detailTitle: 'Alien Vent Entrance Point (Northeastern)',
    detailSummary: '',
    detailDescription: 'https://subnautica.fandom.com/wiki/Alien_Vents',
    detailImage: '',
  },
  'vent-mountains': {
    name: 'Alien Vent Entrance Point',
    detailTitle: 'Alien Vent Entrance Point',
    detailSummary: '',
    detailDescription: 'https://subnautica.fandom.com/wiki/Alien_Vents',
    detailImage: '',
  },
  'cave-lr-trench': {
    name: 'Blood Kelp Caves',
    detailTitle: 'Blood Kelp Caves',
    detailSummary: '',
    detailDescription: 'https://subnautica.fandom.com/wiki/Lost_River',
    detailImage: '',
  },
  'gy-1': {
    name: 'Lava Geyser',
    detailTitle: 'Lava Geyser',
    detailSummary: '',
    detailDescription: 'https://subnautica.fandom.com/wiki/Lava_Geyser',
    detailImage: '',
  },
  'gy-2': {
    name: 'Lava Geyser',
    detailTitle: 'Lava Geyser',
    detailSummary: '',
    detailDescription: 'https://subnautica.fandom.com/wiki/Lava_Geyser',
    detailImage: '',
  },
  'gy-3': {
    name: 'Lava Geyser',
    detailTitle: 'Lava Geyser',
    detailSummary: '',
    detailDescription: 'https://subnautica.fandom.com/wiki/Lava_Geyser',
    detailImage: '',
  },
  'gy-4': {
    name: 'Lava Geyser',
    detailTitle: 'Lava Geyser',
    detailSummary: '',
    detailDescription: 'https://subnautica.fandom.com/wiki/Lava_Geyser',
    detailImage: '',
  },
  'gy-5': {
    name: 'Lava Geyser',
    detailTitle: 'Lava Geyser',
    detailSummary: '',
    detailDescription: 'https://subnautica.fandom.com/wiki/Lava_Geyser',
    detailImage: '',
  },
  'gy-7': {
    name: 'Lava Geyser',
    detailTitle: 'Lava Geyser',
    detailSummary: '',
    detailDescription: 'https://subnautica.fandom.com/wiki/Lava_Geyser',
    detailImage: '',
  },
  'gy-9': {
    name: 'Lava Geyser',
    detailTitle: 'Lava Geyser',
    detailSummary: '',
    detailDescription: 'https://subnautica.fandom.com/wiki/Lava_Geyser',
    detailImage: '',
  },
  'lv-mountains-2': {
    name: 'Ghost Leviathan',
    detailTitle: 'Ghost Leviathan',
    detailSummary: '',
    detailDescription: 'https://subnautica.fandom.com/wiki/Ghost_Leviathan',
    detailImage: '',
  },
  'lv-treader': {
    name: 'Reaper Leviathan',
    detailTitle: 'Reaper Leviathan',
    detailSummary: '',
    detailDescription: 'https://subnautica.fandom.com/wiki/Reaper_Leviathan',
    detailImage: '',
  },
}

const archArticle = sn.articles.find((a) => a.name === 'Alien Arch Caches')
if (archArticle) {
  MANUAL_BY_ID['arch-mountains'] = {
    name: 'Alien Arch Caches',
    detailTitle: 'Alien Arch Caches',
    detailSummary: '',
    detailDescription: `${cleanSummary(archArticle.summary)}\n\n${archArticle.link}`,
    detailImage: archArticle.image || '',
  }
}

function maxD2ForLayer(layerId) {
  if (layerId === 'caveEntrances') return 450 * 450
  if (layerId === 'alienBases') return 280 * 280
  if (layerId === 'geysers') return 650 * 650
  if (layerId === 'leviathans') return 520 * 520
  if (layerId === 'surfaceCaves') return 320 * 320
  return 160 * 160
}

function matchMarker(m) {
  const rt = LAYER_TO_REF[m.layerId]
  if (!rt) return null
  const cand = points.filter((p) => p.refType === rt)
  let best = null
  let bestD = Infinity
  for (const p of cand) {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.z)) continue
    const d = (m.x - p.x) ** 2 + (m.z - p.z) ** 2
    if (d < bestD) {
      bestD = d
      best = p
    }
  }
  const maxD2 = maxD2ForLayer(m.layerId)
  if (!best || bestD > maxD2) return null
  return { ...best, dist2: bestD }
}

function applyFile(file) {
  const p = path.join(dataDir, file)
  const list = JSON.parse(fs.readFileSync(p, 'utf8'))
  let n = 0
  for (const m of list) {
    const manual = MANUAL_BY_ID[m.id]
    if (manual) {
      Object.assign(m, manual)
      if (manual.detailImage === '') delete m.detailImage
      n++
      continue
    }
    const hit = matchMarker(m)
    if (!hit) continue
    m.name = hit.title
    m.detailTitle = hit.title
    const sum = hit.summary || ''
    m.detailSummary = ''
    m.detailDescription = hit.link ? `${sum ? `${sum}\n\n` : ''}${hit.link}` : sum
    m.detailImage = hit.image || ''
    if (Number.isFinite(hit.y)) m.depthM = Math.round(-hit.y)
    n++
  }
  fs.writeFileSync(p, JSON.stringify(list, null, 2) + '\n', 'utf8')
  console.log(file, 'matched', n, '/', list.length)
}

applyFile('markers.json')
applyFile('surfaceCavesMarkers.json')
