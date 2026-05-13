/**
 * Download remote images referenced by media / detailImage in src/data/mapgenie/markers.json
 * into public/images/mapgenie/media/, then rewrite successful URLs to site paths
 * /images/mapgenie/media/<hash>.<ext>
 *
 * Per-file failures do not abort; re-run to fill gaps.
 * Suggested flow: npm run extract:mapgenie → npm run download:mapgenie-media
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { MAPGENIE_MARKERS_JSON, REPO_ROOT } from './lib/mapgenie-data-paths.mjs'

function resolveMediaPaths() {
  const arg = process.argv[2]
  const markersJson = arg ? path.resolve(REPO_ROOT, arg) : MAPGENIE_MARKERS_JSON
  const useBz = markersJson.replace(/\\/g, '/').includes('/mapgenie-bz/')
  const outDir = path.join(
    REPO_ROOT,
    useBz ? 'public/images/mapgenie-bz/media' : 'public/images/mapgenie/media',
  )
  const webPrefix = useBz ? '/images/mapgenie-bz/media/' : '/images/mapgenie/media/'
  return { markersJson, outDir, webPrefix }
}
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'

function extFromUrl(url) {
  try {
    const p = new URL(url).pathname
    const m = p.match(/\.([a-z0-9]+)$/i)
    if (m) return '.' + m[1].toLowerCase()
  } catch {
    /* ignore */
  }
  return '.jpg'
}

function fileNameForUrl(remoteUrl) {
  const h = crypto.createHash('sha256').update(remoteUrl).digest('hex').slice(0, 20)
  return h + extFromUrl(remoteUrl)
}

function isRemoteMapgenieMediaUrl(url, webPrefix) {
  if (typeof url !== 'string') return false
  if (url.startsWith(webPrefix)) return false
  try {
    const u = new URL(url)
    if (u.protocol !== 'https:') return false
    return u.hostname.toLowerCase().endsWith('mapgenie.io')
  } catch {
    return false
  }
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

async function main() {
  const { markersJson: MARKERS_JSON, outDir: OUT_DIR, webPrefix: WEB_PREFIX } = resolveMediaPaths()

  if (!fs.existsSync(MARKERS_JSON)) {
    console.error('Missing', MARKERS_JSON)
    process.exit(1)
  }

  const markers = JSON.parse(fs.readFileSync(MARKERS_JSON, 'utf8'))
  /** @type {Map<string, string>} remote -> /images/... */
  const urlMap = new Map()

  function collectUrl(u) {
    if (!isRemoteMapgenieMediaUrl(u, WEB_PREFIX)) return
    if (!urlMap.has(u)) urlMap.set(u, WEB_PREFIX + fileNameForUrl(u))
  }

  for (const row of Array.isArray(markers) ? markers : []) {
    const media = row.media
    if (Array.isArray(media)) {
      for (const m of media) collectUrl(m?.url)
    }
    collectUrl(row.detailImage)
  }

  fs.mkdirSync(OUT_DIR, { recursive: true })

  console.log('Unique remote media URLs:', urlMap.size)

  let ok = 0
  let failed = 0
  for (const [remoteUrl, webPath] of urlMap) {
    const fname = path.basename(webPath)
    const diskPath = path.join(OUT_DIR, fname)
    if (fs.existsSync(diskPath)) {
      console.log('exists skip', fname)
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
  let remainRemote = 0

  function localizeUrlField(obj, field) {
    const u = obj[field]
    if (!isRemoteMapgenieMediaUrl(u, WEB_PREFIX)) return
    const local = urlMap.get(u)
    if (!local) return
    const diskPath = path.join(OUT_DIR, path.basename(local))
    if (fs.existsSync(diskPath)) {
      obj[field] = local
      rewritten++
    } else {
      remainRemote++
    }
  }

  for (const row of Array.isArray(markers) ? markers : []) {
    const media = row.media
    if (Array.isArray(media)) {
      for (const m of media) localizeUrlField(m, 'url')
    }
    localizeUrlField(row, 'detailImage')
  }

  fs.writeFileSync(MARKERS_JSON, `${JSON.stringify(markers)}\n`, 'utf8')
  console.log('Localized media refs in JSON:', rewritten)
  console.log('Still remote (missing files):', remainRemote)
  console.log('Files on disk:', ok, '/ unique URLs:', urlMap.size, failed ? `(failed this run: ${failed})` : '')
  console.log('Updated', MARKERS_JSON)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
