import {useContextMenu} from '@/hooks/use-context-menu'
import globalEventBus, {GlobalEvents, saveDatabaseAsync} from '@/utils/bus'
import {kService} from '@/api'
import {useRoute, useRouter} from 'vue-router'
import {EntryItem} from '@/enum/kdbx'
import {useKeeStore} from '@/store/kee-store'

import {aLinkDownload, exportEntryListJson} from '@/utils/export-import'
import {formatDate} from '@/utils'
import moment from 'moment/moment'

export const useCommonActions = (options) => {
  const router = useRouter()
  const route = useRoute()
  const keeStore = useKeeStore()
  const {getEntryList, checkedRowKeys = ref([])} = options || {}
  const isShowGroupSelectModal = ref(false)
  const isShowPreviewModal = ref(false)

  const groupUuid = computed(() => {
    return route.query.groupUuid
  })

  const handleDeleteEntry = async (uuid: string, isDelete = false) => {
    if (isDelete) {
      await kService.moveEntry({
        uuid: uuid,
        groupUuid: null,
      })
    } else {
      await kService.removeEntry({
        uuid: uuid,
      })
    }
    await saveDatabaseAsync()
    await getEntryList()
    globalEventBus.emit(GlobalEvents.REFRESH_GROUP_TREE)
  }

  const handleExportJson = async () => {
    await exportEntryListJson(checkedRowKeys.value)
  }

  const getMenuOptions = (item: EntryItem | any) => {
    const isMultiple = Boolean(checkedRowKeys.value.length)
    const isInRecycleBin = keeStore.recycleBinUuid === groupUuid.value

    const handleCreateEntry = async (date: Date) => {
      const entry = await kService.createEntry({
        groupUuid: route.query.groupUuid,
        config: {
          title: formatDate(date),
          creationTime: date.getTime(),
        },
      })
      await saveDatabaseAsync()

      keeStore.detailUuid = entry.uuid
      globalEventBus.emit(GlobalEvents.REFRESH_ENTRY_LIST)
    }

    // 如果在日期上点击右键，则显示创建按钮，item.day 是moment日期类型
    if (item && item.day) {
      return [
        {
          label: '🗒️ Create Note',
          props: {
            onClick: async () => {
              let d: Date
              if (item.day.isSame(moment(), 'day')) {
                d = new Date()
              } else {
                d = item.day.toDate()
              }
              await handleCreateEntry(d)
            },
          },
        },
      ]
    }

    return [
      !isMultiple && {
        label: '🔰 Preview',
        props: {
          onClick: () => {
            nodeAction(item, () => {
              isShowPreviewModal.value = true
            })
          },
        },
      },
      !isMultiple && {
        label: '✒️ Edit',
        props: {
          onClick: () => {
            keeStore.detailUuid = item.uuid
          },
        },
      },
      isMultiple && {
        label: '📃 Export JSON (no attachments)',
        props: {
          onClick: () => {
            handleExportJson()
          },
        },
      },
      {
        label: '📁 Move to group...',
        props: {
          onClick: () => {
            nodeAction(item, () => {
              isShowGroupSelectModal.value = true
            })
          },
        },
      },
      isInRecycleBin
        ? {
            label: '❌ Permanent Delete',
            props: {
              onClick: () => {
                confirmRemoveEntry(item, true)
              },
            },
          }
        : {
            label: '🚮 Move to Recycle Bin',
            props: {
              onClick: () => {
                confirmRemoveEntry(item, false)
              },
            },
          },
    ].filter(Boolean)
  }

  const {editingNode, nodeAction, handleContextmenu, ...contextMenuEtc} =
    useContextMenu(getMenuOptions)

  const confirmRemoveEntry = (item, isDelete = false) => {
    const isMultiple = Boolean(checkedRowKeys.value.length)
    window.$dialog[isDelete ? 'warning' : 'info']({
      title: isDelete ? 'Warning!!' : 'Confirm',
      content: isDelete
        ? `Permanent delete item(s)? (This can not be undo)`
        : `Move item(s) to recycle bin?`,
      positiveText: 'OK',
      negativeText: 'Cancel',
      onPositiveClick: () => {
        handleDeleteEntry(isMultiple ? [...checkedRowKeys.value] : item.uuid, isDelete)
      },
      onNegativeClick: () => {},
    })
  }

  const handleSelectGroup = async (groupUuid: string) => {
    // console.log(groupUuid)
    if (!editingNode.value && !checkedRowKeys.value.length) {
      console.warn('no entry selected', checkedRowKeys)
      return
    }
    await kService.moveEntry({
      groupUuid: groupUuid,
      uuid: checkedRowKeys.value.length ? [...checkedRowKeys.value] : editingNode.value.uuid,
    })

    await saveDatabaseAsync()
    await getEntryList()
    editingNode.value = null
  }

  return {
    editingNode,
    nodeAction,
    handleContextmenu,
    isShowGroupSelectModal,
    isShowPreviewModal,
    handleSelectGroup,
    getMenuOptions,
    ...contextMenuEtc,
  }
}
