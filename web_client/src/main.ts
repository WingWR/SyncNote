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

// 开发环境：自动登录测试用户（跳过登录）
const isDev = import.meta.env.DEV
if (isDev) {
  const userStore = useUserStore()
  // 创建测试用户
  const testUser = {
    id: '1',
    username: '测试用户',
    email: 'test@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
    createdAt: new Date().toISOString()
  }
  userStore.setUser(testUser)
  // 设置测试token
  localStorage.setItem('token', 'dev-test-token')
}

// 初始化用户状态（如果有token）
const token = localStorage.getItem('token')
if (token && !isDev) {
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
