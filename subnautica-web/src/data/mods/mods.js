/** @typedef {{ id: number, title: string, description: string, tags: string[], publishDate: string, imageUrl: string, imageAlt: string, classify: 'game1'|'game2'|'game3', downloadUrl: string, seo: { title: string, description: string, keywords: string }, addressBar: string, detailsHtml: string }} ModEntry */

/**
 * Mod listings by game (`classify`). Summaries from public Nexus pages; outbound URLs only via each entry’s Download (sidebar).
 */
export default [
  {
    id: 101,
    title: 'InternetsLIVE H2.0 Vibrant Shader DX11',
    description:
      'Nexus Mods ID 1: a SweetFX-based vibrant shader pack for Subnautica (DX11). Press F10 in-game to toggle. Legacy release—verify compatibility with your build before installing.',
    tags: ['Graphics', 'Shader', 'Nexus', 'DX11', 'Legacy'],
    publishDate: '2026-05-13',
    imageUrl: '/images/mod/mod01.webp',
    imageAlt: 'Subnautica underwater scene suitable for a graphics mod listing',
    classify: 'game1',
    downloadUrl: 'https://www.nexusmods.com/subnautica/mods/1',
    seo: {
      title: 'InternetsLIVE H2.0 Vibrant Shader — Nexus Mods Subnautica mod 1',
      description:
        'Fan site listing for Nexus Subnautica mod 1: InternetsLIVE H2.0 Vibrant Shader DX11 (SweetFX installer, F10 toggle). Not affiliated with Nexus Mods or Unknown Worlds.',
      keywords:
        'Subnautica mod, Nexus Mods, mod 1, InternetsLIVE, Vibrant Shader, SweetFX, DX11, Reshade-style, graphics, InternetsLuitjens',
    },
    addressBar: 'mod-sn1-nexus-1-internetslive-vibrant-shader-dx11',
    detailsHtml: `
<h2>What this is</h2>
<p>
  <strong>InternetsLIVE H2.0 Vibrant Shader DX11</strong> is the graphics mod historically listed as Nexus Mods
  <strong>Subnautica mod ID 1</strong>. The original listing describes a <strong>custom SweetFX shader installer</strong>:
  straightforward install, a more vibrant in-game look, and <strong>press F10</strong> to toggle the effect on or off.
  Credits on that listing name the SweetFX project and Unknown Worlds Entertainment for Subnautica.
</p>
<ul class="article-media-list" aria-label="Reference images for this mod listing">
  <li>
    <img src="/images/mod/mod01-01.webp" alt="Subnautica underwater vista illustrating a graphics-focused mod" width="1200" height="630" loading="lazy" decoding="async" />
  </li>
  <li>
    <img src="/images/mod/mod01-02.webp" alt="Deeper-toned alien ocean as a second reference image" width="1200" height="630" loading="lazy" decoding="async" />
  </li>
  <li>
    <img src="/images/mod/mod01-03.webp" alt="Deeper-toned alien ocean as a second reference image" width="1200" height="630" loading="lazy" decoding="async" />
  </li>
</ul>
<p>
  Listing metadata references <strong>version 2.00</strong>, original upload <strong>12 November 2015</strong>, last update
  <strong>16 January 2016</strong>, and author <strong>InternetsLuitjens</strong>. Treat this as a
  <strong>legacy</strong> DX11-era tweak, not a promise for current retail builds.
</p>

<h2>Before you install</h2>
<ul>
  <li><strong>Build match:</strong> modern Subnautica may use different render paths than 2015–2016 DX11 + SweetFX stacks. Check your storefront patch notes and any readme bundled with the download after you fetch it via Download.</li>
  <li><strong>Backups:</strong> copy your save folder and note vanilla graphics settings so you can revert cleanly.</li>
  <li><strong>Multiplayer:</strong> avoid visual overrides that create unfair advantages or desync in community sessions.</li>
</ul>

<h2>Where to get the files</h2>
<p>
  This article does not embed outbound links. Use the <strong>Download</strong> control in the right-hand sheet on this
  page to open the official listing in a new tab, then follow that page’s <strong>Files</strong> section for installers,
  changelogs, and user comments.
</p>

<h2>After install</h2>
<p>
  Launch once with the shader disabled if your installer documents a default, confirm stability, then toggle with
  <strong>F10</strong> as described in the bundled readme. If the game fails to boot, remove injected files per that
  readme or restore from backup—graphics injectors are a frequent first suspect after crashes on title load.
</p>
    `.trim(),
  },
  {
    id: 102,
    title: 'AutosortLockers',
    description:
      'Nexus Mods ID 31: base-building QoL—Autosorter and Autosort receptacles that route items into filtered lockers. Requires QModManager and SMLHelper; listing notes latest builds may not match older saves.',
    tags: ['Base building', 'QoL', 'Nexus', 'QMod', 'SMLHelper'],
    publishDate: '2026-05-13',
    imageUrl: '/images/mod/mod02.webp',
    imageAlt: 'Subnautica base and habitat atmosphere for a storage QoL mod listing',
    classify: 'game1',
    downloadUrl: 'https://www.nexusmods.com/subnautica/mods/31',
    seo: {
      title: 'AutosortLockers for Subnautica — Nexus mod 31',
      description:
        'Fan summary of Nexus Subnautica mod 31 AutosortLockers by RandyKnapp: autosorter furniture, receptacles, filters, and install notes without embedding outbound links.',
      keywords:
        'Subnautica, AutosortLockers, Nexus mod 31, RandyKnapp, QModManager, SMLHelper, base storage, filtered lockers',
    },
    addressBar: 'mod-sn1-nexus-31-autosortlockers',
    detailsHtml: `
<h2>What it does</h2>
<p>
  <strong>AutosortLockers</strong> is the Subnautica Nexus listing historically numbered <strong>mod ID 31</strong>, by
  <strong>RandyKnapp</strong>. The description adds new base pieces—an <strong>Autosorter</strong> and
  <strong>Autosort Receptacle</strong> (plus a later <strong>Standing Autosort Receptacle</strong> and custom colours):
  you drop items into the autosorter and the mod routes them into receptacles that match your filters, instead of manually
  shuffling every locker after a long harvest run.
</p>
<ul class="article-media-list" aria-label="Reference images for this mod listing">
  <li>
    <img src="/images/mod/mod02-01.webp" alt="Subnautica interior base lighting suggesting organised storage" width="1200" height="630" loading="lazy" decoding="async" />
  </li>
  <li>
    <img src="/images/mod/mod02-02.webp" alt="Subnautica shallow reef scene as a second listing still" width="1200" height="630" loading="lazy" decoding="async" />
  </li>
   <li>
    <img src="/images/mod/mod02-03.webp" alt="Subnautica shallow reef scene as a second listing still" width="1200" height="630" loading="lazy" decoding="async" />
  </li>
</ul>
<p>
  Nexus metadata on that page shows <strong>version 1.3.0</strong> (last update <strong>21 May 2020</strong>), original upload
  <strong>27 February 2018</strong>, and a virus-scan badge described as <strong>safe to use</strong> on the listing at the
  time this summary was written. Changelog text there notes a move to <strong>SMLHelper</strong> maintenance (PrimeSonic)
  and warns that <strong>the latest SML-based build is not compatible with older saves</strong>—plan a new save or read
  comments before upgrading mid-campaign.
</p>

<h2>Dependencies (read before Download)</h2>
<p>
  The Nexus <strong>Requirements</strong> table names <strong>QModManager</strong> and <strong>SMLHelper (Modding Helper)</strong>
  as prerequisites. Install those in the order their authors document, then add this mod’s package. This listing does not paste
  installer URLs in prose—use <strong>Download</strong> on the right, then follow the Files tab instructions on the store page.
</p>

<h2>Crafting footprint (from the listing text)</h2>
<p>
  The public description lists example blueprint costs: <strong>Autosorter</strong> — 2× titanium, 1× computer chip, 2× ruby;
  <strong>Autosort Receptacle</strong> and <strong>Standing Autosort Receptacle</strong> — 2× titanium, 1× magnetite each, with
  a config option mentioned to make each piece cost only <strong>2× titanium</strong> like regular lockers. Treat costs as
  hints—always read the in-game blueprint after install in case a patch or fork changed recipes.
</p>

<h2>Before you install</h2>
<ul>
  <li><strong>Loader stack:</strong> confirm QMod + SMLHelper versions match your game build (Steam / Epic / Microsoft Store).</li>
  <li><strong>Saves:</strong> heed the listing’s warning about SML conversions and old saves; duplicate saves before migrating.</li>
  <li><strong>Performance:</strong> changelog entries on Nexus mention sorting throughput when many receptacles exist—start small, measure FPS in your largest base.</li>
</ul>

<h2>Where to get the files</h2>
<p>
  Use the <strong>Download</strong> button in the right-hand sheet to open the official Nexus page, then grab the archive
  that matches your toolchain from the <strong>Files</strong> section and extract per the author’s steps (historically: extract
  into the Subnautica install folder after QMods is present—verify against the current readme).
</p>

<h2>After install</h2>
<p>
  Enter a test seamoth base, craft one autosorter and one receptacle, assign simple filters, and drop a mixed inventory to
  confirm routing. If items refuse to move, re-check SMLHelper load order, config JSON files mentioned on Nexus
  (<code>filters.json</code>, <code>colors.json</code> under Assets in the author’s layout), and whether any locker filter is
  too greedy for the “Any” bucket.
</p>
    `.trim(),
  },
  {
    id: 103,
    title: 'Moonpool Vehicle Repair',
    description:
      'Nexus Mods ID 51: BepInEx plugin—dock a Seamoth or PRAWN in a Moonpool for automatic hull repair, similar in spirit to the Cyclops docking repair module. Configurable repair rate and power draw; listing also mentions Nitrox use at your own risk.',
    tags: ['BepInEx', 'Moonpool', 'Vehicles', 'QoL', 'Nexus'],
    publishDate: '2026-05-13',
    imageUrl: '/images/mod/mod03.webp',
    imageAlt: 'Subnautica moonpool and vehicle silhouette for a docking repair mod listing',
    classify: 'game1',
    downloadUrl: 'https://www.nexusmods.com/subnautica/mods/51',
    seo: {
      title: 'Moonpool Vehicle Repair for Subnautica — Nexus mod 51',
      description:
        'Fan summary of Nexus Subnautica mod 51 Moonpool Vehicle Repair: BepInEx moonpool auto-repair, config, Seamoth vs PRAWN health notes—no outbound links in article body.',
      keywords:
        'Subnautica, Moonpool Vehicle Repair, Nexus mod 51, ahk1221, Cookie, BepInEx, moonpool repair, Seamoth, PRAWN',
    },
    addressBar: 'mod-sn1-nexus-51-moonpool-vehicle-repair',
    detailsHtml: `
<h2>What it does</h2>
<p>
  <strong>Moonpool Vehicle Repair</strong> is the Subnautica Nexus listing numbered <strong>mod ID 51</strong>, attributed on
  that page to <strong>ahk1221</strong> and <strong>Cookie</strong>. The description explains a <strong>BepInEx</strong>
  plugin: when you dock a vehicle in a <strong>Moonpool</strong>, hull damage is repaired automatically over time—similar in
  idea to the <strong>Cyclops docking bay repair</strong> flow, but for the standalone moonpool. Later notes on the listing
  mention configurable <strong>repair strength</strong> and that consumed energy can follow the same tuning.
</p>
<ul class="article-media-list" aria-label="Reference images for this mod listing">
  <li>
    <img src="/images/mod/mod03-01.webp" alt="Ice-edge and underwater light suggesting a moonpool base scene" width="1200" height="630" loading="lazy" decoding="async" />
  </li>
  <li>
    <img src="/images/mod/mod03-02.webp" alt="Shallow reef light as a second still for the mod article" width="1200" height="630" loading="lazy" decoding="async" />
  </li>
  <li>
    <img src="/images/mod/mod03-03.webp" alt="Shallow reef light as a second still for the mod article" width="1200" height="630" loading="lazy" decoding="async" />
  </li>
</ul>
<p>
  Nexus file metadata shows <strong>version 1.0.7</strong>, last update <strong>13 August 2025</strong>, original upload
  <strong>17 March 2018</strong>, and a virus-scan line described as <strong>safe to use</strong> on the listing. Changelog
  snippets there reference moving to <strong>SMLHelper</strong> options in older lines and later packaging as a pure
  <strong>BepInEx</strong> plugin—always match the archive you download to the loader stack described in its readme.
</p>

<h2>Dependencies (names only—install order from each readme)</h2>
<p>
  The public text expects <strong>BepInEx</strong> for Subnautica and recommends the <strong>BepInEx Configuration Manager</strong>
  plugin so you can edit values in-game (the listing mentions default <strong>F1</strong> to open the UI, or
  <strong>F2</strong> when another tweaks mod remaps keys). Do not mix QMod-era zip layouts with a BepInEx
  <code>plugins</code> folder—extract exactly where the author’s steps say (typically under <code>BepInEx/plugins</code>).
</p>

<h2>How repair behaves (from the listing math)</h2>
<p>
  The description states a default repair chunk per tick and a timer: health is applied on an interval (the page cites
  <strong>every five seconds</strong> as the cadence in the overview). It also warns that <strong>Seamoth</strong> and
  <strong>PRAWN</strong> use different internal max hull values while the UI shows <strong>percentages</strong>, so the same
  numeric config will change real time-to-full between vehicles—tune in a test save before you rely on it mid-expedition.
</p>

<h2>Before you install</h2>
<ul>
  <li><strong>Store SKU:</strong> the blurb claims one build for Game Pass, Steam, Epic, and Discord retail—still verify your exact patch ID against the mod’s comments.</li>
  <li><strong>Nitrox:</strong> the author note says it may run with Nitrox but bugs should be expected; treat multiplayer as experimental.</li>
  <li><strong>Power:</strong> increasing repair rate can drain base energy faster than solar regen—watch batteries when AFK-docking.</li>
</ul>

<h2>Where to get the files</h2>
<p>
  Use <strong>Download</strong> on the right to open the Nexus page, then pick the current <strong>Moonpool Vehicle Repair</strong>
  archive from <strong>Files</strong> and extract per the numbered steps in the description (BepInEx first, configuration
  manager second, mod zip into plugins last).
</p>

<h2>After install</h2>
<p>
  In a creative sandbox, damage a Seamoth slightly, dock in a powered moonpool, and confirm the hull bar climbs over a few
  ticks. Edit the generated <code>Config.json</code> or the in-game config UI for repair amount and charge intervals, then
  reload the dock test. If nothing repairs, confirm BepInEx chainloading, that the moonpool has spare power, and that no
  other mod overrides vehicle health while docked.
</p>
    `.trim(),
  },
  {
    id: 201,
    title: 'Custom Load Screen',
    description:
      'Nexus Below Zero mod 8: replace the default loading screen art with your own image via a QMods package—swap the bundled file in the mod’s image folder. Simple cosmetic tweak; verify QMod compatibility with your build.',
    tags: ['Below Zero', 'UI', 'Loading screen', 'QMod', 'Nexus', 'Cosmetic'],
    publishDate: '2019-02-18',
    imageUrl: '/images/mod/mod04.webp',
    imageAlt: 'Frozen Below Zero coast tone for a loading-screen cosmetic mod listing',
    classify: 'game2',
    downloadUrl: 'https://www.nexusmods.com/subnauticabelowzero/mods/8',
    seo: {
      title: 'Custom Load Screen for Below Zero — Nexus mod 8',
      description:
        'Fan summary of Nexus Subnautica: Below Zero mod 8 Custom Load Screen by KaiTheBat: QMods loading image swap, install steps, and artwork disclaimer—no outbound links in article body.',
      keywords:
        'Below Zero, Custom Load Screen, Nexus mod 8, KaiTheBat, QMods, loading screen, Subnautica BZ cosmetic',
    },
    addressBar: 'mod-bz-nexus-8-custom-load-screen',
    detailsHtml: `
<h2>What it does</h2>
<p>
  <strong>Custom Load Screen</strong> is the Nexus listing for <strong>Subnautica: Below Zero mod ID 8</strong>, by
  <strong>KaiTheBat</strong>. The public description is a small cosmetic pack: it replaces the game’s default
  <strong>loading screen background</strong> with an image you supply. The page labels the release <strong>BZ-1.0</strong>
  and marks the bundle as built for <strong>QMods</strong>—treat that as a legacy loader path unless the Files tab shows a
  newer fork for BepInEx-only installs.
</p>
<p>
  Metadata on that listing shows original upload and last update both on <strong>18 February 2019</strong>, with a virus-scan
  line described as <strong>safe to use</strong>. File credits there explicitly say the uploaded preview image is
  <strong>not the author’s own artwork</strong>—respect that if you redistribute screenshots, and only ship art you have
  rights to use inside your personal <code>ImageFolder</code> swap.
</p>

<h2>Install flow (from the listing text)</h2>
<ol>
  <li>Download the archive from the mod page using <strong>Download</strong> on the right, then open the <strong>Files</strong> tab there if you need alternate builds.</li>
  <li>Unzip the package <strong>into your QMods directory</strong> so the mod folder sits beside other QMod entries.</li>
  <li>Open the mod’s <strong>ImageFolder</strong> (name given on Nexus) and place exactly <strong>one</strong> image inside—either <code>.jpg</code> or <code>.png</code>; filenames can vary as long as only one image is present, per the author instructions.</li>
  <li>Launch Below Zero and watch the loading screen once caches refresh; revert the file if the game caches aggressively on your OS.</li>
</ol>

<h2>Before you install</h2>
<ul>
  <li><strong>Loader reality check:</strong> QMods-era mods may not match current Microsoft Store or Epic builds—read the newest comments on Nexus before overwriting binaries.</li>
  <li><strong>Resolution &amp; weight:</strong> huge PNGs can slow disk IO on first load; resize art to sane dimensions for your panel.</li>
  <li><strong>License:</strong> bundle only artwork you created or have permission to ship; the stock download’s note about third-party art is a reminder, not a license grant.</li>
</ul>

<h2>Where to get the files</h2>
<p>
  Use the sidebar <strong>Download</strong> button to open the official Nexus page, then pull the <strong>Custom Load Screen</strong>
  zip from <strong>Files</strong>. This listing never pastes direct file URLs in prose.
</p>

<h2>After install</h2>
<p>
  If the vanilla background persists, confirm the mod folder name matches what QMods expects, that only one image lives in
  the image directory, and that no other UI overhaul mod overrides the same asset. Remove the mod folder to return to the
  stock loading art instantly.
</p>
    `.trim(),
  },
  {
    id: 202,
    title: 'Custom command',
    description:
      'Nexus Below Zero mod 7: dev-style console extensions—spawn creatures or vehicles with custom scale, resize aimed objects, docile/pickup toggles, and an experimental player resize. Requires BepInEx pack and Nautilus BZ; use only in saves you can afford to break.',
    tags: ['Below Zero', 'Cheats', 'Console', 'BepInEx', 'Nautilus', 'Nexus'],
    publishDate: '2023-05-28',
    imageUrl: '/images/mod/mod05.webp',
    imageAlt: 'Cool alien ocean atmosphere for a console command utilities mod listing',
    classify: 'game2',
    downloadUrl: 'https://www.nexusmods.com/subnauticabelowzero/mods/7',
    seo: {
      title: 'Custom command for Below Zero — Nexus mod 7',
      description:
        'Fan summary of Nexus Subnautica: Below Zero mod 7 Custom command by Coticvo: spawn/size/friend/pickup console helpers, BepInEx + Nautilus BZ deps—no outbound links in article body.',
      keywords:
        'Below Zero, Custom command, Nexus mod 7, Coticvo, BepInEx, Nautilus BZ, console commands, spawn, cheat',
    },
    addressBar: 'mod-bz-nexus-7-custom-command',
    detailsHtml: `
<h2>What it does</h2>
<p>
  <strong>Custom command</strong> is the Nexus listing for <strong>Subnautica: Below Zero mod ID 7</strong>, by
  <strong>Coticvo</strong>. The page describes a command-focused add-on: extra <strong>developer-style console</strong>
  verbs to spawn scaled creatures or subs, resize what you are aiming at, flip <strong>docile</strong> behaviour on a
  targeted creature, toggle <strong>pickup</strong> on an object, and an optional <strong>player scale</strong> tweak. The
  tone is sandbox/cheat—expect physics and AI edge cases if you push sizes far from vanilla.
</p>
<ul class="article-media-list" aria-label="Reference images for this mod listing">
  <li>
    <img src="/images/mod/mod05-01.webp" alt="Below Zero style cool ocean lighting for a utilities mod listing" width="1200" height="630" loading="lazy" decoding="async" />
  </li>
</ul>
<p>
  Listing metadata shows <strong>version 2.1.0</strong>, last update <strong>28 May 2023</strong>, original upload
  <strong>17 February 2019</strong>, and a virus-scan line described as <strong>safe to use</strong>. The author warns that
  the <strong>player size</strong> command is <strong>very unstable</strong> and that related glitches are called out as
  effectively unsolvable—treat that path as novelty only.
</p>

<h2>Dependencies (names only)</h2>
<p>
  The Nexus requirements table lists <strong>BepInEx Pack for Subnautica: Below Zero</strong> and <strong>Nautilus BZ</strong>.
  Install those stacks first, then drop this mod’s files where its readme specifies (the public blurb mentions extracting the
  archive into your game install folder—match the layout to your storefront copy of Below Zero, not the original Subnautica
  folder if they differ on disk).
</p>

<h2>Command cheat sheet (verbatim names from the listing)</h2>
<ul>
  <li><code>spse [ID] [quantity] [size-X] [size-Y] [size-Z] [distance]</code> — spawn creatures with custom dimensions.</li>
  <li><code>suse [ID] [size-X] [size-Y] [size-Z] [distance]</code> — spawn subs with custom dimensions.</li>
  <li><code>size [size-X] [size-Y] [size-Z]</code> — resize the object you are aiming at.</li>
  <li><code>friend</code> — toggle docile behaviour on the creature you aim at (second use removes it).</li>
  <li><code>pickup</code> — toggle pickup on the object you aim at (second use removes it).</li>
  <li><code>playse [size]</code> — resize the player; listing stresses instability.</li>
</ul>
<p>
  The page gives text examples such as spawning a scaled sea dragon, an oversized Seamoth, or a taller PRAWN-style suit with
  unchanged footprint axes—use those patterns only after you understand how each argument maps to your target prefab ID list.
</p>

<h2>Before you install</h2>
<ul>
  <li><strong>Save hygiene:</strong> duplicate the save; console toys can strand you in geometry or softlock story triggers.</li>
  <li><strong>Achievements &amp; integrity:</strong> treat every command as a self-imposed cheat; multiplayer or challenge runs should skip the mod entirely.</li>
  <li><strong>Performance:</strong> giant creatures tank FPS fast—spawn small increments and watch memory when spamming spawns.</li>
</ul>

<h2>Where to get the files</h2>
<p>
  Use <strong>Download</strong> on the right to open Nexus, then fetch the current zip from <strong>Files</strong> and follow
  the author’s extract path. This article never pastes direct download URLs.
</p>

<h2>After install</h2>
<p>
  Open the console in a test habitat, run a single benign <code>friend</code> toggle on a peeper, confirm the mod loads, then
  escalate to spawn tests. If commands no-op, verify BepInEx log for plugin load order, confirm Nautilus BZ is present, and
  remove conflicting cheat mods that also patch the same console dispatcher.
</p>
    `.trim(),
  },
  {
    id: 203,
    title: 'BelowZero Altitude Meter',
    description:
      'Nexus Below Zero mod 51: HUD altitude readout when you are above sea level on land, with a toggleable symbol and RGB-tunable depth/altitude text. Lists QModManager 4, SMLHelper Zero, and optional VersionChecker—verify loader fit for your build.',
    tags: ['Below Zero', 'HUD', 'QoL', 'QMod', 'SMLHelper', 'Nexus'],
    publishDate: '2022-09-27',
    imageUrl: '/images/mod/mod06.webp',
    imageAlt: 'Below Zero ice and sky suggesting land altitude and surface navigation',
    classify: 'game2',
    downloadUrl: 'https://www.nexusmods.com/subnauticabelowzero/mods/51',
    seo: {
      title: 'BelowZero Altitude Meter for Below Zero — Nexus mod 51',
      description:
        'Fan summary of Nexus Subnautica: Below Zero mod 51 BelowZero Altitude Meter by ihatetn931: land altitude HUD, toggles, colours, QMod stack—no outbound links in article body.',
      keywords:
        'Below Zero, Altitude Meter, Nexus mod 51, ihatetn931, QModManager, SMLHelper Zero, HUD, sea level',
    },
    addressBar: 'mod-bz-nexus-51-belowzero-altitude-meter',
    detailsHtml: `
<h2>What it does</h2>
<p>
  <strong>BelowZero Altitude Meter</strong> is the Nexus listing for <strong>Subnautica: Below Zero mod ID 51</strong>, by
  <strong>ihatetn931</strong>. The author pitch is deliberately narrow: vanilla depth readouts sit at <strong>zero</strong>
  when you are on land above the ocean, so this mod adds a readable <strong>altitude</strong> value for those surface
  segments. Later notes on the page mention a <strong>toggleable symbol</strong>, <strong>mod options</strong> entries to
  flip that symbol, and <strong>RGB sliders</strong> for both depth text and altitude text colours.
</p>
<ul class="article-media-list" aria-label="Reference images for this mod listing">
  <li>
    <img src="/images/mod/mod06-01.webp" alt="Below Zero ice shelf and horizon evoking land traversal above the sea" width="1200" height="630" loading="lazy" decoding="async" />
  </li>
  <li>
    <img src="/images/mod/mod06-02.webp" alt="Cool ocean light as a second still for the altitude HUD mod article" width="1200" height="630" loading="lazy" decoding="async" />
  </li>
  <li>
    <img src="/images/mod/mod06-03.webp" alt="Cool ocean light as a second still for the altitude HUD mod article" width="1200" height="630" loading="lazy" decoding="async" />
  </li>
</ul>
<p>
  Nexus metadata lists <strong>version 3.0.0</strong>, last update <strong>27 September 2022</strong>, original upload
  <strong>22 February 2020</strong>, and a virus-scan line described as <strong>safe to use</strong>. Changelog bullets there
  call out compatibility passes for major Below Zero drops (including a “What The Dock” era line) and the v3 feature that
  exposes text colour tuning—always compare that timeline to your installed game patch before assuming parity.
</p>

<h2>Dependencies (names only)</h2>
<p>
  The Nexus requirements table names <strong>QModManager 4</strong>, <strong>SMLHelper Zero</strong>, and an optional
  <strong>VersionChecker</strong> utility if you want in-game update reminders. Install the mandatory pair first, confirm
  they load on your storefront SKU, then add this meter mod per its readme—modern Below Zero may prefer BepInEx-only stacks,
  so read recent comments if QMod paths fail on your machine.
</p>

<h2>Before you install</h2>
<ul>
  <li><strong>HUD conflicts:</strong> other UI mods that reskin depth readouts may fight this meter—disable suspects one at a time.</li>
  <li><strong>Colour contrast:</strong> extreme RGB values can wash out in snow glare; tune on land during midday and midnight cycles.</li>
  <li><strong>Saves:</strong> duplicate before toggling experimental options; HUD scripts rarely corrupt saves, but icy surface saves are expensive to redo.</li>
</ul>

<h2>Where to get the files</h2>
<p>
  Use <strong>Download</strong> on the right to open Nexus, pull the current archive from <strong>Files</strong>, and follow
  the author’s install order for QMods packages. This listing never pastes direct CDN URLs in prose.
</p>

<h2>After install</h2>
<p>
  Stand on a glacial ramp above the waterline, confirm the altitude value tracks as you climb, then open <strong>mod
  options</strong> to flip the symbol and nudge RGB until the readout stays legible against snow. If the HUD stays at zero,
  verify SMLHelper Zero is running, that no other mod overrides the depth widget, and that you truly are above sea level (not
  inside an interior cell that reports ocean depth differently).
</p>
    `.trim(),
  },
]
