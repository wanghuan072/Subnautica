import { onMounted, onUnmounted, ref } from 'vue'

const toc = [
  { id: 'hub-overview', label: 'Overview' },
  { id: 'hub-guides', label: 'Guides' },
  { id: 'hub-mods', label: 'Mods' },
  { id: 'hub-multiplayer', label: 'Multiplayer' },
  { id: 'hub-faq', label: 'FAQ' },
]

/** 左侧 TOC + 页内锚点滚动（各作品导览页共用，不含文案数据） */
export function useGameHubToc() {
  const activeTocId = ref('hub-overview')

  function tocIndexLabel(idx) {
    return String(idx + 1).padStart(2, '0')
  }

  function getHeaderOffsetPx() {
    if (typeof document === 'undefined') return 76
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--app-header-sticky-offset').trim()
    const n = parseFloat(raw)
    return Number.isFinite(n) && n > 0 ? n : 76
  }

  let smoothTocLockId = /** @type {string | null} */ (null)
  let smoothTocLockTimer = 0

  function updateActiveTocFromScroll() {
    if (smoothTocLockId) {
      if (activeTocId.value !== smoothTocLockId) activeTocId.value = smoothTocLockId
      return
    }
    const y = getHeaderOffsetPx() + 20
    let current = toc[0].id
    for (const item of toc) {
      const el = document.getElementById(item.id)
      if (!el) continue
      if (el.getBoundingClientRect().top <= y) current = item.id
    }
    if (activeTocId.value !== current) activeTocId.value = current
  }

  function clearSmoothTocLock() {
    smoothTocLockId = null
    if (smoothTocLockTimer) {
      window.clearTimeout(smoothTocLockTimer)
      smoothTocLockTimer = 0
    }
    updateActiveTocFromScroll()
  }

  function scrollToSection(id, smooth = true) {
    const el = document.getElementById(id)
    if (!el || typeof window === 'undefined') return
    const pad = 12
    const top = el.getBoundingClientRect().top + window.scrollY - getHeaderOffsetPx() - pad
    activeTocId.value = id

    if (smoothTocLockTimer) {
      window.clearTimeout(smoothTocLockTimer)
      smoothTocLockTimer = 0
    }

    if (smooth) {
      smoothTocLockId = id
      smoothTocLockTimer = window.setTimeout(clearSmoothTocLock, 900)
    } else {
      smoothTocLockId = null
    }

    window.scrollTo({ top: Math.max(0, top), behavior: smooth ? 'smooth' : 'auto' })

    if (!smooth) {
      requestAnimationFrame(() => updateActiveTocFromScroll())
    }
  }

  let tocScrollRaf = 0
  function scheduleTocFromScroll() {
    if (typeof window === 'undefined') return
    if (smoothTocLockId) return
    if (tocScrollRaf) return
    tocScrollRaf = requestAnimationFrame(() => {
      tocScrollRaf = 0
      updateActiveTocFromScroll()
    })
  }

  function onWindowScrollEnd() {
    if (!smoothTocLockId) return
    clearSmoothTocLock()
  }

  onMounted(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '').trim() : ''
    if (hash && typeof window !== 'undefined') {
      const el = document.getElementById(hash)
      if (el) {
        requestAnimationFrame(() => {
          scrollToSection(hash, false)
        })
      }
      const clean = window.location.pathname + window.location.search
      history.replaceState(null, '', clean)
    }

    requestAnimationFrame(() => {
      updateActiveTocFromScroll()
    })
    window.addEventListener('scroll', scheduleTocFromScroll, { passive: true })
    window.addEventListener('resize', scheduleTocFromScroll)
    window.addEventListener('scrollend', onWindowScrollEnd)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', scheduleTocFromScroll)
    window.removeEventListener('resize', scheduleTocFromScroll)
    window.removeEventListener('scrollend', onWindowScrollEnd)
    if (smoothTocLockTimer) window.clearTimeout(smoothTocLockTimer)
  })

  return { toc, activeTocId, tocIndexLabel, scrollToSection }
}
