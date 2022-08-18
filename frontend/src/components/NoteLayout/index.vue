<script lang="ts">
import {kService} from '@/api'
import {GroupItem} from '@/enum/kdbx'
import {defineComponent} from 'vue'
import {useKeeStore} from '@/store/kee-store'
import AutoRouterView from '@/components/AutoRouterView.vue'
import DialogRename from '@/components/DialogRename.vue'
import {useRoute, useRouter} from 'vue-router'
import globalEventBus, {GlobalEvents, saveDatabaseAsync} from '@/utils/bus'
import {LS_KEY_AUTHORIZATION} from '@/enum'
import {formatDate} from '@/utils'
import {DropdownOption, TreeDropInfo, TreeOption} from 'naive-ui'

export default defineComponent({
  name: 'NoteLayout',
  components: {
    AutoRouterView,
    DialogRename,
  },
  setup() {
    const router = useRouter()
    const route = useRoute()

    onMounted(async () => {
      await getGroupTree()
    })
    const groupTree = ref<GroupItem[]>([])
    const keeStore = useKeeStore()

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
        groupUuid: groupUuid.value,
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
        groupUuid: groupUuid.value,
        name: formatDate(new Date()),
      })
      await saveDatabaseAsync()
      await getGroupTree()
    }

    const handleDeleteGroup = async () => {
      await kService.removeGroup({
        groupUuid: groupUuid.value,
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
      if (!tempEditNode.value) {
        return
      }

      await kService.updateGroup({
        uuid: tempEditNode.value.uuid,
        updates: [{path: 'name', value: name}],
      })
      await saveDatabaseAsync()
      await getGroupTree()
      tempEditNode.value = null
    }

    const menuOptionsBase = [
      {
        type: 'divider',
        label: 'd0',
      },
      {
        label: 'Others',
        children: [
          {
            label: 'Logout',
            props: {
              onClick: () => {
                localStorage.removeItem(LS_KEY_AUTHORIZATION)
                router.replace({
                  name: 'HomeView',
                })
              },
            },
          },
          {
            label: 'Settings',
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
        ],
      },
    ]

    const menuOptions = computed(() => {
      if (groupUuid.value) {
        return [
          {
            label: 'Create Entry',
            props: {
              onClick: () => {
                handleCreateEntry()
              },
            },
          },
          {
            type: 'divider',
            label: 'd1',
          },
          {
            label: 'Create Group',
            props: {
              onClick: () => {
                handleCreateGroup()
              },
            },
          },
          {
            label: 'Delete Group',
            props: {
              onClick: () => {
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
              },
            },
          },
          ...menuOptionsBase,
        ]
      }
      return [
        {
          label: 'Select a group first',
          disabled: true,
        },
        ...menuOptionsBase,
      ]
    })

    const showEditModal = ref(false)
    const tempEditNode = ref<TreeOption | null>(null)

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
      tempEditNode,
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
      nodeProps: ({option}: {option: TreeOption}) => {
        return {
          onClick() {
            // message.info('[Click] ' + option.label)
          },
          onContextmenu(e: MouseEvent): void {
            rightMenuOptions.value = [
              {
                label: 'Edit Group',
                props: {
                  onClick: () => {
                    console.log(option)
                    tempEditNode.value = option
                    showEditModal.value = true
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
      handleGroupEdit,
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
            v-model:selected-keys="selectedKeys"
          />

          <DialogRename
            v-model:visible="showEditModal"
            :value="tempEditNode?.title"
            @onSubmit="handleGroupEdit"
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
