<template>
  <article class="site-doc">
    <header class="site-doc__mast">
      <div class="container">
        <p class="site-doc__eyeb">subnauticamap.org</p>
        <h1>Contact</h1>
        <p class="site-doc__lede">
          Use this page to reach the maintainer of subnauticamap.org for corrections, accessibility issues, or licensing
          questions related to content hosted on this domain. There is no ticket system and no chat widget; email is the
          single supported channel.
        </p>
      </div>
    </header>
    <div class="container site-doc__prose article-prose">
      <h2>Email</h2>
      <p>
        For all inquiries about this website, including takedown requests that reference specific URLs on
        subnauticamap.org, write to:
      </p>
      <p>
        <a class="site-doc__mailto" :href="mailtoHref">{{ contactEmail }}</a>
      </p>
      <p>
        Please include the exact page address, a short description of the issue, and—if you are reporting a factual
        error—the game build or patch you used when verifying. We cannot debug personal save files or mod load orders by
        email, but we can fix broken internal links, typos, and unclear map legends when enough detail is provided.
      </p>

      <h2>What we do not offer</h2>
      <p>
        There is no contact form on this site by design. We do not collect message bodies through embedded third-party
        widgets, and we do not route support through social login providers. If you prefer not to use email, you will
        need to wait until an alternative channel is announced on the home page; until then, email remains the only
        monitored path.
      </p>
      <p>
        This mailbox is not a substitute for Unknown Worlds Entertainment customer support. Purchase refunds, account
        bans, multiplayer enforcement, and anti-cheat questions must go through the studio or the store that sold you the
        game.
      </p>

      <h2>Response expectations</h2>
      <p>
        subnauticamap.org is maintained on a best-effort basis. Some weeks will see rapid map updates after a patch; other
        periods may be quieter. If you do not receive an acknowledgement within a reasonable window, your message may
        have been filtered—try resending with a concise subject line that mentions “subnauticamap.org” and the page slug.
      </p>

      <h2>Security and abuse reports</h2>
      <p>
        If you believe a page on this domain is being misused to distribute malware or phishing content, email
        immediately with the string “security” in the subject line. Include screenshots or network headers if you can do
        so safely. We take integrity of the origin seriously because map assets are inherently large and users must trust
        what they load in the browser.
      </p>

      <h2>Postal and company information</h2>
      <p>
        No walk-in office is associated with subnauticamap.org. The site is operated as a personal fan project; if you
        require formal correspondence for legal service, state the jurisdiction and the statutory basis so the recipient
        can route your letter appropriately. Email remains the fastest first step.
      </p>

      <h2>Related pages</h2>
      <p>
        Read the <RouterLink to="/privacy">Privacy</RouterLink> policy for data practices,
        <RouterLink to="/terms">Terms of use</RouterLink> for acceptable use, and
        <RouterLink to="/copyright">Copyright</RouterLink> for trademark attribution.
      </p>
    </div>
  </article>
</template>

<script setup>
const contactEmail = 'subnauticamap.org@wyong.com'
const mailtoHref = `mailto:${contactEmail}?subject=${encodeURIComponent('subnauticamap.org — inquiry')}`
</script>

<style scoped>
.site-doc__mailto {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--color-aqua);
  text-decoration: none;
  border-bottom: 1px solid color-mix(in srgb, var(--color-aqua) 55%, transparent);
  word-break: break-all;
}

.site-doc__mailto:hover {
  color: var(--color-sun);
  border-bottom-color: var(--color-sun);
}
</style>
