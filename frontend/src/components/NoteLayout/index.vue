<script lang="ts">
import {kService} from '@/api'
import {GroupItem} from '@/enum/kdbx'
import {defineComponent} from 'vue'
import {useKeeStore} from '@/store/kee-store'

export default defineComponent({
  name: 'NoteLayout',
  setup() {
    onMounted(async () => {
      await getGroupTree()
    })
    const groupTree = ref<GroupItem[]>([])
    const keeStore = useKeeStore()
    const selectedKeys = computed({
      get(): string[] {
        if (!keeStore.currentGroupUuid) {
          return []
        }
        return [keeStore.currentGroupUuid]
      },
      set(val: string[]) {
        if (!val) {
          val = []
        }
        keeStore.setCurrentGroupUuid(val[0])
      },
    })

    const getGroupTree = async () => {
      const res: GroupItem[] = await kService.getGroupTree()
      console.log(res)
      groupTree.value = res
    }

    return {
      groupTree,
      keeStore,
      selectedKeys,
    }
  },
})
</script>

<template>
  <div class="note-layout">
    <n-layout class="layout-inner-root">
      <n-layout-header style="height: 64px; padding: 24px" bordered>
        KeeNote {{ keeStore.currentGroupUuid }}</n-layout-header
      >

      <n-layout has-sider>
        <n-layout-sider
          collapse-mode="width"
          :collapsed-width="50"
          :width="240"
          show-trigger="arrow-circle"
          content-style="padding: 24px;"
          bordered
        >
          <n-tree
            block-line
            :data="groupTree"
            key-field="uuid"
            label-field="title"
            children-field="children"
            selectable
            default-expand-all
            v-model:selected-keys="selectedKeys"
          />
        </n-layout-sider>
        <n-layout-content content-style="padding: 24px;">
          <router-view :selected-key="selectedKeys[0]"></router-view>
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
