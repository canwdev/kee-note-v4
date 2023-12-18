import service, {isElectron} from '../utils/backend'

export const openDatabase = (params?: any) => {
  return service.post('open-database', params)
}
export const closeDatabase = () => {
  return service.post('close-database')
}
export const saveDatabase = () => {
  return service.post('save-database')
}
export const checkIsOpen = () => {
  return service.post('check-is-open')
}
export const checkIsChanged = () => {
  return service.post('check-is-changed')
}
export const getMeta = () => {
  return service.post('get-meta')
}
export const getGroupTree = (params?: any) => {
  return service.post('get-group-tree', params)
}
export const getGroupEntries = (params: any) => {
  return service.post('get-group-entries', params)
}
export const getGroupEntriesDeep = (params: any) => {
  return service.post('get-group-entries-deep', params)
}
export const getEntryDetail = (params: any) => {
  return service.post('get-entry-detail', params)
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
export const getAttachment = (params: any) => {
  return service.post('get-attachment', params, {
    responseType: 'blob',
  })
}
export const removeAttachment = (params: any) => {
  return service.post('remove-attachment', params)
}

function readAsArrayBufferSync(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export const uploadAttachment = async (uuid: string, files: File[]) => {
  if (isElectron) {
    const filesData: any = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      filesData.push({
        originalname: encodeURIComponent(file.name),
        buffer: await readAsArrayBufferSync(file),
      })
    }

    service.post('upload-attachment', {
      uuid,
      files: filesData,
    })
  } else {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file, encodeURIComponent(file.name))
    })
    return service.post('upload-attachment', formData, {
      params: {
        uuid,
      },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }
}
export const renameAttachment = (params: any) => {
  return service.post('rename-attachment', params)
}

/* ----- electron common api ----- */

export const electronOpenFileDialog = (params: any) => {
  return service.post('open-file-dialog', params)
}

export const electronToggleServer = (params: any) => {
  return service.post('toggle-server', params)
}

export const electronOpenLink = (params: any) => {
  return service.post('open-link', params)
}
