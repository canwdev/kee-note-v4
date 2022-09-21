import {useContextMenu} from '@/hooks/use-context-menu'
import globalEventBus, {GlobalEvents, saveDatabaseAsync} from '@/utils/bus'
import {kService} from '@/api'
import {useRouter} from 'vue-router'

export const useCommonActions = (options) => {
  const router = useRouter()
  const {getEntryList, checkedRowKeys = ref([])} = options || {}
  const isShowGroupSelectModal = ref(false)
  const isShowPreviewModal = ref(false)

  const handleDeleteEntry = async (uuid: string) => {
    await kService.removeEntry({
      uuid: uuid,
    })
    await saveDatabaseAsync()
    await getEntryList()
    globalEventBus.emit(GlobalEvents.REFRESH_GROUP_TREE)
  }

  const getMenuOptions = (option) => [
    {
      label: '👁️ Preview',
      props: {
        onClick: () => {
          nodeAction(option, () => {
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
            query: {uuid: option.uuid},
          })
        },
      },
    },
    {
      label: '📁 Move to group',
      props: {
        onClick: () => {
          nodeAction(option, () => {
            isShowGroupSelectModal.value = true
          })
        },
      },
    },
    {
      label: '🚮 Delete Entry',
      props: {
        onClick: () => {
          const isMultiple = Boolean(checkedRowKeys.value.length)
          window.$dialog.warning({
            title: 'Confirm',
            content: `Delete ${
              isMultiple ? 'selected items' : 'item'
            }? If the item is in the recycle bin, it won't be deleted unless you clean the recycle bin.`,
            positiveText: 'OK',
            negativeText: 'Cancel',
            onPositiveClick: () => {
              handleDeleteEntry(isMultiple ? checkedRowKeys.value : option.uuid)
            },
            onNegativeClick: () => {},
          })
        },
      },
    },
  ]

  const {editingNode, nodeAction, handleContextmenu, ...contextMenuEtc} =
    useContextMenu(getMenuOptions)

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
