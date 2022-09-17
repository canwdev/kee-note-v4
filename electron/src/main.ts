import {app, BrowserWindow} from 'electron'
import * as path from 'path'
import Store from 'electron-store'
import {kdbxHelper} from './api/keepass-api'
import './api/common-api'

const store = new Store()

function createWindow() {
  const winBounds: any = store.get('winBounds') || {}

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    ...winBounds,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  mainWindow.setMenuBarVisibility(false)

  // and load the index.html of the app.
  // mainWindow.loadFile(path.join(__dirname, '../index.html'))
  mainWindow.loadURL('http://127.0.0.1:5173/')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // 退出前询问
  mainWindow.on('close', (e) => {
    store.set('winBounds', mainWindow.getBounds())
    if (kdbxHelper.isChanged) {
      e.preventDefault() // Prevents the window from closing
      mainWindow.webContents.send('IPC_APP_CLOSING')
    }
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    if (kdbxHelper) {
      kdbxHelper.close()
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
