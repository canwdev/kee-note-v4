<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {EntryItem} from '@/enum/kdbx'
import {getAttachment, removeAttachment, uploadAttachment} from '@/api/keepass'
import {aLinkDownload} from '@/utils'
import AttachmentPreview from '@/components/NoteViews/AttachmentPreview.vue'

export default defineComponent({
  name: 'AttachmentBox',
  components: {
    AttachmentPreview,
  },
  props: {
    entryDetail: {
      type: Object as PropType<EntryItem>,
      required: true,
    },
  },
  setup(props, {emit}) {
    const {entryDetail} = toRefs(props)
    const isShowPreview = ref(false)

    const previewIndex = ref(0)
    const handlePreviewItem = async (filename, index) => {
      previewIndex.value = index
      isShowPreview.value = true
    }

    const handleRemoveItem = async (filename) => {
      console.log(filename)

      await removeAttachment({
        uuid: entryDetail.value.uuid,
        filename,
      })

      emit('dataUpdated')
    }

    const handleAddAttachment = async () => {
      // @ts-ignore
      const handles = await window.showOpenFilePicker({
        multiple: true,
      })

      const files = []
      for (let i = 0; i < handles.length; i++) {
        const handle = handles[i]
        const file = await handle.getFile()
        files.push(file)
      }

      await uploadAttachment(entryDetail.value.uuid, files)
      emit('dataUpdated')
    }

    return {
      isShowPreview,
      previewIndex,
      handlePreviewItem,
      handleRemoveItem,
      handleAddAttachment,
    }
  },
})
</script>

<template>
  <div class="attachment-box">
    <n-space align="center">
      Attachments
      <n-button-group size="tiny" v-for="(item, index) in entryDetail.attachmentNames" :key="item">
        <n-button @click="handlePreviewItem(item, index)">{{ item }}</n-button>
        <n-popconfirm @positive-click="handleRemoveItem(item)">
          <template #trigger>
            <n-button>X</n-button>
          </template>
          Confirm remove attachment file?
        </n-popconfirm>
      </n-button-group>

      <n-button size="tiny" @click="handleAddAttachment">+</n-button>
    </n-space>

    <AttachmentPreview
      v-model:visible="isShowPreview"
      :uuid="entryDetail.uuid"
      :attachment-names="entryDetail.attachmentNames"
      :index="previewIndex"
    />
  </div>
</template>

<style lang="scss" scoped>
.attachment-box {
}
</style>
