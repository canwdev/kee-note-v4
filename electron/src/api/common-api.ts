import {dialog, ipcMain, BrowserWindow, shell} from 'electron'
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

// 打开系统的文件保存窗口
ipcMain.handle('open-save-dialog', async (event, config) => {
  // get save filename
  const {filters = [], defaultPath = ''} = config
  return await dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
    defaultPath,
    filters,
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

// 使用系统浏览器打开链接
ipcMain.handle('open-link', async (event, config) => {
  const {url = ''} = config
  shell.openExternal(url)
})
