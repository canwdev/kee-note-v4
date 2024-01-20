<script lang="ts">
import {defineComponent} from 'vue'
import {useModelWrapper} from '@/hooks/use-model-wrapper'
import {Search20Filled, Settings20Filled} from '@vicons/fluent'
import {kService} from '@/api'
import {EntryItem} from '@/enum/kdbx'
import IconDisplay from '@/components/NoteViews/IconDisplay.vue'
import {formatDate} from '@/utils'
import DialogEntryPreview from '@/components/NoteViews/Dialogs/DialogEntryPreview.vue'

export default defineComponent({
  name: 'DialogSearch',
  components: {
    DialogEntryPreview,
    IconDisplay,
    Settings20Filled,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: Number,
      default: null,
    },
  },
  setup(props, {emit}) {
    const mVisible = useModelWrapper(props, emit, 'visible')
    const searchKeyword = ref('')
    const isLoading = ref(false)
    const isShowSearchSettings = ref(false)
    const isShowPreviewModal = ref(false)
    const previewItem = ref<EntryItem | null>(null)
    const resultList = ref<EntryItem[]>([])

    const handleSearch = async () => {
      if (isLoading.value) {
        return
      }
      if (!searchKeyword.value) {
        resultList.value = []
        return
      }
      try {
        isLoading.value = true

        const list = await kService.searchDatabase({
          keyword: searchKeyword.value,
        })
        resultList.value = list || []
      } catch (e) {
        resultList.value = []
      } finally {
        isLoading.value = false
      }
    }

    const handlePreview = (item) => {
      previewItem.value = item
      isShowPreviewModal.value = true
    }

    return {
      mVisible,
      dialogIconRender: () => h(Search20Filled),
      searchKeyword,
      handleSearch,
      resultList,
      formatDate,
      isShowPreviewModal,
      previewItem,
      handlePreview,
      isLoading,
      isShowSearchSettings,
    }
  },
})
</script>

<template>
  <n-modal
    :mask-closable="false"
    :icon="dialogIconRender"
    v-model:show="mVisible"
    preset="dialog"
    title="Search Database"
  >
    <n-input-group>
      <n-button ghost @click="isShowSearchSettings = !isShowSearchSettings">
        <n-icon size="16"><Settings20Filled /> </n-icon>
      </n-button>
      <n-input
        placeholder="Search keyword in title or notes"
        clearable
        v-model:value="searchKeyword"
        @keyup.enter="handleSearch"
      />
      <n-button :disabled="isLoading" type="primary" ghost @click="handleSearch"> Search </n-button>
    </n-input-group>

    <n-collapse-transition :show="isShowSearchSettings"> <div>TBD</div> </n-collapse-transition>

    <div style="margin-top: 16px; margin-left: -16px; margin-right: -16px">
      <n-empty v-if="!resultList.length" description="No Data"> </n-empty>
      <n-list hoverable clickable>
        <n-list-item @click="handlePreview(item)" v-for="item in resultList" :key="item.uuid">
          <template #prefix>
            <IconDisplay
              :icon="item.icon"
              :size="28"
              :bg-color="item.bgColor"
              :fg-color="item.fgColor"
            />
          </template>

          <n-thing :title="item.title">
            <template #description>
              <n-tag :bordered="false" size="small">
                CT: {{ formatDate(item.creationTime) }}
              </n-tag>
            </template>
          </n-thing>
        </n-list-item>
      </n-list>
    </div>
  </n-modal>

  <DialogEntryPreview
    v-model:visible="isShowPreviewModal"
    :uuid="previewItem && previewItem.uuid"
  />
</template>
