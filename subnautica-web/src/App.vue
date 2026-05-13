<template>
  <div class="app-site" :class="{ 'app-site--map': isMapLayout }">
    <AppHeader />
    <main id="main-content" class="app-site__main" role="main">
      <RouterView />
    </main>
    <AppFooter v-if="!isMapLayout" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'

// 地图路由：主区域占满视口剩余空间，隐藏页脚以接近全屏地图体验
const route = useRoute()
const isMapLayout = computed(() => route.meta.layout === 'map')
</script>

<style scoped>
:global(#app) {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.app-site {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.app-site__main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.app-site--map .app-site__main {
  min-height: 0;
}
</style>
