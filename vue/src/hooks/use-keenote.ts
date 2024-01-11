import {useRoute, useRouter} from 'vue-router'
import {useKeeStore} from '@/store/kee-store'
import {EntryItem, GroupItem} from '@/enum/kdbx'
import {kService} from '@/api'
import globalEventBus, {GlobalEvents, saveDatabaseAsync} from '@/utils/bus'
import {HistoryListItem} from '@/enum/settings'
import {useSettingsStore} from '@/store/settings'
import {isElectron} from '@/utils/backend'
import {showInputPrompt} from '@/components/CommonUI/input-prompt'
import {formatDate} from '@/utils'
import {TreeDropInfo} from 'naive-ui'

export interface CalendarData {
  // year
  [key: string]: {
    // month
    [key: string]: {
      // date
      [key: string]: EntryItem[]
    }
  }
}

export const useKeeNoteGroupManage = (editingNode: Ref<GroupItem | null>) => {
  const keeStore = useKeeStore()
  const settingsStore = useSettingsStore()

  const groupTree = ref<GroupItem[]>([])

  const route = useRoute()
  const router = useRouter()

  const groupUuid = computed(() => {
    return route.query.groupUuid
  })

  const rootGroupUuid = computed(() => {
    return groupTree.value[0]?.uuid
  })

  const editingUuid = computed(() => {
    return editingNode.value ? editingNode.value.uuid : groupUuid.value
  })

  const selectedKeys = computed({
    get(): string[] {
      if (!groupUuid.value) {
        return []
      }
      return [String(groupUuid.value)]
    },
    set(val: string[]) {
      if (!val) {
        val = []
      }

      const groupUuid = val[0]

      // 如果开启了历史记录，就设置lastGroupUuid
      if (groupUuid && settingsStore.isSaveHistory && settingsStore.lastOpenedHistoryItem) {
        const {dbPath} = settingsStore.lastOpenedHistoryItem

        // 查找，更新并替换历史记录
        const list: HistoryListItem[] = [...settingsStore.historyList]
        const idx = list.findIndex((item: any) => item.dbPath === dbPath)
        if (idx > -1) {
          const item: HistoryListItem = {
            ...settingsStore.historyList[idx],
            lastGroupUuid: groupUuid,
          }
          list.splice(idx, 1, item)
          console.log('set groupUuid', groupUuid)
          settingsStore.historyList = list
        }
      }

      router.replace({
        query: {
          ...route.query,
          groupUuid,
        },
      })
    },
  })

  const getGroupTree = async () => {
    const info = await kService.getMeta()
    keeStore.dbInfo = info

    groupTree.value = await kService.getGroupTree()

    if (!selectedKeys.value.length && groupTree.value.length) {
      selectedKeys.value = [groupTree.value[0].uuid]
    }
  }

  const handleTreeDrop = async ({node, dragNode, dropPosition}: TreeDropInfo) => {
    const {uuid} = dragNode
    const {uuid: targetUuid} = node

    await kService.moveGroup({
      uuid,
      targetUuid,
    })
    await saveDatabaseAsync()
    await getGroupTree()
  }

  const showOpenDbModal = async () => {
    const password = await showInputPrompt({
      title: 'Unlock Database',
      placeholder: 'Database password',
      value: '',
      type: 'password',
      allowEmpty: true,
    })
    await handleOpenDatabase(password)
  }

  const handleOpenDatabase = async (password?) => {
    if (keeStore.isDbOpened) {
      window.$message.info('Database already opened')

      return
    } else if (isElectron) {
      await router.replace({
        name: 'HomeView',
      })
      return
    }
    try {
      await kService.openDatabase({password})
    } catch (e) {
      console.error(e)
      keeStore.isDbOpened = false
      await showOpenDbModal()

      return
    }

    keeStore.isDbOpened = true
    window.$message.success('Database successfully opened')
    await getGroupTree()
  }

  const handleCreateEntry = async () => {
    const entry = await kService.createEntry({
      groupUuid: editingUuid.value,
      config: {title: formatDate(new Date())},
    })
    await saveDatabaseAsync()

    keeStore.detailUuid = entry.uuid
  }

  const handleCreateGroup = async () => {
    await kService.createGroup({
      groupUuid: editingUuid.value,
      name: formatDate(new Date()),
    })
    await saveDatabaseAsync()
    await getGroupTree()
  }

  const confirmRemoveGroup = (isDelete = false) => {
    const isEmptyRecycleBin = keeStore.recycleBinUuid === editingUuid.value
    window.$dialog.warning({
      title: isDelete || isEmptyRecycleBin ? 'Warning!!' : 'Confirm',
      content: isEmptyRecycleBin
        ? 'Empty Recycle Bin? (This can not be undo)'
        : isDelete
        ? 'Permanent delete selected group? (This can not be undo)'
        : 'Delete selected group? Permanently emptied if group is RecycleBin.',
      positiveText: 'OK',
      negativeText: 'Cancel',
      onPositiveClick: () => {
        handleDeleteGroup(isDelete)
      },
      onNegativeClick: () => {},
    })
  }

  const handleDeleteGroup = async (isDelete = false) => {
    if (isDelete) {
      await kService.moveGroup({
        uuid: editingUuid.value,
        targetUuid: null,
      })
    } else {
      await kService.removeGroup({
        groupUuid: editingUuid.value,
      })
    }
    await saveDatabaseAsync()
    await getGroupTree()
  }

  const showRenameModal = async () => {
    if (!editingNode.value) {
      return
    }
    const name = await showInputPrompt({
      title: 'Rename Group',
      placeholder: 'Group name',
      value: editingNode.value.title,
    })
    if (name !== editingNode.value.title) {
      await handleGroupEdit(name)
    }
  }

  const handleGroupEdit = async (name: string) => {
    if (!editingUuid.value) {
      return
    }

    await kService.updateGroup({
      uuid: editingUuid.value,
      updates: [{path: 'name', value: name}],
    })
    await saveDatabaseAsync()
    await getGroupTree()
    editingNode.value = null
  }

  const isShowChooseIconModal = ref(false)
  const handleSelectIcon = async (icon: number) => {
    if (!editingUuid.value) {
      return
    }

    await kService.updateGroup({
      uuid: editingUuid.value,
      updates: [{path: 'icon', value: icon}],
    })
    await saveDatabaseAsync()
    await getGroupTree()
    editingNode.value = null
    isShowChooseIconModal.value = false
  }

  const handleCloseDatabase = async () => {
    await kService.closeDatabase()
    settingsStore.lastOpenedHistoryItem = null
    keeStore.isDbOpened = false
    keeStore.detailUuid = null
    keeStore.isChanged = false
    window.$message.success('Database successfully closed')

    groupTree.value = []

    if (isElectron) {
      await router.replace({
        name: 'HomeView',
      })
    }
  }

  // 切换数据库锁定
  const handleToggleLock = async () => {
    if (keeStore.isDbOpened) {
      await handleCloseDatabase()
    } else {
      await showOpenDbModal()
    }
  }

  onMounted(async () => {
    globalEventBus.on(GlobalEvents.REFRESH_GROUP_TREE, getGroupTree)
  })
  onBeforeUnmount(() => {
    globalEventBus.off(GlobalEvents.REFRESH_GROUP_TREE, getGroupTree)
  })

  return {
    groupTree,
    keeStore,
    getGroupTree,
    selectedKeys,
    groupUuid,
    rootGroupUuid,
    editingUuid,
    handleOpenDatabase,
    handleCreateEntry,
    handleCreateGroup,
    confirmRemoveGroup,
    handleTreeDrop,
    handleDeleteGroup,
    showRenameModal,
    handleGroupEdit,
    isShowChooseIconModal,
    handleSelectIcon,
    handleCloseDatabase,
    showOpenDbModal,
    handleToggleLock,
  }
}

