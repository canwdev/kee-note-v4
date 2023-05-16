<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {EntryItem} from '@/enum/kdbx'
import {getAttachment, removeAttachment, uploadAttachment} from '@/api/keepass'
import {aLinkDownload} from '@/utils'

export default defineComponent({
  name: 'AttachmentBox',
  props: {
    entryDetail: {
      type: Object as PropType<EntryItem>,
      required: true,
    },
  },
  setup(props, {emit}) {
    const {entryDetail} = toRefs(props)
    const handlePreviewItem = async (filename) => {
      console.log(filename)

      const result = await getAttachment({
        uuid: entryDetail.value.uuid,
        filename,
      })

      console.log(result)

      let imageUrl = URL.createObjectURL(result)
      aLinkDownload(imageUrl, filename)
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
      const [handle] = await window.showOpenFilePicker({
        multiple: true,
      })
      const file = await handle.getFile()
      console.log(file)

      await uploadAttachment([file])
    }

    return {
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
      <n-button-group size="tiny" v-for="item in entryDetail.attachmentNames" :key="item">
        <n-button @click="handlePreviewItem(item)">{{ item }}</n-button>
        <n-popconfirm @positive-click="handleRemoveItem(item)">
          <template #trigger>
            <n-button>X</n-button>
          </template>
          Confirm remove attachment file?
        </n-popconfirm>
      </n-button-group>

      <n-button size="tiny" @click="handleAddAttachment">+</n-button>
    </n-space>
  </div>
</template>

<style lang="scss" scoped>
.attachment-box {
}
</style>
