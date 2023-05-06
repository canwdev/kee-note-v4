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
import DialogEntryIconColor from '@/components/DialogEntryIconColor.vue'
import IconDisplay from '@/components/IconDisplay.vue'
import DialogEntryPreview from '@/components/DialogEntryPreview.vue'
import {
  TextBoxSettings24Regular,
  ArrowLeft16Regular,
  Save20Regular,
  CalendarAdd20Regular,
  CalendarEdit16Regular,
} from '@vicons/fluent'

export default defineComponent({
  name: 'DetailView',
  components: {
    MarkdownEditor,
    DialogEntryIconColor,
    IconDisplay,
    DialogEntryPreview,
    TextBoxSettings24Regular,
    ArrowLeft16Regular,
    Save20Regular,
    CalendarAdd20Regular,
    CalendarEdit16Regular,
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
        const key = String.fromCharCode(event.which).toLowerCase()
        switch (key) {
          case 's':
            event.preventDefault()
            handleSave()
            break
          case '¿': // Keyboard symbol: "/"
            isShowPreviewModal.value = true
            event.preventDefault()
            break
          default:
            return
        }
      } else if (event.code === 'Escape') {
        handleBack()
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
          {path: 'fgColor', value: entryDetail.value.fgColor},
          {path: 'bgColor', value: entryDetail.value.bgColor},
          {path: 'icon', value: entryDetail.value.icon},
          {path: 'times.creationTime', value: times[0]},
        ],
      })
      await getEntryDetail()
      await saveDatabaseAsync()
    }

    const complexEditorRef = ref()
    const isShowIconEdit = ref(false)
    const isShowPreviewModal = ref(false)

    const menuOptions = computed(() => {
      return [
        {
          label: '🔰 Preview (Ctrl+/)',
          props: {
            onClick: async () => {
              isShowPreviewModal.value = true
            },
          },
        },
        !isComplexEditor.value && {
          label: '💫 Enable HyperMD Editor',
          props: {
            onClick: async () => {
              isComplexEditor.value = true
            },
          },
        },
      ].filter(Boolean)
    })

    const titleInputRef = ref()
    watch(entryDetail, () => {
      nextTick(() => {
        titleInputRef.value.focus()
      })
    })

    const handleBack = () => {
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
    }

    return {
      entryDetail,
      handleBack,
      times,
      isChanged,
      handleSave,
      keepassIcons,
      isComplexEditor,
      complexEditorRef,
      showEditorSettings() {
        complexEditorRef.value.showSettings()
      },
      isShowIconEdit,
      menuOptions,
      isShowPreviewModal,
      titleInputRef,
    }
  },
})
</script>

<template>
  <div class="detail-view">
    <n-layout class="layout-inner-root">
      <n-layout-header bordered>
        <n-space align="center" justify="space-between" class="header-space">
          <n-button quaternary @click="handleBack">
            <n-icon size="18"> <ArrowLeft16Regular /> </n-icon>&nbsp;Back</n-button
          >

          <div class="entry-title" v-if="entryDetail">
            <n-dropdown
              :options="menuOptions"
              key-field="label"
              placement="bottom-start"
              trigger="hover"
            >
              <n-button size="small" quaternary @click="isShowIconEdit = true">
                <IconDisplay
                  :icon="entryDetail.icon"
                  :bg-color="entryDetail.bgColor"
                  :fg-color="entryDetail.fgColor"
                />
                <span v-if="isChanged">* </span>
              </n-button>
            </n-dropdown>
          </div>

          <n-button quaternary :disabled="!isChanged" @click="handleSave">
            <n-icon size="18"> <Save20Regular /> </n-icon>&nbsp;Save</n-button
          >
        </n-space>
      </n-layout-header>

      <div v-if="entryDetail" class="detail-card-wrap">
        <div class="detail-card">
          <n-space vertical>
            <n-space justify="space-between">
              <n-space align="center">
                <n-date-picker
                  size="small"
                  v-model:value="times[0]"
                  type="datetime"
                  @update:value="isChanged = true"
                  title="Create Time"
                >
                  <template #date-icon>
                    <n-icon size="18"> <CalendarAdd20Regular /> </n-icon>
                  </template>
                </n-date-picker>
                <n-date-picker
                  size="small"
                  v-model:value="times[1]"
                  type="datetime"
                  disabled
                  title="Update Time"
                >
                  <template #date-icon>
                    <n-icon size="18"> <CalendarEdit16Regular /> </n-icon>
                  </template>
                </n-date-picker>
              </n-space>

              <n-space align="center">
                <n-button
                  size="small"
                  quaternary
                  v-if="isComplexEditor"
                  @click="showEditorSettings"
                  title="Editor Settings"
                >
                  <n-icon size="18">
                    <TextBoxSettings24Regular />
                  </n-icon>
                </n-button>
              </n-space>
            </n-space>

            <n-input-group>
              <n-input
                size="small"
                ref="titleInputRef"
                autofocus
                v-model:value="entryDetail.title"
                type="text"
                placeholder="Title"
              >
              </n-input>
            </n-input-group>

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
        </div>
      </div>

      <DialogEntryIconColor v-model:visible="isShowIconEdit" :entry-detail="entryDetail" />

      <DialogEntryPreview v-model:visible="isShowPreviewModal" :preview-detail="entryDetail" />
    </n-layout>
  </div>
</template>

<style lang="scss" scoped>
.detail-view {
  height: 100%;
  $min_width: 800px;

  .header-space {
    width: 100%;
    height: 100%;
    padding: 6px 24px;
    box-sizing: border-box;
    @media screen and (max-width: $min_width) {
      padding: 2px;
    }
  }

  .entry-title {
    max-width: 50vw;
    font-weight: 500;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .layout-inner-root {
    height: 100%;
    :deep(.n-layout-scroll-container) {
      display: flex;
      flex-direction: column;
    }

    .detail-card-wrap {
      flex: 1;
      overflow: auto;
      padding-top: 10px;
      padding-bottom: 5px;
    }

    .detail-card {
      margin-left: auto;
      margin-right: auto;
      width: $min_width;

      @media screen and (max-width: $min_width) {
        width: 100%;
        padding: 0 10px;
        box-sizing: border-box;
      }

      @media screen and (max-width: 1200px) {
        margin-top: 10px;
      }
    }
  }
}
</style>
