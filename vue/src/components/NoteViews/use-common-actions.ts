import {useContextMenu} from '@/hooks/use-context-menu'
import globalEventBus, {GlobalEvents, saveDatabaseAsync} from '@/utils/bus'
import {kService} from '@/api'

export const useCommonActions = (getEntryList) => {
  const showGroupSelectModal = ref(false)

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
      label: '📁 Move to group',
      props: {
        onClick: () => {
          nodeAction(option, () => {
            showGroupSelectModal.value = true
          })
        },
      },
    },
    {
      label: '🚮 Delete Entry',
      props: {
        onClick: () => {
          window.$dialog.warning({
            title: 'Confirm',
            content:
              "Delete selected items? If the item is in the recycle bin, it won't be deleted unless you clean the recycle bin.",
            positiveText: 'OK',
            negativeText: 'Cancel',
            onPositiveClick: () => {
              handleDeleteEntry(option.uuid)
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
    if (!editingNode.value) {
      return
    }
    await kService.moveEntry({
      groupUuid: groupUuid,
      uuid: editingNode.value.uuid,
    })

    await saveDatabaseAsync()
    await getEntryList()
    editingNode.value = null
  }

  return {
    editingNode,
    nodeAction,
    handleContextmenu,
    showGroupSelectModal,
    handleSelectGroup,
    getMenuOptions,
    ...contextMenuEtc,
  }
}
