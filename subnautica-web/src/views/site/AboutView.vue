<template>
  <article class="site-doc">
    <header class="site-doc__mast">
      <div class="container">
        <p class="site-doc__eyeb">subnauticamap.org</p>
        <h1>About this website</h1>
        <p class="site-doc__lede">
          This page explains what you will find on subnauticamap.org, how the project is maintained, and how we relate
          to the official Subnautica franchise. The goal is plain language, predictable navigation, and content that
          remains useful after game patches.
        </p>
      </div>
    </header>
    <div class="container site-doc__prose article-prose">
      <h2>What subnauticamap.org is</h2>
      <p>
        subnauticamap.org is an independent, fan-operated reference site focused on underwater survival titles from
        Unknown Worlds Entertainment. Visitors can open full-screen style interactive maps, browse curated guides that
        favour neutral wording over spoilers, and scan mod listings that point to first-party or trusted community
        sources when downloads are involved. The site is designed for readers who want a calmer alternative to ad-heavy
        wikis and forum threads that jump between unrelated domains.
      </p>
      <p>
        The editorial scope is intentionally narrow: we document routes, biomes, tools, and quality-of-life topics that
        help players plan dives and base layouts. We do not operate a storefront, sell keys, or host executable files on
        behalf of third parties. When a page references a patch number or release window, treat it as historical context
        and always cross-check the live product page for the title you own.
      </p>

      <h2>Editorial standards and tone</h2>
      <p>
        Guides are written so that a returning player can skim headings first, then read deeper only when needed.
        Wherever possible we describe mechanics using in-game vocabulary and avoid reproducing long quest scripts or
        endgame twists. Maps prioritise clarity of layers and legend legibility on desktop and large tablets; small
        screens still work, but dense cartography is easier to read with a little extra space.
      </p>
      <p>
        When two community strategies disagree, we prefer to outline trade-offs instead of declaring a single “correct”
        playstyle. If a technique depends on a specific patch, we call that out so saves from older branches are not
        accidentally mixed with incompatible advice.
      </p>

      <h2>Relationship to Unknown Worlds Entertainment</h2>
      <p>
        Subnautica, Subnautica: Below Zero, and Subnautica 2 are trademarks of Unknown Worlds Entertainment, Inc.
        subnauticamap.org is not affiliated with, sponsored by, or endorsed by Unknown Worlds Entertainment. We do not
        speak for the studio, and nothing on this site should be read as an official statement about roadmaps,
        multiplayer rules, or platform availability.
      </p>
      <p>
        For authoritative announcements, patch notes, and purchase options, rely on Unknown Worlds channels and the
        storefront tied to your library entry. Our pages may summarise widely reported facts for context, but the live
        store page always wins when numbers or dates differ.
      </p>

      <h2>Maps, performance, and data freshness</h2>
      <p>
        Interactive map experiences can be heavy because they stream tiles, markers, and optional overlays. We
        recommend a modern desktop browser with hardware acceleration enabled. First load may compile shaders or cache
        assets; that pause is normal for large WebGL-style experiences. If a dataset is still being migrated for a new
        title, the map route will say so explicitly rather than silently failing.
      </p>
      <p>
        Coordinates, biome names, and cave passages can change when a game updates world geometry. When we become aware
        of a breaking change, we queue revisions to legends and guide cross-links. Reporting a mismatch helps everyone;
        see the <RouterLink to="/contact">Contact</RouterLink> page for the best address to reach the maintainer.
      </p>

      <h2>Accessibility and international readers</h2>
      <p>
        We aim for legible contrast, focus-visible outlines on interactive controls, and landmark roles on major layout
        regions. Primary copy is published in English because that matches the majority of in-game terminology and
        storefront metadata. If you rely on translation tools, structured headings should still produce a coherent
        outline.
      </p>

      <h2>How this site is funded and sustained</h2>
      <p>
        The project is maintained as a long-term hobby site. There are no paywalled guides on subnauticamap.org and no
        third-party login is required to read public pages. If lightweight analytics are enabled in the future, they
        will be described transparently in the <RouterLink to="/privacy">Privacy</RouterLink> policy and limited to what
        is proportionate for capacity planning.
      </p>

      <h2>Related policies</h2>
      <p>
        For rules of use, liability limits, and acceptable behaviour, read the <RouterLink to="/terms">Terms of use</RouterLink>.
        For trademark and copyright notices specific to this domain, see <RouterLink to="/copyright">Copyright</RouterLink>.
        For questions about correspondence, use <RouterLink to="/contact">Contact</RouterLink>.
      </p>
    </div>
  </article>
</template>

<script setup>
// Route meta (title, description, keywords) is set in src/router/index.js for SEO.
</script>
