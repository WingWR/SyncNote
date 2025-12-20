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
  console.log('Found token, attempting to restore user session...')
  const userStore = useUserStore()
  getCurrentUser()
    .then(resp => {
      console.log('getCurrentUser response:', resp)
      if (resp && resp.code === 200) {
        console.log('User session restored successfully')
        userStore.setUser(resp.data)
      } else {
        console.log('Failed to restore user session, removing token')
        localStorage.removeItem('token')
      }
    })
    .catch((error) => {
      console.log('Error restoring user session:', error)
      localStorage.removeItem('token')
    })
} else {
  console.log('No token found, user not logged in')
}

app.mount('#app')
