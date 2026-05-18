/**
 * 自定义地图标点（SVG → MapLibre 栅格图）。
 * 外形比例对齐 Map Genie 雪碧图主标点：**66×88**（见 `markersAtlas2x.json` 中 width/height）。
 * 分组色与官网 `mapGenieGroups` 一致；内嵌为白色剪影，置于钉头圆内（与官网「色块 + 白标」观感一致）。
 * @see https://mapgenie.io/subnautica-2/maps/world
 */

/** @typedef {'locations'|'biological'|'tech'|'communications'|'resources'|'wildlife'|'plants'|'other'} MapIconGroupKey */

/** 与官网分组色（无 #）一致 */
export const MAP_ICON_GROUP_META = /** @type {const} */ ({
  locations: { color: '1B5575', label: 'Locations' },
  biological: { color: 'C65F33', label: 'Biological' },
  tech: { color: '3BA4C5', label: 'Tech' },
  communications: { color: 'DB6C60', label: 'Communications' },
  resources: { color: 'F3AA2C', label: 'Resources' },
  wildlife: { color: 'C42508', label: 'Wildlife' },
  plants: { color: '39634A', label: 'Plants' },
  other: { color: '5A6570', label: 'Other' },
})

export const MAP_ICON_GROUP_ORDER = /** @type {MapIconGroupKey[]} */ ([
  'locations',
  'biological',
  'tech',
  'communications',
  'resources',
  'wildlife',
  'plants',
  'other',
])

const TITLE_TO_KEY = /** @type {Record<string, MapIconGroupKey>} */ ({
  locations: 'locations',
  biological: 'biological',
  tech: 'tech',
  communications: 'communications',
  resources: 'resources',
  wildlife: 'wildlife',
  plants: 'plants',
  'raw materials': 'resources',
  other: 'other',
})

/**
 * @param {string} groupTitle
 * @param {string | undefined} mapGenieSource
 * @returns {MapIconGroupKey}
 */
export function resolveMapIconGroupKey(groupTitle, mapGenieSource) {
  if (mapGenieSource === 'resource') return 'resources'
  const t = typeof groupTitle === 'string' ? groupTitle.trim().toLowerCase() : ''
  if (t && TITLE_TO_KEY[t]) return TITLE_TO_KEY[t]
  return 'other'
}

/**
 * @param {MapIconGroupKey} key
 * @returns {string}
 */
export function mapIconImageIdFromKey(key) {
  return `cdm-pin-${key}`
}

/** 所有会注册到 MapLibre 的 icon id */
export function allMapIconImageIds() {
  return MAP_ICON_GROUP_ORDER.map(mapIconImageIdFromKey)
}

/** 与 Map Genie 主标点雪碧格一致（@2x 切片为 132×176 像素） */
export const MAP_PIN_VIEW_W = 66
export const MAP_PIN_VIEW_H = 88

/**
 * 泪滴外轮廓（viewBox 0 0 66 88），底尖在 y≈84，与常见 map pin 比例接近官网 66×88 格。
 */
const PIN_OUTER_PATH =
  'M33 2.5C16.8 2.5 4 15.2 4 31.2c0 13.8 29 52.3 29 52.3s29-38.5 29-52.3C62 15.2 49.2 2.5 33 2.5z'

/**
 * @param {MapIconGroupKey} groupKey
 * @param {string} [fillHex] 无 # 的 6 位十六进制
 */
