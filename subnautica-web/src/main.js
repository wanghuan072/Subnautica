import '@fontsource/oxanium/500.css'
import '@fontsource/oxanium/600.css'
import '@fontsource/oxanium/700.css'
import '@fontsource/noto-sans/400.css'
import '@fontsource/noto-sans/500.css'
import '@fontsource/noto-sans/600.css'
import '@fontsource/noto-sans/700.css'
import './styles/global.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
