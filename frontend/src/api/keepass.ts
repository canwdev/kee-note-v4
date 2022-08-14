import Service from '@/utils/service'
import {API_PROXY_BASE} from '@/enum'

const service = Service({
  baseURL: API_PROXY_BASE + '/keepass',
})

export const closeDatabase = (params: any) => {
  return service.post('close-database', params)
}
export const saveDatabase = (params: any) => {
  return service.post('save-database', params)
}
export const checkIsOpen = (params: any) => {
  return service.get('check-is-open', {params})
}
export const checkIsChanged = (params: any) => {
  return service.get('check-is-changed', {params})
}
export const getMeta = (params: any) => {
  return service.get('get-meta', {params})
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
