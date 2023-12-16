import {bootstrapNestjs} from '../nest/main'
import {electronStore} from './store'

let app = null
// 服务器启动日志
let logMessage = ''

export const startServer = async () => {
  if (app) {
    console.log('Server already running.')
    return
  }
  const res = await bootstrapNestjs()
  app = res.app
  logMessage = res.logMessage

  electronStore.set('server_auto_start', true)
}

export const stopServer = async () => {
  if (app) {
    await app.close()
    app = null
    console.log('Server stopped.')
  }
  electronStore.set('server_auto_start', false)
}

export const getServerStatus = () => {
  return {
    // 服务器是否在运行
    running: !!app,
    logMessage,
  }
}

const init = async () => {
  const isAutoStart = electronStore.get('server_auto_start') || false
  if (isAutoStart) {
    console.log('Server auto start.')
    await startServer()
  }
}
init()
