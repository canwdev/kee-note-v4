import {useContextMenu} from '@/hooks/use-context-menu'
import globalEventBus, {GlobalEvents, saveDatabaseAsync} from '@/utils/bus'
import {kService} from '@/api'
import {useRouter} from 'vue-router'
import {EntryItem} from '@/enum/kdbx'

export const useCommonActions = (options) => {
  const router = useRouter()
  const {getEntryList, checkedRowKeys = ref([])} = options || {}
  const isShowGroupSelectModal = ref(false)
  const isShowPreviewModal = ref(false)

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

  const getMenuOptions = (item: EntryItem, event?: MouseEvent) => {
    const isShiftPressed = event?.shiftKey

    return [
      {
        label: '👁️ Preview',
        props: {
          onClick: () => {
            nodeAction(item, () => {
              isShowPreviewModal.value = true
            })
          },
        },
      },
      {
        label: '✒️ Edit',
        props: {
          onClick: () => {
            router.push({
              name: 'NoteDetailView',
              query: {uuid: item.uuid},
            })
          },
        },
      },
      {
        label: '📁 Move to group',
        props: {
          onClick: () => {
            nodeAction(item, () => {
              isShowGroupSelectModal.value = true
            })
          },
        },
      },
      {
        label: isShiftPressed ? '❌ Permanent Delete' : '🚮 Remove to Trash',
        props: {
          onClick: () => {
            confirmRemoveEntry(item, isShiftPressed)
          },
        },
      },
    ]
  }

  const {editingNode, nodeAction, handleContextmenu, ...contextMenuEtc} =
    useContextMenu(getMenuOptions)

  const confirmRemoveEntry = (item, isDelete = false) => {
    const isMultiple = Boolean(checkedRowKeys.value.length)
    const itemText = isMultiple ? 'selected items' : 'item'
    window.$dialog.warning({
      title: 'Confirm',
      content: isDelete
        ? `Permanent delete ${itemText}?`
        : `Delete ${itemText}? (If the item is in the recycle bin, it won't be deleted unless you clean the recycle bin.)`,
      positiveText: 'OK',
      negativeText: 'Cancel',
      onPositiveClick: () => {
        handleDeleteEntry(isMultiple ? checkedRowKeys.value : item.uuid, isDelete)
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
      uuid: checkedRowKeys.value.length ? checkedRowKeys.value : editingNode.value.uuid,
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
