<template>
  <div class="map-route-page">
    <CaveDepthMapView :dataset="subnautica2MapGenieDataset" class="map-route-page__map" />
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'
import { subnautica2MapGenieDataset } from '@/data/mapgenie-sn2/index.js'

const CaveDepthMapView = defineAsyncComponent(() => import('@/components/CaveDepthMapView.vue'))
</script>

<style scoped>
.map-route-page {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.map-route-page__map {
  flex: 1;
  min-height: 0;
}
</style>
