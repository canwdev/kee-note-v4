import {app} from 'electron'
import Store from 'electron-store'
import {isDev} from './index'

const name = `kee_note${isDev ? '_dev' : ''}`
export const electronStore = new Store({
  name: name,
  cwd: app.getPath('userData'),
})
