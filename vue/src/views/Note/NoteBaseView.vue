<script lang="ts">
import {kService} from '@/api'
import {EntryItem, GroupItem} from '@/enum/kdbx'
import {defineComponent} from 'vue'
import {useKeeStore} from '@/store/kee-store'
import DialogInput from '@/components/NoteViews/Dialogs/DialogInput.vue'
import {useRoute, useRouter} from 'vue-router'
import globalEventBus, {GlobalEvents, saveDatabaseAsync} from '@/utils/bus'
import {formatDate} from '@/utils'
import {TreeDropInfo} from 'naive-ui'
import {isElectron} from '@/utils/backend'
import {useContextMenu} from '@/hooks/use-context-menu'
import {useLocalStorageBoolean} from '@/hooks/use-local-storage'
import {LsKeys} from '@/enum'
import ListView from '@/components/NoteViews/ListView.vue'
import CalendarView from '@/components/NoteViews/Calendar/CalendarView.vue'
import IconDisplay from '@/components/NoteViews/IconDisplay.vue'
import DialogIconChooser from '@/components/NoteViews/Dialogs/DialogIconChooser.vue'
import {useMainStore} from '@/store/main'
import {Settings20Filled, LockOpen16Filled} from '@vicons/fluent'
import {
  getEntryItemUpdateParams,
  handleReadSelectedFile,
  importEntryListJson,
} from '@/utils/export-import'
import {useSettingsStore} from '@/store/settings'

export default defineComponent({
  name: 'NoteLayout',
  components: {
    DialogInput,
    ListView,
    CalendarView,
    DialogIconChooser,
    Settings20Filled,
    LockOpen16Filled,
  },
  setup() {
    const router = useRouter()
    const route = useRoute()

    const groupTree = ref<GroupItem[]>([])
    const keeStore = useKeeStore()
    const mainStore = useMainStore()

    const settingsStore = useSettingsStore()

    onMounted(async () => {
      globalEventBus.on(GlobalEvents.REFRESH_GROUP_TREE, getGroupTree)
    })
    onBeforeUnmount(() => {
      globalEventBus.off(GlobalEvents.REFRESH_GROUP_TREE, getGroupTree)
    })

    onActivated(async () => {
      keeStore.isDbOpened = await kService.checkIsOpen()
      if (keeStore.isDbOpened) {
        await getGroupTree()
      } else {
        await handleOpenDatabase()
      }
    })

    const groupUuid = computed(() => {
      return route.query.groupUuid
    })

    const rootGroupUuid = computed(() => {
      return groupTree.value[0]?.uuid
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

        const query = {
          ...route.query,
          groupUuid: val[0],
        }
        router.replace({
          query,
        })
      },
    })

    const getGroupTree = async () => {
      const {
        meta: {recycleBinEnabled, recycleBinUuid},
      } = await kService.getMeta()
      if (recycleBinEnabled && recycleBinUuid && recycleBinUuid.id) {
        keeStore.recycleBinUuid = recycleBinUuid.id
      } else {
        keeStore.recycleBinUuid = null
      }

      groupTree.value = await kService.getGroupTree()

      if (!selectedKeys.value.length && groupTree.value.length) {
        selectedKeys.value = [groupTree.value[0].uuid]
      }
    }

    const handleCreateEntry = async () => {
      const entry = await kService.createEntry({
        groupUuid: editingUuid.value,
        config: {title: formatDate(new Date())},
      })
      await saveDatabaseAsync()

      await router.push({
        name: 'NoteDetailView',
        query: {uuid: entry.uuid},
      })
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
      showChooseIconModal.value = false
    }

    const handleCloseDatabase = async () => {
      await kService.closeDatabase()
      keeStore.isDbOpened = false
      window.$message.success('Database successfully closed')
      selectedKeys.value = []
      groupTree.value = []
      if (isElectron) {
        await router.replace({
          name: 'HomeView',
        })
      }
    }

    const showOpenDbModal = ref(false)
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
        showOpenDbModal.value = true
        keeStore.isDbOpened = false

        return
      }

      keeStore.isDbOpened = true
      window.$message.success('Database successfully opened')
      await getGroupTree()
    }

    const getMenuOptions = (option, event?: MouseEvent) => {
      let isRootSelected = option
        ? option.uuid === rootGroupUuid.value
        : groupUuid.value === rootGroupUuid.value

      const isShiftPressed = event?.shiftKey

      let isEmptyRecycleBin = false
      if (option) {
        isEmptyRecycleBin = keeStore.recycleBinUuid === option.uuid
      } else {
        isEmptyRecycleBin = keeStore.recycleBinUuid === editingUuid.value
      }

      return [
        {
          label: '🗒️ Create Entry',
          props: {
            onClick: () => {
              nodeAction(option, () => {
                handleCreateEntry()
              })
            },
          },
        },
        {
          label: '📁 Create Group',
          props: {
            onClick: () => {
              nodeAction(option, () => {
                handleCreateGroup()
              })
            },
          },
        },
        option && {
          label: '📝 Rename Group',
          props: {
            onClick: () => {
              nodeAction(option, () => {
                showRenameModal.value = true
              })
            },
          },
        },
        option && {
          label: '🌟 Change Icon',
          props: {
            onClick: () => {
              nodeAction(option, () => {
                showChooseIconModal.value = true
              })
            },
          },
        },
        {
          label: '📥 Import JSON',
          props: {
            onClick: () => {
              handleImportJson()
            },
          },
        },
        !isRootSelected && {
          label: isEmptyRecycleBin
            ? '❌ Empty Recycle Bin'
            : isShiftPressed
            ? '❌ Permanent Delete'
            : '🚮 Move to Recycle Bin',
          props: {
            onClick: () => {
              nodeAction(option, () => {
                confirmRemoveGroup(isShiftPressed)
              })
            },
          },
        },
      ].filter(Boolean)
    }

    const {editingNode, nodeAction, handleContextmenu, ...contextMenuEtc} =
      useContextMenu(getMenuOptions)

    const menuOptionsBase = [
      {
        label: '⚙️ Settings',
        props: {
          onClick: () => {
            globalEventBus.emit(GlobalEvents.SHOW_SETTINGS)
          },
        },
      },
      {
        type: 'divider',
        label: 'd0',
      },
      isElectron
        ? null
        : {
            label: '🏃 Logout',
            props: {
              onClick: async () => {
                try {
                  await handleCloseDatabase()
                } catch (e) {
                  window.$message.warning('Database close failed')
                }
                localStorage.removeItem(LsKeys.LS_KEY_AUTHORIZATION)
                await router.replace({
                  name: 'HomeView',
                })
              },
            },
          },
    ].filter(Boolean)

    const menuOptions = computed(() => {
      const options = [
        {
          label: settingsStore.isCalendarView ? '📃 List View' : '📅 Calendar View',
          props: {
            onClick: () => {
              settingsStore.isCalendarView = !settingsStore.isCalendarView
            },
          },
        },
        ...menuOptionsBase,
        keeStore.isDbOpened
          ? {
              label: '🔐 Lock Database',
              props: {
                onClick: async () => {
                  await handleCloseDatabase()
                },
              },
            }
          : {
              label: '🔓 Unlock Database',
              props: {
                onClick: async () => {
                  showOpenDbModal.value = true
                },
              },
            },
      ]
      if (groupUuid.value) {
        return [
          ...getMenuOptions(null),
          {
            type: 'divider',
            label: 'd1',
          },
          ...options,
        ]
      }
      return options
    })

    const showRenameModal = ref(false)
    const showChooseIconModal = ref(false)

    const editingUuid = computed(() => {
      return editingNode.value ? editingNode.value.uuid : groupUuid.value
    })

    const handleImportJson = async () => {
      await importEntryListJson(editingUuid.value)
    }

    return {
      groupTree,
      keeStore,
      selectedKeys,
      menuOptions,
      handleTreeDrop,
      editingNode,
      showRenameModal,
      showChooseIconModal,
      ...contextMenuEtc,
      renderPrefix({option}: {option: GroupItem}) {
        return h(IconDisplay, {
          icon: option.icon,
          size: 18,
        })
      },
      handleGroupEdit,
      handleSelectIcon,
      showOpenDbModal,
      handleOpenDatabase,
      nodeProps: ({option}: {option: any}) => {
        return {
          onClick() {
            // message.info('[Click] ' + option)
          },
          onContextmenu(e: MouseEvent): void {
            handleContextmenu(e, option)
          },
        }
      },
      settingsStore,
    }
  },
})
</script>

