/** Map Genie map pages embed window.mapData / window.specialData */

export const MAPGENIE_SUBNAUTICA_WORLD = 'https://mapgenie.io/subnautica/maps/world'
export const MAPGENIE_BELOW_ZERO_WORLD = 'https://mapgenie.io/subnautica-below-zero/maps/world'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'

/** Slice first top-level `{ ... }` after `prefix` from HTML (matches page assignment format) */
export function extractJsonAssignment(html, prefix) {
  const s = html.indexOf(prefix)
  if (s < 0) throw new Error(`not found: ${prefix}`)
  let i = s + prefix.length
  let depth = 0
  const start = i
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
    if (c === '{') depth++
    if (c === '}') {
      depth--
      if (depth === 0) {
        i++
        break
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
