<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {useModelWrapper} from '@/hooks/use-model-wrapper'
import {kService} from '@/api'
import {EntryItem} from '@/enum/kdbx'
import IconDisplay from '@/components/NoteViews/IconDisplay.vue'
import {formatDate} from '@/utils'
import {marked} from 'marked'
import markedKatex from 'marked-katex-extension'
import {useMainStore} from '@/store/main'
import '@/styles/markdown/github-markdown-dark.css'
import '@/styles/markdown/github-markdown.css'
import mime from 'mime'

marked.use(markedKatex({output: 'mathml'}))

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
      } else {
        await loadDetail()
      }
    })

    const htmlContent = ref('')
    const imageNameUrlMap = ref({})

    /**
     * 提前准备好图片，供markdown调用
     * @param detail
     */
    const loadImages = async (detail: EntryItem | null) => {
      if (!detail) {
        return
      }
      imageNameUrlMap.value = {}
      let imageNames: string[] = []
      if (detail.attachmentNames) {
        imageNames = detail.attachmentNames.filter((filename) => {
          const mimeType = mime.getType(filename)
          const type0 = mimeType?.split('/')[0]
          return type0 === 'image'
        })
      }
      const map = {}
      for (const name of imageNames) {
        const blob = await kService.getAttachment({
          uuid: detail.uuid,
          filename: name,
        })
        map[name] = URL.createObjectURL(blob)
      }
      imageNameUrlMap.value = map
    }

    const loadDetail = async () => {
      htmlContent.value = ''
      let detail: EntryItem | null = null

      if (previewDetail.value) {
        detail = previewDetail.value
      } else {
        detail = await kService.getEntryDetail({uuid: uuid.value})
      }

      if (!detail) {
        return
      }
      await loadImages(detail)

      const customRenderer = new marked.Renderer()

      // 加载附件图片
      customRenderer.image = (href, title, text) => {
        title = title || text
        if (href in imageNameUrlMap.value) {
          return `<img src="${imageNameUrlMap.value[href]}" alt="${text}" title="${title}" />`
        }
        return `<img src="${href}" alt="${text}" title="${title}" />`
      }

      htmlContent.value = marked.parse(detail.fieldsV2.Notes as string, {
        renderer: customRenderer,
      })
      entryDetail.value = detail
    }

    return {
      mainStore,
      entryDetail,
      mVisible,
      formatDate,
      htmlContent,
    }
  },
})
</script>

<template>
  <n-modal
    class="dialog-entry-preview"
    v-model:show="mVisible"
    preset="dialog"
    :title="entryDetail && entryDetail.title"
  >
    <template #icon>
      <IconDisplay
        v-if="entryDetail"
        :icon="entryDetail.icon"
        :bg-color="entryDetail.bgColor"
        :fg-color="entryDetail.fgColor"
      />
    </template>
    <template v-if="entryDetail">
      <n-space justify="space-between" style="font-size: 12px">
        <n-space align="center" style="font-weight: 500">
          Created: {{ formatDate(new Date(entryDetail.creationTime)) }}
        </n-space>
        <n-space align="center">
          Updated: {{ formatDate(new Date(entryDetail.lastModTime)) }}
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
