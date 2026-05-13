<template>
  <article class="game-hub game-hub--game3" aria-labelledby="hub-hero-title">
    <div class="container game-hub__shell">
      <nav class="game-hub__toc" aria-label="On this page">
        <div class="game-hub__toc-panel">
          <p class="game-hub__toc-kicker">On this page</p>
          <ul class="game-hub__toc-list">
            <li v-for="(item, idx) in toc" :key="item.id">
              <button
                type="button"
                class="game-hub__toc-item"
                :class="{ 'game-hub__toc-item--active': activeTocId === item.id }"
                @click="scrollToSection(item.id)"
              >
                <span class="game-hub__toc-index" aria-hidden="true">{{ tocIndexLabel(idx) }}</span>
                <span class="game-hub__toc-text">{{ item.label }}</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <div class="game-hub__flow">
        <section id="hub-overview" class="gh-hero gh-scroll-target" aria-labelledby="hub-hero-title">
          <div class="gh-panel">
            <div class="gh-panel__head">
              <div class="gh-panel__intro">
                <p class="gh-eyebrow">Unknown Worlds · next expedition</p>
                <h1 id="hub-hero-title" class="gh-hero-title">Subnautica 2</h1>
              </div>
              <p class="gh-hero-meta">Hub · Map · Guides · Mods</p>
            </div>
            <div class="gh-hero-lead gh-rich">
              <p>
                <strong>Subnautica 2</strong> is Unknown Worlds’ next major underwater survival project, built on a new
                generation of tooling (commonly reported as <strong>Unreal Engine 5</strong> class visuals). Public
                marketing highlights <strong>exploration, base building, crafting, and optional small-squad co-op</strong>
                alongside a solo path—exact menus, player counts, and session rules will depend on the build you install,
                so read first-party patch notes after every update.
              </p>
              <p>
                Because the title is expected to evolve through <strong>early access–style milestones</strong>, treat
                roadmap commentary from social channels as speculative unless it appears in official Unknown Worlds posts
                or your storefront’s news feed.
              </p>
              <ul>
                <li>Expect shader compilation hitches and tuning passes on fresh installs—normal for large open-world UE titles.</li>
                <li>Co-op scheduling works best when your crew agrees on spoiler boundaries and save-backup duties before each session.</li>
                <li>
                  Returning from <RouterLink to="/subnautica">Subnautica</RouterLink> or
                  <RouterLink to="/subnautica-below-zero">Below Zero</RouterLink>? Mechanics rhyme with older games but
                  recipes, biomes, and story are new.
                </li>
              </ul>
              <p class="gh-rich-foot">
                Atlas status for the sequel lives on the
                <RouterLink to="/maps/subnautica-2">Subnautica 2 map</RouterLink> route; the
                <RouterLink to="/">home page</RouterLink> explains how this hub treats spoilers. Subnautica 2 mod listings
                will appear in this hub’s Mods section when we add curated entries; until then use your storefront and
                official Unknown Worlds channels for tooling news.
              </p>
            </div>
            <div class="gh-maprow" role="list" aria-label="Map entry">
              <RouterLink
                class="gh-mapslot gh-mapslot--sn2"
                to="/maps/subnautica-2"
                role="listitem"
                aria-label="Open Subnautica 2 map"
              >
                <div class="gh-mapslot__thumb">
                  <img src="/images/hero-02.jpg" alt="" />
                </div>
                <div class="gh-mapslot__body">
                  <h2 class="gh-mapslot__title">Subnautica 2 Interactive map</h2>
                  <p class="gh-mapslot__desc">Biome layers, pins, and cave sheets for this title.</p>
                  <span class="gh-mapslot__action">Open map</span>
                </div>
              </RouterLink>
            </div>
            <div class="gh-hero-actions">
              <button type="button" class="gh-pill gh-pill--ghost" @click="scrollToSection('hub-guides')">
                Guides
              </button>
              <button type="button" class="gh-pill gh-pill--ghost" @click="scrollToSection('hub-mods')">Mods</button>
              <button type="button" class="gh-pill gh-pill--ghost" @click="scrollToSection('hub-faq')">FAQ</button>
            </div>
          </div>
        </section>

        <section id="hub-guides" class="gh-section gh-scroll-target" aria-labelledby="hub-guides-h-sn2">
          <div class="gh-head">
            <p class="gh-eyebrow">Read</p>
            <h2 id="hub-guides-h-sn2" class="gh-section-title">Subnautica 2 Guides</h2>
          </div>
          <ul v-if="hubGuides.length" class="gh-cardstack" role="list">
            <li v-for="g in hubGuides" :key="g.id" role="listitem" class="gh-cardstack__li">
              <RouterLink class="gh-vcard gh-mapslot--sn2" :to="`/guides/${g.addressBar}`">
                <div class="gh-vcard__media">
                  <img :src="g.imageUrl" :alt="g.imageAlt" width="960" height="540" loading="lazy" />
                </div>
                <div class="gh-vcard__body">
                  <p class="gh-vcard__meta">
                    <time :datetime="g.publishDate">{{ g.publishDate }}</time>
                  </p>
                  <h3 class="gh-vcard__title">{{ g.title }}</h3>
                  <p class="gh-vcard__desc">{{ g.description }}</p>
                  <span class="gh-vcard__action">Read guide</span>
                </div>
              </RouterLink>
            </li>
          </ul>
          <p v-else class="gh-empty">No guides for this title yet.</p>
        </section>

        <section id="hub-mods" class="gh-section gh-scroll-target" aria-labelledby="hub-mods-h-sn2">
          <div class="gh-head">
            <p class="gh-eyebrow">Extend</p>
            <h2 id="hub-mods-h-sn2" class="gh-section-title">Subnautica 2 Mods</h2>
          </div>
          <ul v-if="hubMods.length" class="gh-cardstack" role="list">
            <li v-for="m in hubMods" :key="m.id" role="listitem" class="gh-cardstack__li">
              <RouterLink class="gh-vcard gh-mapslot--sn2" :to="`/mods/${m.addressBar}`">
                <div class="gh-vcard__media">
                  <img :src="m.imageUrl" :alt="m.imageAlt" width="960" height="540" loading="lazy" />
                </div>
                <div class="gh-vcard__body">
                  <p class="gh-vcard__meta">
                    <time :datetime="m.publishDate">{{ m.publishDate }}</time>
                  </p>
                  <h3 class="gh-vcard__title">{{ m.title }}</h3>
                  <p class="gh-vcard__desc">{{ m.description }}</p>
                  <span class="gh-vcard__action">Open mod</span>
                </div>
              </RouterLink>
            </li>
          </ul>
          <p v-else class="gh-empty">No mods for this title yet.</p>
        </section>

        <section id="hub-multiplayer" class="gh-section gh-section--band gh-scroll-target" aria-labelledby="hub-mp-sn2">
          <div class="gh-band-bg" aria-hidden="true" />
          <div class="gh-split">
            <div class="gh-split__copy">
              <p class="gh-eyebrow gh-eyebrow--on-dark">Together</p>
              <h2 id="hub-mp-sn2" class="gh-section-title">Co-op and online play</h2>
              <div class="gh-split__rich gh-rich">
                <p>
                  Official messaging for <em>Subnautica 2</em> describes <strong>optional online cooperative play</strong> for
                  small groups in addition to a single-player route. Host migration, progression sync, and session privacy
                  settings are defined by the build you download—re-read the patch log whenever a networking update ships.
                </p>
                <p>
                  Early access periods often roll network features out in phases. Prefer bug reports through Unknown Worlds’
                  approved channels rather than third-party executables pulled from chat links.
                </p>
                <p>
                  While mod support matures, bookmark the
                  <RouterLink to="/guides/sn2-early-access-co-op-players-guide">early access &amp; co-op players guide</RouterLink>
                  on this hub
                  for save hygiene and squad etiquette.
                </p>
              </div>
              <p class="gh-callout">
                Treat unverified leaks as spoilers. When in doubt, stick to Unknown Worlds’ own blog and the store page
                you purchased from.
              </p>
            </div>
            <div id="hub-specs" class="gh-split__frame-wrap gh-scroll-target" aria-labelledby="hub-req-sn2">
              <div class="gh-frame">
                <h2 id="hub-req-sn2" class="gh-frame__title">PC requirements</h2>
                <p class="gh-frame__lead">
                  Press-facing PC targets for UE5-era survival games—always read the live Steam / Epic / Xbox PC page before
                  upgrading; minimums often rise during early access.
                </p>
                <div class="gh-spec-grid">
                  <div>
                    <h3 class="gh-spec-h">Minimum</h3>
                    <ul class="gh-spec-ul">
                      <li>Requires a 64-bit processor and operating system</li>
                      <li>OS: Windows 10 or newer (64-bit)</li>
                      <li>Processor: Intel Core i5-8400 or AMD Ryzen 5 2600 class (or newer equivalent)</li>
                      <li>Memory: 12 GB RAM (8 GB may appear on some older tables—12 GB is safer for large UE5 worlds)</li>
                      <li>Graphics: NVIDIA GeForce GTX 1660 or AMD Radeon RX 5500 XT class GPU</li>
                      <li>VRAM: 6 GB (NVIDIA) / 4 GB (AMD) class cards per common press summaries</li>
                      <li>DirectX: Version 12 (confirm on your SKU)</li>
                      <li>Storage: about 50 GB available space (NVMe SSD strongly recommended)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 class="gh-spec-h">Recommended</h3>
                    <ul class="gh-spec-ul">
                      <li>Processor: Intel Core i7-13700 or AMD Ryzen 7 7700X class CPU</li>
                      <li>Memory: 16 GB RAM</li>
                      <li>
                        Graphics: NVIDIA RTX 2060 / RTX 3060 or AMD Radeon RX 5600 XT / RX 6700 XT class GPUs for higher
                        resolutions
                      </li>
                      <li>Storage: fast NVMe SSD for streaming textures</li>
                    </ul>
                  </div>
                </div>
                <ul class="gh-spec-notes">
                  <li>Console and handheld SKUs publish separate requirement tables—open the listing for your hardware.</li>
                  <li>Shader precompilation can look like a hang on first boot; wait several minutes before force-quitting.</li>
                  <li>
                    When performance tuning, pair these notes with the
                    <RouterLink to="/guides/sn2-early-access-co-op-players-guide">performance checklist</RouterLink> in that
                    players guide.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="hub-faq" class="gh-section gh-section--faq gh-scroll-target" aria-labelledby="hub-faq-sn2">
          <div class="gh-head">
            <p class="gh-eyebrow">Support</p>
            <h2 id="hub-faq-sn2" class="gh-section-title">FAQ</h2>
            <p class="gh-section-intro">Same list rhythm as the home page.</p>
          </div>
          <div class="gh-faq-list">
            <article class="gh-faq-row">
              <h3 class="gh-faq-row__q">Is Subnautica 2 a direct story sequel?</h3>
              <div class="gh-faq-row__a gh-rich">
                <p>
                  It continues the franchise’s underwater survival fantasy on a <strong>new</strong> world. Treat lore
                  connections as spoilers and discover them in-game when possible. Older titles remain on
                  <RouterLink to="/subnautica">Subnautica</RouterLink> and
                  <RouterLink to="/subnautica-below-zero">Below Zero</RouterLink> hubs.
                </p>
              </div>
            </article>
            <article class="gh-faq-row">
              <h3 class="gh-faq-row__q">Will my save survive every patch?</h3>
              <div class="gh-faq-row__a gh-rich">
                <p>
                  Survival games sometimes invalidate saves after major world updates. Keep manual backups and read wipe
                  warnings in official patch notes—tips also appear in
                  <RouterLink to="/guides/sn2-early-access-co-op-players-guide">early access &amp; co-op players guide</RouterLink>.
                </p>
              </div>
            </article>
            <article class="gh-faq-row">
              <h3 class="gh-faq-row__q">Where is the interactive map?</h3>
              <div class="gh-faq-row__a gh-rich">
                <p>
                  Visit <RouterLink to="/maps/subnautica-2">Subnautica 2 map</RouterLink> for the current atlas status. Live
                  datasets for the first two games sit on <RouterLink to="/maps/subnautica">Subnautica</RouterLink> and
                  <RouterLink to="/maps/subnautica-below-zero">Below Zero</RouterLink> routes.
                </p>
              </div>
            </article>
            <article class="gh-faq-row">
              <h3 class="gh-faq-row__q">How do I compare all three hubs quickly?</h3>
              <div class="gh-faq-row__a gh-rich">
                <p>
                  Use the <RouterLink to="/">home page</RouterLink> map row, then open each title’s hub (
                  <RouterLink to="/subnautica">Subnautica</RouterLink>,
                  <RouterLink to="/subnautica-below-zero">Below Zero</RouterLink>,
                  <RouterLink to="/subnautica-2">Subnautica 2</RouterLink>) for tailored guides and mods.
                </p>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { guidesForClassify, modsForClassify } from '@/data/gameHubResolve.js'
