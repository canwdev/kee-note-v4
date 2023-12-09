import {createRouter, createWebHashHistory} from 'vue-router'
import LoginView from '@/views/Home/LoginView.vue'
import UnlockView from '@/views/Home/UnlockView.vue'
import {isElectron} from '@/utils/backend'
import {LsKeys} from '@/enum'
import pkg from '../../package.json'

const constantRoutes = [
  {
    name: 'HomeView',
    path: '/',
    component: isElectron ? UnlockView : LoginView,
  },
  {
    name: 'EnvGenerator',
    path: '/gen',
    component: () => import('@/views/EnvGenerator.vue'),
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
        component: () => import('@/views/Note/NoteBaseView.vue'),
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

router.afterEach((to, _, failure) => {
  document.title = (to?.meta?.title as string) || `KeeNote v${pkg.version}`
})

export default router
