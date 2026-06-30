import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { Toaster } from 'vue-sonner'

import App from '@/App.vue'
import router from '@/router'
import '@/style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('AppToaster', Toaster)

app.mount('#app')