import { useGameHubToc } from '@/composables/useGameHubToc.js'

const { toc, activeTocId, tocIndexLabel, scrollToSection } = useGameHubToc()
const hubGuides = computed(() => guidesForClassify('game3'))
const hubMods = computed(() => modsForClassify('game3'))
</script>

<style scoped>
/* 与 HomeView 相同：全站 .container 控制 max-width:1400px；此处仅排版 TOC + 主栏 */
.game-hub {
  --accent: var(--color-aqua);
  padding-block: 0.5rem 3.5rem;
}

.gh-scroll-target {
  scroll-margin-top: calc(var(--app-header-sticky-offset, 76px) + 0.75rem);
}

.game-hub--game2 {
  --accent: var(--color-ice);
}

.game-hub--game3 {
  --accent: var(--color-magenta);
}

.game-hub__shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
  align-items: start;
}

@media (min-width: 1024px) {
  .game-hub__shell {
    grid-template-columns: 14.5rem minmax(0, 1fr);
    gap: 2rem;
  }
}

.game-hub__toc {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.25rem 0 0.5rem;
}

@media (min-width: 1024px) {
  .game-hub__toc {
    position: sticky;
    top: calc(var(--app-header-sticky-offset, 76px) + 0.75rem);
    flex-direction: column;
    flex-wrap: nowrap;
    padding: 0;
    margin: 0;
  }
}

