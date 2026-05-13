/** @typedef {{ id: number, title: string, description: string, tags: string[], publishDate: string, imageUrl: string, imageAlt: string, classify: 'game1'|'game2'|'game3', seo: { title: string, description: string, keywords: string }, addressBar: string, detailsHtml: string }} Guide */

/** @type {Guide[]} 每作一篇长指南；classify 对应各 hub 页 */
export default [
    {
    id: 101,
    title: 'Subnautica: from Lifepod 5 to confident deep dives',
    description:
      'A player-focused walkthrough of the real survival loop on planet 4546B: oxygen, radiation, scanning, vehicles, bases, and how to read the world without rushing into late-game hazards.',
    tags: ['Subnautica', 'Beginner', 'Survival', 'Vehicles'],
    publishDate: '2026-05-12',
    imageUrl: '/images/guides/guide01.webp',
    imageAlt: 'Sunlit shallow reef and kelp',
    classify: 'game1',
    seo: {
      title: 'Subnautica survival and progression guide for players',
      description:
        'Detailed Subnautica tips: Lifepod 5 priorities, Aurora radiation, Seamoth and Cyclops depth, biomes, bases, leviathans, and story pacing—written for real playthroughs.',
      keywords:
        'Subnautica guide, 4546B, Lifepod 5, Seamoth depth module, Cyclops, PRAWN, Aurora radiation suit, Safe Shallows, Kelp Forest, scanner fragments, habitat builder',
    },
    addressBar: 'sn1-survival-and-progression-players-guide',
    detailsHtml: `
<h2>What you are actually playing</h2>
<p>
  <strong>Subnautica</strong> drops you into the ocean of <strong>planet 4546B</strong> after the capital ship
  <strong>Aurora</strong> breaks apart. Your lifepod is a tiny fabricator on legs: the whole game is learning where
  to get metals, how far your oxygen reaches, and when to stop pushing depth. Nothing here replaces discovering PDAs
  yourself—this guide sticks to mechanics and geography most players learn the hard way.
</p>
<figure>
  <img src="/images/guides/guide01-01.webp" alt="Subnautica Safe Shallows style environment with kelp and reef light" width="1200" height="630" loading="lazy" decoding="async" />
  <figcaption>Shallow biomes are where you learn oxygen rhythm—treat sunlit reef runs as training, not a race to depth.</figcaption>
</figure>

<h2>First hour: fabricator order that matches the real tutorial pressure</h2>
<p>
  Swim the <strong>Safe Shallows</strong> first: catch fish with the fabricator sample you craft, and turn
  <strong>bladderfish</strong> into water so you are not fighting thirst while you learn movement. Build a
  <strong>survival knife</strong> for coral tubes and self-defense, then a <strong>scanner</strong>—almost every
  progression gate in Subnautica is “have you scanned the right wreck fragment yet?”
</p>
<ul>
  <li><strong>Standard O2 tank</strong> before long horizontal swims; upgrade to high capacity when you have spare lithium.</li>
  <li><strong>Fins</strong> reduce the time you spend in transit, which is the same as reducing oxygen risk.</li>
  <li><strong>Repair tool</strong> once you have cave sulfur and stalker teeth: you will use it on the pod, vehicles, and hull breaches forever.</li>
</ul>
<div class="article-table-scroll">
  <table>
    <caption>Example early-game fabricator priority (adjust to your PDA unlocks)</caption>
    <thead>
      <tr>
        <th scope="col">Stage</th>
        <th scope="col">Craft</th>
        <th scope="col">Player goal</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>0–15 min</td>
        <td>Survival knife, scanner</td>
        <td>Harvest samples, scan fragments, open blueprint paths</td>
      </tr>
      <tr>
        <td>15–40 min</td>
        <td>Standard O<sub>2</sub> tank, fins</td>
        <td>Longer kelp / plateau trips without constant surface panic</td>
      </tr>
      <tr>
        <td>Before Aurora dives</td>
        <td>Radiation suit</td>
        <td>Stop radiation DOT; unlock safe exploration of the wreck’s useful sections</td>
      </tr>
      <tr>
        <td>First vehicle push</td>
        <td>Mobile Vehicle Bay + Seamoth</td>
        <td>Controlled depth, storage, and retreat speed for mid-depth wrecks</td>
      </tr>
    </tbody>
  </table>
</div>
<p>
  When the game tells you about <strong>radiation</strong> around the Aurora, treat that as a hard wall until you craft the
  <strong>Radiation Suit</strong> (lead from metal-rich areas, wiring kits from silver + copper). Do not “peek” the drive
  core without protection—you will take damage fast.
</p>

<h2>Biomes you will live in before the story forces you deeper</h2>
<p>
  <strong>Kelp Forest</strong> gives stalkers, creep vine clusters, and early access to silicone rubber and lithium if you
  explore carefully. <strong>Grassy Plateaus</strong> are your reliable titanium and silver route for wiring kits. Scan every
  <strong>outcrop</strong> variant you see; names on the HUD tell you whether you are looking at limestone, sandstone, or shale.
</p>
<div class="article-table-scroll">
  <table>
    <caption>Common drillable outcrops in early-to-mid biomes (materials vary by RNG)</caption>
    <thead>
      <tr>
        <th scope="col">Outcrop type</th>
        <th scope="col">Typical metals / gems</th>
        <th scope="col">Where you first see it</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Limestone</td>
        <td>Titanium, copper</td>
        <td>Safe Shallows, Kelp Forest walls</td>
      </tr>
      <tr>
        <td>Sandstone</td>
        <td>Lead, silver, gold</td>
        <td>Grassy Plateaus, Kelp edges</td>
      </tr>
      <tr>
        <td>Shale</td>
        <td>Lithium, gold, diamond</td>
        <td>Deeper kelp pockets, Mushroom Forest, many wrecks</td>
      </tr>
    </tbody>
  </table>
</div>
<p>
  The <strong>Aurora’s bow</strong> (front) is guarded by a <strong>Reaper Leviathan</strong> patrol in the Crash Zone—new
  players die there more than in the “scary” deep biomes because the reaper is loud and fast. Approach the ship from the
  <strong>flank or rear</strong> once you have radiation gear, keep terrain between you and open water, and do not chase
  lights on the surface at night until you know the map.
</p>
<p>
  Later arcs send you toward <strong>Jellyshroom Cave</strong>, the <strong>Lost River</strong>, and lava-adjacent zones.
  Those areas assume you already run a <strong>Seamoth</strong> with depth modules or a <strong>Cyclops</strong> with spare
  power cells. If you feel “crushed” or hear hull stress audio, you are past your vehicle’s crush depth—surface or upgrade.
</p>

<h2>Vehicles: what each one is for</h2>
<p>
  The <strong>Seamoth</strong> is your daily driver for gathering and scanning. Install <strong>depth modules</strong> in
  order (Mk1 → Mk2 → Mk3); each tier is a recipe gate tied to materials from progressively deeper biomes. Perimeter defense
  and torpedoes are optional—many players prefer storage and sonar for navigation.
</p>
<p>
  The <strong>PRAWN suit</strong> ignores small creature harassment, mines resources with the drill arm, and survives jumps
  the Seamoth cannot. It is slower: plan grapple or drill routes so you are not walking empty corridors of cave systems
  without spare batteries.
</p>
<p>
  The <strong>Cyclops</strong> is a mobile base. Learn <strong>silent running</strong> before you take it into leviathan
  territory, keep <strong>fire suppression</strong> systems charged, and never park broadside in a tight tunnel—one bad
  scrape turns into a hull breach chain reaction if you panic-throttle.
</p>
<figure>
  <img src="/images/guides/guide01-02.webp" alt="Deeper alien ocean atmosphere useful as a visual break between guide sections" width="1200" height="630" loading="lazy" decoding="async" />
  <figcaption>Vehicle progression is a pacing tool—if the view turns this moody and you still hear hull stress, check crush depth before you commit.</figcaption>
</figure>
<div class="article-table-scroll">
  <table>
    <caption>Reference crush depths for fully upgraded hulls (vanilla Subnautica)</caption>
    <thead>
      <tr>
        <th scope="col">Vehicle</th>
        <th scope="col">Configuration</th>
        <th scope="col">Approx. max depth (m)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Seamoth</td>
        <td>Stock → Depth Mk1 → Mk2 → Mk3</td>
        <td>200 → 300 → 500 → 900</td>
      </tr>
      <tr>
        <td>Cyclops</td>
        <td>Stock → Depth Mk1 → Mk2</td>
        <td>500 → 900 → 1,700</td>
      </tr>
      <tr>
        <td>PRAWN</td>
        <td>Stock → Depth Mk1 → Mk2</td>
        <td>900 → 1,300 → 1,700</td>
      </tr>
    </tbody>
  </table>
</div>
<p>Always read the in-game blueprint tooltip—numbers above help you plan routes; the PDA is authoritative if a balance patch changes values.</p>

<h2>Bases that survive the midgame</h2>
<p>
  Scan <strong>Habitat Builder</strong> fragments early, then pick a build site with flat ground and a clear path to
  resources you still need daily (titanium, quartz, salt). <strong>Solar panels</strong> work beautifully in the shallows;
  switch to <strong>bioreactors</strong> or <strong>thermal plants</strong> when you move deeper where sunlight is weak.
</p>
<ul>
  <li><strong>Water filtration</strong> removes the bladderfish grind at the cost of power—budget energy before you scale rooms.</li>
  <li><strong>Exterior growbeds</strong> plus marblemelons or Chinese potatoes trivialize food if you replant cuttings.</li>
  <li><strong>Scanner room</strong> in a central biome saves hours hunting specific ores once you have camera drones.</li>
</ul>

<h2>Radio signals, beacons, and pacing</h2>
<p>
  The <strong>radio</strong> in the lifepod pings survivor caches and story breadcrumbs. You can ignore the order and explore
  freely, but each signal is also a lesson in navigation: build <strong>beacons</strong> with custom colors for “home,”
  “wreck A,” “cave mouth,” so your map stays readable. Color discipline matters more than fancy names.
</p>

<h2>Creatures: respect, don’t rush combat</h2>
<p>
  Ghost Leviathans, Sea Dragons, and other large threats are part of the world’s geography. The reliable player strategies are
  <strong>terrain line of sight</strong>, <strong>stasis rifle timing</strong> if you invested the resources, and
  <strong>never stopping in open blue water</strong> when you hear leviathan calls. Save before experimental dives and carry
  a spare battery set—dying deep without a Seamoth parked safely is how you lose backpacks.
</p>

<h2>End state without spoilers</h2>
<p>
  Subnautica’s “win condition” is explicit in the PDA network once you follow the Alterra thread: you will need a launch
  platform, cured infection status, and a lot of late-tier crafting. When the rocket blueprint appears, read each ingredient
  aloud to yourself once—players who rush often forget a single nickel ore run and stall for hours. Enjoy the verticality:
  Subnautica is one survival game where going <em>down</em> is the reward loop done right.
</p>
    `.trim(),
  },

  {
    id: 102,
    title: "Subnautica Xenobiology: A Comprehensive Field Guide to Alien Marine Life",
    description: "Explore the intricate ecosystems of the ocean planet's biomes. From the sunlit shallows to the crushing depths of the volcanic zones, this guide analyzes the physiological traits and evolutionary strategies of iconic alien species.",
    tags: ["Subnautica", "Xenobiology", "Leviathan Class", "Marine Ecology", "Alien Life", "Deep Sea Exploration"],
    publishDate: "2026-05-12",
    imageUrl: "/images/guides/guide02.webp",
    imageAlt: "A massive Reefback Leviathan drifting through deep ocean waters with a diverse ecosystem on its back.",
    seo: {
      title: "Marine Biology Guide: Alien Species and Ecosystems Analysis",
      description: "Detailed biological study of alien marine life, covering predator-prey dynamics, symbiosis, and the physiology of deep-sea Leviathans.",
      keywords: "alien marine biology, deep sea ecology, predatory fish behavior, leviathan classification, underwater survival guide"
    },
    classify: 'game1',
    addressBar: "subnautica-xenobiology-field-guide",
    detailsHtml: `
        <section>
            <h2>Introduction to Alien Marine Ecosystems</h2>
            <p>The ocean planet presents a unique case study in convergence evolution. Despite its extraterrestrial origin, many species exhibit biological traits analogous to Earth's marine life, adapted for high-pressure, bioluminescent, and hydrothermal environments.</p>
        </section>

        <section>
            <h2>Thermal Crater Biomes: Tropical Diversity</h2>
            <h3>The Safe Shallows and Kelp Forests</h3>
            <p>The upper layers of the ocean are powered by intense solar radiation and volcanic nutrients. The <strong>Peeper</strong> serves as a primary example of high-functioning vision, utilizing massive ocular sensors to navigate light-shifting waters. In the nearby Kelp Forests, the <strong>Stalker</strong> demonstrates a unique behavioral trait: a fascination with titanium and scrap metal, mirroring the attraction to shiny objects seen in Earth's barracudas.</p>

            <h3>Deep Sea Specialists</h3>
            <ul>
                <li><strong>Crabsquid:</strong> A master of electronic warfare. It possesses a translucent mantle that reveals its internal organs and is capable of emitting a powerful electromagnetic pulse (EMP) to disable the tech of intruders.</li>
                <li><strong>Mesmer:</strong> A dangerous predator that uses hypnotic skin patterns to manipulate the nervous systems of its prey, luring them into a fatal strike.</li>
            </ul>
        </section>

        <img src="/images/guides/guide02-01.webp" alt="A massive Reefback Leviathan drifting through deep ocean waters with a diverse ecosystem on its back." width="1200" height="630" loading="lazy" decoding="async" />

        <section>
            <h2>Leviathan Classification: The Giants of the Deep</h2>
            <p>Leviathans are defined as massive organisms at the top of the food chain, categorized by their ecological impact and threat level.</p>
            <table>
                <thead>
                    <tr>
                        <th>Species</th>
                        <th>Classification</th>
                        <th>Biological Adaptation</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Reefback</strong></td>
                        <td>Passive Leviathan</td>
                        <td>Functions as a mobile ecosystem, supporting coral and small fish on its thick exoskeleton.</td>
                    </tr>
                    <tr>
                        <td><strong>Reaper Leviathan</strong></td>
                        <td>Apex Predator</td>
                        <td>Uses echolocation to hunt. Its roar is a functional sonar system used to map its environment and track prey.</td>
                    </tr>
                    <tr>
                        <td><strong>Sea Dragon</strong></td>
                        <td>Extremophile</td>
                        <td>Found in volcanic zones, it can consume and expel molten rock, essentially "breathing fire" underwater.</td>
                    </tr>
                </tbody>
            </table>
        </section>

        <img src="/images/guides/guide02-02.webp" alt="A massive Reefback Leviathan drifting through deep ocean waters with a diverse ecosystem on its back." width="1200" height="630" loading="lazy" decoding="async" />

        <section>
            <h2>Arctic Sector: Frozen Frontiers</h2>
            <p>The polar regions introduce specialized survival strategies for sub-zero temperatures:</p>
            <ul>
                <li><strong>Brinewing:</strong> This predator utilizes a super-cooled saline solution to instantly freeze prey in a block of ice, a unique thermal-chemical adaptation.</li>
                <li><strong>Snow Stalker:</strong> A rare terrestrial relative of marine species, featuring thick white fur and powerful claws for hunting across the ice floes.</li>
                <li><strong>Ice Worm:</strong> A massive serpentine Leviathan that uses a chemically-heated horn to tunnel through solid ice, ambushing prey from below.</li>
            </ul>
        </section>

        <img src="/images/guides/guide02-03.webp" alt="A massive Reefback Leviathan drifting through deep ocean waters with a diverse ecosystem on its back." width="1200" height="630" loading="lazy" decoding="async" />

        <section>
            <h2>Artificial Life and Scientific Legacy</h2>
            <p>The planet's biology is deeply intertwined with the legacy of the <strong>Architects</strong>, an ancient civilization that utilized advanced genetic engineering. The <strong>Warper</strong> is a primary example—a biological construct designed to enforce quarantine. It possesses the ability to fold space-time, allowing for instantaneous teleportation across the ocean floor.</p>
            <p>The survival of the planet's ecosystem eventually relied on the <strong>Sea Emperor Leviathan</strong>, an intelligent telepathic being whose "Enzyme 42" was the only cure for the Kharaa Bacterium, highlighting the delicate balance between biological life and planetary health.</p>
        </section>
    `.trim(),
  },

  {
    id: 103,
    title: "Subnautica Survival Hazard Manual: Every Lethal Threat Explained",
    description: "A comprehensive analysis of the most dangerous threats in the ocean depths. This manual details predator attack patterns, environmental hazards, and critical survival errors to avoid while exploring the deep.",
    tags: ["Subnautica", "Survival Guide", "Death Animations", "Hazard Assessment", "Predator Behavior"],
    publishDate: "2026-05-13",
    imageUrl: "/images/guides/guide03.webp",
    imageAlt: "A diver facing a deadly encounter with a deep-sea predator in Subnautica.",
    seo: {
      title: "Subnautica Survival Guide: How to Survive Every Predator Attack",
      description: "Learn the attack patterns and lethal hazards of the ocean planet. Our guide covers Leviathan encounters, environmental dangers, and essential survival tips.",
      keywords: "survival hazards, predator attacks, leviathan danger, deep sea survival, gaming guide, death mechanics"
    },
    classify: 'game1',
    addressBar: "subnautica-survival-hazard-manual",
    detailsHtml: `
        <section>
            <h2>The Reality of Survival in the Depths</h2>
            <p>Exploring the ocean isn't just about discovery; it's about staying at the top of a food chain that doesn't want you there. Survival requires a deep understanding of how different creatures attack and how the environment itself can become your enemy.</p>
        </section>

        <section>
            <h2>Lethal Predator Encounters</h2>
            <p>Predators range from small, annoying pests to gargantuan Leviathans capable of destroying vehicles in seconds.</p>
            
            <h3>1. The Apex Leviathans</h3>
            <ul>
                <li><strong>Reaper Leviathan:</strong> Known for its "grab and shake" maneuver. It uses its four mandibles to pin a player or a Seamoth, delivering massive damage through sheer physical force. Avoid open waters where their roar is audible.</li>
                <li><strong>Ghost Leviathan:</strong> These bioluminescent giants favor a high-speed ramming attack. Their sheer mass can crush a diver instantly, especially in the Grand Reef or the Lost River.</li>
                <li><strong>Sea Dragon Leviathan:</strong> The ultimate deep-sea threat. It utilizes both physical swatting and fire-based projectiles. Its "bite" animation is an instant kill for any diver caught too close to its maw.</li>
            </ul>

            <h3>2. Mid-Tier Predatory Threats</h3>
            <ul>
                <li><strong>Stalker:</strong> Often encountered in Kelp Forests. While they primarily target metal, they will bite divers who venture too close to their nests.</li>
                <li><strong>Boneshark:</strong> Heavily armored and aggressive. They tend to swarm, leading to death by a thousand cuts if the diver is surrounded.</li>
                <li><strong>Crabsnake:</strong> Hidden within Jellyshrooms, these predators utilize a vertical ambush. They snatch divers directly from above or below, dragging them toward their burrow.</li>
            </ul>
        </section>
        <img src="/images/guides/guide03-01.webp" alt="A diver facing a deadly encounter with a deep-sea predator in Subnautica." width="1200" height="630" loading="lazy" decoding="async" />

        <section>
            <h2>Environmental & Biological Hazards</h2>
            <p>Not every death comes from a set of jaws. The planet itself offers numerous ways to fail your mission.</p>
            <table>
                <thead>
                    <tr>
                        <th>Hazard Type</th>
                        <th>Source</th>
                        <th>Survival Strategy</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Asphyxiation</strong></td>
                        <td>Oxygen Depletion</td>
                        <td>Always keep a 30-second reserve. Use pathfinder tools in complex cave systems.</td>
                    </tr>
                    <tr>
                        <td><strong>Thermal Damage</strong></td>
                        <td>Hydrothermal Vents / Lava</td>
                        <td>Maintain distance from steam vents. Use a Reinforced Dive Suit for high-temperature zones.</td>
                    </tr>
                    <tr>
                        <td><strong>Biological Detonation</strong></td>
                        <td>Crashfish</td>
                        <td>Listen for the distinct "hiss." Swim perpendicular to the fish's flight path to evade the blast.</td>
                    </tr>
                    <tr>
                        <td><strong>Hypnotic Luring</strong></td>
                        <td>Mesmer</td>
                        <td>If your HUD flickers and the screen distorts, look away immediately and use a Seaglide to break the trance.</td>
                    </tr>
                </tbody>
            </table>
        </section>

        <img src="/images/guides/guide03-02.webp" alt="A diver facing a deadly encounter with a deep-sea predator in Subnautica." width="1200" height="630" loading="lazy" decoding="async" />

        <section>
            <h2>Vehicle Failures: Death in the Cockpit</h2>
            <p>Your vehicles are your lifeline, but they can become your tomb if not managed correctly:</p>
            <ul>
                <li><strong>Crush Depth:</strong> Exceeding the structural integrity of your hull leads to a rapid implosion. Always upgrade your Depth Modules before venturing deeper.</li>
                <li><strong>Creature Aggression:</strong> Large predators like the Reaper or the Squidshark can disable your vehicle's power or destroy the hull entirely, leaving you stranded in high-pressure zones without oxygen.</li>
            </ul>
        </section>

        <img src="/images/guides/guide03-03.webp" alt="A diver facing a deadly encounter with a deep-sea predator in Subnautica." width="1200" height="630" loading="lazy" decoding="async" />

        <section>
            <h2>Final Survival Directive</h2>
            <p>Death in the deep is often the result of overconfidence. Whether it's staying down "just five more seconds" for a resource or trying to pet a Leviathan, the ocean does not forgive mistakes. Keep your tools repaired, your batteries charged, and your eyes on the sonar.</p>
        </section>
    `.trim(),
},


  {
    id: 201,
    title: 'Below Zero: cold, Seatruck routes, and arctic ocean rhythm',
    description:
      'Player guide to Subnautica: Below Zero on 4546B’s ice shelf—surface temperature, the Seatruck, key biomes, predators, and how to stay alive above and below the ice.',
    tags: ['Below Zero', 'Survival', 'Seatruck', 'Temperature'],
    publishDate: '2026-05-12',
    imageUrl: '/images/guides/guide04.webp',
    imageAlt: 'Frozen coast and underwater ice',
    classify: 'game2',
    seo: {
      title: 'Below Zero survival guide for players',
      description:
        'Below Zero tips: Robin’s drop pod loop, cold exposure, Seatruck modules, Twisty Bridges oxygen plants, Lilypads, Crystal Caves, Shadow Leviathan zones, and surface travel.',
      keywords:
        'Below Zero guide, Seatruck, Snowfox, thermal lily, Robin Ayou, Delta Station, Twisty Bridges, Pengwing, Shadow Leviathan, cold survival',
    },
    addressBar: 'bz-arctic-and-seatruck-players-guide',
    detailsHtml: `
<h2>How Below Zero changes the Subnautica formula</h2>
<p>
  You still fabricate, scan, and build underwater bases, but <strong>Subnautica: Below Zero</strong> adds meaningful
  <strong>surface travel</strong> on ice, weather, and <strong>temperature</strong> management. Above water you can freeze;
  underwater is often the “safe” temperature bubble. Plan routes as hops between warmth (caves, geysers, bases, vehicles)
  instead of sprinting across glare ice because the compass arrow says so.
</p>
<figure>
  <img src="/images/hero-03.jpg" alt="Subnautica Below Zero arctic shoreline with ice and cold ocean tones" width="1200" height="630" loading="lazy" decoding="async" />
  <figcaption>Surface ice is a survival mechanic—plan warmth hops before you treat land travel like a sprint.</figcaption>
</figure>

<img src="/images/guides/guide04-01.webp" alt="A screenshot of the Opening loop after the drop pod in Subnautica Below Zero." width="1200" height="630" loading="lazy" decoding="async" />

<h2>Opening loop after the drop pod</h2>
<p>
  Fabricate the usual trio—<strong>knife</strong>, <strong>scanner</strong>, <strong>standard O2</strong>—then secure
  water (bladderfish still exist) and a heat buffer: <strong>hot springs</strong> on land, <strong>thermal lilies</strong> in
  certain shallows, or cooked food from the fabricator. The <strong>cold suit</strong> upgrade path is worth prioritizing
  before you commit to long glacial hikes for story objectives.
</p>
<ul>
  <li>Carry <strong>spare batteries</strong> earlier than in Subnautica 1: the Seatruck and handheld tools chew through them.</li>
  <li>Mark only <strong>permanent</strong> landmarks with beacons; ice fog makes “beacon soup” unreadable fast.</li>
  <li>Read PDAs when you are safe—voice acting is part of the pacing and hints at where Alterra left supplies.</li>
</ul>
<div class="article-table-scroll">
  <table>
    <caption>Surface vs underwater: how temperature usually behaves</caption>
    <thead>
      <tr>
        <th scope="col">Layer</th>
        <th scope="col">Threat</th>
        <th scope="col">Mitigation habits</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Open ice / glacial hikes</td>
        <td>Cold exposure, weather, limited sprint</td>
        <td>Hot springs, peppers, coffee, cold suit upgrades, short segments</td>
      </tr>
      <tr>
        <td>Shallow underwater</td>
        <td>Oxygen + predators, temps often milder</td>
        <td>Oxygen plants in Twisty Bridges, Seatruck as mobile shelter</td>
      </tr>
      <tr>
        <td>Deep caves / lily roots</td>
        <td>Large predators, disorientation</td>
        <td>Flares or vehicle lights, pre-placed beacons only at real forks</td>
      </tr>
    </tbody>
  </table>
</div>

<img src="/images/guides/guide04-02.webp" alt="A screenshot of the Seatruck in Subnautica Below Zero." width="1200" height="630" loading="lazy" decoding="async" />

<h2>Seatruck: treat it like a train, not a Seamoth reskin</h2>
<p>
  The <strong>Seatruck</strong> connects <strong>modules</strong> (fabricator, storage, sleeper, aquarium, etc.) behind a cab.
  Depth upgrades matter the same way Seamoth modules did: if the HUD warns about hull integrity, stop and craft the next tier
  before you commit to a Lilypad or Crystal run.
</p>
<p>
  Detach the cab for tight caves when the full train won’t turn. Park the rear segment in a lit, creature-light pocket and
  scout with handheld tools or the <strong>Seaglide</strong>. Power is usually <strong>power cells</strong> in the cab—keep
  duplicates in storage modules so a long round trip does not strand you at 180 meters with red lights.
</p>
<div class="article-table-scroll">
  <table>
    <caption>Seatruck modules players most often chain first (names match in-game labels)</caption>
    <thead>
      <tr>
        <th scope="col">Module</th>
        <th scope="col">Why it matters</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Storage</td>
        <td>Spare cells, food, titanium buffer so cab trips do not abort early</td>
      </tr>
      <tr>
        <td>Fabricator</td>
        <td>Field repairs and mid-route battery crafting without surfacing to base</td>
      </tr>
      <tr>
        <td>Sleeper / Aquarium</td>
        <td>Long survey loops: skip time safely or grow fish snacks on the rail</td>
      </tr>
    </tbody>
  </table>
</div>

<h2>Biomes worth respecting on the first pass</h2>
<p>
  <strong>Twisty Bridges</strong> introduces oxygen from <strong>oxygen plants</strong>—learn their silhouette so you can
  extend exploration without racing to the surface every minute. <strong>Thermal spires</strong> reward you with vents for
  power and navigation cues but may host aggressive wildlife—scan from a distance first.
</p>
<p>
  <strong>Lilypad Islands</strong> mixes surface pads with underwater roots and large predators. Treat vertical transitions
  (surface ↔ roots) as separate dives: re-check oxygen every time you clip through the water line. <strong>Crystal Caves</strong>
  and the <strong>Fabricator Caverns</strong> route assume you brought food, medkits, and a clear exit plan; carry magnesium
  for flares or rely on vehicle headlights, but do not blind yourself staring at bioluminescent bait.
</p>
<p>
  Deep later-game areas include <strong>Shadow Leviathan</strong> territory. Audio cues are long-range: if you hear the
  wrong kind of echo in a narrow tunnel, back out to a Seatruck-wide chamber before you commit to a fight you cannot win with
  early tools.
</p>
<figure>
  <img src="/images/hero-01.jpg" alt="Contrasting warmer shallow reef image as a visual reminder of oxygen-rich zones" width="1200" height="630" loading="lazy" decoding="async" />
  <figcaption>Oxygen plants and lit Seatruck cabins both extend range—pick whichever is closer before you gamble on a blind tunnel.</figcaption>
</figure>
<div class="article-table-scroll">
  <table>
    <caption>Biome beats to memorize on your first map pass</caption>
    <thead>
      <tr>
        <th scope="col">Biome</th>
        <th scope="col">Teaching moment</th>
        <th scope="col">Gear check</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Twisty Bridges</td>
        <td>Oxygen plants extend horizontal range</td>
        <td>Seaglide + spare batteries</td>
      </tr>
      <tr>
        <td>Lilypad Islands</td>
        <td>Vertical surface ↔ roots transitions</td>
        <td>Seatruck depth upgrade before deep roots</td>
      </tr>
      <tr>
        <td>Crystal / Fabricator route</td>
        <td>Tight audio, predator pressure</td>
        <td>Medkits, food, clear retreat heading</td>
      </tr>
    </tbody>
  </table>
</div>

<h2>Surface toys: Snowfox and ice worms</h2>
<p>
  The <strong>Snowfox hoverbike</strong> uses dedicated tracks on some ice sheets. It is fast but fragile—treat jumps as
  optional stunts, not mandatory shortcuts. <strong>Ice Worms</strong> on certain surfaces punish sprinting in straight lines:
  weave, use rocks, or simply walk the long way with a thermal break halfway.
</p>

<h2>Story and Alterra without spoilers</h2>
<p>
  Robin’s plot ties into alien artifacts and Alterra politics. The game gates some blueprints behind story beats you can
  sequence at your own pace. If you feel underpowered, you are usually meant to <strong>scan</strong> more wrecks or return
  to a shallower biome for silver, gold, or magnetite before the next story ping.
</p>

<h2>Quality-of-life habits that save real hours</h2>
<ul>
  <li>Keep a labeled locker for “vehicle upgrade mats” vs “base cosmetics.”</li>
  <li>Before entering a new biome at night, surface craft food and replace batteries in daylight UI.</li>
  <li>Save manually before experimental depth pushes; Below Zero’s vertical caves punish one wrong grapple.</li>
</ul>
<p>
  Pair this guide with the site’s <strong>Below Zero map</strong> to pre-plan Seatruck tunnels and surface crossings—you
  will spend less time backtracking across ice bridges and more time listening to the excellent ambient audio design.
</p>
    `.trim(),
  },

  {
    id: 202,
    title: "Below Zero Creature Catalog: Navigation and Altitude Management Guide",
    description: "A complete visual and technical breakdown of every creature and Leviathan in the Arctic sector. This guide integrates essential altitude and depth meter data to help explorers navigate treacherous vertical biomes and predator territories.",
    tags: ["Subnautica Below Zero", "Leviathan Guide", "Creature Catalog", "Altitude Meter", "Navigation Survival", "Arctic Biomes"],
    publishDate: "2026-05-12",
    imageUrl: "/images/guides/guide05.webp",
    imageAlt: "Showcase of the Shadow Leviathan and various Arctic marine life in Subnautica Below Zero.",
    seo: {
      title: "Below Zero Bestiary: Altitude Meter Tips for Leviathan Encounters",
      description: "Master navigation in the Arctic depths. Our guide combines a full creature catalog with strategic altitude meter usage to avoid deadly Leviathan attacks.",
      keywords: "creature list, leviathan locations, altitude meter navigation, deep sea predators, arctic survival tips"
    },
    classify: 'game2',
    addressBar: "below-zero-creature-catalog-navigation-and-altitude-management-guide",
    detailsHtml: `
        <section>
            <h2>Mastering the Vertical Frontier: The Altitude & Depth Meter</h2>
            <p>In the unforgiving Arctic sector, your <strong>Altitude Meter</strong> is your primary survival tool. Unlike the first crater, survival here requires constant switching between sub-zero depths and high-altitude glacial peaks. Knowing your exact elevation can mean the difference between finding a sanctuary and wandering into a Leviathan's mouth.</p>
        </section>

        <img src="/images/guides/guide05-01.webp" alt="A screenshot of the Altitude Meter in Subnautica Below Zero." width="1200" height="630" loading="lazy" decoding="async" />

        <section>
            <h2>Apex Leviathans and Depth Thresholds</h2>
            <p>Every major predator in the sector operates within specific altitude and depth parameters. Understanding these "kill zones" on your meter is vital for safe transit.</p>
            
            <h3>1. Deep Trench Predators (High-Pressure Zones)</h3>
            <ul>
                <li><strong>Shadow Leviathan:</strong> Found in the Crystal Caves and Fabricator Caverns. These monsters patrol depths beyond -600 meters. Monitor your depth meter closely; once you pass the threshold of the red crystals, you are in their primary hunting grounds.</li>
                <li><strong>Cheliscerate:</strong> The "shrimp-like" terror of the open waters. It typically patrols mid-level depths (-50m to -200m). Use your verticality to hide among tight coral structures where its massive hitbox cannot follow.</li>
            </ul>

            <h3>2. Terrestrial and Surface Threats (High-Altitude Zones)</h3>
            <ul>
                <li><strong>Ice Worm:</strong> The master of the Arctic Spires. Your altitude meter is critical here. The Ice Worm senses vibrations through the permafrost; staying at high elevations on specialized platforms can occasionally offer brief respite from its tunneling strikes.</li>
                <li><strong>Snow Stalker:</strong> These agile predators dominate the rocky outcrops and caves above sea level. Always check your altitude—climbing higher doesn't always mean safety, as Snow Stalkers are excellent climbers.</li>
            </ul>
        </section>

        <img src="/images/guides/guide05-02.webp" alt="A screenshot of the Depth Meter in Subnautica Below Zero." width="1200" height="630" loading="lazy" decoding="async" />

        <section>
            <h2>Navigating Multilayered Biomes</h2>
            <p>The Arctic environment is highly vertical. Use your meter to distinguish between layers in complex biomes:</p>
            <table>
                <thead>
                    <tr>
                        <th>Biome Type</th>
                        <th>Navigation Focus</th>
                        <th>Key Lifeforms</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><b>Twisty Bridges</b></td>
                        <td>Vertical Depth (-50m to -400m)</td>
                        <td>Squidsharks, Brute Sharks, Ribbon Fish</td>
                    </tr>
                    <tr>
                        <td><b>Glacial Basin</b></td>
                        <td>Positive Altitude (0m to +150m)</td>
                        <td>Pengwings, Snow Stalkers, Skyrays</td>
                    </tr>
                    <tr>
                        <td><b>Lilypad Islands</b></td>
                        <td>Variable (Floating Biomes)</td>
                        <td>Glow Whales, Lily Paddlers, Sea Monkeys</td>
                    </tr>
                </tbody>
            </table>
        </section>

        <img src="/images/guides/guide05-03.webp" alt="A screenshot of the Multilayered Biomes in Subnautica Below Zero." width="1200" height="630" loading="lazy" decoding="async" />

        <section>
            <h2>Survival Tip: Meter Calibration and Threat Assessment</h2>
            <p>When diving near the <strong>World Edge</strong>, your meter will show a rapid drop-off. If you descend beyond -1000 meters in the void, <strong>Void Cheliscerates</strong> will spawn in trios. This is a hard-coded biological barrier; if your depth meter flashes red in the open ocean, ascend immediately.</p>
            <p>Conversely, in land-based exploration, use your altitude meter to find <strong>Thermal Lilies</strong>. These life-saving organisms are often clustered at specific elevations near steam vents, providing essential warmth during blizzards.</p>
        </section>

        <section>
            <h2>Conclusion</h2>
            <p>Whether you are tracking the majestic Glow Whales or evading the terrifying Shadow Leviathan, your position in the water column is everything. Keep one eye on the creature and the other on your <strong>Altitude Meter</strong> to ensure you stay within your vehicle's structural limits and outside of the predator's reach.</p>
        </section>
    `
},


  {
    id: 301,
    title: 'Subnautica 2 early access: co-op, saves, and what to expect',
    description:
      'What Unknown Worlds has publicly positioned for Subnautica 2—multiplayer, new vehicles, DNA-style progression, currents—and practical habits for squads during a long early access.',
    tags: ['Subnautica 2', 'Early access', 'Co-op'],
    publishDate: '2026-05-12',
    imageUrl: '/images/hero-02.jpg',
    imageAlt: 'Alien ocean horizon at dusk',
    classify: 'game3',
        seo: {
      title: 'Subnautica 2 early access guide for players and co-op squads',
      description:
        'Subnautica 2 EA tips: four-player co-op expectations, the Tadpole submersible, ocean currents, DNA-style upgrades, backups, performance, and how to read patch notes.',
      keywords:
        'Subnautica 2 guide, early access, co-op multiplayer, Tadpole submersible, Unknown Worlds, save backup, Game Pass, DNA upgrades',
    },
    addressBar: 'sn2-early-access-co-op-players-guide',
    detailsHtml: `
<h2>Scope check: early access means your build is a moving target</h2>
<p>
  <strong>Subnautica 2</strong> is being developed in public <strong>early access</strong> across PC and Xbox platforms (see
  your store page for the exact SKU you own). Features, balance, and even save compatibility can change when patches ship.
  Treat any third-party “leak” list as unverified—Unknown Worlds’ own patch notes and blog posts are the only sources that tell
  you whether your save is safe this week.
</p>
<figure>
  <img src="/images/hero-02.jpg" alt="Alien ocean horizon suggesting Subnautica 2 early access exploration mood" width="1200" height="630" loading="lazy" decoding="async" />
  <figcaption>Marketing art sets tone—your live build’s HUD, currents, and co-op UI are what matter day-to-day in early access.</figcaption>
</figure>

<h2>Co-op is a headline feature—plan the squad like a real dive team</h2>
<p>
  Official messaging describes <strong>online cooperative play</strong> for small groups alongside single-player. In
  practice that means shared world state: decide who owns <strong>hosting</strong>, whether friends can join mid-session,
  and how you share fabricator queues. Agree on a “loot etiquette” up front—Subnautica’s fun is scanning and building, not
  arguing over who drained the last lithium stack.
</p>
<ul>
  <li><strong>Roles:</strong> one player on mapping/navigation pings, one on power and base logistics, one on vehicle
    maintenance (cells, hull kits), one flex for story objectives.</li>
  <li><strong>Voice discipline:</strong> underwater games punish panic callouts; use short headings (“Reef, 120, leviathan
    audio”) instead of long stories during crises.</li>
  <li><strong>Session end:</strong> park vehicles in lit moonpools or safe caves so the next session does not start with a
    drifting Cyclops-sized problem—follow whatever vehicle rules your build actually supports.</li>
</ul>
<div class="article-table-scroll">
  <table>
    <caption>Suggested four-player responsibilities (rotate each session)</caption>
    <thead>
      <tr>
        <th scope="col">Role</th>
        <th scope="col">In-session job</th>
        <th scope="col">Carries</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Navigator</td>
        <td>Beacon colors, cardinal callouts, map pings</td>
        <td>Spare beacons, compass familiarity</td>
      </tr>
      <tr>
        <td>Quartermaster</td>
        <td>Fabricator queue, locker labels, recipe gaps</td>
        <td>Scroll of needed ores, empty inventory slots</td>
      </tr>
      <tr>
        <td>Engineer</td>
        <td>Vehicle cells, hull repairs, power spares</td>
        <td>Batteries, repair kits, spare power cells</td>
      </tr>
      <tr>
        <td>Scout</td>
        <td>First entry to new biomes, scan targets</td>
        <td>Flares, stasis if unlocked, medkits</td>
      </tr>
    </tbody>
  </table>
</div>

<h2>New traversal: Tadpole submersible and ocean currents</h2>
<p>
  Marketing and store copy highlight a compact <strong>Tadpole</strong>-style submersible built for the new world’s scale.
  Expect a different cadence than the Seamoth: tighter turns, different camera ergonomics, and upgrade trees that will
  expand across EA milestones. <strong>Ocean currents</strong> have been shown as a navigation wrinkle—when the HUD warns
  about drift, treat it like weather: adjust headings, hug terrain, and never burn the last 20% of power fighting the flow
  in open water.
</p>

<h2>DNA-style progression and experimentation</h2>
<p>
  Press materials reference <strong>DNA modification</strong> or hybrid upgrades as part of the survival fantasy. In early
  access builds this may arrive in phases: read each unlock’s tooltip carefully, duplicate saves before respec-like actions,
  and report softlocks through official channels so QA can repro with your build number attached.
</p>
<div class="article-table-scroll">
  <table>
    <caption>Patch-week checklist before you launch the game</caption>
    <thead>
      <tr>
        <th scope="col">Step</th>
        <th scope="col">Action</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>Copy saves / note folder path shown in patch notes</td>
      </tr>
      <tr>
        <td>2</td>
        <td>Read “known issues” + multiplayer sections first</td>
      </tr>
      <tr>
        <td>3</td>
        <td>Disable overclock experiments if you crash on shader compile</td>
      </tr>
      <tr>
        <td>4</td>
        <td>Launch solo once after big updates before loading co-op hosts</td>
      </tr>
    </tbody>
  </table>
</div>

<h2>Save hygiene (non-negotiable)</h2>
<ul>
  <li>Copy your save folder before major patches the day they drop.</li>
  <li>Keep one “clean” solo save if you mostly co-op—networking bugs are often host-specific.</li>
  <li>After shader compilation or first-boot updates, wait several minutes before force-quitting; UE-scale worlds can look hung
    while streaming compiles.</li>
</ul>

<h2>Performance checklist for PC players</h2>
<div class="article-table-scroll">
  <table>
    <caption>Tuning order when FPS tanks (try top to bottom)</caption>
    <thead>
      <tr>
        <th scope="col">Setting bucket</th>
        <th scope="col">Why it helps UE-scale oceans</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Install location</td>
        <td>NVMe SSD reduces streaming hitches vs spinning disks</td>
      </tr>
      <tr>
        <td>Frame cap</td>
        <td>Slightly below refresh reduces thermal throttling spikes</td>
      </tr>
      <tr>
        <td>Volumetrics / water</td>
        <td>Usually the most expensive transparent passes in storm scenes</td>
      </tr>
      <tr>
        <td>Shadow quality</td>
        <td>Dropping one tier often buys large margins on mid GPUs</td>
      </tr>
    </tbody>
  </table>
</div>
<p>
  UE5-era titles love fast storage. Install on an <strong>NVMe SSD</strong>, cap frame rates slightly below your monitor’s
  ceiling to reduce hitching, and lower volumetrics or water quality first if you GPU-bound in storms. Console and handheld
  SKUs have separate tuning pages—do not assume PC presets translate 1:1.
</p>

<h2>Mods, spoilers, and community health</h2>
<p>
  Mod support will mature over years of EA. Avoid random executables from chat; stick to the storefront’s workshop or
  official forums when they open for your platform. For story, Unknown Worlds framed Subnautica 2 as a <strong>new</strong>
  world—enjoy reveals in-game before reading wiki plot summaries, and mark spoiler channels in Discord so your squad stays
  aligned.
</p>

<h2>When this guide goes stale</h2>
<p>
  Re-read the top of your patch notes every update: if the text mentions <strong>save wipes</strong> or
  <strong>experimental branches</strong>, believe it. Early access is the bargain where you get to influence development
  through structured feedback—use official bug templates, attach logs, and celebrate when a patch fixes the crash that ate your
  Friday night base tour.
</p>
    `.trim(),
  },
]
