import { createRouter, createWebHistory } from 'vue-router'
import { getGuideByAddressBar, getModByAddressBar } from '@/data/gameHubResolve.js'
import {
  HOME_PAGE_DOCUMENT_TITLE,
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_KEYWORDS,
} from '@/constants/siteSeo.js'
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
      completeTitle: true,
      title: HOME_PAGE_DOCUMENT_TITLE,
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
      title: 'Subnautica Map — SN1 guides, mods & interactive map',
      description:
        'Subnautica guides for survival and hazards, mod summaries with install context, Nitrox notes, PC targets, FAQ, and a link to the full-screen interactive map.',
      keywords:
        'Subnautica Map, Subnautica guides, Subnautica survival tips, Subnautica mod list, Nitrox, Subnautica interactive map',
    },
  },
  {
    path: '/subnautica-below-zero',
    name: 'subnautica-below-zero',
    component: () => import('@/views/SubnauticaBelowZeroGuideView.vue'),
    meta: {
      title: 'Subnautica: Below Zero — guides, mods & interactive map',
      description:
        'Below Zero guides for Seatruck routing, cold survival, and mods; PC targets, FAQ, and one-click access to the full-screen Below Zero interactive browser map.',
      keywords:
        'Subnautica Map, Below Zero guide, Subnautica Below Zero map, Below Zero mods, Seatruck tips, Arctic survival, interactive map',
    },
  },
  {
    path: '/subnautica-2',
    name: 'subnautica-2',
    component: () => import('@/views/Subnautica2GuideView.vue'),
    meta: {
      title: 'Subnautica 2 — early access guides, co-op & mod list',
      description:
        'Subnautica 2 early-access guides for co-op and survival, curated mod picks, PC targets, FAQ, and the interactive map roadmap when public data is available.',
      keywords:
        'Subnautica Map, Subnautica 2 guide, Subnautica 2 early access, Subnautica 2 co-op, Subnautica 2 mods, Subnautica 2 map status',
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
      title: 'Subnautica interactive map — full-screen atlas: biomes, resources & caves',
      layout: 'map',
      description:
        'Full-screen Subnautica map: biome polygons, resource and POI pins, opacity sliders, optional cave depth layer—pan and zoom in your browser with MapLibre.',
      keywords:
        'Subnautica Map, Subnautica interactive map, Subnautica biome map, Subnautica resource map, cave map, MapLibre atlas, full screen map',
    },
  },
  {
    path: '/maps/subnautica-below-zero',
    name: 'map-below-zero',
    component: () => import('@/views/maps/SubnauticaBelowZeroMapView.vue'),
    meta: {
      title: 'Subnautica Below Zero interactive map — ice shelf, biomes & POIs',
      layout: 'map',
      description:
        'Full-screen Below Zero map: ice shelf and underwater biome layers, markers, opacity controls—same atlas tools as the Subnautica map, tuned for polar routes.',
      keywords:
        'Subnautica Map, Below Zero interactive map, Subnautica Below Zero map, Below Zero biome map, Below Zero resource locations, full screen map',
    },
  },
  {
    path: '/maps/subnautica-2',
    name: 'map-subnautica-2',
    component: () => import('@/views/maps/Subnautica2MapView.vue'),
    meta: {
      title: 'Subnautica 2 Interactive Map | Early Access Tracker & Status',
      description:
        'Track Subnautica 2 map updates for Early Access. Waiting for stable datasets to build a 100% accurate interactive atlas—zero fabricated coordinates. Bookmark now',
      keywords:
        'Subnautica 2 map, Subnautica 2 interactive atlas, early access tracker, upcoming biomes',
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
        description: 'The requested guide could not be found.',
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
        description: 'The requested mod entry could not be found.',
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

  const rawTitle = to.meta?.title ?? seoConfig.defaults.title
  const title = to.meta?.completeTitle ? String(rawTitle) : buildDocumentTitle(rawTitle)
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
