import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

import Homepage from '../views/Homepage.vue'
import DocumentEditor from '../views/DocumentEditor.vue'
import Login from '../views/Login.vue'
import EditorTest from '../views/EditorTest.vue'
import Sidebar from '../components/sidebar/Sidebar.vue'

const routes = [
  {
    path: '/',
    redirect: import.meta.env.DEV ? '/home' : '/login'
  },
  {
    path: '/login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    component: Sidebar,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        component: Homepage
      },
      {
        path: 'document/:id',
        name: 'DocumentEditor',
        component: DocumentEditor,
        props: true
      },
      {
        path: 'editor-test',
        name: 'EditorTest',
        component: EditorTest
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  const isDev = import.meta.env.DEV
  
  // 开发环境：跳过认证检查
  if (isDev) {
    // 如果访问登录页且已登录，重定向到home
    if (to.path === '/login' && userStore.isAuthenticated) {
      next('/home')
    } else {
      next()
    }
    return
  }
  
  // 生产环境：正常认证检查
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && userStore.isAuthenticated) {
    next('/home')
  } else {
    next()
  }
})

export default router