import {createRouter, createWebHashHistory} from 'vue-router'
import LoginView from '@/views/Home/LoginView.vue'
import UnlockView from '@/views/Home/UnlockView.vue'
import {isElectron} from '@/utils/backend'
import {LsKeys} from '@/enum'

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
      if (!isElectron && !localStorage.getItem(LsKeys.LS_KEY_AUTHORIZATION)) {
        // reject the navigation
        return {name: 'HomeView'}
      }
    },
    children: [
      {
        name: 'NoteView',
        path: 'view',
        // redirect: '/note/view/list',
        redirect: (to) => {
          if (localStorage.getItem(LsKeys.LS_KEY_IS_CALENDAR_VIEW)) {
            return {name: 'NoteCalendarView'}
          }
          return {name: 'NoteListView'}
        },
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
  history: createWebHashHistory(import.meta.env.BASE_URL || ''),
  routes: constantRoutes,
})

export default router
