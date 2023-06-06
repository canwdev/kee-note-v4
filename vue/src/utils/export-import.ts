import {kService} from '@/api'
import {EntryItem} from '@/enum/kdbx'
import globalEventBus, {GlobalEvents, saveDatabaseAsync} from '@/utils/bus'

export const aLinkDownload = (src: string, name?) => {
  try {
    if ('download' in document.createElement('a')) {
      const a = document.createElement('a')
      if (name) a.download = name
      a.style.display = 'none'
      a.href = src
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(a.href) // 释放URL 对象
      document.body.removeChild(a)
    } else {
      const elemIF = document.createElement('iframe')
      elemIF.src = src
      elemIF.style.display = 'none'
      document.body.appendChild(elemIF)
    }
  } catch (e) {
    console.error(e)
    window.open(src)
  }
}
export const handleReadSelectedFile = (file, parseJson = false) => {
  // console.log(file)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        let val = reader.result
        if (parseJson && typeof val === 'string') {
          val = JSON.parse(val)
        }
        resolve(val)
      } catch (error: any) {
        reject(error)
        window.$message.error('Import failed! ' + error.message)
      }
    }
    reader.readAsText(file)
  })
}

type FieldsUpdatesType = {
  path: string
  value: string
}

export const getEntryItemUpdateParams = ({uuid, entryDetail, isSetModTime = false}) => {
  // generate update params
  const fieldsUpdates: FieldsUpdatesType[] = []
  for (const key in entryDetail.fieldsV2) {
    fieldsUpdates.push({path: `fields.${key}`, value: entryDetail.fieldsV2[key]})
  }

  return {
    uuid: uuid,
    updates: [
      ...fieldsUpdates,
      {path: 'fgColor', value: entryDetail.fgColor},
      {path: 'bgColor', value: entryDetail.bgColor},
      {path: 'icon', value: entryDetail.icon},
      {path: 'times.creationTime', value: entryDetail.creationTime},
      isSetModTime && {path: 'times.lastModTime', value: entryDetail.lastModTime},
    ].filter(Boolean),
  }
}

export const exportEntryListJson = async (uuids) => {
  const details: EntryItem[] = []
  for (let i = 0; i < uuids.length; i++) {
    const uuid = uuids[i]
    details.push(await kService.getEntryDetail({uuid}))
  }
  const contentStr = JSON.stringify(details, null, 2)

  const blob = new Blob([contentStr], {
    type: 'text/plain;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  aLinkDownload(url, `KeeNote_Export_${Date.now()}.json`)
  window.$message.success('Export success!')
}

export const importEntryListJson = async (groupUuid) => {
  // @ts-ignore
  const [handle] = await window.showOpenFilePicker({
    types: [
      {
        description: 'JSON',
        accept: {
          'application/JSON': ['.json'],
        },
      },
    ],
  })
  const file = await handle.getFile()

  const entryItems: EntryItem[] = (await handleReadSelectedFile(file, true)) as EntryItem[]

  entryItems.reverse()

  console.log('[entryItems]', entryItems)
  for (let i = 0; i < entryItems.length; i++) {
    const entryDetail = entryItems[i]
    const item = await kService.createEntry({
      groupUuid: groupUuid,
      config: {title: entryDetail.title},
    })

    const params = getEntryItemUpdateParams({
      uuid: item.uuid,
      entryDetail,
      isSetModTime: true,
    })

    await kService.updateEntry(params)
  }
  await saveDatabaseAsync()
  globalEventBus.emit(GlobalEvents.REFRESH_ENTRY_LIST)
  window.$message.success('Import success!')
}
