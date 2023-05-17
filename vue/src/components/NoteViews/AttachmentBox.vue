<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {EntryItem} from '@/enum/kdbx'
import {getAttachment, removeAttachment, renameAttachment, uploadAttachment} from '@/api/keepass'
import {Attach12Regular, MoreVertical16Regular} from '@vicons/fluent'
import AttachmentPreview from '@/components/NoteViews/AttachmentPreview.vue'
import DialogInput from '@/components/DialogInput.vue'

export default defineComponent({
  name: 'AttachmentBox',
  components: {
    DialogInput,
    AttachmentPreview,
    Attach12Regular,
    MoreVertical16Regular,
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

    const editingFilename = ref(null)
    const getMenuOptions = (item) => {
      return [
        {
          label: '✒️ Rename',
          props: {
            onClick: () => {
              editingFilename.value = item
              isShowRenameDialog.value = true
            },
          },
        },
        {
          label: '❌ Delete',
          props: {
            onClick: () => {
              if (confirm('Confirm delete attached file?')) {
                handleRemoveItem(item)
              }
            },
          },
        },
      ]
    }

    const isShowRenameDialog = ref(false)
    const handleRename = async (name) => {
      await renameAttachment({
        uuid: entryDetail.value.uuid,
        filename: editingFilename.value,
        newFilename: name,
      })
      emit('dataUpdated')
    }

    return {
      isShowPreview,
      previewIndex,
      handlePreviewItem,
      handleRemoveItem,
      handleAddAttachment,
      getMenuOptions,
      isShowRenameDialog,
      handleRename,
      editingFilename,
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

        <n-dropdown :options="getMenuOptions(item)" key-field="label">
          <n-button title="Delete file">
            <template #icon>
              <MoreVertical16Regular />
            </template>
          </n-button>
        </n-dropdown>
      </n-button-group>

      <n-button title="Add file" size="tiny" @click="handleAddAttachment">
        <template #icon>
          <Attach12Regular />
        </template>
      </n-button>
    </n-space>

    <AttachmentPreview
      v-model:visible="isShowPreview"
      :uuid="entryDetail.uuid"
      :attachment-names="entryDetail.attachmentNames"
      :index="previewIndex"
      @dataUpdated="$emit('dataUpdated')"
    />

    <DialogInput
      v-model:visible="isShowRenameDialog"
      :value="editingFilename"
      dialog-title="Rename File"
      input-label="Filename"
      @onSubmit="handleRename"
    />
  </div>
</template>

<style lang="scss" scoped>
.attachment-box {
}
</style>
