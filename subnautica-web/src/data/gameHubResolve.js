import guides from '@/data/guides/guides.js'
import mods from '@/data/mods/mods.js'

/** 面包屑等仅需路径与标题，勿再依赖整页 hub 文案对象 */
export const hubBriefByClassify = {
  game1: { hubPath: '/subnautica', hubTitle: 'Subnautica' },
  game2: { hubPath: '/subnautica-below-zero', hubTitle: 'Subnautica: Below Zero' },
  game3: { hubPath: '/subnautica-2', hubTitle: 'Subnautica 2' },
}

/** @param {string} slug */
export function getGuideByAddressBar(slug) {
  if (!slug || typeof slug !== 'string') return null
  return guides.find((g) => g.addressBar === slug) ?? null
}

/** @param {string} slug */
export function getModByAddressBar(slug) {
  if (!slug || typeof slug !== 'string') return null
  return mods.find((m) => m.addressBar === slug) ?? null
}

/** @param {'game1'|'game2'|'game3'} classify */
export function guidesForClassify(classify) {
  return guides.filter((g) => g.classify === classify)
}

/** @param {'game1'|'game2'|'game3'} classify */
export function modsForClassify(classify) {
  return mods.filter((m) => m.classify === classify)
}

/**
 * Which top-nav pill should look active on guide/mod detail routes.
 * @param {{ name?: string, params?: Record<string, string> }} route
 * @returns {'home'|'subnautica'|'subnautica-below-zero'|'subnautica-2'|null}
 */
export function resolveHeaderNavKey(route) {
  const name = route.name
  const slug = route.params?.slug
  if (name === 'home') return 'home'
  if (name === 'subnautica') return 'subnautica'
  if (name === 'subnautica-below-zero') return 'subnautica-below-zero'
  if (name === 'subnautica-2') return 'subnautica-2'
  if (name === 'guide-detail' && slug) {
    const g = getGuideByAddressBar(slug)
    if (g?.classify === 'game1') return 'subnautica'
    if (g?.classify === 'game2') return 'subnautica-below-zero'
    if (g?.classify === 'game3') return 'subnautica-2'
  }
  if (name === 'mod-detail' && slug) {
    const m = getModByAddressBar(slug)
    if (m?.classify === 'game1') return 'subnautica'
    if (m?.classify === 'game2') return 'subnautica-below-zero'
    if (m?.classify === 'game3') return 'subnautica-2'
  }
  return null
}
