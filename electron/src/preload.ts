import {contextBridge, ipcRenderer} from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('$electronAPI', {
  ipcInvoke: (channel, params) => ipcRenderer.invoke(channel, params),
  on: (channel, listener) => ipcRenderer.on(channel, listener),
  off: (channel, listener) => ipcRenderer.off(channel, listener),
})
