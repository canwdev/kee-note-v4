import Service from '../service'
import electronService from './electron'
import {API_PROXY_BASE} from '@/enum'

export const isElectron = '$electronAPI' in window

let service
if (isElectron) {
  service = electronService
} else {
  service = Service({
    baseURL: API_PROXY_BASE + '/keepass',
  })
}

export default service