.game-hub__toc-panel {
  width: 100%;
  padding: 0.85rem 0.75rem 0.95rem;
  border-radius: 16px;
  border: 1px solid var(--color-line);
  background: linear-gradient(165deg, rgba(8, 26, 44, 0.92) 0%, rgba(4, 10, 18, 0.96) 100%);
  box-shadow:
    0 18px 48px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  position: relative;
  overflow: hidden;
}

.game-hub__toc-panel::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, var(--accent) 0%, transparent 88%);
  opacity: 0.85;
  pointer-events: none;
}

.game-hub__toc-kicker {
  margin: 0 0 0.65rem 0.35rem;
  font-family: var(--font-display);
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(210, 240, 248, 0.45);
}

.game-hub__toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.35rem;
}

@media (min-width: 1024px) {
  .game-hub__toc-list {
    flex-direction: column;
    flex-wrap: nowrap;
    gap: 0.2rem;
  }
}

.game-hub__toc-item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  margin: 0;
  padding: 0.48rem 0.5rem 0.48rem 0.45rem;
  border: 1px solid transparent;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
  color: rgba(226, 248, 255, 0.88);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.game-hub__toc-item:hover {
  border-color: rgba(124, 245, 255, 0.22);
  background: rgba(46, 243, 217, 0.06);
}

