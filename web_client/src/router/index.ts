import { createRouter, createWebHistory } from 'vue-router'

import Homepage from '../view/Homepage.vue'

const routes = [
    {path: '/home', component: Homepage}
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})


export default router