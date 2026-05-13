/** 全站默认 SEO（与 index.html 首屏、路由 meta 对齐）；生产 canonical 等仍用 seo/config 域名 */
export const SITE_DOMAIN = 'subnauticamap.org'

/**
 * 首页完整 document.title（不再拼接「| Subnautica Map」；路由 meta.completeTitle = true）。
 * 主关键词：Subnautica Map、Subnautica interactive map、Subnautica 2。
 */
export const HOME_PAGE_DOCUMENT_TITLE = 'Subnautica Map - Subnautica interactive map & Subnautica 2'

/** 路由未提供 meta.title 时的回退主题段（会经 buildDocumentTitle 加品牌后缀） */
export const SITE_FALLBACK_TITLE_SEGMENT = 'Subnautica Map — interactive maps & guides'

/** 默认 meta description：约 140–160 英文字符；不含免责声明类套话 */
export const SITE_DEFAULT_DESCRIPTION =
  'Full-screen Subnautica and Below Zero maps: biomes, pins, cave overlays, guides, mod listings, and Subnautica 2 map status—all in your browser.'

/** 默认 meta keywords：无域名 */
export const SITE_DEFAULT_KEYWORDS =
  'Subnautica Map, Subnautica interactive map, Subnautica 2, Subnautica Below Zero map, interactive atlas, survival guide, mod index, biome map, resource map, cave overlay'
