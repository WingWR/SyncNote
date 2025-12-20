import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '../stores/user'
import { authRoutes } from './auth'
import { homeRoutes } from './home'

// 合并所有路由
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: import.meta.env.DEV ? '/home' : '/login'
  },
  ...authRoutes,
  ...homeRoutes
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  const isDev = import.meta.env.DEV
  const token = localStorage.getItem('token')

  // 开发环境跳过认证
  if (isDev) {
    if (to.path === '/login' && userStore.isAuthenticated) {
      next('/home')
    } else {
      next()
    }
    return
  }

  // 生产环境认证
  // 如果有token但用户状态还未恢复，允许访问需要认证的页面
  // main.ts中的异步恢复逻辑会处理用户状态
  if (to.meta.requiresAuth) {
    if (userStore.isAuthenticated || token) {
      next()
    } else {
      next('/login')
    }
  } else if (to.path === '/login' && userStore.isAuthenticated) {
    next('/home')
  } else {
    next()
  }
})

export default router