.game-hub__toc-item--active {
  border-color: color-mix(in srgb, var(--accent) 55%, var(--color-line));
  background: color-mix(in srgb, var(--accent) 12%, rgba(4, 12, 22, 0.5));
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 25%, transparent);
}

.game-hub__toc-index {
  flex: 0 0 1.65rem;
  font-family: var(--font-display);
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: rgba(210, 240, 248, 0.4);
}

.game-hub__toc-item--active .game-hub__toc-index {
  color: var(--accent);
}

.game-hub__toc-text {
  font-family: var(--font-display);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

@media (max-width: 1023px) {
  .game-hub__toc-list {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 0.15rem;
    scrollbar-width: thin;
  }

  .game-hub__toc-item {
    width: auto;
    min-width: 9.5rem;
  }
}

.game-hub__flow {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(2.5rem, 5vw, 3.75rem);
}

/* —— Hero：对齐 .home-hero-panel / .home-hero-lead / .home-hero-maprow —— */
.gh-hero {
  padding-top: 0.35rem;
}

.gh-panel {
  position: relative;
  padding: 1.85rem;
  border-radius: 22px;
  background: linear-gradient(155deg, rgba(12, 32, 52, 0.42) 0%, rgba(4, 12, 22, 0.5) 100%);
  border: 1px solid rgba(124, 245, 255, 0.28);
  box-shadow:
    0 28px 80px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
}

.gh-panel__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem 1.5rem;
  margin-bottom: 0.65rem;
}

