import {createRouter, createWebHistory} from 'vue-router'
import LoginView from '@/views/Home/LoginView.vue'

const constantRoutes = [
  {name: 'HomeView', path: '/', component: LoginView},
  {path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/PageNotFound.vue')},
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || ''),
  routes: constantRoutes,
})

export default router
