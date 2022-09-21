<script lang="ts">
import {useRoute, useRouter} from 'vue-router'
import {kService} from '@/api'
import {EntryItem} from '@/enum/kdbx'
import keepassIcons from '@/assets/icons'
import {saveDatabaseAsync} from '@/utils/bus'
import {useUnSavedChanges} from '@/hooks/use-changed'
import {useLocalStorageBoolean} from '@/hooks/use-local-storage'
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import {LsKeys} from '@/enum'

export default defineComponent({
  name: 'DetailView',
  components: {
    MarkdownEditor,
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const entryDetail = ref<EntryItem | null>(null)
    const times = reactive([0, 0])
    const isComplexEditor = useLocalStorageBoolean(LsKeys.LS_KEY_NO_COMPLEX_EDITOR, true)

    onMounted(() => {
      getEntryDetail()
      window.addEventListener('keydown', handleKeyDown)
    })
    onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleKeyDown)
    })

    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (String.fromCharCode(event.which).toLowerCase()) {
          case 's':
            event.preventDefault()
            handleSave()
            break
          default:
            return
        }
      }
    }

    const getEntryDetail = async () => {
      entryDetail.value = await kService.getEntryDetail({uuid: route.query.uuid})
      nextTick(() => {
        isChanged.value = false
      })
    }

    const {isChanged} = useUnSavedChanges()

    watch(entryDetail, (val) => {
      if (!val) {
        return
      }
      const {creationTime, lastModTime} = val
      times[0] = new Date(creationTime).getTime()
      times[1] = new Date(lastModTime).getTime()
    })

    watch(
      entryDetail,
      () => {
        isChanged.value = true
      },
      {deep: true}
    )

    const handleSave = async () => {
      if (!entryDetail.value) {
        return
      }
      await kService.updateEntry({
        uuid: entryDetail.value.uuid,
        updates: [
          {path: 'fields.Title', value: entryDetail.value.title},
          {path: 'fields.Notes', value: entryDetail.value.notes},
          {path: 'times.creationTime', value: times[0]},
        ],
      })
      await getEntryDetail()
      await saveDatabaseAsync()
    }

    const complexEditorRef = ref()

    return {
      handleBack() {
        if (isChanged.value) {
          window.$dialog.warning({
            title: 'Confirm',
            content: 'Discard Changes?',
            positiveText: 'OK',
            negativeText: 'Cancel',
            onPositiveClick: () => {
              router.back()
            },
            onNegativeClick: () => {},
          })
          return
        }
        router.back()
      },
      entryDetail,
      times,
      isChanged,
      handleSave,
      keepassIcons,
      isComplexEditor,
      complexEditorRef,
      showEditorSettings() {
        if (!isComplexEditor.value) {
          isComplexEditor.value = true
          return
        }
        complexEditorRef.value.showSettings()
      },
    }
  },
})
</script>

<template>
  <div class="detail-view">
    <n-layout class="layout-inner-root">
      <n-layout-header bordered>
        <n-space
          align="center"
          justify="space-between"
          style="width: 100%; height: 100%; padding: 10px 24px; box-sizing: border-box"
        >
          <n-button @click="handleBack">Back</n-button>

          <div>
            <span v-if="isChanged">* </span>
            {{ entryDetail && entryDetail.title }}
          </div>

          <n-button :disabled="!isChanged" @click="handleSave">Save</n-button>
        </n-space>
      </n-layout-header>

      <n-scrollbar trigger="none">
        <n-layout-content>
          <n-card v-if="entryDetail" class="detail-card" size="small">
            <n-space vertical>
              <n-input-group>
                <n-button>
                  <img
                    :src="keepassIcons[entryDetail.icon]"
                    :alt="entryDetail.icon"
                    style="width: 24px; height: 24px"
                  />
                </n-button>
                <n-input v-model:value="entryDetail.title" type="text" placeholder="Title" />

                <n-button @click="showEditorSettings">
                  {{ isComplexEditor ? '⚙' : '_' }}
                </n-button>
              </n-input-group>

              <n-space justify="space-between">
                <n-space align="center">
                  Create Time
                  <n-date-picker
                    v-model:value="times[0]"
                    type="datetime"
                    @update:value="isChanged = true"
                  />
                </n-space>
                <n-space align="center">
                  Update Time
                  <n-date-picker v-model:value="times[1]" type="datetime" disabled />
                </n-space>
              </n-space>

              <MarkdownEditor
                ref="complexEditorRef"
                v-if="isComplexEditor"
                v-model="entryDetail.notes"
                @turnOff="isComplexEditor = false"
              />
              <n-input
                v-else
                v-model:value="entryDetail.notes"
                type="textarea"
                placeholder="Input your Note here."
                :autosize="{
                  minRows: 20,
                }"
                style="background-color: inherit !important"
              />
            </n-space>
          </n-card>
        </n-layout-content>
      </n-scrollbar>
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

    .detail-card {
      max-width: 800px;
      margin: 24px auto;

      @media screen and (max-width: 1200px) {
        margin-top: 10px;
      }
    }
  }
}
</style>
