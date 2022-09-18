<script lang="ts">
import {kService} from '@/api'
import {GroupItem} from '@/enum/kdbx'
import {defineComponent} from 'vue'
import {useKeeStore} from '@/store/kee-store'
import AutoRouterView from '@/components/AutoRouterView.vue'
import DialogInput from '@/components/DialogInput.vue'
import {useRoute, useRouter} from 'vue-router'
import globalEventBus, {GlobalEvents, saveDatabaseAsync} from '@/utils/bus'
import {LS_KEY_AUTHORIZATION} from '@/enum'
import {formatDate} from '@/utils'
import {DropdownOption, TreeDropInfo, TreeOption} from 'naive-ui'
import {openDatabase} from '@/api/keepass'
import {isElectron} from '@/utils/backend'
import keepassIcons from '@/assets/icons'

export default defineComponent({
  name: 'NoteLayout',
  components: {
    AutoRouterView,
    DialogInput,
  },
  setup() {
    const router = useRouter()
    const route = useRoute()

    const groupTree = ref<GroupItem[]>([])
    const keeStore = useKeeStore()

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
                    localStorage.removeItem(LS_KEY_AUTHORIZATION)
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

        ...menuOptionsBase,
      ]
      if (groupUuid.value) {
        return [
          {
            label: '🗒️ Create Entry',
            props: {
              onClick: () => {
                nodeAction(null, () => {
                  handleCreateEntry()
                })
              },
            },
          },
          {
            label: '📁 Create Group',
            props: {
              onClick: () => {
                nodeAction(null, () => {
                  handleCreateGroup()
                })
              },
            },
          },
          {
            label: '🚮 Delete Group',
            props: {
              onClick: () => {
                nodeAction(null, () => {
                  confirmDeleteGroup()
                })
              },
            },
          },
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
    const editingNode = ref<GroupItem | null>(null)
    const nodeAction = (node: GroupItem | null, cb) => {
      // console.log(node)
      editingNode.value = node
      cb()
    }
    const editingUuid = computed(() => {
      return editingNode.value ? editingNode.value.uuid : groupUuid.value
    })

    const rightMenuOptions = ref<DropdownOption[]>([])
    const showRightMenu = ref(false)
    const xRef = ref(0)
    const yRef = ref(0)

    return {
      groupTree,
      keeStore,
      selectedKeys,
      menuOptions,
      handleTreeDrop,
      editingNode,
      showEditModal,
      rightMenuOptions,
      showRightMenu,
      xRef,
      yRef,
      handleSelect: () => {
        showRightMenu.value = false
      },
      handleClickoutside: () => {
        showRightMenu.value = false
      },
      nodeProps: ({option}: {option: GroupItem}) => {
        return {
          onClick() {
            // message.info('[Click] ' + option)
          },
          onContextmenu(e: MouseEvent): void {
            rightMenuOptions.value = [
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
            showRightMenu.value = true
            xRef.value = e.clientX
            yRef.value = e.clientY
            e.preventDefault()
          },
        }
      },
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
          style="width: 100%; height: 100%; padding: 10px 24px; box-sizing: border-box"
        >
          KeeNote
          <n-dropdown
            :options="menuOptions"
            key-field="label"
            placement="bottom-start"
            trigger="click"
          >
            <n-button>Menu</n-button>
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
          :width="240"
          show-trigger="arrow-circle"
          bordered
        >
          <n-tree
            block-line
            :data="groupTree"
            key-field="uuid"
            label-field="title"
            children-field="children"
            class="content-padding"
            selectable
            default-expand-all
            draggable
            :node-props="nodeProps"
            @drop="handleTreeDrop"
            :render-prefix="renderPrefix"
            v-model:selected-keys="selectedKeys"
          />

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
          @clickoutside="handleClickoutside"
        />

        <n-layout-content>
          <AutoRouterView />
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
