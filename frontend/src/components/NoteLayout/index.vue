<script lang="ts">
import {kService} from '@/api'
import {GroupItem} from '@/enum/kdbx'
import {defineComponent} from 'vue'
import {useKeeStore} from '@/store/kee-store'
import AutoRouterView from '@/components/AutoRouterView.vue'
import {useRoute, useRouter} from 'vue-router'

export default defineComponent({
  name: 'NoteLayout',
  components: {
    AutoRouterView,
  },
  setup() {
    const router = useRouter()
    const route = useRoute()

    onMounted(async () => {
      await getGroupTree()
    })
    const groupTree = ref<GroupItem[]>([])
    const keeStore = useKeeStore()
    const selectedKeys = computed({
      get(): string[] {
        if (!route.query.groupUuid) {
          return []
        }
        return [String(route.query.groupUuid)]
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
      const res: GroupItem[] = await kService.getGroupTree()
      console.log(res)
      groupTree.value = res
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
            label: 'Save Database',
            props: {
              onClick: () => {
                kService.saveDatabase()
              },
            },
          },
          {
            label: 'About',
            props: {
              onClick: () => {
                window.$message.success('Good!')
              },
            },
          },
        ],
      },
    ]

    const menuOptions = computed(() => {
      if (route.query.groupUuid) {
        return [
          {
            label: 'Create Entry',
            props: {
              onClick: () => {
                window.$message.success('Good!')
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
                window.$message.success('Good!')
              },
            },
          },
          {
            label: 'Edit Group',
            props: {
              onClick: () => {
                window.$message.success('Good!')
              },
            },
          },
          {
            label: 'Move Group...',
            disabled: true,
          },
          {
            label: 'Delete Group',
            props: {
              onClick: () => {
                window.$message.success('Good!')
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

    return {
      groupTree,
      keeStore,
      selectedKeys,
      menuOptions,
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
            v-model:selected-keys="selectedKeys"
          />
        </n-layout-sider>
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
