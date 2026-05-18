/** Map Genie map pages embed window.mapData / window.specialData */

export const MAPGENIE_SUBNAUTICA_WORLD = 'https://mapgenie.io/subnautica/maps/world'
export const MAPGENIE_BELOW_ZERO_WORLD = 'https://mapgenie.io/subnautica-below-zero/maps/world'
export const MAPGENIE_SUBNAUTICA_2_WORLD = 'https://mapgenie.io/subnautica-2/maps/world'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'

/**
 * Slice first JSON object or array after `prefix` (matches `window.mapData = {...}` and `window.specialData = []`).
 */
export function extractJsonAssignment(html, prefix) {
  const s = html.indexOf(prefix)
  if (s < 0) throw new Error(`not found: ${prefix}`)
  let i = s + prefix.length
  while (i < html.length && /\s/.test(html[i])) i++
  const start = i
  const open = html[i]
  if (open !== '{' && open !== '[') {
    throw new Error(`expected { or [ after ${prefix}`)
  }
  const stack = [open]
  i++
  let inStr = false
  let q = ''
  let esc = false
  for (; i < html.length; i++) {
    const c = html[i]
    if (inStr) {
      if (esc) {
        esc = false
        continue
      }
      if (c === '\\') {
        esc = true
        continue
      }
      if (c === q) inStr = false
      continue
    }
    if (c === '"' || c === "'") {
      if (c === "'") continue
      inStr = true
      q = c
      continue
    }
    if (c === '{' || c === '[') {
      stack.push(c)
      continue
    }
    if (c === '}' || c === ']') {
      const top = stack[stack.length - 1]
      if ((c === '}' && top === '{') || (c === ']' && top === '[')) {
        stack.pop()
        if (stack.length === 0) {
          i++
          break
        }
      }
    }
  }
  return html.slice(start, i)
}

export async function fetchMapgeniePageHtml(pageUrl = MAPGENIE_SUBNAUTICA_WORLD) {
  const res = await fetch(pageUrl, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`fetch map page HTTP ${res.status}`)
  return res.text()
}

/** @deprecated use fetchMapgeniePageHtml */
export async function fetchMapgenieWorldHtml() {
  return fetchMapgeniePageHtml(MAPGENIE_SUBNAUTICA_WORLD)
}

/** Map Genie embeds marker sprite rects keyed by category id (same sheet as markers@2x.png). */
export const MARKER_SPRITE_POSITIONS_V3_PREFIX = 'const MARKER_SPRITE_POSITIONS_V3 = '

/**
 * @returns {Record<string, { width: number, height: number, x: number, y: number, pixelRatio?: number }> | null}
 */
export function extractMarkerSpritePositionsV3(html) {
  if (typeof html !== 'string' || !html.includes(MARKER_SPRITE_POSITIONS_V3_PREFIX)) return null
  try {
    return JSON.parse(extractJsonAssignment(html, MARKER_SPRITE_POSITIONS_V3_PREFIX))
  } catch {
    return null
  }
}