<template>
  <div class="note-layout">
    <n-layout class="layout-inner-root">
      <n-layout-header bordered>
        <n-space
          align="center"
          style="
            width: 100%;
            height: 100%;
            padding: 10px 24px;
            box-sizing: border-box;
            user-select: none;
          "
          justify="space-between"
        >
          <n-space align="center" size="small">
            <n-icon style="transform: translateY(2px)" size="16"> <LockOpen16Filled /> </n-icon
            >KeeNote
          </n-space>
          <n-dropdown
            :options="menuOptions"
            key-field="label"
            placement="bottom-start"
            trigger="hover"
          >
            <n-button quaternary size="small">
              <n-icon size="16"> <Settings20Filled /> </n-icon>&nbsp;Menu
            </n-button>
          </n-dropdown>
        </n-space>
      </n-layout-header>

      <DialogInput
        v-model:visible="showOpenDbModal"
        :value="''"
        @onSubmit="handleOpenDatabase"
        dialog-title="Unlock Database"
        input-label="Database password"
        is-password
        :required="false"
      />

      <n-layout has-sider>
        <n-layout-sider
          collapse-mode="width"
          :collapsed-width="50"
          :width="240"
          show-trigger="arrow-circle"
          bordered
          :collapsed="settingsStore.isSidebarCollapsed"
          @updateCollapsed="(val) => (settingsStore.isSidebarCollapsed = val)"
        >
          <n-scrollbar x-scrollable>
            <n-tree
              style="min-width: 150px"
              block-line
              :data="groupTree"
              key-field="uuid"
              label-field="title"
              children-field="children"
              class="content-padding"
              selectable
              default-expand-all
              draggable
              :cancelable="false"
              :node-props="nodeProps"
              @drop="handleTreeDrop"
              :render-prefix="renderPrefix"
              v-model:selected-keys="selectedKeys"
            />
          </n-scrollbar>

          <DialogInput
            v-model:visible="showRenameModal"
            :value="editingNode?.title"
            @onSubmit="handleGroupEdit"
            dialog-title="Rename Group"
            input-label="Group name"
          />
          <DialogIconChooser
            v-model:visible="showChooseIconModal"
            @onSelectIcon="handleSelectIcon"
          />
        </n-layout-sider>

        <n-dropdown
          trigger="manual"
          placement="bottom-start"
          :show="showRightMenu"
          :options="rightMenuOptions"
          :x="xRef"
          :y="yRef"
          @select="handleSelect"
          key-field="label"
          :on-clickoutside="handleClickOutside"
        />

        <n-layout-content>
          <CalendarView v-if="settingsStore.isCalendarView" />
          <ListView v-else />
        </n-layout-content>
      </n-layout>
    </n-layout>
  </div>
</template>

<style lang="scss" scoped>
.note-layout {
  height: 100%;
  .layout-inner-root {
    height: 100%;
    :deep(.n-layout-scroll-container) {
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
