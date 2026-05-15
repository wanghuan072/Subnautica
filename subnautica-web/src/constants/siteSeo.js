/** 全站默认 SEO（与 index.html 首屏、路由 meta 对齐）；生产 canonical 等仍用 seo/config 域名 */
export const SITE_DOMAIN = 'subnauticamap.org'

/**
 * 首页完整 document.title（不再拼接「| Subnautica Map」；路由 meta.completeTitle = true）。
 * 主关键词：Subnautica Map、Subnautica interactive map、Subnautica 2。
 */
export const HOME_PAGE_DOCUMENT_TITLE = 'Subnautica Interactive Map & Wiki | Subnautica 2 & Series Atlas'

/** 路由未提供 meta.title 时的回退主题段（会经 buildDocumentTitle 加品牌后缀） */
export const SITE_FALLBACK_TITLE_SEGMENT = 'Subnautica Map — interactive maps & guides'

/** 默认 meta description：约 140–160 英文字符；不含免责声明类套话 */
export const SITE_DEFAULT_DESCRIPTION =
  'Explore the ultimate Subnautica interactive map and wiki. Locate biomes, resource pins, and cave overlays, plus comprehensive survival guides for Subnautica 2 and Below Zero.'

/** 默认 meta keywords：无域名 */
export const SITE_DEFAULT_KEYWORDS =
  'Subnautica interactive map, Below Zero atlas, Subnautica 2 tracker, survival guide, resource map'
