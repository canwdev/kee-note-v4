import {dialog, ipcMain, BrowserWindow} from 'electron'

ipcMain.handle('open-file-dialog', async (event, config) => {
  const {
    filters = [], // [{name: '*.kdbx file', extensions: ['kdbx']}]
  } = config
  return await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
    properties: ['openFile'],
    filters: filters,
  })
})
