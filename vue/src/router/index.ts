import {createRouter, createWebHistory} from 'vue-router'
import LoginView from '@/views/Home/LoginView.vue'
import UnlockView from '@/views/Home/UnlockView.vue'
import {LS_KEY_AUTHORIZATION} from '@/enum'
import {isElectron} from '@/utils/backend'

const constantRoutes = [
  {
    name: 'HomeView',
    path: '/',
    component: isElectron ? UnlockView : LoginView,
  },
  {
    name: 'NoteRoot',
    path: '/note',
    redirect: '/note/view/list',
    beforeEnter: () => {
      if (!isElectron && !localStorage.getItem(LS_KEY_AUTHORIZATION)) {
        // reject the navigation
        return {name: 'HomeView'}
      }
    },
    children: [
      {
        name: 'NoteView',
        path: 'view',
        redirect: '/note/view/list',
        component: () => import('@/components/NoteLayout/index.vue'),
        children: [
          {
            name: 'NoteListView',
            path: 'list',
            component: () => import('@/views/Note/ListView.vue'),
          },
          {
            name: 'NoteCalendarView',
            path: 'calendar',
            component: () => import('@/views/Note/CalendarView.vue'),
          },
        ],
        meta: {
          keepAlive: true,
        },
      },
      {
        name: 'NoteDetailView',
        path: 'detail',
        component: () => import('@/views/Note/DetailView.vue'),
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
