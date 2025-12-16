import Login from '../views/auth/LoginView.vue'

export const authRoutes = [
  {
    path: '/login',
    component: Login,
    meta: { requiresAuth: false }
  }
]
