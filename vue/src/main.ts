import {createApp} from 'vue'
import 'normalize.css'
import './styles/base.scss'
import router from './router'
import App from './App.vue'
import {create} from 'naive-ui'
import {createPinia} from 'pinia'

const naive = create()

const app = createApp(App)
app.use(naive)
app.use(createPinia())
app.use(router)
app.mount('#app')
