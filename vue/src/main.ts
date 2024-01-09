import {createApp} from 'vue'
import 'normalize.css'
import './styles/base.scss'
import router from './router'
import App from './App.vue'
import {create} from 'naive-ui'
import {createPinia} from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// 全局设置moment地区语言
import moment from 'moment/moment'
import 'moment/min/locales'
const locale =
  navigator.languages && navigator.languages.length ? navigator.languages[0] : navigator.language
moment.locale(locale)

const naive = create()

const app = createApp(App)
app.use(naive)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)
app.mount('#app')
