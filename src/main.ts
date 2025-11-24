import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import './style.css'
import App from './App.vue'

const pinia = createPinia()
pinia.use(createPersistedState())

createApp(App).use(pinia).mount('#app')
