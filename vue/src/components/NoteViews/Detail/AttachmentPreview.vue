<script lang="ts">
import {defineComponent} from 'vue'
import {getAttachment, renameAttachment} from '@/api/keepass'
import {Icons20Regular} from '@vicons/fluent'
import {useModelWrapper} from '@/hooks/use-model-wrapper'
import mime from 'mime'
import {
  ArrowDownload16Regular,
  ArrowPrevious20Regular,
  ArrowNext20Regular,
  Rename16Regular,
} from '@vicons/fluent'
import DialogInput from '@/components/NoteViews/Dialogs/DialogInput.vue'
import {aLinkDownload} from '@/utils/export-import'

export default defineComponent({
  name: 'AttachmentPreview',
  components: {
    ArrowDownload16Regular,
    ArrowPrevious20Regular,
    ArrowNext20Regular,
    Rename16Regular,
    DialogInput,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    attachmentNames: {
      type: Array,
      default() {
        return []
      },
    },
    index: {
      type: Number,
      default: 0,
    },
    uuid: {
      type: String,
      required: true,
    },
  },
  setup(props, {emit}) {
    const {attachmentNames, index, uuid} = toRefs(props)
    const mVisible = useModelWrapper(props, emit, 'visible')

    const imgSrc = ref(null)
    const pureText = ref(null)
    const blobData = shallowRef(null)

    watch(mVisible, (val) => {
      if (val) {
        mIndex.value = index.value
        updatePreview()
      } else {
        blobData.value = null
        imgSrc.value = null
        pureText.value = null
      }
    })

    const mIndex = ref(0)
    watch(
      index,
      (val) => {
        mIndex.value = val
      },
      {immediate: true}
    )

    const filename = computed(() => {
      return attachmentNames.value[mIndex.value] || ''
    })

    const fileMimeType = ref('')

    const previewType = computed(() => {
      const mimeType = fileMimeType.value || ''
      const fileSuffix = (filename.value.split('.').pop() || '').toLowerCase()
      const type0 = mimeType?.split('/')[0]

      if (type0 === 'image') {
        return 'image'
      }
      if (type0 === 'video') {
        return 'video'
      }
      if (type0 === 'audio') {
        return 'audio'
      }
      if (
        type0 === 'text' ||
        mimeType === 'application/json' ||
        mimeType === 'application/javascript' ||
        fileSuffix === 'vue' ||
        fileSuffix === 'ts'
      ) {
        if (blobData.value) {
          const reader = new FileReader()
          reader.readAsText(blobData.value)
          reader.onload = () => {
            pureText.value = reader.result
          }
        }
        return 'text'
      }

      return null
    })

    const updatePreview = async () => {
      const blob = await getAttachment({
        uuid: uuid.value,
        filename: filename.value,
      })

      fileMimeType.value = mime.getType(filename.value)
      blobData.value = blob
      imgSrc.value = URL.createObjectURL(blob)
    }

    return {
      imgSrc,
      mVisible,
      pureText,
      dialogIconRender() {
        return h(Icons20Regular)
      },
      mIndex,
      goNext() {
        if (mIndex.value >= attachmentNames.value.length - 1) {
          mIndex.value = 0
        } else {
          mIndex.value++
        }

        updatePreview()
      },
      goPrev() {
        if (mIndex.value <= 0) {
          mIndex.value = attachmentNames.value.length - 1
        } else {
          mIndex.value--
        }

        updatePreview()
      },
      filename,
      fileMimeType,
      previewType,
      handleDownload() {
        if (blobData.value) {
          aLinkDownload(imgSrc.value, filename.value)
        }
      },
    }
  },
})
</script>

<template>
  <n-modal
    v-model:show="mVisible"
    :icon="dialogIconRender"
    :title="filename"
    preset="card"
    size="medium"
    :style="{maxWidth: '800px'}"
  >
    <div class="attachment-preview">
      <n-space size="small" align="center" justify="center">
        <n-button-group>
          <n-button title="Prev" size="small" @click="goPrev"
            ><template #icon><ArrowPrevious20Regular /></template
          ></n-button>
          <n-button title="Next" size="small" @click="goNext"
            ><template #icon><ArrowNext20Regular /></template
          ></n-button>
        </n-button-group>
        <n-button title="Download" size="small" @click="handleDownload"
          ><template #icon><ArrowDownload16Regular /></template
        ></n-button>
      </n-space>

      <div class="image-box">
        <img v-if="previewType === 'image'" :src="imgSrc" />
        <audio controls v-else-if="previewType === 'audio'" :src="imgSrc" />
        <video controls v-else-if="previewType === 'video'" :src="imgSrc" />
        <textarea v-else-if="previewType === 'text'" disabled :value="pureText" />
        <div style="text-align: center" v-else>
          <b>Unable to preview</b> <br />
          {{ fileMimeType }}
        </div>
      </div>
      <div class="filename-title" :title="fileMimeType">
        {{ `${mIndex + 1}/${attachmentNames?.length}` }}
      </div>
    </div>
  </n-modal>
</template>

<style lang="scss" scoped>
.attachment-preview {
  height: 580px;
  display: flex;
  flex-direction: column;
  .image-box {
    margin-top: 10px;
    margin-bottom: 10px;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    img {
      max-width: 100%;
      max-height: 100%;
    }
    textarea {
      width: 90%;
      height: 90%;
      font-family: monospace;
    }
  }

  .filename-title {
    text-align: center;
    font-size: 14px;
  }
}
</style>
