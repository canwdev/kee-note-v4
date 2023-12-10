// using ES6 modules
import mitt from 'mitt'

const globalEventBus = mitt()

export default globalEventBus

export const GlobalEvents = {
  SHOW_SETTINGS: 'SHOW_SETTINGS',
  SAVE_DATABASE: 'SAVE_DATABASE',
  REFRESH_GROUP_TREE: 'REFRESH_GROUP',
  REFRESH_ENTRY_LIST: 'REFRESH_ENTRY_LIST',
}

export const saveDatabaseAsync = () => {
  return new Promise((resolve, reject) => {
    globalEventBus.emit(GlobalEvents.SAVE_DATABASE, {resolve, reject})
  })
}