export function buildMapPinSvgString(groupKey, fillHex) {
  const meta = MAP_ICON_GROUP_META[groupKey] ?? MAP_ICON_GROUP_META.other
  const fill = /^[0-9A-Fa-f]{6}$/.test(String(fillHex || '').replace(/^#/, ''))
    ? String(fillHex).replace(/^#/, '')
    : meta.color

  const inner = INNER_PATHS[groupKey] ?? INNER_PATHS.other

  /** 不用 clip-path：data URL 经 encodeURIComponent 后 `url(#id)` 里的 `#` 会变成 `%23`，片段引用失效，内嵌图标会整块不显示 */
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MAP_PIN_VIEW_W} ${MAP_PIN_VIEW_H}" width="${MAP_PIN_VIEW_W}" height="${MAP_PIN_VIEW_H}">
  <path fill="#${fill}" stroke="rgba(0,0,0,0.34)" stroke-width="1"
    d="${PIN_OUTER_PATH}"/>
  <g fill="#ffffff" fill-opacity="0.98" transform="translate(33,28)">
    ${inner}
  </g>
</svg>`
}

/**
 * 内嵌剪影（局部坐标，原点在钉头圆心）；与 Map Genie 各组语义对应。
 * @type {Record<MapIconGroupKey, string>}
 */
const INNER_PATHS = {
  /** Locations：地标 / 舱体 — 简化的「屋顶 + 墙」 */
  locations: `<path d="M-12,9 L12,9 L12,1 L0,-10 L-12,1 Z M-6,9 L-6,3 L6,3 L6,9 Z"/>`,
  /** Biological：利维坦类 — 弓形背 + 背鳍 */
  biological: `<path d="M-13,6 C-11,-10 -2,-12 6,-6 C11,-2 12,4 10,8 C6,5 -2,5 -8,8 C-12,8 -13,6 -13,6Z"/><path d="M-2,-12 L2,-12 L0,-18 Z"/>`,
  /** Tech：碎片 / 数据块 — 等距立方体面 */
  tech: `<path d="M0,-11 L10,-4 L0,3 L-10,-4 Z M0,-11 L0,3 M-10,-4 L10,-4 M-6,1 L-6,9 L6,9 L6,1 Z"/>`,
  /** Communications：终端 / 信号 — 竖条天线 + 波纹 */
  communications: `<path fill="none" d="M0,10 L0,-14 M-2,-14 L2,-14" stroke="#ffffff" stroke-opacity="0.98" stroke-width="2.2" stroke-linecap="round"/><path fill="none" d="M-11,4 Q0,-6 11,4" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><path fill="none" d="M-8,8 Q0,2 8,8" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/><rect x="-7" y="-2" width="14" height="10" rx="1.5" fill="#ffffff"/>`,
  /** Resources：矿石 — 多棱块 */
  resources: `<path d="M0,-12 L9,0 L6,11 L-6,11 L-9,0 Z M-4,-5 L4,2"/>`,
  /** Wildlife：鱼类轮廓（atlas 中 wildlife 多为 fish） */
  wildlife: `<path d="M-13,0.5 Q-5,-7 7,-2.5 Q13,0.5 7,3.5 Q-3,8 -13,0.5Z"/><path d="M8,-1 L16,0.5 L8,2.5 Z"/><circle cx="-6" cy="-1" r="1.8"/>`,
  /** Plants：茎 + 双叶 */
  plants: `<path fill="none" d="M0,10 L0,-6 M-9,2 Q-11,-8 0,-11 Q11,-8 9,2" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  /** Other：圆环 */
  other: `<circle cx="0" cy="0" r="6" fill="none" stroke="#ffffff" stroke-width="2.4"/>`,
}

const OUT_W = MAP_PIN_VIEW_W
const OUT_H = MAP_PIN_VIEW_H

/**
 * @param {import('maplibre-gl').Map} map
 * @param {{ pixelRatio?: number }} [opts]
 */
export async function registerMapLibrePinImages(map, opts = {}) {
  const pr = typeof opts.pixelRatio === 'number' && opts.pixelRatio > 0 ? opts.pixelRatio : 2
  const w = Math.round(OUT_W * pr)
  const h = Math.round(OUT_H * pr)

  for (const key of MAP_ICON_GROUP_ORDER) {
    const id = mapIconImageIdFromKey(key)
    if (map.hasImage(id)) continue

    const svg = buildMapPinSvgString(key)
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise((resolve, reject) => {
      img.onload = () => resolve(null)
      img.onerror = () => reject(new Error(`mapIcon: failed to decode SVG for ${key}`))
      img.src = url
    })

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) continue
    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)
    const bitmap = await createImageBitmap(canvas)
    map.addImage(id, bitmap, { pixelRatio: pr })
  }
}
