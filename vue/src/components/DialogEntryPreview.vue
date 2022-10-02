<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {useModelWrapper} from '@/hooks/use-model-wrapper'
import {kService} from '@/api'
import {EntryItem} from '@/enum/kdbx'
import IconDisplay from '@/components/IconDisplay.vue'
import {formatDate} from '@/utils'
import {marked} from 'marked'
import {useMainStore} from '@/store/main-store'
import '@/styles/markdown/github-markdown-dark.css'
import '@/styles/markdown/github-markdown.css'

export default defineComponent({
  name: 'DialogEntryPreview',
  components: {
    IconDisplay,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    uuid: {
      type: String,
      default: null,
    },
    previewDetail: {
      type: Object as PropType<EntryItem | null>,
      default: null,
    },
  },
  setup(props, {emit}) {
    const mainStore = useMainStore()
    const {uuid, previewDetail} = toRefs(props)
    const mVisible = useModelWrapper(props, emit, 'visible')
    const entryDetail = ref<EntryItem | null>(null)

    watch(mVisible, async (nv) => {
      if (!nv) {
        entryDetail.value = null
      } else if (uuid.value) {
        entryDetail.value = await kService.getEntryDetail({uuid: uuid.value})
      }
    })

    const detailData = computed(() => {
      return previewDetail.value || entryDetail.value
    })

    const htmlContent = computed(() => {
      if (!detailData.value) {
        return ''
      }
      return marked.parse(detailData.value.notes)
    })

    return {
      mainStore,
      entryDetail,
      mVisible,
      formatDate,
      htmlContent,
      detailData,
    }
  },
})
</script>

<template>
  <n-modal
    class="dialog-entry-preview"
    v-model:show="mVisible"
    preset="dialog"
    :title="detailData && detailData.title"
  >
    <template #icon>
      <IconDisplay
        v-if="detailData"
        :icon="detailData.icon"
        :bg-color="detailData.bgColor"
        :fg-color="detailData.fgColor"
      />
    </template>
    <template v-if="detailData">
      <n-space justify="space-between" style="font-size: 12px">
        <n-space align="center" style="font-weight: 500">
          Created: {{ formatDate(new Date(detailData.creationTime)) }}
        </n-space>
        <n-space align="center">
          Updated: {{ formatDate(new Date(detailData.lastModTime)) }}
        </n-space>
      </n-space>
      <n-divider style="margin-top: 10px; margin-bottom: 10px" />

      <div
        :class="mainStore.isAppDarkMode ? 'markdown-body-dark' : 'markdown-body'"
        v-html="htmlContent"
      />
    </template>
  </n-modal>
</template>

<style lang="scss">
.dialog-entry-preview {
  width: 600px !important;
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
