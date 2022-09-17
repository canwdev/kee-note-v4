import {KdbxHelper} from '../common/keepass/kdbx'
import {ipcMain} from 'electron'

export const kdbxHelper = new KdbxHelper()
const apiPrefix = 'ipc-kdbx/'

const apiList = [
  {key: 'test-ok', handler: () => 'ok'},
  {
    key: 'test-error',
    handler: () => {
      throw new Error('test-error')
    },
  },
  {key: 'open-database', handler: (params) => kdbxHelper.open(params)},
  {key: 'close-database', handler: () => kdbxHelper.close()},
  {key: 'save-database', handler: () => kdbxHelper.save()},
  {key: 'check-is-open', handler: () => kdbxHelper.isOpen},
  {key: 'check-is-changed', handler: () => kdbxHelper.isChanged},
  {key: 'get-meta', handler: () => kdbxHelper.getMeta()},
  {key: 'get-group-tree', handler: (params) => kdbxHelper.getGroupTree(params?.groupUuid)},
  {key: 'get-group-entries', handler: (params) => kdbxHelper.getGroupEntries(params?.groupUuid)},
  {key: 'get-entry-detail', handler: (params) => kdbxHelper.getEntryDetail(params?.uuid)},
  {key: 'update-entry', handler: (params) => kdbxHelper.updateEntry(params)},
  {key: 'update-group', handler: (params) => kdbxHelper.updateGroup(params)},
  {key: 'create-entry', handler: (params) => kdbxHelper.createEntry(params)},
  {key: 'remove-group', handler: (params) => kdbxHelper.removeGroup(params)},
  {key: 'remove-entry', handler: (params) => kdbxHelper.removeEntry(params)},
  {key: 'move-group', handler: (params) => kdbxHelper.moveGroup(params)},
  {key: 'move-entry', handler: (params) => kdbxHelper.moveEntry(params)},
]

apiList.forEach(({key, handler}) => {
  ipcMain.handle(apiPrefix + key, (event, ...args) => {
    // @ts-ignore
    return handler(...args)
  })
})

ipcMain.handle('getAvailableApi', () => apiList.map(({key}) => apiPrefix + key))
