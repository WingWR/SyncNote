import { createApp } from 'vue'

import router from './router'

import App from './App.vue'

const syncnote_app = createApp(App)
syncnote_app.use(router)
syncnote_app.mount('#app')
