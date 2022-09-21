<script lang="ts">
import {kService} from '@/api'
import {GroupItem} from '@/enum/kdbx'
import {defineComponent} from 'vue'
import {useKeeStore} from '@/store/kee-store'
import DialogInput from '@/components/DialogInput.vue'
import {useRoute, useRouter} from 'vue-router'
import globalEventBus, {GlobalEvents, saveDatabaseAsync} from '@/utils/bus'
import {formatDate} from '@/utils'
import {TreeDropInfo} from 'naive-ui'
import {isElectron} from '@/utils/backend'
import keepassIcons from '@/assets/icons'
import {useContextMenu} from '@/hooks/use-context-menu'
import {useLocalStorageBoolean} from '@/hooks/use-local-storage'
import {LsKeys} from '@/enum'
import ListView from '@/components/NoteViews/ListView.vue'
import CalendarView from '@/components/NoteViews/CalendarView.vue'

export default defineComponent({
  name: 'NoteLayout',
  components: {
    DialogInput,
    ListView,
    CalendarView,
  },
  setup() {
    const router = useRouter()
    const route = useRoute()

    const groupTree = ref<GroupItem[]>([])
    const keeStore = useKeeStore()

    const isCalendarView = useLocalStorageBoolean(LsKeys.LS_KEY_IS_CALENDAR_VIEW)

    onMounted(async () => {
      globalEventBus.on(GlobalEvents.REFRESH_GROUP_TREE, getGroupTree)
    })
    onBeforeUnmount(() => {
      globalEventBus.off(GlobalEvents.REFRESH_GROUP_TREE, getGroupTree)
    })

    onActivated(async () => {
      isCalendarView.value = Boolean(localStorage.getItem(LsKeys.LS_KEY_IS_CALENDAR_VIEW))
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

    const confirmDeleteGroup = () => {
      window.$dialog.warning({
        title: 'Confirm',
        content: 'Delete selected group? Permanently emptied if group is RecycleBin.',
        positiveText: 'OK',
        negativeText: 'Cancel',
        onPositiveClick: () => {
          handleDeleteGroup()
        },
        onNegativeClick: () => {},
      })
    }

    const handleDeleteGroup = async () => {
      await kService.removeGroup({
        groupUuid: editingUuid.value,
      })
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

    const getMenuOptions = (option) => [
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
      {
        label: '📝 Edit Group',
        props: {
          onClick: () => {
            nodeAction(option, () => {
              showEditModal.value = true
            })
          },
        },
      },
      {
        label: '🚮 Delete Group',
        props: {
          onClick: () => {
            nodeAction(option, () => {
              confirmDeleteGroup()
            })
          },
        },
      },
    ]

    const {editingNode, nodeAction, handleContextmenu, ...contextMenuEtc} =
      useContextMenu(getMenuOptions)

    const menuOptionsBase = [
      {
        type: 'divider',
        label: 'd0',
      },
      {
        label: 'Others',
        children: [
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
          {
            label: '⚙️ Settings',
            props: {
              onClick: () => {
                globalEventBus.emit(GlobalEvents.SHOW_SETTINGS)
              },
            },
          },
          // {
          //   label: 'About',
          //   props: {
          //     onClick: () => {
          //       window.$message.success('Good!')
          //     },
          //   },
          // },
        ].filter(Boolean),
      },
    ]

    const menuOptions = computed(() => {
      const options = [
        keeStore.isDbOpened
          ? {
              label: '🔐 Close Database',
              props: {
                onClick: async () => {
                  await handleCloseDatabase()
                },
              },
            }
          : {
              label: '🔓 Open Database',
              props: {
                onClick: async () => {
                  showOpenDbModal.value = true
                },
              },
            },

        {
          label: isCalendarView.value ? '📃 List View' : '📅 Calendar View',
          props: {
            onClick: () => {
              isCalendarView.value = !isCalendarView.value
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

    const showEditModal = ref(false)

    const editingUuid = computed(() => {
      return editingNode.value ? editingNode.value.uuid : groupUuid.value
    })

    return {
      groupTree,
      keeStore,
      selectedKeys,
      menuOptions,
      handleTreeDrop,
      editingNode,
      showEditModal,
      ...contextMenuEtc,
      renderPrefix({option}: {option: GroupItem}) {
        return h('img', {
          onClick: (e: Event) => e.stopPropagation(),
          alt: String(option.icon),
          src: String(keepassIcons[option.icon]),
          style: {height: '18px', width: '18px'},
        })
      },
      handleGroupEdit,
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
      isCalendarView,
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
        >
          🔓 KeeNote
          <n-dropdown
            :options="menuOptions"
            key-field="label"
            placement="bottom-start"
            trigger="click"
          >
            <n-button size="small">⚙ Menu</n-button>
          </n-dropdown>
        </n-space>
      </n-layout-header>

      <DialogInput
        v-model:visible="showOpenDbModal"
        :value="''"
        @onSubmit="handleOpenDatabase"
        dialog-title="Open Database"
        input-label="Database password"
        is-password
        :required="false"
      />

      <n-layout has-sider>
        <n-layout-sider
          collapse-mode="width"
          :collapsed-width="50"
          :width="248"
          show-trigger="arrow-circle"
          bordered
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
            v-model:visible="showEditModal"
            :value="editingNode?.title"
            @onSubmit="handleGroupEdit"
            dialog-title="Rename Group"
            input-label="Group name"
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
          <CalendarView v-if="isCalendarView" />
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
