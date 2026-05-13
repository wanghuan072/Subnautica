<template>
  <div class="map-sn2-page">
    <section class="map-sn2-section" aria-labelledby="map-sn2-heading">
      <div class="container">
        <div class="map-sn2-content">
          <h1 id="map-sn2-heading">Subnautica 2 Map</h1>
          <p>
            A public interactive map for Subnautica 2 is not wired into this build yet. When Unknown Worlds
            Entertainment publishes enough stable world reference material, this route will host the same style
            of pan–zoom atlas used for the first game and for Below Zero.
          </p>
          <p>
            For now you can open the
            <RouterLink to="/maps/subnautica">Subnautica map</RouterLink>
            or the
            <RouterLink to="/maps/subnautica-below-zero">Below Zero map</RouterLink>
            from the home hero, or return to the
            <RouterLink to="/">home page</RouterLink>.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// 《深海迷航 2》地图占位说明（不编造数据源或上线日期）
</script>

<style scoped>
.map-sn2-page {
  flex: 1;
  padding-block: clamp(2rem, 5vw, 3.5rem);
}

.map-sn2-content {
  max-width: 720px;
}

.map-sn2-content h1 {
  margin-bottom: 0.75em;
}
</style>
