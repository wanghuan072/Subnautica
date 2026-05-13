<template>
  <div class="map-route-page">
    <CaveDepthMapView :dataset="belowZeroMapGenieDataset" class="map-route-page__map" />
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'
import { belowZeroMapGenieDataset } from '@/data/mapgenie-bz/index.js'

// 全屏（在顶栏之下）《零度之下》地图
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
