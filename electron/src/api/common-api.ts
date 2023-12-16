import {dialog, ipcMain, BrowserWindow} from 'electron'
import {getServerStatus, startServer, stopServer} from '../utils/server-manager'

// 打开系统的文件选择窗口
ipcMain.handle('open-file-dialog', async (event, config) => {
  const {
    filters = [], // [{name: '*.kdbx file', extensions: ['kdbx']}]
  } = config
  return await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
    properties: ['openFile'],
    filters: filters,
  })
})

// 切换Nest.js服务器启动/停止
ipcMain.handle('toggle-server', async (event, config) => {
  const {toggle = false, getStatusOnly = false} = config

  // 只获取服务器状态
  if (getStatusOnly) {
    return getServerStatus()
  }

  // 切换启停
  if (toggle) {
    await startServer()
  } else {
    await stopServer()
  }
  return getServerStatus()
})
