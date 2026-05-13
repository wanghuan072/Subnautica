<template>
  <div class="map-route-page">
    <CaveDepthMapView :dataset="mapGenieDataset" class="map-route-page__map" />
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'
import { mapGenieDataset } from '@/data/mapgenie/index.js'

// 全屏（在顶栏之下）一代地图
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
