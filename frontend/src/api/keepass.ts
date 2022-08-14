import Service from '@/utils/service'
import {API_PROXY_BASE} from '@/enum'

const service = Service({
  baseURL: API_PROXY_BASE + '/keepass',
})

export const closeDatabase = () => {
  return service.post('close-database')
}
export const saveDatabase = () => {
  return service.post('save-database')
}
export const checkIsOpen = () => {
  return service.get('check-is-open')
}
export const checkIsChanged = () => {
  return service.get('check-is-changed')
}
export const getMeta = () => {
  return service.get('get-meta')
}
export const getGroupTree = (params?: any) => {
  return service.get('get-group-tree', {params})
}
export const getGroupEntries = (params: any) => {
  return service.get('get-group-entries', {params})
}
export const getEntryDetail = (params: any) => {
  return service.get('get-entry-detail', {params})
}
export const updateEntry = (params: any) => {
  return service.post('update-entry', params)
}
export const updateGroup = (params: any) => {
  return service.post('update-group', params)
}
export const createEntry = (params: any) => {
  return service.post('create-entry', params)
}
export const createGroup = (params: any) => {
  return service.post('create-group', params)
}
export const removeGroup = (params: any) => {
  return service.post('remove-group', params)
}
export const removeEntry = (params: any) => {
  return service.post('remove-entry', params)
}
export const moveGroup = (params: any) => {
  return service.post('move-group', params)
}
export const moveEntry = (params: any) => {
  return service.post('move-entry', params)
}
