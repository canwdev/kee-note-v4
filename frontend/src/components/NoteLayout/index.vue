<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: 'NoteLayout',
  setup() {
    return {}
  },
})
</script>

<template>
  <div class="note-layout">
    <n-layout class="layout-inner-root">
      <n-layout-header style="height: 64px; padding: 24px" bordered> KeeNote </n-layout-header>

      <n-layout has-sider>
        <n-layout-sider
          collapse-mode="width"
          :collapsed-width="50"
          :width="240"
          show-trigger="arrow-circle"
          content-style="padding: 24px;"
          bordered
        >
          <p>海淀桥 海淀桥 海淀桥 海淀桥 海淀桥</p>
        </n-layout-sider>
        <n-layout-content content-style="padding: 24px;">
          <router-view></router-view>
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