.gh-panel__intro {
  min-width: min(100%, 18rem);
}

.gh-eyebrow {
  margin: 0 0 0.65rem;
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--color-coral);
}

.gh-eyebrow--on-dark {
  color: var(--color-sun);
}

.gh-hero-title {
  margin: 0 0 0.5rem;
  font-size: clamp(2rem, 4vw, 3.1rem);
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.05;
  color: var(--color-text);
}

.gh-hero-meta {
  margin: 0;
  font-family: var(--font-display);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(210, 244, 252, 0.55);
  text-align: right;
}

.gh-hero-lead {
  margin: 0 0 1.25rem;
  max-width: 52rem;
  font-size: 0.98rem;
  color: rgba(232, 250, 255, 0.92);
  line-height: 1.65;
  text-shadow: 0 1px 12px rgba(0, 8, 16, 0.75);
}

.gh-hero-lead p {
  margin: 0 0 0.75em;
}

.gh-hero-bullets {
  margin: 0.5em 0 0;
  padding-left: 1.15rem;
}

.gh-hero-foot {
  margin: 0.75em 0 0;
  font-size: 0.85rem;
  color: rgba(210, 240, 248, 0.65);
}

.gh-rich p {
  margin: 0 0 0.75em;
}

.gh-rich p:last-child {
  margin-bottom: 0;
}

.gh-rich ul {
  margin: 0.5em 0 0;
  padding-left: 1.15rem;
}

.gh-rich a {
  color: color-mix(in srgb, var(--accent) 82%, white);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.gh-rich a:hover {
  color: var(--color-sun);
}

.gh-rich .gh-rich-foot {
  font-size: 0.85rem;
  color: rgba(210, 240, 248, 0.65);
}

.gh-split__rich {
  margin: 0 0 0.85em;
  color: rgba(232, 252, 255, 0.85);
  line-height: 1.6;
  font-size: 0.98rem;
}

.gh-split__rich p {
  margin: 0 0 0.85em;
}

.gh-split__rich p:last-of-type {
  margin-bottom: 0;
}

.gh-maprow {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: 1fr;
  list-style: none;
  margin: 0;
  padding: 0;
}

@media (min-width: 768px) {
  .gh-maprow {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem;
  }
}

@media (min-width: 1024px) {
  .gh-maprow {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.85rem;
    align-items: stretch;
  }

  .gh-hero .gh-maprow {
    grid-template-columns: 1fr;
    max-width: 32rem;
  }
}

.gh-maprow__li {
  min-width: 0;
}

/* 对齐 .home-mapslot */
.gh-mapslot {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  align-self: stretch;
  min-height: 124px;
  height: 100%;
  text-decoration: none;
  color: inherit;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(5, 14, 26, 0.92);
  border: 1px solid var(--color-line);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.gh-mapslot:hover {
  transform: translateY(-3px);
  border-color: rgba(255, 255, 255, 0.28);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.45), var(--shadow-glow);
}

.gh-mapslot:focus-visible {
  outline: 2px solid var(--color-aqua);
  outline-offset: 3px;
}

.gh-mapslot--sn1 {
  border-color: rgba(46, 243, 217, 0.35);
}

.gh-mapslot--sn1:hover {
  border-color: rgba(46, 243, 217, 0.75);
}

.gh-mapslot--sn2 {
  border-color: rgba(255, 94, 200, 0.4);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35), 0 0 28px rgba(255, 94, 200, 0.1);
}

.gh-mapslot--sn2:hover {
  border-color: rgba(255, 94, 200, 0.85);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.45), 0 0 40px rgba(255, 94, 200, 0.2);
}

.gh-mapslot--bz {
  border-color: rgba(124, 245, 255, 0.35);
}

.gh-mapslot--bz:hover {
  border-color: rgba(124, 245, 255, 0.85);
}

.gh-mapslot__thumb {
  position: relative;
  flex: 0 0 44%;
  min-width: 132px;
  max-width: 220px;
  min-height: 100%;
  align-self: stretch;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.35);
}

.gh-mapslot__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.gh-mapslot__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.2rem;
  padding: 0.75rem 0.9rem 0.85rem 0.85rem;
  min-width: 0;
}

.gh-mapslot__meta {
  margin: 0 0 0.15rem;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(210, 240, 248, 0.45);
}

.gh-mapslot__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-aqua);
}

