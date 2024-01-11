import {KdbxHelper} from '../common/keepass/kdbx'
import {ipcMain} from 'electron'

export const kdbxHelper = new KdbxHelper()

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
  {key: 'change-credentials', handler: (params) => kdbxHelper.changeCredentials(params)},
  {key: 'create-credential-key', handler: (params) => kdbxHelper.createCredentialKey(params)},
  {key: 'create-database', handler: (params) => kdbxHelper.createDatabase(params)},
  {key: 'save-database', handler: () => kdbxHelper.save()},
  {key: 'check-is-open', handler: () => kdbxHelper.isOpen},
  {key: 'check-is-changed', handler: () => kdbxHelper.isChanged},
  {key: 'get-meta', handler: () => kdbxHelper.getMeta()},
  {key: 'get-group-tree', handler: (params) => kdbxHelper.getGroupTree(params?.groupUuid)},
  {key: 'get-group-entries', handler: (params) => kdbxHelper.getGroupEntries(params?.groupUuid)},
  {key: 'get-group-entries-deep', handler: (params) => kdbxHelper.getGroupEntriesDeep(params)},
  {key: 'get-entry-detail', handler: (params) => kdbxHelper.getEntryDetail(params?.uuid)},
  {key: 'update-entry', handler: (params) => kdbxHelper.updateEntry(params)},
  {key: 'update-group', handler: (params) => kdbxHelper.updateGroup(params)},
  {key: 'create-entry', handler: (params) => kdbxHelper.createEntry(params)},
  {key: 'create-group', handler: (params) => kdbxHelper.createGroup(params)},
  {key: 'remove-group', handler: (params) => kdbxHelper.removeGroup(params)},
  {key: 'remove-entry', handler: (params) => kdbxHelper.removeEntry(params)},
  {key: 'move-group', handler: (params) => kdbxHelper.moveGroup(params)},
  {key: 'move-entry', handler: (params) => kdbxHelper.moveEntry(params)},
  {
    key: 'get-attachment',
    handler: (params) => {
      return kdbxHelper.getAttachment(params).value
    },
  },
  {key: 'remove-attachment', handler: (params) => kdbxHelper.removeAttachment(params)},
  {
    key: 'upload-attachment',
    handler: async (params) => {
      const {uuid, files} = params

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const {originalname, buffer} = file
        await kdbxHelper.setAttachment({
          uuid: uuid,
          filename: decodeURIComponent(originalname),
          buffer,
        })
      }
    },
  },
  {key: 'rename-attachment', handler: (params) => kdbxHelper.renameAttachment(params)},
]

apiList.forEach(({key, handler}) => {
  ipcMain.handle(key, (event, ...args) => {
    // @ts-ignore
    return handler(...args)
  })
})
