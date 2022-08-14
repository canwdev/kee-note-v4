<script lang="ts">
import {useRoute, useRouter} from 'vue-router'
import {kService} from '@/api'
import {EntryItem} from '@/enum/kdbx'

export default defineComponent({
  name: 'DetailView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const entryDetail = ref<EntryItem | null>(null)

    onMounted(() => {
      getEntryDetail()
    })

    const getEntryDetail = async () => {
      entryDetail.value = await kService.getEntryDetail({uuid: route.query.uuid})
    }
    return {
      handleBack() {
        router.back()
      },
      entryDetail,
    }
  },
})
</script>

<template>
  <div class="detail-view">
    <n-layout class="layout-inner-root">
      <n-layout-header style="height: 64px" bordered>
        <n-space
          align="center"
          justify="space-between"
          style="width: 100%; height: 100%; padding: 0 24px; box-sizing: border-box"
        >
          <n-button @click="handleBack">Back</n-button>

          <div>Detail View</div>

          <n-button>Save</n-button>
        </n-space>
      </n-layout-header>

      <n-layout-content content-style="padding: 24px;">
        <n-card v-if="entryDetail"> {{ entryDetail }} </n-card>
      </n-layout-content>
    </n-layout>
  </div>
</template>
<style lang="scss" scoped>
.detail-view {
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