.gh-mapslot--sn2 .gh-mapslot__title {
  color: var(--color-magenta);
}

.gh-mapslot--bz .gh-mapslot__title {
  color: var(--color-ice);
}

.gh-mapslot:hover .gh-mapslot__title {
  color: var(--color-sun);
}

.gh-mapslot__desc {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-muted);
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.gh-mapslot__action {
  margin-top: 0.35rem;
  font-family: var(--font-display);
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-coral);
}

.gh-mapslot:hover .gh-mapslot__action {
  color: var(--color-aqua);
}

.gh-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.gh-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  font-family: var(--font-display);
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid rgba(124, 245, 255, 0.35);
  color: rgba(232, 250, 255, 0.88);
  background: transparent;
  cursor: pointer;
}

.gh-pill--ghost:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* —— 分节：对齐 .home-about-section —— */
.gh-section {
  padding-block: 0;
}

.gh-head {
  margin-bottom: 1.75rem;
}

.gh-section-title {
  margin: 0 0 0.75rem;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  color: var(--color-text);
}

.gh-section-intro {
  margin: 0;
  max-width: 52rem;
  font-size: 0.95rem;
  color: var(--color-muted);
  line-height: 1.55;
}

.gh-empty {
  margin: 0;
  padding: 1rem 1.1rem;
  border-radius: 14px;
  border: 1px dashed var(--color-line);
  color: rgba(210, 240, 248, 0.65);
  font-size: 0.92rem;
}

/* Guides / Mods：上图下文 */
.gh-cardstack {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
  max-width: 100%;
}

@media (min-width: 640px) {
  .gh-cardstack {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.gh-cardstack__li {
  min-width: 0;
}

.gh-vcard {
  display: flex;
  flex-direction: column;
  height: 100%;
  text-decoration: none;
  color: inherit;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(5, 14, 26, 0.92);
  border: 1px solid var(--color-line);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.gh-vcard:hover {
  transform: translateY(-3px);
  border-color: rgba(255, 255, 255, 0.28);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.45), var(--shadow-glow);
}

.gh-vcard:focus-visible {
  outline: 2px solid var(--color-aqua);
  outline-offset: 3px;
}

.gh-vcard.gh-mapslot--sn1 {
  border-color: rgba(46, 243, 217, 0.35);
}

.gh-vcard.gh-mapslot--sn1:hover {
  border-color: rgba(46, 243, 217, 0.75);
}

.gh-vcard.gh-mapslot--sn2 {
  border-color: rgba(255, 94, 200, 0.4);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35), 0 0 28px rgba(255, 94, 200, 0.1);
}

.gh-vcard.gh-mapslot--sn2:hover {
  border-color: rgba(255, 94, 200, 0.85);
}

.gh-vcard.gh-mapslot--bz {
  border-color: rgba(124, 245, 255, 0.35);
}

.gh-vcard.gh-mapslot--bz:hover {
  border-color: rgba(124, 245, 255, 0.85);
}

.gh-vcard__media {
  margin: 0;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.35);
}

.gh-vcard__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.gh-vcard__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.85rem 0.95rem 1rem;
}

.gh-vcard__meta {
  margin: 0;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(210, 240, 248, 0.45);
}

.gh-vcard__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-aqua);
}

.gh-vcard.gh-mapslot--sn2 .gh-vcard__title {
  color: var(--color-magenta);
}

.gh-vcard.gh-mapslot--bz .gh-vcard__title {
  color: var(--color-ice);
}

.gh-vcard:hover .gh-vcard__title {
  color: var(--color-sun);
}

.gh-vcard__desc {
  margin: 0;
  font-size: 0.82rem;
  color: var(--color-muted);
  line-height: 1.45;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.gh-vcard__action {
  margin-top: 0.35rem;
  font-family: var(--font-display);
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-coral);
}

.gh-vcard:hover .gh-vcard__action {
  color: var(--color-aqua);
}

/* —— Multiplayer + Specs：对齐 .home-trailer-section / split / frame —— */
.gh-section--band {
  position: relative;
  padding-block: 3.5rem;
  margin-top: 0.35rem;
}

.gh-band-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(40, 8, 52, 0.55) 0%,
    rgba(6, 40, 52, 0.75) 38%,
    rgba(8, 22, 48, 0.9) 100%
  );
  border-block: 1px solid var(--color-line);
  pointer-events: none;
}

