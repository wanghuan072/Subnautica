import { createRouter, createWebHistory } from 'vue-router'
import { getGuideByAddressBar, getModByAddressBar } from '@/data/gameHubResolve.js'
import { SITE_DEFAULT_DESCRIPTION, SITE_DEFAULT_KEYWORDS } from '@/constants/siteSeo.js'
import { legalPageMeta } from '@/constants/siteLegalMeta.js'
import { seoConfig } from '@/seo/config.js'
import {
  applyDocumentSeo,
  buildArticleJsonLd,
  buildHomePageJsonLdGraph,
  mergeArticleJsonLdWithHead,
  resolveCanonicalUrl,
} from '@/seo/documentMeta.js'
import { buildDocumentTitle } from '@/utils/pageSeo.js'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: 'Subnautica Map — Interactive maps & survival guide hub',
      description: SITE_DEFAULT_DESCRIPTION,
      keywords: SITE_DEFAULT_KEYWORDS,
    },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/site/AboutView.vue'),
    meta: { ...legalPageMeta.about },
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('@/views/site/ContactView.vue'),
    meta: { ...legalPageMeta.contact },
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('@/views/site/PrivacyView.vue'),
    meta: { ...legalPageMeta.privacy },
  },
  {
    path: '/terms',
    name: 'terms',
    component: () => import('@/views/site/TermsView.vue'),
    meta: { ...legalPageMeta.terms },
  },
  {
    path: '/copyright',
    name: 'copyright',
    component: () => import('@/views/site/CopyrightView.vue'),
    meta: { ...legalPageMeta.copyright },
  },
  {
    path: '/subnautica',
    name: 'subnautica',
    component: () => import('@/views/SubnauticaGuideView.vue'),
    meta: {
      title: 'Subnautica — Guides, mods & hub',
      description:
        'Subnautica hub on subnauticamap.org: guides, mod index, multiplayer context, PC requirements, and FAQ. Jump to the interactive Subnautica map from the same site.',
      keywords: 'Subnautica hub, subnauticamap.org Subnautica, fan guides, Nitrox context, Subnautica map link',
    },
  },
  {
    path: '/subnautica-below-zero',
    name: 'subnautica-below-zero',
    component: () => import('@/views/SubnauticaBelowZeroGuideView.vue'),
    meta: {
      title: 'Subnautica: Below Zero — Guides, mods & hub',
      description:
        'Below Zero hub on subnauticamap.org: ice-shelf routing tips, mod compatibility notes, PC requirements, and FAQ. Links to the Below Zero interactive map on the same domain.',
      keywords: 'Below Zero hub, subnauticamap.org Below Zero, polar survival guides, Below Zero map',
    },
  },
  {
    path: '/subnautica-2',
    name: 'subnautica-2',
    component: () => import('@/views/Subnautica2GuideView.vue'),
    meta: {
      title: 'Subnautica 2 — Guides, mods & hub',
      description:
        'Subnautica 2 hub on subnauticamap.org: early access co-op expectations, PC targets, and FAQ. Unofficial fan reference; not affiliated with Unknown Worlds Entertainment.',
      keywords: 'Subnautica 2 hub, subnauticamap.org Subnautica 2, UE5 survival, fan co-op notes',
    },
  },
  {
    path: '/guides/:slug',
    name: 'guide-detail',
    component: () => import('@/views/GuideDetailView.vue'),
    beforeEnter(to) {
      const g = getGuideByAddressBar(to.params.slug)
      if (!g) return { name: 'home' }
      const t = g.seo?.title && String(g.seo.title).trim()
      to.meta.title = t ? `${t} — Guide` : 'Guide'
      if (g.seo?.description) to.meta.description = String(g.seo.description).trim()
      else to.meta.description = SITE_DEFAULT_DESCRIPTION
      if (g.seo?.keywords) to.meta.keywords = String(g.seo.keywords).trim()
      else to.meta.keywords = SITE_DEFAULT_KEYWORDS
    },
    meta: { title: 'Guide', description: SITE_DEFAULT_DESCRIPTION, keywords: SITE_DEFAULT_KEYWORDS },
  },
  {
    path: '/mods/:slug',
    name: 'mod-detail',
    component: () => import('@/views/ModDetailView.vue'),
    beforeEnter(to) {
      const m = getModByAddressBar(to.params.slug)
      if (!m) return { name: 'home' }
      const t = m.seo?.title && String(m.seo.title).trim()
      to.meta.title = t ? `${t} — Mod` : 'Mod'
      if (m.seo?.description) to.meta.description = String(m.seo.description).trim()
      else to.meta.description = SITE_DEFAULT_DESCRIPTION
      if (m.seo?.keywords) to.meta.keywords = String(m.seo.keywords).trim()
      else to.meta.keywords = SITE_DEFAULT_KEYWORDS
    },
    meta: { title: 'Mod', description: SITE_DEFAULT_DESCRIPTION, keywords: SITE_DEFAULT_KEYWORDS },
  },
  {
    path: '/maps/subnautica',
    name: 'map-subnautica',
    component: () => import('@/views/maps/SubnauticaMapView.vue'),
    meta: {
      title: 'Subnautica Map — Full-screen interactive world map',
      layout: 'map',
      description:
        'Full-screen Subnautica interactive map on subnauticamap.org: biomes, pins, and cave sheets in your browser. Unofficial fan atlas; performance depends on your device.',
      keywords: 'Subnautica interactive map, subnauticamap.org map, fan atlas, biome map',
    },
  },
  {
    path: '/maps/subnautica-below-zero',
    name: 'map-below-zero',
    component: () => import('@/views/maps/SubnauticaBelowZeroMapView.vue'),
    meta: {
      title: 'Subnautica: Below Zero Map — Full-screen interactive world map',
      layout: 'map',
      description:
        'Below Zero interactive map on subnauticamap.org: surface routes and underwater biomes in a browser atlas. Unofficial fan project.',
      keywords: 'Below Zero map, subnauticamap.org Below Zero atlas, interactive map',
    },
  },
  {
    path: '/maps/subnautica-2',
    name: 'map-subnautica-2',
    component: () => import('@/views/maps/Subnautica2MapView.vue'),
    meta: {
      title: 'Subnautica 2 Map — Coming later',
      description:
        'Placeholder route for the Subnautica 2 atlas on subnauticamap.org. Status updates will appear here as datasets become available.',
      keywords: 'Subnautica 2 map, subnauticamap.org Subnautica 2 atlas',
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  if (to.name === 'guide-detail') {
    const slug = to.params.slug
    const g = getGuideByAddressBar(slug)
    const path = g ? `/guides/${g.addressBar}` : to.path
    if (!g) {
      applyDocumentSeo({
        path,
        title: buildDocumentTitle('Guide not found'),
        description: 'The requested guide is not available on subnauticamap.org.',
        keywords: seoConfig.defaults.keywords,
      })
      return
    }
    const description = g.seo?.description || g.description || seoConfig.defaults.description
    const keywords = g.seo?.keywords || seoConfig.defaults.keywords
    const segment = to.meta?.title || g.seo?.title || g.title
    const pageTitle = buildDocumentTitle(segment)
    applyDocumentSeo({
      path,
      title: pageTitle,
      description,
      keywords,
      ogImage: g.imageUrl,
      ogType: 'article',
      jsonLd: mergeArticleJsonLdWithHead(
        buildArticleJsonLd({
          headline: pageTitle,
          description,
          url: resolveCanonicalUrl(path),
          datePublished: g.publishDate,
          imageUrl: g.imageUrl,
        }),
        'head' in g && typeof g.head === 'string' ? g.head : undefined,
      ),
    })
    return
  }

  if (to.name === 'mod-detail') {
    const slug = to.params.slug
    const m = getModByAddressBar(slug)
    const path = m ? `/mods/${m.addressBar}` : to.path
    if (!m) {
      applyDocumentSeo({
        path,
        title: buildDocumentTitle('Mod not found'),
        description: 'The requested mod entry is not available on subnauticamap.org.',
        keywords: seoConfig.defaults.keywords,
      })
      return
    }
    const description = m.seo?.description || m.description || seoConfig.defaults.description
    const keywords = m.seo?.keywords || seoConfig.defaults.keywords
    const segment = to.meta?.title || m.seo?.title || m.title
    const pageTitle = buildDocumentTitle(segment)
    applyDocumentSeo({
      path,
      title: pageTitle,
      description,
      keywords,
      ogImage: m.imageUrl,
      ogType: 'article',
      jsonLd: buildArticleJsonLd({
        headline: pageTitle,
        description,
        url: resolveCanonicalUrl(path),
        datePublished: m.publishDate,
        imageUrl: m.imageUrl,
      }),
    })
    return
  }

  const title = buildDocumentTitle(to.meta?.title ?? seoConfig.defaults.title)
  const description = to.meta?.description || seoConfig.defaults.description
  const keywords = to.meta?.keywords || seoConfig.defaults.keywords

  if (to.name === 'home') {
    applyDocumentSeo({
      path: to.path,
      title,
      description,
      keywords,
      ogImage: to.meta?.ogImage,
      jsonLd: buildHomePageJsonLdGraph({
        pageTitle: title,
        description,
        pageUrl: resolveCanonicalUrl(to.path),
      }),
    })
    return
  }

  applyDocumentSeo({
    path: to.path,
    title,
    description,
    keywords,
    ogImage: to.meta?.ogImage,
  })
})

export default router
