<template>
  <header class="app-header" :data-menu-open="menuOpen ? 'true' : 'false'" role="banner">
    <div class="app-header__accent" aria-hidden="true" />
    <div class="container app-header__inner">
      <a class="app-header__brand" href="/" aria-label="Subnautica Map home" @click="menuOpen = false">
        <img class="app-header__logo" src="/images/logo.webp" alt="" decoding="async" />
        <span class="app-header__title-wrap">
          <span class="app-header__title">Subnautica</span>
        </span>
      </a>
      <button
        type="button"
        class="app-header__pill"
        aria-label="Toggle navigation"
        :aria-expanded="menuOpen ? 'true' : 'false'"
        aria-controls="primary-nav"
        @click="menuOpen = !menuOpen"
      >
        {{ menuOpen ? '✕' : '☰' }}
      </button>
      <nav
        id="primary-nav"
        class="app-header__nav"
        :data-open="menuOpen ? 'true' : 'false'"
        aria-label="Primary"
      >
        <a
          class="app-header__pill"
          :class="{ 'app-header__pill--active': navKey === 'home' }"
          href="/"
          @click="menuOpen = false"
        >
          Home
        </a>
        <a
          class="app-header__pill"
          :class="{ 'app-header__pill--active': navKey === 'subnautica' }"
          href="/subnautica"
          @click="menuOpen = false"
        >
          Subnautica
        </a>
        <a
          class="app-header__pill"
          :class="{ 'app-header__pill--active': navKey === 'subnautica-2' }"
          href="/subnautica-2"
          @click="menuOpen = false"
        >
          Subnautica 2
        </a>
        <a
          class="app-header__pill"
          :class="{ 'app-header__pill--active': navKey === 'subnautica-below-zero' }"
          href="/subnautica-below-zero"
          @click="menuOpen = false"
        >
          Subnautica Below Zero
        </a>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { resolveHeaderNavKey } from '@/data/gameHubResolve.js'

const route = useRoute()
const navKey = computed(() => resolveHeaderNavKey(route) ?? '')
const menuOpen = ref(false)

function syncHeaderHeightVar() {
  if (typeof document === 'undefined') return
  const el = document.querySelector('.app-header')
  const h = el?.getBoundingClientRect().height
  if (h && Number.isFinite(h)) {
    document.documentElement.style.setProperty('--app-header-sticky-offset', `${Math.ceil(h)}px`)
  }
}

/** @type {ResizeObserver | null} */
let headerRo = null

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
    requestAnimationFrame(syncHeaderHeightVar)
  },
)

onMounted(() => {
  syncHeaderHeightVar()
  const el = document.querySelector('.app-header')
  if (el && typeof ResizeObserver !== 'undefined') {
    headerRo = new ResizeObserver(() => syncHeaderHeightVar())
    headerRo.observe(el)
  }
  window.addEventListener('resize', syncHeaderHeightVar)
})

onUnmounted(() => {
  headerRo?.disconnect()
  headerRo = null
  window.removeEventListener('resize', syncHeaderHeightVar)
})
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 200;
  flex-shrink: 0;
  width: 100%;
  background: linear-gradient(180deg, rgba(10, 28, 48, 0.97) 0%, rgba(5, 12, 22, 0.94) 100%);
  border-bottom: 1px solid var(--color-line);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(12px);
}

.app-header__accent {
  height: 4px;
  background: linear-gradient(
    90deg,
    var(--color-magenta) 0%,
    var(--color-aqua) 35%,
    var(--color-sun) 65%,
    var(--color-coral) 100%
  );
}

.app-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 0.75rem 0.85rem;
}

.app-header__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--color-text);
}

.app-header__brand:hover .app-header__title {
  color: var(--color-aqua);
}

.app-header__logo {
  width: 2.75rem;
  height: 2.75rem;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid rgba(46, 243, 217, 0.45);
  box-shadow: 0 0 20px rgba(46, 243, 217, 0.25);
}

.app-header__title-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.app-header__kicker {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-coral);
}

.app-header__title {
  font-family: var(--font-display);
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 1rem;
  transition: color 0.15s ease;
}

.app-header__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: flex-end;
}

.app-header__pill {
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-decoration: none;
  color: var(--color-muted);
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.04);
  transition:
    color 0.15s ease,
    border-color 0.15s ease,
    background 0.15s ease,
    box-shadow 0.15s ease;
}

.app-header__pill:hover {
  color: var(--color-text);
  border-color: var(--color-line);
  background: rgba(46, 243, 217, 0.08);
}

.app-header__pill--active {
  color: var(--color-void);
  background: linear-gradient(135deg, var(--color-aqua) 0%, var(--color-ice) 100%);
  border-color: rgba(255, 255, 255, 0.35);
  box-shadow: 0 0 24px rgba(46, 243, 217, 0.45);
}

/* 平板 ≤1023：略收紧 */
@media (max-width: 1023px) {
  .app-header__inner {
    gap: 0.65rem;
    padding-block: 0.65rem 0.72rem;
  }

  .app-header__title {
    font-size: 0.92rem;
  }

  .app-header__pill {
    font-size: 0.68rem;
    padding: 0.38rem 0.72rem;
  }
}

/* 平板及以上 ≥768：隐藏汉堡按钮 */
@media (min-width: 768px) {
  .app-header__inner > button.app-header__pill {
    display: none;
  }
}

/* 移动 ≤767：汉堡 + 侧栏抽屉，仅用 .app-header / .app-header__inner / .app-header__nav / .app-header__pill */
@media (max-width: 767px) {
  .app-header[data-menu-open='true']::after {
    content: '';
    position: fixed;
    inset: 0;
    z-index: 40;
    background: rgba(0, 0, 0, 0.55);
    pointer-events: auto;
  }

  .app-header__inner {
    position: relative;
    z-index: 45;
    flex-wrap: nowrap;
  }

  .app-header__inner > button.app-header__pill {
    flex-shrink: 0;
    min-width: 2.75rem;
    padding-inline: 0.65rem;
    font-size: 1rem;
    line-height: 1;
    z-index: 99;
  }

  .app-header__nav {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 50;
    width: min(88vw, 300px);
    height: 100dvh;
    max-height: 100vh;
    margin: 0;
    padding: 4.5rem 1rem 1.5rem;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: stretch;
    justify-content: flex-start;
    gap: 0.5rem;
    background: linear-gradient(195deg, rgba(8, 22, 38, 0.98) 0%, rgba(3, 8, 16, 0.99) 100%);
    border-left: 1px solid var(--color-line);
    box-shadow: -12px 0 48px rgba(0, 0, 0, 0.5);
    transform: translateX(100%);
    transition: transform 0.22s ease;
    overflow-y: auto;
  }

  .app-header__nav[data-open='true'] {
    transform: translateX(0);
  }

  .app-header__nav .app-header__pill {
    width: 100%;
    text-align: center;
    border-radius: 12px;
    padding-block: 0.55rem;
    font-size: 0.72rem;
  }
}
</style>