.gh-split {
  position: relative;
  display: grid;
  gap: 1.75rem;
  align-items: stretch;
}

@media (min-width: 1024px) {
  .gh-split {
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
    gap: 2rem;
  }
}

.gh-split__copy .gh-section-title {
  margin-top: 0;
}

.gh-split__p {
  margin: 0 0 0.85em;
  color: rgba(232, 252, 255, 0.85);
  line-height: 1.6;
  font-size: 0.98rem;
}

.gh-split__p:last-of-type {
  margin-bottom: 0;
}

.gh-callout {
  margin: 1rem 0 0;
  padding: 0.85rem 1rem;
  border-radius: 14px;
  border: 1px solid rgba(255, 122, 92, 0.45);
  background: rgba(255, 122, 92, 0.08);
  font-size: 0.9rem;
  color: rgba(255, 232, 220, 0.92);
  max-width: 52rem;
}

.gh-split__frame-wrap {
  display: flex;
  align-items: stretch;
  min-height: 0;
}

.gh-frame {
  flex: 1;
  width: 100%;
  padding: 1.1rem 1.15rem 1.2rem;
  border-radius: var(--radius-lg);
  background: #050810;
  border: 3px solid rgba(46, 243, 217, 0.55);
  box-shadow:
    0 0 0 1px rgba(255, 94, 200, 0.35),
    0 24px 60px rgba(0, 0, 0, 0.55),
    inset 0 0 60px rgba(124, 245, 255, 0.06);
}

.game-hub--game2 .gh-frame {
  border-color: rgba(124, 245, 255, 0.55);
}

.game-hub--game3 .gh-frame {
  border-color: rgba(255, 94, 200, 0.55);
}

.gh-frame__title {
  margin: 0 0 0.5rem;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-text);
}

.gh-frame__lead {
  margin: 0 0 1rem;
  font-size: 0.82rem;
  color: rgba(210, 240, 248, 0.62);
  line-height: 1.5;
}

.gh-spec-grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 520px) {
  .gh-spec-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.gh-spec-h {
  margin: 0 0 0.35em;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent);
}

.gh-spec-ul {
  margin: 0;
  padding-left: 1rem;
  font-size: 0.8rem;
  color: rgba(210, 240, 248, 0.78);
}

.gh-spec-notes {
  margin: 1rem 0 0;
  padding-left: 1rem;
  font-size: 0.78rem;
  color: rgba(210, 240, 248, 0.55);
}

/* —— FAQ：对齐 .home-faq-section —— */
.gh-section--faq {
  padding-block: 3.25rem;
}

.gh-faq-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.gh-faq-row {
  margin: 0;
  padding: 1.35rem 0;
  border-bottom: 1px solid var(--color-line);
}

.gh-faq-row:first-child {
  padding-top: 0.35rem;
}

.gh-faq-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.gh-faq-row__q {
  margin: 0 0 0.5rem;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-coral);
  letter-spacing: 0.02em;
}

.gh-faq-row__a {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-muted);
  line-height: 1.6;
  max-width: 58rem;
}

@media (max-width: 1023px) {
  .gh-section-title {
    font-size: 1.65rem;
  }

  .gh-section--band {
    padding-block: 2.75rem;
  }

  .gh-split {
    gap: 1.25rem;
  }

  .gh-split__p {
    font-size: 0.92rem;
  }

  .gh-section--faq {
    padding-block: 2.75rem;
  }

  .gh-faq-row {
    padding: 1.15rem 0;
  }

  .gh-faq-row__q {
    font-size: 0.98rem;
  }

  .gh-faq-row__a {
    font-size: 0.9rem;
  }

  .gh-panel {
    padding: 1.45rem;
    border-radius: 18px;
  }

  .gh-hero-title {
    font-size: 2.4rem;
  }

  .gh-mapslot {
    min-height: 112px;
  }

  .gh-mapslot__body {
    padding: 0.65rem 0.75rem;
  }

  .gh-mapslot__title {
    font-size: 0.88rem;
  }

  .gh-mapslot__desc {
    font-size: 0.76rem;
  }
}

@media (max-width: 767px) {
  .game-hub {
    padding-block: 0.25rem 2.5rem;
  }

  .gh-hero-title {
    font-size: 1.85rem;
  }

  .gh-hero-meta {
    text-align: left;
    width: 100%;
  }
}

</style>
