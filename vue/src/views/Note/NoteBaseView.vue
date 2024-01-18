<script lang="ts">
import {kService} from '@/api'
import {GroupItem} from '@/enum/kdbx'
import {defineComponent} from 'vue'
import {useRouter} from 'vue-router'
import globalEventBus, {GlobalEvents, saveDatabaseAsync} from '@/utils/bus'
import {isElectron} from '@/utils/backend'
import {useContextMenu} from '@/hooks/use-context-menu'
import {LsKeys} from '@/enum'
import ListView from '@/components/NoteViews/ListView.vue'
import CalendarView from '@/components/NoteViews/Calendar/CalendarView.vue'
import IconDisplay from '@/components/NoteViews/IconDisplay.vue'
import DialogIconChooser from '@/components/NoteViews/Dialogs/DialogIconChooser.vue'
import {useMainStore} from '@/store/main'
import {
  Settings20Filled,
  LockClosed20Filled,
  Save20Regular,
  Search20Filled,
  LockShield20Regular,
  Key20Regular,
} from '@vicons/fluent'
import {importEntryListJson} from '@/utils/export-import'
import {useSettingsStore} from '@/store/settings'
import {useKeeNoteGroupManage} from '@/hooks/use-keenote'
import DetailView from '@/views/Note/DetailView.vue'
import {checkDatabaseIsOpen} from '@/api/keepass'

export default defineComponent({
  name: 'NoteLayout',
  components: {
    DetailView,
    ListView,
    CalendarView,
    DialogIconChooser,
    Settings20Filled,
    Search20Filled,
    LockClosed20Filled,
    Save20Regular,
    LockShield20Regular,
    Key20Regular,
  },
  setup() {
    const router = useRouter()

    const mainStore = useMainStore()
    const settingsStore = useSettingsStore()

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
          label: '🗒️ Create Note',
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
                showRenameModal()
              })
            },
          },
        },
        option && {
          label: '🌟 Change Icon',
          props: {
            onClick: () => {
              nodeAction(option, () => {
                isShowChooseIconModal.value = true
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

    onMounted(() => {
      window.addEventListener('keydown', listenShortcuts)
    })
    onBeforeUnmount(() => {
      window.removeEventListener('keydown', listenShortcuts)
    })
    const listenShortcuts = (event) => {
      if (event.ctrlKey || event.metaKey) {
        const key = event.key.toLowerCase()
        if (key === 'l') {
          event.preventDefault()
          if (!keeStore.isChanged) {
            handleToggleLock()
          }
        } else if (key === 's') {
          event.preventDefault()
          if (keeStore.isNotSave) {
            // TODO: 处理快速重复按键，避免重复请求
            handleManualSave()
          }
        }
      }
    }

    const {
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
      showRenameModal,
      isShowChooseIconModal,
      handleSelectIcon,
      handleCloseDatabase,
      handleToggleLock,
      handleManualSave,
    } = useKeeNoteGroupManage(editingNode)

    onActivated(async () => {
      keeStore.isDbOpened = await kService.checkDatabaseIsOpen()
      if (keeStore.isDbOpened) {
        await getGroupTree()
      } else {
        await handleOpenDatabase()
      }
    })

    const menuOptionsBase = [
      {
        label: '⚙️ Settings',
        props: {
          onClick: () => {
            globalEventBus.emit(GlobalEvents.SHOW_SETTINGS)
          },
        },
      },

      !isElectron && {
        type: 'divider',
        label: 'd_logout',
      },
      !isElectron && {
        label: '🏃 Logout',
        props: {
          onClick: () => {
            handleLogout()
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

    const handleImportJson = async () => {
      await importEntryListJson(editingUuid.value)
    }

    const handleLogout = async () => {
      try {
        await handleCloseDatabase()
      } catch (e) {
        window.$message.warning('Database close failed')
      }
      localStorage.removeItem(LsKeys.LS_KEY_AUTHORIZATION)
      await router.replace({
        name: 'HomeView',
      })
    }

    return {
      mainStore,
      settingsStore,
      keeStore,
      isElectron,
      groupTree,
      selectedKeys,
      menuOptions,
      editingNode,
      isShowChooseIconModal,
      renderPrefix({option}: {option: GroupItem}) {
        return h(IconDisplay, {
          icon: option.icon,
          size: 18,
        })
      },
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
      handleTreeDrop,
      handleSelectIcon,
      handleLogout,
      handleToggleLock,
      handleManualSave,
      ...contextMenuEtc,
    }
  },
})
</script>

<template>
  <div class="note-layout">
    <n-layout class="layout-inner-root">
      <n-layout-header bordered>
        <n-space align="center" class="nav-header-content" justify="space-between">
          <n-space align="center" size="small">
            <n-icon class="logo-icon" size="20">
              <LockClosed20Filled />
            </n-icon>
            <span class="note-title"> KeeNote {{ keeStore.isNotSave ? '*' : '' }}</span>

            <n-button
              strong
              secondary
              v-if="keeStore.isNotSave"
              type="primary"
              size="small"
              @click="handleManualSave"
            >
              <n-icon size="20">
                <Save20Regular />
              </n-icon>
            </n-button>
          </n-space>

          <n-space size="small" align="center">
            <n-button
              quaternary
              size="small"
              :title="keeStore.isDbOpened ? 'Lock' : 'Unlock'"
              @click="handleToggleLock"
            >
              <n-icon size="20">
                <LockShield20Regular v-if="keeStore.isDbOpened" />
                <Key20Regular v-else />
              </n-icon>
            </n-button>

            <n-button disabled quaternary size="small" title="Search">
              <n-icon size="20"> <Search20Filled /> </n-icon>
            </n-button>

            <n-dropdown
              :options="menuOptions"
              key-field="label"
              placement="bottom-start"
              trigger="hover"
            >
              <n-badge :show="mainStore.isServerRunning" dot type="success" :offset="[-4, 5]">
                <n-button quaternary size="small" title="Menu">
                  <n-icon size="20"> <Settings20Filled /> </n-icon>
                </n-button>
              </n-badge>
            </n-dropdown>
          </n-space>
        </n-space>
      </n-layout-header>

      <n-layout has-sider>
        <n-layout-sider
          collapse-mode="transform"
          :collapsed-width="0"
          :width="220"
          show-trigger="bar"
          trigger-style="width: 22px;right: -12px;"
          collapsed-trigger-style="width: 22px;right: -12px;"
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

          <DialogIconChooser
            v-model:visible="isShowChooseIconModal"
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
          <template v-if="groupTree.length">
            <CalendarView v-if="settingsStore.isCalendarView" />
            <ListView v-else />
          </template>
        </n-layout-content>
      </n-layout>
    </n-layout>
  </div>

  <transition name="fade-scale">
    <DetailView v-if="Boolean(keeStore.detailUuid)" />
  </transition>
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

  .logo-icon {
    border: 2px solid $primary;
    border-radius: 50%;
    color: $primary;
    transform: translateY(2px);
  }

  .note-title {
    @media screen and (max-width: 500px) {
      display: none;
    }
  }

  .nav-header-content {
    width: 100%;
    height: 100%;
    padding: 8px 24px;
    box-sizing: border-box;
    user-select: none;
  }
}
</style>
