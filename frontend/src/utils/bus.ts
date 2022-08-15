// using ES6 modules
import mitt from 'mitt'

const globalEventBus = mitt()

export default globalEventBus

export const GlobalEvents = {
  SHOW_SETTINGS: 'SHOW_SETTINGS',
}
