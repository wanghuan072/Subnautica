<template>
  <div v-if="mod" :class="['detail', themeClass]">
    <header class="detail__mast">
      <div class="container detail__hero">
        <div class="detail__hero-text">
          <nav class="detail__crumb" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span class="detail__crumb-dot" aria-hidden="true" />
            <a :href="hubPath">{{ hubTitle }}</a>
            <span class="detail__crumb-dot" aria-hidden="true" />
            <span class="detail__crumb-here">{{ mod.title }}</span>
          </nav>
          <p class="detail__eyebrow">Mod</p>
          <h1 class="detail__title">{{ mod.title }}</h1>
          <p class="detail__lede">{{ mod.description }}</p>
        </div>
        <figure class="detail__hero-media">
          <img
            :src="mod.imageUrl"
            :alt="mod.imageAlt"
            width="1200"
            height="630"
            decoding="async"
            fetchpriority="high"
          />
          <figcaption class="detail__hero-caption">{{ mod.imageAlt }}</figcaption>
        </figure>
      </div>
    </header>

    <div class="container detail__body">
      <div class="detail__grid">
        <article class="detail__article">
          <div class="article-prose article-prose--detail" v-html="mod.detailsHtml" />
        </article>

        <aside class="detail__rail" aria-label="Mod sheet">
          <div class="detail__panel">
            <h2 class="detail__panel-h">Sheet</h2>
            <dl class="detail__dl">
              <div>
                <dt>Updated</dt>
                <dd>
                  <time :datetime="mod.publishDate">{{ mod.publishDate }}</time>
                </dd>
              </div>
              <div v-if="mod.tags?.length">
                <dt>Tags</dt>
                <dd>
                  <ul class="detail__tags">
                    <li v-for="t in mod.tags" :key="t">{{ t }}</li>
                  </ul>
                </dd>
              </div>
            </dl>
            <a
              v-if="downloadHref"
              class="detail__download"
              :href="downloadHref"
              rel="noopener noreferrer"
              target="_blank"
            >
              Download
            </a>
            <p v-else class="detail__nodl">Download link not set.</p>
            <a class="detail__back" :href="hubPath">Return to game page</a>
          </div>
        </aside>
      </div>
    </div>
  </div>
  <div v-else class="container detail detail--void">
    <p>Mod not found.</p>
    <a href="/">Home</a>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getModByAddressBar, hubBriefByClassify } from '@/data/gameHubResolve.js'

const route = useRoute()

const mod = computed(() => {
  const slug = typeof route.params.slug === 'string' ? route.params.slug : ''
  return slug ? getModByAddressBar(slug) : null
})

const downloadHref = computed(() => {
  const u = mod.value?.downloadUrl
  if (typeof u !== 'string') return ''
  const t = u.trim()
  if (!t || t === '#') return ''
  try {
    const parsed = new URL(t)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return ''
    return t
  } catch {
    return ''
  }
})

const themeClass = computed(() => {
  const c = mod.value?.classify
  return c === 'game2' || c === 'game3' ? `detail--${c}` : 'detail--game1'
})

const hubPath = computed(() => {
  const c = mod.value?.classify
  if (c && hubBriefByClassify[c]) return hubBriefByClassify[c].hubPath
  return '/subnautica'
})

const hubTitle = computed(() => {
  const c = mod.value?.classify
  if (c && hubBriefByClassify[c]) return hubBriefByClassify[c].hubTitle
  return 'Subnautica'
})
</script>

<style scoped>
.detail {
  --detail-accent: var(--color-aqua);
  --detail-glow: rgba(46, 243, 217, 0.12);
}

.detail--game2 {
  --detail-accent: var(--color-ice);
  --detail-glow: rgba(124, 245, 255, 0.12);
}

.detail--game3 {
  --detail-accent: var(--color-magenta);
  --detail-glow: rgba(255, 94, 200, 0.12);
}

.detail__mast {
  padding-block: 0;
  border-bottom: 1px solid var(--color-line);
  background:
    radial-gradient(ellipse 90% 120% at 88% -10%, var(--detail-glow), transparent 52%),
    linear-gradient(180deg, rgba(6, 18, 32, 0.55) 0%, transparent 100%);
}

.detail__crumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.5rem;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(210, 240, 248, 0.55);
  margin-bottom: 1rem;
}

.detail__crumb a {
  color: rgba(226, 248, 255, 0.78);
  text-decoration: none;
  border-bottom: 1px solid transparent;
}

.detail__crumb a:hover {
  color: var(--detail-accent);
  border-bottom-color: var(--detail-accent);
}

.detail__crumb-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--detail-accent);
  opacity: 0.55;
}

.detail__crumb-here {
  color: var(--color-text);
}

.detail__eyebrow {
  margin: 0 0 0.35rem;
  font-family: var(--font-display);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--detail-accent);
}

.detail__title {
  margin: 0 0 0.35em;
  font-size: clamp(2rem, 4.5vw, 3.1rem);
  line-height: 1.08;
}

.detail__lede {
  margin: 0;
  font-size: 1.08rem;
  color: rgba(226, 248, 255, 0.82);
}

.detail__body {
  padding-block: clamp(1.5rem, 3vw, 2.5rem) 3.5rem;
}

.detail__grid {
  display: grid;
  gap: clamp(1.25rem, 2.5vw, 2rem);
  align-items: start;
}

@media (min-width: 960px) {
  .detail__grid {
    grid-template-columns: minmax(0, 1fr) 17.5rem;
    gap: clamp(2rem, 4vw, 3rem);
  }

  .detail__rail {
    position: sticky;
    top: 5.5rem;
  }
}

.detail__article {
  min-width: 0;
  padding: clamp(1.15rem, 2vw, 1.85rem) clamp(1rem, 2vw, 1.75rem);
  border-radius: 18px;
  border: 1px solid var(--color-line);
  background: rgba(4, 12, 22, 0.78);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.38);
  border-top: 3px solid var(--detail-accent);
}

.detail__panel {
  border-radius: 16px;
  border: 1px solid var(--color-line);
  background: rgba(6, 18, 32, 0.85);
  padding: 1rem 1.05rem 1.15rem;
}

.detail__panel-h {
  margin: 0 0 0.75rem;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(210, 240, 248, 0.5);
}

.detail__dl {
  margin: 0;
}

.detail__dl > div {
  margin-bottom: 0.85rem;
}

.detail__dl dt {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(210, 240, 248, 0.45);
  margin-bottom: 0.2rem;
}

.detail__dl dd {
  margin: 0;
  color: var(--color-text);
}

.detail__tags {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.detail__tags li {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--detail-accent) 45%, var(--color-line));
  color: color-mix(in srgb, var(--detail-accent) 80%, white);
}

.detail__download {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 0.35rem;
  padding: 0.55rem 0.75rem;
  border-radius: 11px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-void);
  background: linear-gradient(135deg, var(--color-coral) 0%, #ff9a7a 100%);
  border: 1px solid rgba(255, 255, 255, 0.22);
}

.detail__download:hover {
  filter: brightness(1.05);
  color: var(--color-void);
}

.detail__nodl {
  margin: 0.35rem 0 0;
  font-size: 0.82rem;
  color: rgba(210, 240, 248, 0.55);
}

.detail__back {
  display: inline-flex;
  margin-top: 0.65rem;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.detail--void {
  padding-block: 3rem;
}
</style>
