import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

document.documentElement.classList.add('dark')

const pinia = createPinia()
setActivePinia(pinia)

const auth = useAuthStore()

await auth.bootstrap()

createApp(App).use(pinia).use(router).mount('#app')
