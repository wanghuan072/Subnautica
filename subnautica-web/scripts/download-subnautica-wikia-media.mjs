/**
 * Download static.wikia.nocookie.net images referenced in Subnautica JSON data
 * into public/images/subnautica/wikia/, rewrite URLs to /images/subnautica/wikia/<file>.
 * Also strips trailing subnautica.wikia.com / fandom.com URLs from marker descriptions.
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import {
  REPO_ROOT,
  SUBNAUTICA_MARKERS_JSON,
  SUBNAUTICA_VANILLA_JSON,
} from './lib/subnautica-data-paths.mjs'

const OUT_DIR = path.join(REPO_ROOT, 'public/images/subnautica/wikia')
const WEB_PREFIX = '/images/subnautica/wikia/'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'

function isRemoteWikiaImage(url) {
  if (typeof url !== 'string') return false
  if (url.startsWith(WEB_PREFIX)) return false
  try {
    const h = new URL(url.trim()).hostname.toLowerCase()
    return h.endsWith('wikia.nocookie.net')
  } catch {
    return false
  }
}

function extFromUrl(url) {
  try {
    const p = new URL(url).pathname
    const m = p.match(/\.([a-z0-9]+)$/i)
    if (m) return '.' + m[1].toLowerCase()
  } catch {
    /* ignore */
  }
  return '.png'
}

function fileNameForUrl(remoteUrl) {
  const h = crypto.createHash('sha256').update(remoteUrl).digest('hex').slice(0, 16)
  return h + extFromUrl(remoteUrl)
}

function stripWikiRefsFromDescription(s) {
  if (typeof s !== 'string') return s
  return s
    .replace(/\n\nhttps?:\/\/subnautica\.wikia\.com\/\S+/gi, '')
    .replace(/\nhttps?:\/\/subnautica\.wikia\.com\/\S+/gi, '')
    .replace(/\n\nhttps?:\/\/subnautica\.fandom\.com\/\S+/gi, '')
    .replace(/\nhttps?:\/\/subnautica\.fandom\.com\/\S+/gi, '')
    .replace(/^https?:\/\/subnautica\.wikia\.com\/\S+/gim, '')
    .replace(/^https?:\/\/subnautica\.fandom\.com\/\S+/gim, '')
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms))
}

async function downloadToFile(remoteUrl, diskPath, retries = 4) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(remoteUrl, { headers: { 'User-Agent': UA } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      fs.writeFileSync(diskPath, Buffer.from(await res.arrayBuffer()))
      return true
    } catch {
      await sleep(350 * (attempt + 1))
    }
  }
  return false
}

/** Recursively replace string leaf values */
function mapStrings(obj, fn) {
  if (obj == null) return
  if (typeof obj === 'string') return fn(obj)
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const v = obj[i]
      if (typeof v === 'string') obj[i] = fn(v)
      else mapStrings(v, fn)
    }
    return
  }
  if (typeof obj === 'object') {
    for (const k of Object.keys(obj)) {
      const v = obj[k]
      if (typeof v === 'string') obj[k] = fn(v)
      else mapStrings(v, fn)
    }
  }
}

async function processJsonFile(filePath, extraStringTransform) {
  if (!fs.existsSync(filePath)) {
    console.warn('Skip missing', filePath)
    return
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  /** @type Map<string, string> */
  const urlMap = new Map()

  function collect(u) {
    if (!isRemoteWikiaImage(u)) return
    if (!urlMap.has(u)) urlMap.set(u, WEB_PREFIX + fileNameForUrl(u))
  }

  mapStrings(data, (s) => {
    collect(s)
    return s
  })

  fs.mkdirSync(OUT_DIR, { recursive: true })
  console.log(filePath, 'unique Wikia image URLs:', urlMap.size)

  let ok = 0
  let failed = 0
  for (const [remoteUrl, webPath] of urlMap) {
    const fname = path.basename(webPath)
    const diskPath = path.join(OUT_DIR, fname)
    if (fs.existsSync(diskPath)) {
      ok++
      continue
    }
    console.log('download', fname)
    const success = await downloadToFile(remoteUrl, diskPath)
    if (success) ok++
    else {
      failed++
      console.warn('FAILED', fname)
    }
    await sleep(80)
  }

  let rewritten = 0
  mapStrings(data, (s) => {
    let t = s
    if (extraStringTransform) t = extraStringTransform(t)
    if (!isRemoteWikiaImage(t)) return t
    const local = urlMap.get(t)
    if (!local) return t
    const diskPath = path.join(OUT_DIR, path.basename(local))
    if (fs.existsSync(diskPath)) {
      rewritten++
      return local
    }
    return t
  })

  fs.writeFileSync(filePath, `${JSON.stringify(data)}\n`, 'utf8')
  console.log('Rewrote Wikia image refs:', rewritten, 'files ok:', ok, failed ? `failed: ${failed}` : '')
}

async function main() {
  await processJsonFile(SUBNAUTICA_VANILLA_JSON)
  await processJsonFile(SUBNAUTICA_MARKERS_JSON, stripWikiRefsFromDescription)
  console.log('Done. Output:', OUT_DIR)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
