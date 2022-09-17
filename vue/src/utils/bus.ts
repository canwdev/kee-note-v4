// using ES6 modules
import mitt from 'mitt'

const globalEventBus = mitt()

export default globalEventBus

export const GlobalEvents = {
  SHOW_SETTINGS: 'SHOW_SETTINGS',
  SAVE_DATABASE: 'SAVE_DATABASE',
  UPDATE_MY_CRYPT_KEY: 'UPDATE_MY_CRYPT_KEY',
}

export const saveDatabaseAsync = () => {
  return new Promise((resolve, reject) => {
    globalEventBus.emit(GlobalEvents.SAVE_DATABASE, {resolve, reject})
  })
}