export const useKeeNoteEntryList = (options?) => {
  const {
    isCalendar = false,
    // 仅限日历视图开启：
    calendarIsMapped = true,
    getCalendarParams,
    cleanupFn,
  } = options || {}
  const route = useRoute()

  const keeStore = useKeeStore()
  const entryList = ref<EntryItem[]>([])
  const calendarData = ref<CalendarData>({})

  const groupUuid = computed(() => {
    return route.query.groupUuid
  })

  onMounted(async () => {
    globalEventBus.on(GlobalEvents.REFRESH_ENTRY_LIST, getEntryList)
  })
  onBeforeUnmount(() => {
    globalEventBus.off(GlobalEvents.REFRESH_ENTRY_LIST, getEntryList)
  })

  watch(
    () => keeStore.isDbOpened,
    (val) => {
      if (val) {
        getEntryList()
      } else {
        entryList.value = []
      }
    }
  )

  watch(
    () => groupUuid.value,
    (val) => {
      getEntryList()
    }
  )

  const getEntryList = async () => {
    if (cleanupFn) {
      cleanupFn()
    }
    if (!groupUuid.value) {
      entryList.value = []
      return
    }
    if (isCalendar) {
      let params = {}
      if (getCalendarParams) {
        params = getCalendarParams()
      }
      calendarData.value = await kService.getGroupEntriesDeep({
        groupUuid: groupUuid.value,
        isDayMapped: calendarIsMapped,
        ...params,
      })
    } else {
      entryList.value = await kService.getGroupEntries({
        groupUuid: groupUuid.value,
      })
    }
  }

  return {
    entryList,
    calendarData,
    getEntryList,
    keeStore,
    groupUuid,
  }
}
