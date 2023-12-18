import {app} from 'electron'
import Store from 'electron-store'

import {isDev} from '../common/utils'

const name = `kee_note${isDev ? '_dev' : ''}`
export const electronStore = new Store({
  name: name,
  cwd: app.getPath('userData'),
})
