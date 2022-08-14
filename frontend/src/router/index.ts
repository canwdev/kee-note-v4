import {createRouter, createWebHistory} from 'vue-router'
import LoginView from '@/views/Home/LoginView.vue'
import {LS_KEY_AUTHORIZATION} from '@/enum'

const constantRoutes = [
  {name: 'HomeView', path: '/', component: LoginView},
  {
    name: 'NoteView',
    path: '/note',
    redirect: '/note/list',
    component: () => import('@/components/NoteLayout/index.vue'),
    beforeEnter: () => {
      if (!localStorage.getItem(LS_KEY_AUTHORIZATION)) {
        // reject the navigation
        return {name: 'HomeView'}
      }
    },
    children: [
      {
        name: 'NoteListView',
        path: 'list',
        component: () => import('@/views/Note/ListView.vue'),
      },
    ],
  },
  {path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/PageNotFound.vue')},
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || ''),
  routes: constantRoutes,
})

export default router
