import {contextBridge, dialog, ipcRenderer} from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('$electronAPI', {
  ipcInvoke: (key, params) => ipcRenderer.invoke(key, params),
  openFileChooser: (key, params) => ipcRenderer.invoke(key, params),
})
