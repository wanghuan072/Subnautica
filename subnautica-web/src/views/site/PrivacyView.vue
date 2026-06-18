<template>
  <article class="site-doc">
    <header class="site-doc__mast">
      <div class="container">
        <p class="site-doc__eyeb">subnauticamap.org</p>
        <h1>Privacy policy</h1>
        <p class="site-doc__lede">
          This policy describes how subnauticamap.org handles information when you browse, read guides, or open embedded
          map experiences. It is written for a general audience and follows common expectations for small fan sites: we
          minimise collection, avoid surprise sharing, and document what the technology stack can observe by default.
        </p>
      </div>
    </header>
    <div class="container site-doc__prose article-prose">
      <h2>Who operates this site</h2>
      <p>
        The public pages at subnauticamap.org are operated independently of Unknown Worlds Entertainment. The person or
        small team maintaining the origin is the data controller for any processing described here that does not involve
        a separate processor such as a hosting provider acting solely on instructions.
      </p>

      <h2>Information you provide voluntarily</h2>
      <p>
        Most pages on subnauticamap.org are static or client-rendered reference material. There is no account system on
        this domain at launch, which means we do not ask you to register a username or password. The
        <a href="/contact">Contact</a> page lists an email address; if you write to that address, your
        message and headers will be stored in the recipient’s mailbox according to their provider’s retention rules.
      </p>
      <p>
        Because there is no HTML form on subnauticamap.org for general feedback, we do not intentionally harvest
        structured personal profiles from visitors. If a future feature introduces optional accounts or comments, this
        policy will be revised before the feature ships, with a summary posted on the home page.
      </p>

      <h2>Technical logs and hosting</h2>
      <p>
        Like nearly every website, the server that answers requests for subnauticamap.org may create short-lived access
        logs. Those logs can include your IP address, user agent string, requested path, timestamp, and HTTP status.
        They are used for security monitoring, capacity planning, and debugging misconfigured routes—not for marketing
        lists.
      </p>
      <p>
        Logs are retained only as long as needed for those purposes or as required by law in the jurisdiction where the
        server resides. Aggregated statistics such as “how many bytes were served for map tiles this week” do not attempt
        to identify individual households when raw logs are summarised.
      </p>

      <h2>Cookies, local storage, and map sessions</h2>
      <p>
        Interactive maps may cache preferences—such as selected layers or last viewport—in your browser using local
        storage or similar APIs. That data stays on your device unless you clear site data. We do not require cookies for
        reading text guides, but your browser may still store small first-party technical cookies if the deployment stack
        enables them for HTTPS or caching correctness.
      </p>
      <p>
        If we later enable privacy-preserving analytics with a short retention window, the implementation will be
        first-party only on subnauticamap.org and documented here with opt-out instructions when technically feasible.
      </p>

      <h2>Embedded media and third-party assets</h2>
      <p>
        Some pages may embed video players or reference fonts that are loaded from the same origin when possible. If an
        embed must load additional network resources, your browser will contact those hosts directly under their policies,
        not ours. We avoid loading trackers that follow you across unrelated sites.
      </p>

      <h2>Children’s privacy</h2>
      <p>
        Subnautica titles are rated for teen or mature audiences in many regions. subnauticamap.org does not knowingly
        solicit personal information from children under the age where parental consent is required in your country. If
        you believe a page inadvertently encourages minors to share personal data, contact us so we can correct the wording.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, privacy laws may grant you rights to access, correct, export, or delete personal
        data tied to a controller. Because we operate a lightweight fan site, we may need reasonable proof that a request
        relates to your own data before taking action. Email the address on the <a href="/contact">Contact</a>
        page with the subject “privacy request” and describe the right you wish to exercise.
      </p>

      <h2>International transfers</h2>
      <p>
        Visitors arrive from many countries. Servers and backups may be located in jurisdictions with different privacy
        statutes than your own. By continuing to use subnauticamap.org, you acknowledge that necessary technical
        transfers can occur so the site remains available and secure.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        When material changes are made, we will update the “Last updated” indicator below and, when practical, add a short
        note on the home page so returning readers notice. Continued use after the effective date constitutes acceptance
        of the revised policy.
      </p>
      <p><strong>Last updated:</strong> May 12, 2026</p>

      <h2>Related documents</h2>
      <p>
        Read the <a href="/terms">Terms of use</a> for acceptable behaviour and liability limits, and the
        <a href="/copyright">Copyright</a> page for trademark attribution.
      </p>
    </div>
  </article>
</template>

<script setup>
// Route meta for SEO is defined in the router.
</script>
