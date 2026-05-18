/**
 * subnauticamap.org — 生产 canonical、OG、Twitter、sitemap 使用此域名。
 */
import {
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_KEYWORDS,
  SITE_FALLBACK_TITLE_SEGMENT,
} from '../constants/siteSeo.js'

export const seoConfig = {
  domain: 'subnauticamap.org',
  fullDomain: 'https://subnauticamap.org',
  siteName: 'Subnautica Map',
  /** 默认分享图（站内路径，运行时拼为绝对 URL） */
  defaultOgImage: '/images/logo.webp',
  defaults: {
    title: SITE_FALLBACK_TITLE_SEGMENT,
    description: SITE_DEFAULT_DESCRIPTION,
    keywords: SITE_DEFAULT_KEYWORDS,
    author: 'Subnautica Map',
    type: 'website',
  },
  social: {
    twitterSite: '',
    twitterCreator: '',
  },
  /** sitemap priority（0.0–1.0），键与路由 `name` 对齐 */
  priorities: {
    home: 1.0,
    subnautica: 0.92,
    'subnautica-below-zero': 0.92,
    'subnautica-2': 0.92,
    'map-subnautica': 0.95,
    'map-below-zero': 0.95,
    'map-subnautica-2': 0.75,
    'guide-detail': 0.78,
    'mod-detail': 0.72,
    about: 0.4,
    contact: 0.4,
    privacy: 0.35,
    terms: 0.35,
    copyright: 0.35,
  },
  changefreq: {
    home: 'weekly',
    subnautica: 'weekly',
    'subnautica-below-zero': 'weekly',
    'subnautica-2': 'weekly',
    'map-subnautica': 'weekly',
    'map-below-zero': 'weekly',
    'map-subnautica-2': 'monthly',
    'guide-detail': 'monthly',
    'mod-detail': 'monthly',
    about: 'yearly',
    contact: 'yearly',
    privacy: 'yearly',
    terms: 'yearly',
    copyright: 'yearly',
  },
}
