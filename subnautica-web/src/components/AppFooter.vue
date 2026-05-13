<template>
  <footer class="app-footer" role="contentinfo">
    <div class="app-footer__glow" aria-hidden="true" />
    <div class="container app-footer__inner">
      <div class="app-footer__top">
        <div class="app-footer__brand-block">
          <RouterLink class="app-footer__brand" to="/">Subnautica Map</RouterLink>
          <p class="app-footer__domain">
            <span class="app-footer__domain-label">Site</span>
            <span class="app-footer__domain-value" translate="no">subnauticamap.org</span>
          </p>
          <p class="app-footer__intro">
            subnauticamap.org brings together full-screen interactive maps for underwater survival games,
            game-specific guides, and a mod index—so you can check routes, loadouts, and version notes in one place.
            This site is fan-maintained; content and layout keep evolving.
          </p>
        </div>

        <nav class="app-footer__nav" aria-label="Site policies">
          <p class="app-footer__nav-k">Explore</p>
          <ul class="app-footer__links">
            <li><RouterLink to="/about">About</RouterLink></li>
            <li><RouterLink to="/contact">Contact</RouterLink></li>
            <li><RouterLink to="/privacy">Privacy</RouterLink></li>
            <li><RouterLink to="/terms">Terms</RouterLink></li>
            <li><RouterLink to="/copyright">Copyright</RouterLink></li>
          </ul>
        </nav>

        <nav class="app-footer__nav" aria-label="Games">
          <p class="app-footer__nav-k">Games</p>
          <ul class="app-footer__links">
            <li><RouterLink to="/subnautica">Subnautica</RouterLink></li>
            <li><RouterLink to="/subnautica-below-zero">Below Zero</RouterLink></li>
            <li><RouterLink to="/subnautica-2">Subnautica 2</RouterLink></li>
            <li><RouterLink to="/maps/subnautica">Map · SN1</RouterLink></li>
            <li><RouterLink to="/maps/subnautica-below-zero">Map · BZ</RouterLink></li>
          </ul>
        </nav>
      </div>

      <div class="app-footer__bottom">
        <p class="app-footer__copy">© {{ year }} subnauticamap.org</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const year = computed(() => new Date().getFullYear())
</script>

<style scoped>
.app-footer {
  position: relative;
  flex-shrink: 0;
  margin-top: auto;
  padding-block: clamp(1.75rem, 3.5vw, 2.75rem);
  background: linear-gradient(0deg, rgba(2, 4, 10, 0.99) 0%, rgba(8, 18, 32, 0.96) 100%);
  border-top: 1px solid var(--color-line);
}

.app-footer__glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--color-aqua), var(--color-magenta), transparent);
  opacity: 0.85;
}

.app-footer__inner {
  position: relative;
  z-index: 1;
}

.app-footer__top {
  display: grid;
  gap: clamp(1.5rem, 3vw, 2.25rem);
  align-items: start;
}

@media (min-width: 720px) {
  .app-footer__top {
    grid-template-columns: minmax(0, 1.35fr) minmax(0, 0.85fr) minmax(0, 0.85fr);
    gap: 2rem 2.5rem;
  }
}

.app-footer__brand {
  display: inline-flex;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-text);
  border-bottom: 2px solid transparent;
}

.app-footer__brand:hover {
  color: var(--color-aqua);
  border-bottom-color: color-mix(in srgb, var(--color-aqua) 55%, transparent);
}

.app-footer__domain {
  margin: 0.65rem 0 0.45rem;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.35rem 0.65rem;
}

.app-footer__domain-label {
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(210, 240, 248, 0.45);
}

.app-footer__domain-value {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  color: var(--color-ice);
}

.app-footer__intro {
  margin: 0;
  max-width: 26rem;
  font-size: 0.8rem;
  line-height: 1.6;
  color: rgba(210, 240, 248, 0.7);
}

.app-footer__nav-k {
  margin: 0 0 0.55rem;
  font-family: var(--font-display);
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(210, 240, 248, 0.45);
}

.app-footer__links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.app-footer__links a {
  font-size: 0.84rem;
  font-weight: 600;
  color: rgba(232, 250, 255, 0.88);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  width: fit-content;
}

.app-footer__links a:hover {
  color: var(--color-aqua);
  border-bottom-color: color-mix(in srgb, var(--color-aqua) 45%, transparent);
}

.app-footer__bottom {
  margin-top: clamp(1.25rem, 2.5vw, 1.75rem);
  padding-top: 1rem;
  border-top: 1px solid var(--color-line);
}

.app-footer__copy {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  color: rgba(210, 240, 248, 0.48);
}
</style>
