import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import {create} from 'naive-ui'
import {createPinia} from 'pinia'

const naive = create()

const app = createApp(App)
app.use(naive)
app.use(createPinia())
app.mount('#app')
