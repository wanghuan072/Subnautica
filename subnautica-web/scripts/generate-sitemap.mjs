import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import guides from '../src/data/guides/guides.js'
import mods from '../src/data/mods/mods.js'
import { seoConfig } from '../src/seo/config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const fullDomain = seoConfig.fullDomain.replace(/\/+$/, '')

const staticRoutes = [
  { path: '/', name: 'home' },
  { path: '/about', name: 'about' },
  { path: '/contact', name: 'contact' },
  { path: '/privacy', name: 'privacy' },
  { path: '/terms', name: 'terms' },
  { path: '/copyright', name: 'copyright' },
  { path: '/subnautica', name: 'subnautica' },
  { path: '/subnautica-below-zero', name: 'subnautica-below-zero' },
  { path: '/subnautica-2', name: 'subnautica-2' },
  { path: '/maps/subnautica', name: 'map-subnautica' },
  { path: '/maps/subnautica-below-zero', name: 'map-below-zero' },
  { path: '/maps/subnautica-2', name: 'map-subnautica-2' },
]

function getPriority(name) {
  return (seoConfig.priorities && seoConfig.priorities[name]) ?? 0.7
}

function getChangefreq(name) {
  return (seoConfig.changefreq && seoConfig.changefreq[name]) ?? 'monthly'
}

function urlNode(loc, lastmod, changefreq, priority) {
  const p = String(Math.round((priority ?? 0.7) * 100) / 100)
  return `  <url>
    <loc>${fullDomain}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${p}</priority>
  </url>`
}

function generate() {
  const lastmod = new Date().toISOString().split('T')[0]

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`

  for (const r of staticRoutes) {
    xml += `\n${urlNode(r.path, lastmod, getChangefreq(r.name), getPriority(r.name))}`
  }

  const guideList = Array.isArray(guides) ? guides : []
  for (const g of guideList) {
    if (!g?.addressBar) continue
    const slug = String(g.addressBar).replace(/^\/+|\/+$/g, '')
    const guidePath = `/guides/${slug}`
    const date = g.publishDate ? String(g.publishDate).split('T')[0] : lastmod
    xml += `\n${urlNode(guidePath, date, getChangefreq('guide-detail'), getPriority('guide-detail'))}`
  }

  const modList = Array.isArray(mods) ? mods : []
  for (const m of modList) {
    if (!m?.addressBar) continue
    const slug = String(m.addressBar).replace(/^\/+|\/+$/g, '')
    const modPath = `/mods/${slug}`
    const date = m.publishDate ? String(m.publishDate).split('T')[0] : lastmod
    xml += `\n${urlNode(modPath, date, getChangefreq('mod-detail'), getPriority('mod-detail'))}`
  }

  xml += '\n</urlset>'

  const publicPath = path.join(__dirname, '../public/sitemap.xml')
  const publicDir = path.dirname(publicPath)
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }
  fs.writeFileSync(publicPath, xml, 'utf8')
  console.log('Sitemap written to public/sitemap.xml')

  const count = (xml.match(/<url>/g) || []).length
  console.log(`Total URLs: ${count}`)
}

generate()
