import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './style.css'
import router from './router'
import App from './App.vue'
import { useUserStore } from './stores/user'
import { getCurrentUser } from './api/user'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化用户状态（如果有token）
const token = localStorage.getItem('token')
if (token) {
  const userStore = useUserStore()
  getCurrentUser()
    .then(resp => {
      if (resp && resp.code === 200) {
        userStore.setUser(resp.data)
      } else {
        localStorage.removeItem('token')
      }
    })
    .catch(() => {
      localStorage.removeItem('token')
    })
}

app.mount('#app')
